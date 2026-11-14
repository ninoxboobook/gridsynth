// Each generation source, the instrument that plays it, and when its melody starts.
// The melodies are offset from each other by a 16th note.

const generationSources = [
    { name: 'coal', instrument: coal, start: 0 },
    { name: 'wind', instrument: wind, start: "16n" },
    { name: 'hydro', instrument: hydro, start: "8n" },
    { name: 'gas', instrument: gas, start: "8n + 16n" },
    { name: 'solar', instrument: solar, start: "4n" },
    { name: 'battery', instrument: battery, start: "4n + 16n" },
];

// The song currently loaded: its data, tempos, volumes and sequences

let currentDataset = null;
let bpmData = [];
let currentInstrumentVolumes = [];
let sequences = [];
let bassSequence = null;

Tone.Transport.timeSignature = stepsPerBar; // One note of the bass line lasts one bar

// Tempo controls

let bpmLoop = new Tone.Loop((time) => {
    rampTempo(bpmData);
}, "4n").start(0);

// Volume controls

let volumeLoop = new Tone.Loop((time) => {
    currentInstrumentVolumes.forEach((currentInstrumentVolume) => {
        currentInstrumentVolume.ramp();
    });
}, "4n").start(0);

// Turns a dataset into a song, using the current sound settings

const createTempos = (dataset) => {
    return convertData(dataset.demand, createMaxValueArray(dataset.demand), settings.tempo.fastest - settings.tempo.slowest, settings.tempo.slowest);
}

function createSong(dataset) {
    let totalGeneration = dataset.totalGeneration;
    currentDataset = dataset;

    // Clear out the previous song

    sequences.forEach((sequence) => {
        sequence.dispose();
    });
    sequences = [];
    currentInstrumentVolumes = [];

    // Get the data points for conversion

    bpmData = createTempos(dataset);
    tempoIndex = 0;
    setTempo(bpmData[0]); // Initial tempo

    generationSources.forEach((source) => {
        let generation = dataset.generation[source.name];
        let melody = createMelody(generation, totalGeneration);

        source.volumeData = convertData(generation, totalGeneration, 21, -30);
        source.currentVolume = new CurrentVolume(source.volumeData, source.instrument, source.name);
        currentInstrumentVolumes.push(source.currentVolume);

        // Set up the melody as a sequence

        source.sequence = new Tone.Sequence((time, note) => {
            if (note != 0 && isAudible(source.name)) {
                source.instrument.triggerAttackRelease(note, "4n", time);
            }
        }, melody, "4n").start(source.start);
        sequences.push(source.sequence);
    });

    bassSequence = new Tone.Sequence((time, note) => {
        if (isAudible('price')) {
            price.triggerAttackRelease(note, "1m", time);
        }
    }, createBassLine(dataset.price), "1m").start(0);
    sequences.push(bassSequence);

    updateLevels(); // Initial volumes

    setVisualiserData(generationSources.map((source) => dataset.generation[source.name]), totalGeneration);
}

// Applying changes to the sound settings
// Each of these can be called while the song is playing, and the change is heard straight away.

// Rebuilds the melodies and the bass line from the current notes

function updateNotes() {
    if (!currentDataset) {
        return;
    }
    generationSources.forEach((source) => {
        source.sequence.events = createMelody(currentDataset.generation[source.name], currentDataset.totalGeneration);
    });
    bassSequence.events = createBassLine(currentDataset.price);
}

// Rebuilds the tempos from the current tempo range

function updateTempo() {
    if (!currentDataset) {
        return;
    }
    bpmData = createTempos(currentDataset);
    if (!playing) {
        setTempo(bpmData[0]);
    }
}

// Sets the volume of every voice: the volume from the data, plus the level set for the voice

function updateLevels() {
    generationSources.forEach((source) => {
        if (source.currentVolume) {
            let volume = source.currentVolume.value === undefined ? source.volumeData[0] : source.currentVolume.value;
            setVolume(volume + settings.voices[source.name].trim, source.instrument);
        }
    });
    setVolume(originalBassLevel + settings.voices.price.trim, price);
}

// Stops any note that is still sounding on a voice that has just been muted

function silenceMutedVoices() {
    voices.forEach((voice) => {
        if (!isAudible(voice.name)) {
            if (voice.instrument.releaseAll) {
                voice.instrument.releaseAll();
            } else {
                voice.instrument.triggerRelease();
            }
        }
    });
}

// Applies every sound setting at once

function applySettings() {
    voices.forEach((voice) => {
        if (voice.synth) {
            applySynthSettings(voice);
        }
    });
    updateNotes();
    updateTempo();
    updateLevels();
    silenceMutedVoices();
}

// Set up UI functions

var playing = false;

function playNote() {
    Tone.start();
    Tone.Transport.start();
}

function stopNote() {
    Tone.Transport.stop();
    tempoIndex = 0;
    currentInstrumentVolumes.forEach((currentInstrumentVolume, i) => {
        currentInstrumentVolume.timeIndex = 0;
    });
    currentGenerations.forEach((currentGenerationSource, i) => {
        currentGenerationSource.timeIndex = 0;
    });
}

function buttonFocus() {
    document.getElementById("stop-button").classList.toggle("emphasis", playing);
    document.getElementById("play-button").classList.toggle("emphasis", !playing);
    document.getElementById("play-button").disabled = playing;
    document.getElementById("stop-button").disabled = !playing;
}

function stop() {
    if (playing) {
        playing = false;
        stopNote();
        buttonFocus();
    }
}

// Shows where the data for the current song came from

function showDataSource(source) {
    const dataSource = document.getElementById("data-source");
    dataSource.textContent = "";
    if (!source) {
        return;
    }

    const createLink = (text, url) => {
        const link = document.createElement("a");
        link.textContent = text;
        link.href = url;
        return link;
    };

    dataSource.append("Data sourced from ", source.url ? createLink(source.name, source.url) : source.name);
    if (source.publisher) {
        dataSource.append(" (" + source.publisher + ")");
    }
    if (source.licence) {
        dataSource.append(", licensed under ", source.licenceUrl ? createLink(source.licence, source.licenceUrl) : source.licence);
    }
    dataSource.append(".");
}

// Loads a dataset and gets its song ready to play

async function loadSong(file) {
    const songTitle = document.getElementById("song-title");
    const playButton = document.getElementById("play-button");

    stop();
    playButton.disabled = true;

    try {
        const dataset = await getDataset(file);
        createSong(dataset);
        songTitle.textContent = dataset.title;
        showDataSource(dataset.source);
        playButton.disabled = false;
    } catch (error) {
        console.error(error);
        songTitle.textContent = "Sorry, the grid data could not be loaded.";
        showDataSource(null);
    }
}

// Sets up the region and day pickers with the available datasets, and loads the default song

function formatDate(date) {
    return new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
}

async function setUpSongs() {
    const regionSelect = document.getElementById("region-select");
    const dateSelect = document.getElementById("date-select");

    try {
        const datasetList = await getDatasetList();

        // Lists the days available for a region, most recent first, keeping the current day selected if the region has it

        const showDates = (region, selectedDate) => {
            const dates = datasetList.datasets
                .filter((dataset) => dataset.region == region)
                .map((dataset) => dataset.date)
                .sort()
                .reverse();

            dateSelect.textContent = "";
            dates.forEach((date) => {
                const option = document.createElement("option");
                option.value = date;
                option.textContent = formatDate(date);
                dateSelect.appendChild(option);
            });
            dateSelect.value = dates.includes(selectedDate) ? selectedDate : dates[0];
        };

        const loadSelectedSong = () => {
            const dataset = datasetList.datasets.find((dataset) => {
                return dataset.region == regionSelect.value && dataset.date == dateSelect.value;
            });
            return loadSong(dataset.file);
        };

        datasetList.regions.forEach((region) => {
            const option = document.createElement("option");
            option.value = region.code;
            option.textContent = region.name;
            regionSelect.appendChild(option);
        });
        regionSelect.value = datasetList.default.region;
        showDates(datasetList.default.region, datasetList.default.date);

        // The pickers are only needed when there is more than one song to choose from
        document.getElementById("song-picker").hidden = datasetList.datasets.length < 2;

        regionSelect.addEventListener("change", function () {
            showDates(regionSelect.value, dateSelect.value);
            loadSelectedSong();
        });

        dateSelect.addEventListener("change", loadSelectedSong);

        await loadSelectedSong();
    } catch (error) {
        console.error(error);
        document.getElementById("song-title").textContent = "Sorry, the grid data could not be loaded.";
    }
}

window.addEventListener("load", function () {
    document.getElementById("stop-button").disabled = true;
    document.getElementById("play-button").disabled = true;

    document.getElementById("play-button").addEventListener("click", function () {
        playing = true;
        playNote();
        buttonFocus();
    });

    document.getElementById("stop-button").addEventListener("click", stop);

    document.getElementById("about-button").addEventListener("click", function () {
        document.getElementById("sound").classList.add("hidden");
        document.getElementById("about").classList.toggle("hidden");
    })

    setUpSongs();
});
