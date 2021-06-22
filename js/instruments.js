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

let coal = new Tone.Sampler({
    urls: {
        G3: "piano_G3_pp_RR2.wav",
        G4: "piano_G4_pp_RR2.wav",
    },
    baseUrl: "/samples/piano/",
}).toDestination();
coal.name = "Coal";

let wind = new Tone.Sampler({
    urls: {
        G3: "9283__eliasheuninck__sol-3.wav",
    },
    baseUrl: "/samples/musicbox/",
}).toDestination();
wind.name = "Wind";

let hydro = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

let solar = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

let gas = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

let battery = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

// Effects rack

const distortion = new Tone.Distortion(0.8).toDestination();
const reverb = new Tone.Reverb(5).toDestination();
const compressor = new Tone.Compressor(-50,1);
const chorus = new Tone.Chorus(1, 1, 1).toDestination().start();
const pingpongDelay = new Tone.PingPongDelay("8n", 0.5).toDestination();
const tremolo = new Tone.Tremolo(3, 0.75).toDestination().start();


coal.connect(reverb);

wind.connect(chorus);
wind.connect(pingpongDelay);
wind.connect(reverb);

compressor.toDestination();
