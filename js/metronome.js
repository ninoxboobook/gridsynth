Tone.Transport.bpm.value = 73;
Tone.Transport.timeSignature = 3;

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
async function rampTempo(tempos) {
    if (tempos) {
        for (let i = 0; i <= tempos.length; i++) {
            if (playing) {
                await sleep(1000);
                console.log(tempos[i]);
                Tone.Transport.bpm.rampTo(tempos[i], 1);
            } else {
                return false;
            }
        }
    } else {
        return false;
    }

}