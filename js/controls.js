// Sleep function 

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


// Data converter: converts raw data into values within a specified range at a specified interval

class DataConverter {
    constructor(numerator, denominator, range, lowerBound, tick, output) {
        this.numerator = numerator; // Value to be divided, e.g. fuel generation
        this.denominator = denominator; // Value to divide by, e.g. total generation
        this.range = range; // Output value range, e.g. difference between lower and upper bounds of output value range
        this.lowerBound = lowerBound; // Lower bound of output value range
        this.tick = tick; // Frequency of data conversion
        this.output = output;
    }
}

// This version pushes all conversions to an array
function convertData(DataConverter) {
    if (DataConverter.numerator && DataConverter.denominator) {
        DataConverter.output = [];
        for (let i = 0; i < DataConverter.denominator.length; i++) {
            if (playing) {
                DataConverter.output.push(DataConverter.lowerBound + ((DataConverter.numerator[i] / DataConverter.denominator[i]) * DataConverter.range));
            } else {
                return false;
            }
        }
        return DataConverter.output;
    } else {
        return false;
    }
}

// This version converts data at a specified frequency
// async function convertData(DataConverter) {
//     let outputValue;
//     if (DataConverter.numerator && DataConverter.denominator) {
//         for (let i = 0; i <= DataConverter.denominator.length; i++) {
//             if (playing) {
//                 console.log(DataConverter.lowerBound + ((DataConverter.numerator[i] / DataConverter.denominator[i]) * DataConverter.range));
//                 outputValue = DataConverter.lowerBound + ((DataConverter.numerator[i] / DataConverter.denominator[i]) * DataConverter.range);
//                 await sleep(DataConverter.tick);
//             } else {
//                 return false;
//             }
//         }
//     } else {
//         return false;
//     }
// }


// Volume controller: changes volume according to converted data source

class VolumeController {
    constructor(volumeValue, tick, instrument) {
        this.volumeValue = volumeValue; // Volume in decibels
        this.tick = tick; // Frequency of ramping in milliseconds
        this.instrument = instrument; // Instrument that the controller affects
    }
}

async function rampVolume(VolumeController) {
    if (VolumeController.volumeValue) {
        // Set the initial volume value of the instrument
        VolumeController.instrument.volume.value = VolumeController.volumeValue[0];
        for (let i = 0; i < VolumeController.volumeValue.length; i++) {
            if (playing) {
                VolumeController.instrument.volume.value = Math.min(Math.max(parseInt(VolumeController.volumeValue[i]), -50), 0); // Ramp the volume up or down according to the volume data, clamped to protect your speakers from rogue data
                console.log(VolumeController.instrument + " volume: " + VolumeController.instrument.volume.value);
                await sleep(VolumeController.tick);
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}


// Tempo controller: changes tempo according to converted data source

class TempoController {
    constructor(tempoValue, tick) {
        this.tempoValue = tempoValue; // Tempo in bpm
        this.tick = tick;
    }
}

async function rampTempo(TempoController) {
    if (TempoController.tempoValue) {
        for (let i = 0; i < TempoController.tempoValue.length; i++) {
            if (playing) {
                console.log('BPM: ' + TempoController.tempoValue[i]);
                Tone.Transport.bpm.value = TempoController.tempoValue[i];
                await sleep(TempoController.tick);
            } else {
                return false;
            }
        }
    } else {
        return false;
    }

}