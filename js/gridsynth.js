coalVolume = new VolumeController(coalVolumes, 1000, coal);
gasVolume = new VolumeController(gasVolumes, 1000, gas);

const loop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of melody) {
        gas.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
    // triggered every eighth note.
    // synth.triggerAttackRelease("C4", "8n");
}, "1m").start(0);

const bassloop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of bassline) {
        coal.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
        t += Tone.Time(note[1]);
    }
    // triggered every eighth note.
    // synth.triggerAttackRelease("C4", "8n");
}, "1m").start(0);

var playing = false;

function playNote(tempos) {
    Tone.start();
    Tone.Transport.start();
    rampTempo(tempos);
    rampVolume(coalVolume);
    rampVolume(gasVolume);
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
        playNote(tempos);
        buttonFocus();
    });

    document.getElementById("stop-button").addEventListener("click", function () {
        playing = false;
        Tone.Transport.stop();
        buttonFocus();
    });
});