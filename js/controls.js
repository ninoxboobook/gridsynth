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
            output.push(lowerBound + ((numerators[i] / denominators[i]) * range));
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
            note = pitch.concat(octave);
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

const createBassLine = () => {
    let averageSpotPrices = averageArray(spotPrice, 12);
    let i = 0;
    let bassLineIndex = 0;
    let bassLine = [];
    if (averageSpotPrices) {
        for (i = 0; i < averageSpotPrices.length; i++) {
            if (i == 0) {
                bassLine.push(bassLineScale[bassLineIndex]);
                bassLine.push(bassLineScale[bassLineIndex]);
                bassLine.push(bassLineScale[bassLineIndex]);
            } else {
                if (averageSpotPrices[i] > averageSpotPrices[i - 1]) {
                    if (bassLineIndex < 5) {
                        bassLineIndex++;
                    } else {
                        bassLineIndex = 0;
                    }
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                } else if (averageSpotPrices[i] < averageSpotPrices[i - 1]) {
                    if (bassLineIndex > 0) {
                        bassLineIndex--;
                    } else {
                        bassLineIndex = 0;
                    }
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                } else {
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                    bassLine.push(bassLineScale[bassLineIndex]);
                }
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

function CurrentVolume(volumes, instrument) {
    this.value;
    this.timeIndex = 0;
    this.ramp = function () {
        this.value = Math.min(Math.max(parseInt(volumes[this.timeIndex]), -50), 0);
        if (volumes && instrument) {
            if (playing) {
                setVolume(this.value, instrument);
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

const setTempo = (tempo) => {
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