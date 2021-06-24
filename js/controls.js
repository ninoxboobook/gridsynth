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

// Creates notes

const createNote = (pitch, octave) => {
    if (pitch && octave) {
        let note = [];
        note.push(pitch.concat(octave), '4n');
        return note;
    }
}

// Creates a melody of notes based on generation data

const createMelody = (generationValues, noise) => {
    if (generationValues) {
        let melody = [];

        generationValues.forEach((generationValue, i) => {
            let pitch;
            if (generationValue > 1) {
                pitch = Math.log(generationValue + noise[i]).toString().charAt(4);
                if (pitch == '0' || pitch == '1') {
                    pitch = scale[0];
                } else if (pitch == '2' || pitch == '3') {
                    pitch = scale[2];
                } else if (pitch == '4' || pitch == '5') {
                    pitch = scale[2];
                } else if (pitch == '6' || pitch == '7') {
                    pitch = scale[3];
                } else if (pitch == '8' || pitch == '9') {
                    pitch = scale[4];
                }
            } else {
                pitch = 're';
            }

            let octave;
            let maxValue = generationValues.reduce(function (a, b) {
                return Math.max(a, b);
            });
            if (pitch != 're') {
                if (generationValue <= maxValue * (1 / 3)) {
                    octave = octaves[0];
                } else if (generationValue > maxValue * (1 / 3) && generationValue <= maxValue * (2 / 3)) {
                    octave = octaves[1];
                } else if (generationValue > maxValue * (2 / 3)) {
                    octave = octaves[2];
                }
            } else {
                octave = 'st';
            }

            if (pitch && octave) {
                melody.push(createNote(pitch, octave));
            }
        })
        return melody;
    }
}

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

// Controls spot price bassline with trends

// Plays melodies at highest and lowest points

// Adds percussion at certain bpm