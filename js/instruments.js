// Volume controller
class VolumeController {
    constructor(volumeValue, tick, instrument) {
        this.volumeValue = volumeValue; // The volume in decibels
        this.tick = tick; // The frequency of ramping in milliseconds
        this.instrument = instrument; // The instrument that the controller affects
    }
}

async function rampVolume(VolumeController) {
    if (VolumeController.volumeValue) {
        // Set the initial volume value of the instrument
        VolumeController.instrument.volume.value = VolumeController.volumeValue[0];
        for (let i = 0; i <= VolumeController.volumeValue.length; i++) {
            if (playing) {
                // Ramp the volume up or down according to the volume data, clamped to protect your speakers from rogue data
                VolumeController.instrument.volume.value = Math.min(Math.max(parseInt(VolumeController.volumeValue[i]), -20), 0);
                await sleep(VolumeController.tick);
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}


// Instruments
let synth;
let coal;
let gas;
let hydro;
let solar;
let wind;


synth = new Tone.Synth({
    oscillator: {
        type: "sine"
    }
});

coal = new Tone.MonoSynth({
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.07,
        decay: 0.08,
        sustain: 0.085,
        release: 0.095,
    }
}).toDestination();

gas = new Tone.AMSynth({
    harmonicity: 2,
    oscillator: {
        type: "sine",
    },
    envelope: {
        attack: 0.04,
        decay: 0.4,
        sustain: 0.5,
        release: 0.2,
    }
}).toDestination();

hydro = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

solar = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

wind = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
}).toDestination();

// Effects rack

const distortion = new Tone.Distortion(0.8).toDestination();
const reverb = new Tone.Reverb(4).toDestination();
const compressor = new Tone.Compressor(-30,1);
const chorus = new Tone.Chorus(1, 1, 1).toDestination().start();
const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
const tremolo = new Tone.Tremolo(3, 0.75).toDestination().start();


synth.connect(reverb);
gas.connect(chorus);
gas.connect(feedbackDelay);
gas.connect(tremolo);
compressor.toDestination();
// coal.connect(distortion);