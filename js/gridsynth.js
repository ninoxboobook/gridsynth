// Get the data points for conversion

let bpmData = convertData(scheduledDemand, createMaxValueArray(scheduledDemand), 60, 30)
let coalData = convertData(coalGeneration, totalGeneration, 21, -30);
let windData = convertData(windGeneration, totalGeneration, 21, -30);
let hydroData = convertData(hydroGeneration, totalGeneration, 21, -30);
let gasData = convertData(gasGeneration, totalGeneration, 21, -30);
let solarData = convertData(solarGeneration, totalGeneration, 21, -30);
let batteryData = convertData(batteryGeneration, totalGeneration, 21, -30);


// Create the melodies

let coalMelody = (createMelody(coalGeneration, totalGeneration));
let windMelody = (createMelody(windGeneration, totalGeneration));
let hydroMelody = (createMelody(hydroGeneration, totalGeneration));
let gasMelody = (createMelody(gasGeneration, totalGeneration));
let solarMelody = (createMelody(solarGeneration, totalGeneration));
let batteryMelody = (createMelody(solarGeneration, totalGeneration));
let bassLine = createBassLine();

// Tempo controls

Tone.Transport.bpm.value = bpmData[0]; // Initial tempo
Tone.Transport.timeSignature = 3; // Time signature

let bpmLoop = new Tone.Loop((time) => {
    rampTempo(bpmData);
}, "4n").start(0);


// Volume controls

let instruments = [coal, wind, gas, hydro, solar, battery];
let volumeData = [coalData, windData, gasData, hydroData, solarData, batteryData];

function setInitialVolume() {
    instruments.forEach((instrument, i) => {
       for (let j = 0; j < 1; j++) {
            if (j < 1) {
                setVolume(volumeData[i][j], instrument);
            }
        }; 
    });
}

setInitialVolume();

let coalCurrentVolume = new CurrentVolume(coalData, coal);
let windCurrentVolume = new CurrentVolume(windData, wind);
let gasCurrentVolume = new CurrentVolume(gasData, gas);
let hydroCurrentVolume = new CurrentVolume(hydroData, hydro);
let solarCurrentVolume = new CurrentVolume(solarData, solar);
let batteryCurrentVolume = new CurrentVolume(batteryData, battery);

let volumeLoop = new Tone.Loop((time) => {
    coalCurrentVolume.ramp();
    windCurrentVolume.ramp();
    gasCurrentVolume.ramp();
    hydroCurrentVolume.ramp();
    solarCurrentVolume.ramp();
    batteryCurrentVolume.ramp();
}, "4n").start(0);


// Set up the melodies as sequences

const coalSequence = new Tone.Sequence((time, note) => {
    coal.triggerAttackRelease(note, "4n", time);
}, coalMelody, "4n").start(0);

const windSequence = new Tone.Sequence((time, note) => {
    wind.triggerAttackRelease(note, "4n", time);
}, windMelody, "4n").start("16n");

const hydroSequence = new Tone.Sequence(async (time, note) => {
    if (note == 0) {
        await sleep(Tone.Time("4n"));
    } else {
        hydro.triggerAttackRelease(note, "4n", time);
    }
}, hydroMelody, "4n").start("8n");

const gasSequence = new Tone.Sequence((time, note) => {
    gas.triggerAttackRelease(note, "4n", time);
}, gasMelody, "4n").start("8n + 16n");

const solarSequence = new Tone.Sequence(async (time, note) => {
    if (note == 0) {
        await sleep(Tone.Time("4n"));
    } else {
        solar.triggerAttackRelease(note, "4n", time);
    }
}, solarMelody, "4n").start("4n");

const batterySequence = new Tone.Sequence(async (time, note) => {
    if (note == 0) {
        await sleep(Tone.Time("4n"));
    } else {
        battery.triggerAttackRelease(note, "4n", time);
    }
}, batteryMelody, "4n").start("4n + 16n");

const priceSequence = new Tone.Sequence((time, note) => {
    price.triggerAttackRelease(note, "1m", time);
}, bassLine, "1m").start(0);


// Set up UI functions

var playing = false;

function playNote() {
    Tone.start();
    Tone.Transport.start();
}

let currentGenerations = [coalCurrentGeneration, windCurrentGeneration, gasCurrentGeneration, hydroCurrentGeneration, solarCurrentGeneration, batteryCurrentGeneration];
let currentInstrumentVolumes = [coalCurrentVolume, windCurrentVolume, gasCurrentVolume, hydroCurrentVolume, solarCurrentVolume, batteryCurrentVolume];

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
    document.getElementById("stop-button").classList.toggle("emphasis");
    document.getElementById("play-button").classList.toggle("emphasis");
    if (playing) {
        document.getElementById("play-button").disabled = true;
        document.getElementById("stop-button").disabled = false;
    } else {
        document.getElementById("stop-button").disabled = true;
        document.getElementById("play-button").disabled = false;
    }
}

window.addEventListener("load", function () {
    document.getElementById("stop-button").disabled = true;
    document.getElementById("play-button").addEventListener("click", function () {
        playing = true;
        playNote();
        buttonFocus();
    });

    document.getElementById("stop-button").addEventListener("click", function () {
        playing = false;
        stopNote();
        buttonFocus();
    });

    const contrastButton = document.getElementById("contrastButton");

    contrastButton.addEventListener("click", function () {  
    let checked = contrastButton.getAttribute("aria-checked") === "true";
    contrastButton.setAttribute("aria-checked", String(!checked));
        document.body.classList.toggle("high-contrast");
    });
});