// Get the data points for conversion

let bpmData = convertData(scheduledDemand, createMaxValueArray(scheduledDemand), 40, 20)
let coalData = convertData(coalGeneration, totalGeneration, 21, -25);
let windData = convertData(windGeneration, totalGeneration, 21, -25);
let hydroData = convertData(hydroGeneration, totalGeneration, 21, -25);
let gasData = convertData(gasGeneration, totalGeneration, 21, -25);
let solarData = convertData(solarGeneration, totalGeneration, 21, -25);
let batteryData = convertData(batteryGeneration, totalGeneration, 21, -25);

// Get the melodies

let coalMelody = (createMelody(coalGeneration, totalGeneration, spotPrice, bpmData));
let windMelody = (createMelody(windGeneration, totalGeneration, spotPrice, bpmData));
let hydroMelody;
let gasMelody;
let solarMelody;
let batteryMelody;

// Set up the tempo controls

Tone.Transport.bpm.value = bpmData[0]; // Initial tempo
Tone.Transport.timeSignature = 3; // Time signature

// Set up the instrument loops

const playMelody = (melody, instrument) => {
    let t = Tone.now();
    for (const note of melody) {
        instrument.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
}

const priceLoop = new Tone.Loop((time) => {
    price.triggerAttackRelease("G#1", "2n.");
}, "1n").start(0);

// Set up UI functions

var playing = false;

function playNote() {
    Tone.start();
    Tone.Transport.start();
    rampTempo(bpmData, 1000);
    rampVolume(windData, 1000, wind);
    rampVolume(coalData, 1000, coal);
    playMelody(coalMelody,coal);
    playMelody(windMelody,wind);
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