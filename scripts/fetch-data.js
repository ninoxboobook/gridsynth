#!/usr/bin/env node

// Fetches one or more days of five-minute grid data from the Open Electricity
// API (formerly OpenNEM) and saves each region's day as a gridsynth dataset in data/.
//
// Usage:
//   node scripts/fetch-data.js <date> [<end-date>] [options]
//   node scripts/fetch-data.js --last <days> [options]
//
// Options:
//   --region <code>       Only fetch this region (every region is fetched by default)
//   --last <days>         Fetch the most recent complete days, instead of giving dates
//   --keep-days <days>    Keep a rolling window: days fetched with this option are
//                         removed again once they are more than this many days old
//   --force               Fetch days again even if they already have a file
//   --max-requests <n>    The most API requests one run may make (20 by default)
//
// Examples:
//   node scripts/fetch-data.js 2026-01-15                  Every region, one day
//   node scripts/fetch-data.js 2026-10-01 2026-10-07       Every region, one week
//   node scripts/fetch-data.js 2026-01-15 --region SA1     One region only
//   node scripts/fetch-data.js --last 3                    What the daily workflow runs
//
// The API key is read from the OPENELECTRICITY_API_KEY environment variable.
// One request returns every region in a network, so each block of up to seven
// days costs two API requests per network (one for generation by fuel, one for
// price and demand): four requests for every region, or two if only National
// Electricity Market regions or only Western Australia are fetched. Days that
// already have a file in data/ are not fetched again, unless --force is given.

const fs = require('fs');
const path = require('path');

const API_URL = (process.env.OPENELECTRICITY_API_URL || 'https://api.openelectricity.org.au/v4').replace(/\/+$/, '');
const API_KEY = process.env.OPENELECTRICITY_API_KEY;
const DATA_DIR = path.join(__dirname, '..', 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

const INTERVAL_MINUTES = 5;
const STEPS_PER_DAY = (24 * 60) / INTERVAL_MINUTES;
const MAX_DAYS_PER_REQUEST = 7; // The API allows up to 8 days of five-minute data per request
const REQUESTS_PER_CHUNK = 2;
const DEFAULT_MAX_REQUESTS = 20;
const MAX_GAPS = 12; // An hour of missing intervals. Price and demand with more missing than this are treated as incomplete.

// The networks, and the offset of each network's market time from UTC in minutes
const NETWORKS = {
    NEM: { offsetMinutes: 600 },
    WEM: { offsetMinutes: 480 },
};

// name is used in the region picker on the page, label in the song title
const REGIONS = {
    NSW1: { network: 'NEM', name: 'New South Wales', label: 'New South Wales' },
    QLD1: { network: 'NEM', name: 'Queensland', label: 'Queensland' },
    SA1: { network: 'NEM', name: 'South Australia', label: 'South Australian' },
    TAS1: { network: 'NEM', name: 'Tasmania', label: 'Tasmanian' },
    VIC1: { network: 'NEM', name: 'Victoria', label: 'Victorian' },
    WEM: { network: 'WEM', name: 'Western Australia', label: 'Western Australian' },
};

// Open Electricity fuel tech groups, mapped to the gridsynth instrument they play
const INSTRUMENT_GROUPS = {
    coal: 'coal',
    gas: 'gas',
    wind: 'wind',
    solar: 'solar',
    hydro: 'hydro',
    battery_discharging: 'battery',
};

// Loads on the grid and net figures. These are not generation, so they are left out of the mix.
const IGNORED_GROUPS = ['battery', 'battery_charging', 'pumps'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const fail = (message) => {
    console.error(message);
    process.exit(1);
};

// Dates are handled as plain calendar days in the network's local time

const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));

const addDays = (day, count) => new Date(Date.parse(day + 'T00:00:00Z') + count * 86400000).toISOString().slice(0, 10);

const networkNow = (offsetMinutes) => new Date(Date.now() + offsetMinutes * 60000).toISOString();

const formatTitle = (region, day) => {
    const [year, month, date] = day.split('-').map(Number);
    return REGIONS[region].label + ' Energy Grid - ' + MONTHS[month - 1] + ' ' + date + ', ' + year;
};

const datasetId = (region, day) => region + '-' + day;

const datasetFile = (region, day) => path.join(DATA_DIR, datasetId(region, day) + '.json');

// Command line arguments

const parseArguments = (args) => {
    const options = { force: false, maxRequests: DEFAULT_MAX_REQUESTS, regions: [], last: null, keepDays: null, positional: [] };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--force') {
            options.force = true;
        } else if (args[i] === '--max-requests') {
            options.maxRequests = Number(args[++i]);
        } else if (args[i] === '--last') {
            options.last = Number(args[++i]);
        } else if (args[i] === '--keep-days') {
            options.keepDays = Number(args[++i]);
        } else if (args[i] === '--region') {
            options.regions.push(...String(args[++i] || '').toUpperCase().split(',').filter(Boolean));
        } else {
            options.positional.push(args[i]);
        }
    }

    const usage = 'Usage: node scripts/fetch-data.js <date> [<end-date>] [options]\n' +
        '       node scripts/fetch-data.js --last <days> [options]\n' +
        'Options: --region <code>, --keep-days <days>, --force, --max-requests <n>\n' +
        'Dates: YYYY-MM-DD. Regions: ' + Object.keys(REGIONS).join(', ') + ' (every region is fetched if none is given).';
    const isCount = (value) => Number.isInteger(value) && value >= 1;

    if (args.includes('--region') && !options.regions.length) fail('--region needs a region code.\n' + usage);
    options.regions.forEach((region) => {
        if (!REGIONS[region]) fail('Unknown region "' + region + '".\n' + usage);
    });
    if (!isCount(options.maxRequests)) fail('--max-requests needs a whole number of 1 or more.');
    if (options.keepDays !== null && !isCount(options.keepDays)) fail('--keep-days needs a whole number of 1 or more.');

    const regions = Object.keys(REGIONS).filter((region) => !options.regions.length || options.regions.includes(region));

    // Only complete days can be played, so today (in market time) and later are out
    const today = regions.map((region) => networkNow(NETWORKS[REGIONS[region].network].offsetMinutes).slice(0, 10)).sort()[0];
    const latest = addDays(today, -1);

    let [start, end = start] = options.positional;
    if (options.last !== null) {
        if (!isCount(options.last)) fail('--last needs a whole number of 1 or more.');
        if (options.positional.length) fail('Give either dates or --last, not both.\n' + usage);
        start = addDays(latest, 1 - options.last);
        end = latest;
    }

    if (!start || options.positional.length > 2) fail(usage);
    if (!isDay(start) || !isDay(end)) fail('Dates must be in YYYY-MM-DD format.\n' + usage);
    if (end < start) fail('The end date is before the start date.');
    if (end > latest) fail('Only complete days can be fetched. The latest available day is ' + latest + '.');

    return { regions, start, end, today, force: options.force, maxRequests: options.maxRequests, keepDays: options.keepDays };
};

// Groups the days into blocks that each span no more than seven days, so each block can be fetched in one go

const chunkDays = (days) => {
    const chunks = [];
    days.forEach((day) => {
        const chunk = chunks[chunks.length - 1];
        if (chunk && day < addDays(chunk[0], MAX_DAYS_PER_REQUEST)) {
            chunk.push(day);
        } else {
            chunks.push([day]);
        }
    });
    return chunks;
};

// API requests. Each call to request() is one request against the daily limit.

let requestCount = 0;

const request = async (endpoint, params) => {
    const url = new URL(API_URL + endpoint);
    Object.entries(params).forEach(([key, value]) => {
        [].concat(value).forEach((item) => url.searchParams.append(key, item));
    });

    let response;
    try {
        response = await fetch(url, { headers: API_KEY ? { Authorization: 'Bearer ' + API_KEY } : {} });
    } catch (error) {
        const reason = (error.cause && (error.cause.message || error.cause.code)) || error.message;
        throw new Error('Could not reach the Open Electricity API at ' + url.host + ': ' + reason);
    }
    requestCount++;
    const text = await response.text();

    let body;
    try {
        body = JSON.parse(text);
    } catch (error) {
        body = null;
    }

    if (!response.ok || !body || body.success === false) {
        const detail = body && (body.detail || body.error);
        let message = 'Open Electricity API request failed (HTTP ' + response.status + ')';
        message += detail ? ': ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '.';
        if (response.status === 401 || response.status === 403) message += '\nCheck that OPENELECTRICITY_API_KEY is set to a valid key.';
        if (response.status === 429) message += '\nYou may have reached your daily request limit.';
        throw new Error(message);
    }

    return body.data || [];
};

// Sorts the values in an API response into regions, days and five-minute steps.
// Returns { region: { name: { day: [288 values, null where missing] } } }, where
// name is the fuel tech group for generation data, or the metric for market data.

const collectSeries = (seriesList, network, regions, days) => {
    const offsetMinutes = NETWORKS[network].offsetMinutes;
    const collected = {};
    regions.forEach((region) => {
        collected[region] = {};
    });

    seriesList.forEach((series) => {
        (series.results || []).forEach((result) => {
            const columns = result.columns || {};
            const region = columns.region || columns.network_region || (regions.length === 1 ? regions[0] : null);
            if (!collected[region]) return;

            const name = columns.fueltech_group || series.metric;
            if (!collected[region][name]) {
                collected[region][name] = {};
                days.forEach((day) => {
                    collected[region][name][day] = new Array(STEPS_PER_DAY).fill(null);
                });
            }

            (result.data || []).forEach(([timestamp, value]) => {
                const local = new Date(Date.parse(timestamp) + offsetMinutes * 60000);
                const day = local.toISOString().slice(0, 10);
                const step = (local.getUTCHours() * 60 + local.getUTCMinutes()) / INTERVAL_MINUTES;
                if (collected[region][name][day] && Number.isInteger(step) && typeof value === 'number') {
                    collected[region][name][day][step] = value;
                }
            });
        });
    });

    return collected;
};

// Fills missing intervals with the nearest earlier value (or the next value, at the start of the day)

const fillGaps = (values) => {
    const gaps = values.filter((value) => value === null).length;
    if (gaps === values.length) return { values: null, gaps };

    const filled = values.slice();
    for (let i = 1; i < filled.length; i++) {
        if (filled[i] === null) filled[i] = filled[i - 1];
    }
    for (let i = filled.length - 2; i >= 0; i--) {
        if (filled[i] === null) filled[i] = filled[i + 1];
    }
    return { values: filled, gaps };
};

// Fills missing intervals in a generation source. Short gaps are filled from the nearest value.
// A gap longer than an hour is treated as no generation, rather than guessing at what was generated.

const fillGenerationGaps = (values) => {
    const longGaps = values.slice();
    let zeroed = 0;
    for (let i = 0; i < values.length; i++) {
        if (values[i] !== null) continue;
        let end = i;
        while (end < values.length && values[end] === null) end++;
        if (end - i > MAX_GAPS) {
            longGaps.fill(0, i, end);
            zeroed += end - i;
        }
        i = end;
    }
    const { values: filled, gaps } = fillGaps(longGaps);
    return { values: filled, gaps, zeroed };
};

const round = (value) => Math.round(value * 100) / 100;

// Builds the dataset that gridsynth plays for one day

const buildDataset = (region, day, generationSeries, marketSeries, rolling) => {
    const warnings = [];
    const zeros = () => new Array(STEPS_PER_DAY).fill(0);

    const market = {};
    ['demand', 'price'].forEach((metric) => {
        const { values, gaps } = fillGaps((marketSeries[metric] || {})[day] || new Array(STEPS_PER_DAY).fill(null));
        if (!values || gaps > MAX_GAPS) {
            throw new Error('The ' + metric + ' data for ' + region + ' on ' + day + ' is incomplete (' + gaps + ' of ' + STEPS_PER_DAY + ' intervals missing).');
        }
        if (gaps) warnings.push(gaps + ' missing ' + metric + ' interval(s) filled from the nearest value');
        market[metric] = values.map(round);
    });

    const generation = {};
    Object.values(INSTRUMENT_GROUPS).forEach((instrument) => {
        generation[instrument] = zeros();
    });
    const totalGeneration = zeros();
    let groupsFound = 0;

    Object.keys(generationSeries).forEach((group) => {
        if (IGNORED_GROUPS.includes(group)) return;

        const { values, gaps, zeroed } = fillGenerationGaps(generationSeries[group][day]);
        if (!values) return;
        if (gaps) warnings.push(gaps + ' missing ' + group + ' interval(s) filled from the nearest value');
        if (zeroed) warnings.push(zeroed + ' missing ' + group + ' interval(s) in a gap of more than an hour treated as no generation');
        groupsFound++;

        // Anything below zero is not generation, so it does not count towards the mix
        const output = values.map((value) => Math.max(0, value));
        output.forEach((value, i) => {
            totalGeneration[i] += value;
        });
        if (INSTRUMENT_GROUPS[group]) generation[INSTRUMENT_GROUPS[group]] = output.map(round);
    });

    if (!groupsFound) throw new Error('No generation data was returned for ' + region + ' on ' + day + '.');

    return {
        dataset: {
            id: datasetId(region, day),
            title: formatTitle(region, day),
            network: REGIONS[region].network,
            region,
            date: day,
            intervalMinutes: INTERVAL_MINUTES,
            ...(rolling ? { rolling: true } : {}), // Part of a rolling window, so it is removed once it is old enough
            source: {
                name: 'Open Electricity',
                url: 'https://openelectricity.org.au',
                publisher: 'The Superpower Institute',
                licence: 'CC BY-NC 4.0',
                licenceUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
                fetchedAt: new Date().toISOString(),
            },
            notes: 'All values are five-minute values. Total generation is the sum of every generating fuel source in the region; battery is battery discharging.',
            demand: market.demand,
            price: market.price,
            totalGeneration: totalGeneration.map(round),
            generation,
        },
        warnings,
    };
};

// Writes the dataset with one array per line, which keeps the files compact and diffs readable

const serialiseDataset = (dataset) => {
    const lines = Object.entries(dataset).map(([key, value]) => {
        if (key === 'generation') {
            const sources = Object.entries(value).map(([source, values]) => '    ' + JSON.stringify(source) + ': ' + JSON.stringify(values));
            return '  "generation": {\n' + sources.join(',\n') + '\n  }';
        }
        return '  ' + JSON.stringify(key) + ': ' + JSON.stringify(value);
    });
    return '{\n' + lines.join(',\n') + '\n}\n';
};

// Rebuilds the list of regions and days that the gridsynth page offers, from the files in data/

const updateIndex = () => {
    let index = {};
    if (fs.existsSync(INDEX_FILE)) index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

    const datasets = fs.readdirSync(DATA_DIR)
        .filter((file) => file.endsWith('.json') && file !== path.basename(INDEX_FILE))
        .map((file) => {
            const { region, date } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            return { region, date, file };
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.region.localeCompare(b.region));

    const regions = Object.keys(REGIONS)
        .filter((region) => datasets.some((dataset) => dataset.region === region))
        .map((region) => ({ code: region, name: REGIONS[region].name }));

    // The default is the song that is loaded first. It is kept as long as its file still exists.
    const isAvailable = (choice) => choice && datasets.some((dataset) => dataset.region === choice.region && dataset.date === choice.date);
    let defaultDataset = isAvailable(index.default) ? index.default : null;
    if (!defaultDataset && datasets.length) defaultDataset = { region: datasets[0].region, date: datasets[0].date };

    fs.writeFileSync(INDEX_FILE, JSON.stringify({ default: defaultDataset, regions, datasets }, null, 2) + '\n');
    return datasets;
};

// Removes days that were fetched as part of a rolling window and have since fallen out of it.
// Days fetched without --keep-days are never removed.

const removeOldDays = (today, keepDays) => {
    if (keepDays === null || !fs.existsSync(DATA_DIR)) return;

    const oldest = addDays(today, -keepDays);
    let removed = 0;
    fs.readdirSync(DATA_DIR)
        .filter((file) => file.endsWith('.json') && file !== path.basename(INDEX_FILE))
        .forEach((file) => {
            const { rolling, date } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            if (rolling === true && date < oldest) {
                fs.unlinkSync(path.join(DATA_DIR, file));
                removed++;
            }
        });
    if (removed) console.log('Removed ' + removed + ' dataset(s) from before ' + oldest + ' (the rolling window is ' + keepDays + ' days).');
};

const main = async () => {
    const { regions, start, end, today, force, maxRequests, keepDays } = parseArguments(process.argv.slice(2));
    const isWanted = (region, day) => force || !fs.existsSync(datasetFile(region, day));
    const networks = Object.keys(NETWORKS).filter((network) => regions.some((region) => REGIONS[region].network === network));

    const days = [];
    for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);

    // One request covers every region in a network, so the days are planned network by network
    const plans = networks.map((network) => {
        const networkRegions = regions.filter((region) => REGIONS[region].network === network);
        const wantedDays = days.filter((day) => networkRegions.some((region) => isWanted(region, day)));
        return { network, regions: networkRegions, chunks: chunkDays(wantedDays) };
    }).filter((plan) => plan.chunks.length);

    const existing = regions.length * days.length - regions.reduce((count, region) => count + days.filter((day) => isWanted(region, day)).length, 0);
    if (existing) console.log('Skipping ' + existing + ' region day(s) already in data/ (use --force to fetch them again).');
    if (!plans.length) {
        removeOldDays(today, keepDays);
        updateIndex();
        console.log('Nothing to fetch. API requests made: 0.');
        return;
    }

    const plannedRequests = plans.reduce((count, plan) => count + plan.chunks.length * REQUESTS_PER_CHUNK, 0);
    if (plannedRequests > maxRequests) {
        fail('This needs ' + plannedRequests + ' API requests, which is over the limit of ' + maxRequests +
            ' for one run.\nFetch a shorter range, or raise the limit with --max-requests ' + plannedRequests + '.');
    }

    if (!API_KEY) console.warn('OPENELECTRICITY_API_KEY is not set, so requests will be sent without a key.');
    console.log('Fetching ' + days.length + ' day(s) for ' + regions.join(', ') + ' using ' + plannedRequests + ' API request(s).');

    fs.mkdirSync(DATA_DIR, { recursive: true });
    let saved = 0;
    const problems = [];

    for (const plan of plans) {
        for (const chunk of plan.chunks) {
            const range = {
                interval: INTERVAL_MINUTES + 'm',
                date_start: chunk[0] + 'T00:00:00',
                date_end: addDays(chunk[chunk.length - 1], 1) + 'T00:00:00',
                primary_grouping: 'network_region',
            };
            // With no region given, the API returns every region in the network
            if (plan.regions.length === 1) range.network_region = plan.regions[0];

            const generationData = await request('/data/network/' + plan.network, { ...range, metrics: 'power', secondary_grouping: 'fueltech_group' });
            const marketData = await request('/market/network/' + plan.network, { ...range, metrics: ['price', 'demand'] });

            const generationSeries = collectSeries(generationData, plan.network, plan.regions, chunk);
            const marketSeries = collectSeries(marketData, plan.network, plan.regions, chunk);

            chunk.forEach((day) => {
                plan.regions.filter((region) => isWanted(region, day)).forEach((region) => {
                    try {
                        const { dataset, warnings } = buildDataset(region, day, generationSeries[region], marketSeries[region], keepDays !== null);
                        fs.writeFileSync(datasetFile(region, day), serialiseDataset(dataset));
                        saved++;
                        console.log('Saved data/' + dataset.id + '.json (' + dataset.title + ')');
                        warnings.forEach((warning) => console.log('  Note: ' + warning));
                    } catch (error) {
                        problems.push(error.message);
                    }
                });
            });
        }
    }

    removeOldDays(today, keepDays);
    const datasets = updateIndex();
    problems.forEach((problem) => console.error('Not saved: ' + problem));
    console.log('Saved ' + saved + ' dataset(s). data/index.json now lists ' + datasets.length + '. API requests made: ' + requestCount + '.');
    if (problems.length) process.exitCode = 1;
};

main().catch((error) => {
    console.error(error.message);
    if (requestCount) console.error('API requests made: ' + requestCount + '.');
    process.exit(1);
});
