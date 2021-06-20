// Instruments
let synth;
let coal;
let gas;
let hydro;
let solar;
let wind;


synth = new Tone.Synth({
    oscillator: {
        type: "sine"
    }
});

coal = new Tone.MonoSynth({
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.07,
        decay: 0.08,
        sustain: 0.085,
        release: 0.095,
    }
}).toDestination();
coal.name = "Coal";

gas = new Tone.AMSynth({
    harmonicity: 2,
    oscillator: {
        type: "sine",
    },
    envelope: {
        attack: 0.04,
        decay: 0.4,
        sustain: 0.5,
        release: 0.2,
    }
}).toDestination();
gas.name = "Gas";

hydro = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

solar = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

wind = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

// Effects rack

const distortion = new Tone.Distortion(0.8).toDestination();
const reverb = new Tone.Reverb(4).toDestination();
const compressor = new Tone.Compressor(-50,1);
const chorus = new Tone.Chorus(1, 1, 1).toDestination().start();
const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
const tremolo = new Tone.Tremolo(3, 0.75).toDestination().start();


synth.connect(reverb);
gas.connect(chorus);
gas.connect(feedbackDelay);
gas.connect(tremolo);
compressor.toDestination();
// coal.connect(distortion);