// Get the data points for conversion

let bpmData = convertData(bpms, createMaxValueArray(bpms), 40, 20)
let coalData = convertData(coalGeneration, totalGeneration, 21, -25);
let windData = convertData(windGeneration, totalGeneration, 21, -25);

// Set the tempo controls

Tone.Transport.bpm.value = bpmData[0]; // Initial tempo
Tone.Transport.timeSignature = 3; // Time signature

// Set the instrument loops

const loop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of windmelody) {
        wind.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
}, "2m").start(0);

const bassloop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of coalmelody) {
        coal.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
}, "1m").start(0);

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