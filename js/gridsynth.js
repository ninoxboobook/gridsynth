// Get the data points for conversion

let bpmData = convertData(scheduledDemand, createMaxValueArray(scheduledDemand), 60, 30)
let coalData = convertData(coalGeneration, totalGeneration, 21, -30);
let windData = convertData(windGeneration, totalGeneration, 21, -30);
let hydroData = convertData(hydroGeneration, totalGeneration, 21, -30);
let gasData = convertData(gasGeneration, totalGeneration, 21, -30);
let solarData = convertData(solarGeneration, totalGeneration, 21, -30);
let batteryData = convertData(batteryGeneration, totalGeneration, 21, -30);

// Get the melodies

let coalMelody = (createMelody(coalGeneration, totalGeneration));
let windMelody = (createMelody(windGeneration, totalGeneration));
let hydroMelody = (createMelody(hydroGeneration, totalGeneration));
let gasMelody = (createMelody(gasGeneration, totalGeneration));
let solarMelody = (createMelody(solarGeneration, totalGeneration));
let batteryMelody = (createMelody(solarGeneration, totalGeneration));

// TODO: Assign instruments according to average fuel mix???

// Set up the tempo controls

Tone.Transport.bpm.value = bpmData[0]; // Initial tempo
Tone.Transport.timeSignature = 3; // Time signature


// Setting up the melodies as parts

const coalSequence = new Tone.Sequence((time, note) => {
	coal.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, coalMelody, "4n").start(0);

const windSequence = new Tone.Sequence((time, note) => {
	wind.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, windMelody, "4n").start("16n");

const hydroSequence = new Tone.Sequence((time, note) => {
	hydro.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, hydroMelody, "4n").start("8n");

const gasSequence = new Tone.Sequence((time, note) => {
	gas.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, gasMelody, "4n").start("8n + 16n");

const solarSequence = new Tone.Sequence((time, note) => {
	solar.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, solarMelody, "4n").start("4n");

const batterySequence = new Tone.Sequence((time, note) => {
	battery.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, batteryMelody, "4n").start("4n + 16n");


// const priceLoop = new Tone.Loop((time) => {
//     price.triggerAttackRelease("G1", "2n.");
// }, "1n").start(0);

// Set up UI functions

var playing = false;

function playNote() {
    Tone.start();
    Tone.Transport.start();
    rampTempo(bpmData, 1000);
    rampVolume(windData, 1000, wind);
    rampVolume(coalData, 1000, coal);
    rampVolume(gasData, 1000, gas);
    rampVolume(solarData, 1000, solar);
    rampVolume(batteryData, 1000, battery);
    rampVolume(hydroData, 1000, hydro);
    console.log(solarMelody);
}

function stopNote() {
    Tone.Transport.stop();
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
        Tone.Transport.stop();
        buttonFocus();
    });
});