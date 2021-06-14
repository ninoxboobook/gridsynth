const synth = new Tone.Synth({
    oscillator: {
        type: "sine"
    }
});
const reverb = new Tone.Reverb(4).toDestination();
synth.connect(reverb);

const distortion = new Tone.Distortion(0.8).toDestination();
const coal = new Tone.MonoSynth({
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.2,
        decay: 0.01,
        sustain: 0.01,
        release: 0.01,
    }
});
coal.connect(distortion);