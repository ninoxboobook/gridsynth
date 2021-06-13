const synth = new Tone.Synth();
const reverb = new Tone.Reverb(4).toDestination();
synth.connect(reverb);


