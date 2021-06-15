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


// Effects rack

const distortion = new Tone.Distortion(0.8).toDestination();
const reverb = new Tone.Reverb(4).toDestination();


// Instruments

const synth = new Tone.Synth({
    oscillator: {
        type: "sine"
    }
});

synth.connect(reverb);


const coal = new Tone.MonoSynth({
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

// coal.connect(distortion);