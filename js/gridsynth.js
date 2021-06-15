let tempos = [73, 72, 72, 71, 71, 70, 71, 69, 69, 69, 68, 68, 68, 67, 67, 66, 66, 65, 65, 65, 65, 65, 64, 64,
    63, 63, 63, 63, 62, 62, 62, 62, 61, 60, 61, 60, 60, 60, 60, 60, 60, 60, 61, 60, 60, 61, 61, 61, 61, 61,
    61, 61, 61, 62, 61, 62, 62, 62, 62, 63, 63, 64, 64, 64, 64, 65, 65, 66, 66, 66, 67, 67, 69, 69, 71, 71,
    72, 73, 74, 76, 77, 78, 79, 80, 82, 82, 83, 85, 86, 88, 87, 89, 90, 90, 90, 92, 92, 93, 94, 94, 94, 94,
    93, 93, 93, 93, 93, 93, 93, 93, 93, 92, 92, 91, 91, 91, 90, 90, 90, 90, 89, 89, 88, 87, 87, 87, 86, 86,
    85, 85, 84, 84, 84, 84, 83, 83, 83, 83, 82, 83, 82, 82, 82, 81, 80, 80, 80, 80, 79, 79, 79, 79, 79, 78,
    78, 78, 78, 78, 78, 78, 78, 78, 77, 77, 77, 77, 76, 76, 76, 75, 76, 76, 76, 76, 76, 77, 77, 77, 77, 77,
    77, 77, 78, 77, 78, 78, 79, 80, 80, 81, 82, 82, 83, 84, 84, 85, 85, 86, 86, 87, 88, 89, 89, 90, 91, 91,
    93, 94, 94, 96, 96, 97, 98, 99, 99, 99, 98, 98, 98, 97, 98, 97, 97, 97, 96, 96, 95, 94, 94, 94, 94, 94,
    94, 92, 92, 92, 91, 91, 91, 91, 90, 90, 91, 90, 89, 89, 88, 88, 87, 87, 86, 85, 85, 86, 85, 84, 83, 83,
    82, 83, 82, 81, 81, 79, 79, 78, 77, 77, 77, 76, 76, 76, 76, 76, 76, 74, 74, 75, 77, 77, 77, 77, 77, 77,
    77, 76, 76, 75
]

let coalVolumes = [-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0];

coalVolume = new VolumeController(coalVolumes,1000,coal);

const melody = [
    ['A3', '8n'],
    ['B3', '8n'],
    ['C4', '8n'],
    ['E4', '8n'],
    ['A4', '8n'],
    ['B4', '8n'],
];

const bassline = [
    ['A2', '8n'],
    ['A2', '8n'],
    ['0', '8n'],
    ['A2', '8n'],
    ['A2', '8n'],
    ['A2', '8n'],
]

const loop = new Tone.Loop((time) => {
    let t = Tone.now();

    for (const note of melody) {
        synth.triggerAttackRelease(note[0], Tone.Time(note[1]), t);
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

function playNote(tempos) {
    Tone.start();
    Tone.Transport.start();
    rampTempo(tempos);
    rampVolume(coalVolume);
}

function stopNote() {
    Tone.Transport.stop();
}

window.addEventListener("load", function () {
    document.getElementById("play-button").addEventListener("click", function () {
        playing = true;
        playNote(tempos);
    });

    document.getElementById("stop-button").addEventListener("click", function () {
        playing = false;
        Tone.Transport.stop();
    });
});