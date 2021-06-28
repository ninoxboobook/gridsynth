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

// Set up the instrument loops

const playMelody = async (melody, instrument) => {
    let t = Tone.now();
    for (const note of melody) {
        if (note[0] != 'rest') {
            instrument.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
            t += Tone.Time(note[1]);
        } else {
            t += Tone.Time(note[1]);
        }
    }
}

// Setting up the melodies as parts

const coalSequence = new Tone.Sequence((time, note) => {
	coal.triggerAttackRelease(note, "4n", time);
	// subdivisions are given as subarrays
}, coalMelody, "4n").start(0);

// var seq = new Tone.Sequence(callback, ["C3", "Eb3", "F4", "Bb4"], "8n");


// const coalPart = new Tone.Part(((time, value) => {
// 	// the value is an object which contains both the note and the velocity
// 	coal.triggerAttackRelease(value.notation, value.noteLength, time);
// }), coalMelody).start(0);

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
    console.log(coalMelody);
    // playMelody(coalMelody, coal);
    // playMelody(windMelody, wind);
    // playMelody(hydroMelody, hydro);
    // playMelody(gasMelody, gas);
    // playMelody(solarMelody, solar);
    // playMelody(batteryMelody, hydro);
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