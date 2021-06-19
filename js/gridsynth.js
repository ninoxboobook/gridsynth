// Get the data points for conversion

let coalData = new DataConverter(coalGeneration, totalGeneration, 23, -30, 1000);
let hydroData = new DataConverter(hydroGeneration, totalGeneration, 23, -30, 1000);


// Set the volume controls

let coalVolume = new VolumeController(coalVolumes, 1000, coal);
let gasVolume = new VolumeController(gasVolumes, 1000, gas);


// Set the tempo controls

Tone.Transport.bpm.value = 73; // Initial tempo
Tone.Transport.timeSignature = 3; // Time signature

let tempos = new TempoController(tempoValues, 1000);


// Set the loops

const loop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of melody) {
        gas.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
}, "1m").start(0);

const bassloop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of bassline) {
        coal.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
}, "1m").start(0);


// Set up UI functions

var playing = false;

function playNote() {
    Tone.start();
    Tone.Transport.start();
    rampTempo(tempos);
    rampVolume(coalVolume);
    rampVolume(gasVolume);
    console.log(convertData(coalData));
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