// Sound settings
// gridsynth always starts with the original sound. The sound panel changes a working copy of
// these settings, and the song reads from that copy, so the original is never lost.

// Every voice in the song: one for each generation source, plus the bass line.
// The synth voices have extra settings that the sampled voices do not.

const voices = [
    { name: 'coal', label: 'Coal', instrument: coal, synth: true },
    { name: 'wind', label: 'Wind', instrument: wind, synth: true },
    { name: 'gas', label: 'Gas', instrument: gas, synth: true },
    { name: 'hydro', label: 'Hydro', instrument: hydro },
    { name: 'solar', label: 'Solar', instrument: solar },
    { name: 'battery', label: 'Battery', instrument: battery },
    { name: 'price', label: 'Spot price (bass line)', instrument: price },
];

// The wave shapes a synth voice can use

const waveShapes = ['sine', 'triangle', 'square', 'sawtooth'];

// Reads the settings of a synth voice from the instrument itself

const getSynthSettings = (instrument) => {
    const current = instrument.get();
    const synth = {
        wave: current.oscillator.type,
        attack: current.envelope.attack,
        decay: current.envelope.decay,
        sustain: current.envelope.sustain,
        release: current.envelope.release,
    };
    // Only the frequency-modulated synth has these two
    if (current.harmonicity !== undefined) {
        synth.harmonicity = current.harmonicity;
        synth.modulationIndex = current.modulationIndex;
    }
    return synth;
}

// The original synth settings and bass line level are read from the instruments as they are
// set up in instruments.js, before anything has been changed

const originalSynthSettings = {};
voices.forEach((voice) => {
    if (voice.synth) {
        originalSynthSettings[voice.name] = getSynthSettings(voice.instrument);
    }
});

const originalBassLevel = price.volume.value;

const createOriginalSettings = () => {
    const original = {
        // The five notes a melody is built from. The original uses C twice and leaves out
        // the B in the scale (see createMelody).
        melodyNotes: [scale[0], scale[2], scale[2], scale[3], scale[4]],
        // The notes the bass line steps through, from lowest to highest
        bassNotes: bassLineScale.slice(),
        // The tempo range in beats per minute
        tempo: { slowest: 30, fastest: 90 },
        voices: {},
    };
    voices.forEach((voice) => {
        original.voices[voice.name] = { mute: false, solo: false, trim: 0 };
        if (voice.synth) {
            original.voices[voice.name].synth = Object.assign({}, originalSynthSettings[voice.name]);
        }
    });
    return original;
}

let settings = createOriginalSettings();

// A voice plays if it is not muted. If any voice is set to solo, only the solo voices play.

const isAudible = (voiceName) => {
    const anySolo = voices.some((voice) => settings.voices[voice.name].solo);
    return anySolo ? settings.voices[voiceName].solo : !settings.voices[voiceName].mute;
}

// Applies the settings of a synth voice to its instrument

const applySynthSettings = (voice) => {
    const synth = settings.voices[voice.name].synth;
    const options = {
        oscillator: { type: synth.wave },
        envelope: { attack: synth.attack, decay: synth.decay, sustain: synth.sustain, release: synth.release },
    };
    if (synth.harmonicity !== undefined) {
        options.harmonicity = synth.harmonicity;
        options.modulationIndex = synth.modulationIndex;
    }
    voice.instrument.set(options);
}
