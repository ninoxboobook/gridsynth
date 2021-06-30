// Instruments

let price = new Tone.Sampler({
    urls: {
        C2: "singing_bowl.wav"
    },
    baseUrl: "/samples/singingbowl/",
    attack: 1,
    release: 1,
    curve: "linear",
    volume: -12,
}).toDestination();

let coal = new Tone.Synth({
    oscillator: {
        detune: 0,
        type: "sine",
        // partials: [2,1],
        phase: 0,
    },
    envelope: {
        attack: 0.2,
        decay: 0.05,
        sustain: 0.2,
        release: 0.1,
    }
});
coal.name = "Coal";

// let coal = new Tone.Synth({
//     oscillator: {
//         type: "sine"
//     },
// }).toDestination();
// coal.name = "Coal";

let wind = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();
wind.name = "Wind";

let hydro = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();
hydro.name = "Hydro";

let solar = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();
solar.name = "Solar";

let gas = new Tone.FMSynth({
    harmonicity: 2,
});
gas.name = "Gas";

// let gas = new Tone.Synth({
//     oscillator: {
//         type: "sine"
//     },
// }).toDestination();
// gas.name = "Gas";

let battery = new Tone.Sampler({
    urls: {
        G3: "9283__eliasheuninck__sol-3.wav",
    },
    baseUrl: "/samples/musicbox/",
}).toDestination();
battery.name = "Battery";

// let battery = new Tone.Synth({
//     oscillator: {
//         type: "sine"
//     },
// }).toDestination();
// battery.name = "Battery";

// let coal = new Tone.Sampler({
//     urls: {
//         G3: "piano_G3_pp_RR2.wav",
//         G4: "piano_G4_pp_RR2.wav",
//     },
//     baseUrl: "/samples/piano/",
// }).toDestination();
// coal.name = "Coal";



// Effects rack

const compressor = new Tone.Compressor(-50, 1);
const pingpongDelay = new Tone.PingPongDelay("8n", 0.5);
const chorus = new Tone.Chorus(4, 2.5, 0.5);
const distortion = new Tone.Distortion(0.1)

wind.chain(pingpongDelay, Tone.Destination);
coal.chain(distortion, Tone.Destination);
gas.chain(Tone.Destination);
compressor.toDestination();

// Buffers

const priceBuffer = new Tone.ToneAudioBuffer("/samples/singingbowl/singing_bowl.wav", () => {
	console.log("loaded");
});