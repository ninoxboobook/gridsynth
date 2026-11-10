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

// The song currently loaded: its tempos, volumes and sequences

let bpmData = [];
let currentInstrumentVolumes = [];
let sequences = [];

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

// Turns a dataset into a song

function createSong(dataset) {
    let totalGeneration = dataset.totalGeneration;

    // Clear out the previous song

    sequences.forEach((sequence) => {
        sequence.dispose();
    });
    sequences = [];
    currentInstrumentVolumes = [];

    // Get the data points for conversion

    bpmData = convertData(dataset.demand, createMaxValueArray(dataset.demand), 60, 30);
    tempoIndex = 0;
    Tone.Transport.bpm.value = bpmData[0]; // Initial tempo

    generationSources.forEach((source) => {
        let generation = dataset.generation[source.name];
        let volumeData = convertData(generation, totalGeneration, 21, -30);
        let melody = createMelody(generation, totalGeneration);

        setVolume(volumeData[0], source.instrument); // Initial volume
        currentInstrumentVolumes.push(new CurrentVolume(volumeData, source.instrument));

        // Set up the melody as a sequence

        sequences.push(new Tone.Sequence((time, note) => {
            if (note != 0) {
                source.instrument.triggerAttackRelease(note, "4n", time);
            }
        }, melody, "4n").start(source.start));
    });

    sequences.push(new Tone.Sequence((time, note) => {
        price.triggerAttackRelease(note, "1m", time);
    }, createBassLine(dataset.price), "1m").start(0));

    setVisualiserData(generationSources.map((source) => dataset.generation[source.name]), totalGeneration);
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

// Fills the song picker with the available datasets and loads the default one

async function setUpSongs() {
    const songSelect = document.getElementById("song-select");

    try {
        const datasetList = await getDatasetList();

        datasetList.datasets.forEach((dataset) => {
            const option = document.createElement("option");
            option.value = dataset.file;
            option.textContent = dataset.title;
            option.selected = dataset.id == datasetList.default;
            songSelect.appendChild(option);
        });

        // The picker is only needed when there is more than one song to choose from
        document.getElementById("song-picker").hidden = datasetList.datasets.length < 2;

        songSelect.addEventListener("change", function () {
            loadSong(songSelect.value);
        });

        await loadSong(songSelect.value);
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

    const contrastButton = document.getElementById("contrastButton");

    contrastButton.addEventListener("click", function () {
    let checked = contrastButton.getAttribute("aria-checked") === "true";
    contrastButton.setAttribute("aria-checked", String(!checked));
        document.body.classList.toggle("high-contrast");
    });

    document.getElementById("about-button").addEventListener("click", function () {
        document.getElementById("about").classList.toggle("hidden");
    })

    setUpSongs();
});
