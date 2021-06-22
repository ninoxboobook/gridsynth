// Sleep function 

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// Creates max value array for BPMs so convertData can be used

const createMaxValueArray = (values) => {
    if (values) {
        let output = [];
        let maxValue = values.reduce(function (a, b) {
            return Math.max(a, b);
        });
        values.forEach((value, i) => {
            output.push(maxValue);
        })
        return output;
    }
}

// Converts raw data into values within a specified range at a specified interval

const convertData = (numerators, denominators, range, lowerBound) => {
    if (numerators && denominators && range && lowerBound) {
        let output = [];
        denominators.forEach((denominator, i) => {
            output.push(lowerBound + ((numerators[i] / denominators[i]) * range));
        })
        return output;
    }
}

// Creates melody

const createNote = (pitch, octave, noteLength) => {
    if (pitch && octave && noteLength) {
        let note = [];
        note.push(pitch.concat(octave), noteLength);
        return note;
    }
}

// Iterate over the generation data
const createMelody = (generationValues, spotPrices, bpms) => {
    if (generationValues && spotPrices && bpms) {
        let melody = [];
        generationValues.forEach((generationValue, i) => {
            let pitch;
            if (generationValue > 1) {
                pitch = log(generationValue).toString().charAt(5);
                if (pitch >= 1 && pitch <= 3) {
                    pitch = scale[1];
                }
                if (pitch >= 4 && pitch <= 6) {
                    pitch = scale[2];
                }
                if (pitch >= 7 && pitch <= 9) {
                    pitch = scale[3];
                } else {
                    pitch = scale[4];
                }
            } else {
                pitch = 'G#';
            }
            let octave;
            if (spotPrices[i] < 50) {
                octave = octaves[4];
            } else if (spotPrices[i] >= 50 && spotPrices[i] < 100) {
                octave = octaves[3];
            } else if (spotPrices[i] >= 100 && spotPrices[i] < 150) {
                octave = octaves[2];
            } else {
                octave = octaves[1];
            }
            let noteLength;



            createNote(pitch, octave, noteLength);
        })
        return melody;
    }
}

// For each value:
// Get the spot price at the time - spot price determines octave
// If spot price[i] is [1]over 150 [2]between 100-150 [3]between 50-100 [4]below 50
//if value is zero, rest, if 1, ???, otherwise log(x), number to string, get 5th decimal point
// if 5th decimal point is: [1]1-2-3 [2]4-5-6 [3]7-8-9 [4]0
// If bpm[i] is [1]1-20% [2]21-40% [3]41-60% [4]61-80% [5]81-100%



// Changes volume according to converted data source

const setVolume = (volume, instrument) => {
    instrument.volume.value = volume;
    console.log(instrument + " volume: " + instrument.volume.value);
}

const rampVolume = async (volumes, tick, instrument) => {
    if (volumes && tick && instrument) {
        // Set the initial volume value of the instrument
        setVolume(volumes[0], instrument)
        for (let i = 0; i < volumes.length; i++) {
            if (playing) {
                const newVolume = Math.min(Math.max(parseInt(volumes[i]), -50), 0); // Ramp the volume up or down according to the volume data, clamped to protect your speakers from rogue data
                setVolume(newVolume, instrument);
                await sleep(tick);
            }
        };
    }
}

// Changes tempo according to converted data source

const setTempo = (tempo) => {
    console.log('BPM: ' + tempo);
    Tone.Transport.bpm.value = tempo;
}

const rampTempo = async (tempos, tick) => {
    if (tempos && tick) {
        for (let i = 0; i < tempos.length; i++) {
            if (playing) {
                setTempo(tempos[i]);
                await sleep(tick);
            }
        }
    }
}

// Generates melodies

const generateMelody = (notes, measures) => {
    if (notes && measures) {
        let melody = [];
        return melody;
    }
}