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

// Keys and modes
// The notes of the song come from a key and a mode. Each melody and bass note is a position
// in that scale (a scale degree), so changing the key or the mode moves every note together.

const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Each mode, as the number of semitones each of its seven notes is above the key note

const modes = {
    'Ionian': [0, 2, 4, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Aeolian': [0, 2, 3, 5, 7, 8, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
};

const bassOctave = 1; // The octave the bass line starts in

// Works out the note for a position in the scale. Positions above 7 carry on into the next
// octave, so 8 is the key note an octave up. The octave is the octave of the C that the scale
// is built from: keys from C to F# sit above that C and keys from G to B sit below it, which
// keeps the song in a similar register in every key.

const getNote = (degree, octave) => {
    const key = noteNames.indexOf(settings.key);
    const keyOffset = key > 6 ? key - 12 : key;
    const semitones = keyOffset + modes[settings.mode][(degree - 1) % 7] + 12 * Math.floor((degree - 1) / 7);
    return noteNames[((semitones % 12) + 12) % 12] + (Number(octave) + Math.floor(semitones / 12));
}

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
        // The original song is in C Ionian (C major)
        key: 'C',
        mode: 'Ionian',
        // The five notes a melody is built from, as positions in the scale. In C Ionian these
        // are G, C, C, D and E: the original scale of ['G', 'B', 'C', 'D', 'E'], which uses C
        // twice and leaves out the B (see createMelody). Other scales that were tried:
        // ['G', 'B', 'D', 'F#', 'A'];
        // ['F','A','C','Eb','G'];
        melodyDegrees: [5, 1, 1, 2, 3],
        // The notes the bass line steps through, from lowest to highest. In C Ionian these
        // are the original bass line scale of ['C1', 'E1', 'F1', 'G1', 'A1', 'C2'].
        bassDegrees: [1, 3, 4, 5, 6, 8],
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
