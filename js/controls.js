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

// Converts raw data into values within a specified range

const convertData = (numerators, denominators, range, lowerBound) => {
    if (numerators && denominators && range && lowerBound) {
        let output = [];
        denominators.forEach((denominator, i) => {
            if (denominator > 0) {
                output.push(lowerBound + ((numerators[i] / denominator) * range));
            } else {
                output.push(lowerBound);
            }
        })
        return output;
    }
}

// Creates notes

const createNote = (pitch, octave) => {
    if (pitch && octave) {
        let note;
        if (pitch + octave == 'rest') {
            note = 0;
        } else {
            note = getNote(pitch, octave); // The pitch is a position in the scale
        }
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
                    pitch = settings.melodyDegrees[0];
                } else if (pitch == '2' || pitch == '3') {
                    pitch = settings.melodyDegrees[1];
                } else if (pitch == '4' || pitch == '5') {
                    pitch = settings.melodyDegrees[2];
                } else if (pitch == '6' || pitch == '7') {
                    pitch = settings.melodyDegrees[3];
                } else if (pitch == '8' || pitch == '9') {
                    pitch = settings.melodyDegrees[4];
                } else {
                    pitch = settings.melodyDegrees[0]; // The logarithm was too short to have a digit in this position
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

// Creates a bass line that moves up or down according to spot price trend

const getAverage = (values) => {
    let total = 0;
    let average;
    if (values) {
        values.forEach((value, i) => {
            total += value;
        });
        average = total / values.length;
        return average;
    }
}

const averageArray = (array, segmentSize) => {
    let i = 0;
    let arrayLength = array.length;
    let averagedArray = [];
    if (array && segmentSize) {
        for (i = 0; i < arrayLength; i += segmentSize) {
            let segment = array.slice(i, i + segmentSize);
            let segmentAverage = Math.round(getAverage(segment));
            averagedArray.push(segmentAverage);
        }
        return averagedArray;
    }
}

const createBassLine = (spotPrices) => {
    let averageSpotPrices = averageArray(spotPrices, stepsPerHour);
    let notesPerAverage = stepsPerHour / stepsPerBar; // Keeps each hour of price in step with the same hour of generation
    let bassNotes = settings.bassDegrees.map((degree) => getNote(degree, bassOctave));
    let bassLineIndex = 0;
    let bassLine = [];
    if (averageSpotPrices) {
        for (let i = 0; i < averageSpotPrices.length; i++) {
            if (i > 0) {
                if (averageSpotPrices[i] > averageSpotPrices[i - 1]) {
                    if (bassLineIndex < bassNotes.length - 1) {
                        bassLineIndex++;
                    } else {
                        bassLineIndex = 0;
                    }
                } else if (averageSpotPrices[i] < averageSpotPrices[i - 1]) {
                    if (bassLineIndex > 0) {
                        bassLineIndex--;
                    } else {
                        bassLineIndex = 0;
                    }
                }
            }
            for (let j = 0; j < notesPerAverage; j++) {
                bassLine.push(bassNotes[bassLineIndex]);
            }
        }
        return bassLine;
    }

    // TODO Decide the first note of the bassline
}

// Changes volume according to converted data source

const setVolume = (volume, instrument) => {
    instrument.volume.value = volume;
}

function CurrentVolume(volumes, instrument, voiceName) {
    this.value;
    this.timeIndex = 0;
    this.ramp = function () {
        this.value = Math.min(Math.max(parseInt(volumes[this.timeIndex]), -50), 0);
        if (volumes && instrument) {
            if (playing) {
                setVolume(this.value + settings.voices[voiceName].trim, instrument);
                console.log("[" + this.timeIndex + "] " + instrument + " volume: " + instrument.volume.value);
                if (this.timeIndex < volumes.length - 1) {
                    this.timeIndex++;
                } else {
                    this.timeIndex = 0;
                }
            }
        }
    }
}

// Changes tempo according to converted data source

const minTempo = 10; // Stops the song from stalling if demand drops to zero or below

const setTempo = (tempo) => {
    tempo = Math.max(tempo, minTempo);
    console.log('BPM: ' + tempo);
    Tone.Transport.bpm.value = tempo;
}

let tempoIndex = 0;

const rampTempo = (tempos) => {
    if (tempos && playing) {
        setTempo(tempos[tempoIndex]);
        if (tempoIndex < tempos.length - 1) {
            tempoIndex++
        } else {
            tempoIndex = 0;
        }
    }
}