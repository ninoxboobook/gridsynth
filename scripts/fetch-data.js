#!/usr/bin/env node

// Fetches one or more days of five-minute grid data from the Open Electricity
// API (formerly OpenNEM) and saves each day as a gridsynth dataset in data/.
//
// Usage:
//   node scripts/fetch-data.js <region> <date> [<end-date>] [--force] [--max-requests <n>]
//
// Examples:
//   node scripts/fetch-data.js SA1 2026-01-05
//   node scripts/fetch-data.js NSW1 2026-10-01 2026-10-03
//
// The API key is read from the OPENELECTRICITY_API_KEY environment variable.
// Each run costs two API requests per block of up to seven days (one for
// generation by fuel, one for price and demand). Days that already have a file
// in data/ are skipped without making any requests, unless --force is given.

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
const MAX_GAPS = 12; // An hour of missing intervals; any more and the day is treated as incomplete

const REGIONS = {
    NSW1: { network: 'NEM', offsetMinutes: 600, label: 'New South Wales' },
    QLD1: { network: 'NEM', offsetMinutes: 600, label: 'Queensland' },
    SA1: { network: 'NEM', offsetMinutes: 600, label: 'South Australian' },
    TAS1: { network: 'NEM', offsetMinutes: 600, label: 'Tasmanian' },
    VIC1: { network: 'NEM', offsetMinutes: 600, label: 'Victorian' },
    WEM: { network: 'WEM', offsetMinutes: 480, label: 'Western Australian' },
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
    const options = { force: false, maxRequests: DEFAULT_MAX_REQUESTS, positional: [] };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--force') {
            options.force = true;
        } else if (args[i] === '--max-requests') {
            options.maxRequests = Number(args[++i]);
        } else {
            options.positional.push(args[i]);
        }
    }

    const [region, start, end = start] = options.positional;
    const usage = 'Usage: node scripts/fetch-data.js <region> <date> [<end-date>] [--force] [--max-requests <n>]\n' +
        'Regions: ' + Object.keys(REGIONS).join(', ') + '. Dates: YYYY-MM-DD.';

    if (!region || !start || options.positional.length > 3) fail(usage);
    if (!REGIONS[region.toUpperCase()]) fail('Unknown region "' + region + '".\n' + usage);
    if (!isDay(start) || !isDay(end)) fail('Dates must be in YYYY-MM-DD format.\n' + usage);
    if (end < start) fail('The end date is before the start date.');
    if (!Number.isInteger(options.maxRequests) || options.maxRequests < 1) fail('--max-requests needs a whole number of 1 or more.');

    return { region: region.toUpperCase(), start, end, force: options.force, maxRequests: options.maxRequests };
};

// Groups the days into blocks of consecutive days, so each block can be fetched in one go

const chunkDays = (days) => {
    const chunks = [];
    days.forEach((day) => {
        const chunk = chunks[chunks.length - 1];
        if (chunk && chunk.length < MAX_DAYS_PER_REQUEST && addDays(chunk[chunk.length - 1], 1) === day) {
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

// Sorts the values in an API response into days and five-minute steps.
// Returns { name: { day: [288 values, null where missing] } }, where name is
// the fuel tech group for generation data, or the metric for market data.

const collectSeries = (seriesList, region, days) => {
    const offsetMinutes = REGIONS[region].offsetMinutes;
    const collected = {};

    seriesList.forEach((series) => {
        (series.results || []).forEach((result) => {
            const columns = result.columns || {};
            const resultRegion = columns.region || columns.network_region;
            if (resultRegion && resultRegion !== region) return;

            const name = columns.fueltech_group || series.metric;
            if (!collected[name]) {
                collected[name] = {};
                days.forEach((day) => {
                    collected[name][day] = new Array(STEPS_PER_DAY).fill(null);
                });
            }

            (result.data || []).forEach(([timestamp, value]) => {
                const local = new Date(Date.parse(timestamp) + offsetMinutes * 60000);
                const day = local.toISOString().slice(0, 10);
                const step = (local.getUTCHours() * 60 + local.getUTCMinutes()) / INTERVAL_MINUTES;
                if (collected[name][day] && Number.isInteger(step) && typeof value === 'number') {
                    collected[name][day][step] = value;
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

const round = (value) => Math.round(value * 100) / 100;

// Builds the dataset that gridsynth plays for one day

const buildDataset = (region, day, generationSeries, marketSeries) => {
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

        const { values, gaps } = fillGaps(generationSeries[group][day]);
        if (!values) return;
        if (gaps > MAX_GAPS) {
            throw new Error('The ' + group + ' generation data for ' + region + ' on ' + day + ' is incomplete (' + gaps + ' of ' + STEPS_PER_DAY + ' intervals missing).');
        }
        if (gaps) warnings.push(gaps + ' missing ' + group + ' interval(s) filled from the nearest value');
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

// Rebuilds the list of datasets that the gridsynth page offers, from the files in data/

const updateIndex = () => {
    let index = { default: null, datasets: [] };
    if (fs.existsSync(INDEX_FILE)) index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

    index.datasets = fs.readdirSync(DATA_DIR)
        .filter((file) => file.endsWith('.json') && file !== path.basename(INDEX_FILE))
        .map((file) => {
            const { id, title, region, date } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            return { id, title, region, date, file };
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.region.localeCompare(b.region));

    if (!index.datasets.some((dataset) => dataset.id === index.default)) {
        index.default = index.datasets.length ? index.datasets[0].id : null;
    }

    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n');
    return index;
};

const main = async () => {
    const { region, start, end, force, maxRequests } = parseArguments(process.argv.slice(2));
    const { network, offsetMinutes } = REGIONS[region];

    // Only complete days can be played, so today (in the network's local time) and later are out
    const today = networkNow(offsetMinutes).slice(0, 10);
    if (end >= today) fail('Only complete days can be fetched. The latest available day for ' + region + ' is ' + addDays(today, -1) + '.');

    const days = [];
    for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);

    const wanted = days.filter((day) => force || !fs.existsSync(datasetFile(region, day)));
    const skipped = days.length - wanted.length;
    if (skipped) console.log('Skipping ' + skipped + ' day(s) already in data/ (use --force to fetch them again).');
    if (!wanted.length) {
        updateIndex();
        console.log('Nothing to fetch. API requests made: 0.');
        return;
    }

    const chunks = chunkDays(wanted);
    const plannedRequests = chunks.length * REQUESTS_PER_CHUNK;
    if (plannedRequests > maxRequests) {
        fail('Fetching ' + wanted.length + ' day(s) needs ' + plannedRequests + ' API requests, which is over the limit of ' + maxRequests +
            ' for one run.\nFetch a shorter range, or raise the limit with --max-requests ' + plannedRequests + '.');
    }

    if (!API_KEY) console.warn('OPENELECTRICITY_API_KEY is not set, so requests will be sent without a key.');
    console.log('Fetching ' + wanted.length + ' day(s) for ' + region + ' using ' + plannedRequests + ' API request(s).');

    fs.mkdirSync(DATA_DIR, { recursive: true });

    for (const chunk of chunks) {
        const range = {
            interval: INTERVAL_MINUTES + 'm',
            date_start: chunk[0] + 'T00:00:00',
            date_end: addDays(chunk[chunk.length - 1], 1) + 'T00:00:00',
            network_region: region,
            primary_grouping: 'network_region',
        };

        const generationData = await request('/data/network/' + network, { ...range, metrics: 'power', secondary_grouping: 'fueltech_group' });
        const marketData = await request('/market/network/' + network, { ...range, metrics: ['price', 'demand'] });

        const generationSeries = collectSeries(generationData, region, chunk);
        const marketSeries = collectSeries(marketData, region, chunk);

        chunk.forEach((day) => {
            const { dataset, warnings } = buildDataset(region, day, generationSeries, marketSeries);
            fs.writeFileSync(datasetFile(region, day), serialiseDataset(dataset));
            console.log('Saved data/' + dataset.id + '.json (' + dataset.title + ')');
            warnings.forEach((warning) => console.log('  Note: ' + warning));
        });
    }

    const index = updateIndex();
    console.log('data/index.json now lists ' + index.datasets.length + ' dataset(s). API requests made: ' + requestCount + '.');
};

main().catch((error) => {
    console.error(error.message);
    if (requestCount) console.error('API requests made: ' + requestCount + '.');
    process.exit(1);
});
