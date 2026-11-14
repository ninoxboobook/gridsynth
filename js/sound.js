// The sound panel: controls for changing the sound settings while the song plays

// How each mode is named in the panel

const modeLabels = {
    'Ionian': 'Ionian (major)',
    'Dorian': 'Dorian',
    'Phrygian': 'Phrygian',
    'Lydian': 'Lydian',
    'Mixolydian': 'Mixolydian',
    'Aeolian': 'Aeolian (minor)',
    'Locrian': 'Locrian',
};

const melodyDegreeOptions = [1, 2, 3, 4, 5, 6, 7];
const bassDegreeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// The settings of a synth voice that are set with a slider

const synthSliders = [
    { setting: 'attack', label: 'Attack', min: 0.005, max: 2, step: 0.005, unit: ' seconds' },
    { setting: 'decay', label: 'Decay', min: 0.01, max: 2, step: 0.01, unit: ' seconds' },
    { setting: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01, unit: '' },
    { setting: 'release', label: 'Release', min: 0.01, max: 4, step: 0.01, unit: ' seconds' },
    { setting: 'harmonicity', label: 'Harmonicity', min: 0.5, max: 8, step: 0.5, unit: '' },
    { setting: 'modulationIndex', label: 'Modulation', min: 0, max: 40, step: 1, unit: '' },
];

// Helpers for building the controls

const createElement = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text) {
        element.textContent = text;
    }
    if (className) {
        element.className = className;
    }
    return element;
}

// A drop-down list with a label. onChange is given the chosen value.
// optionLabels gives the text to show for each option, if it is different from its value.

const createSelect = (labelText, options, value, onChange, optionLabels) => {
    const label = createElement("label", null, "sound-field");
    const select = document.createElement("select");
    options.forEach((optionValue) => {
        const option = createElement("option", optionLabels ? optionLabels[optionValue] : optionValue);
        option.value = optionValue;
        select.appendChild(option);
    });
    select.value = value;
    select.addEventListener("change", function () {
        onChange(select.value);
    });
    label.append(createElement("span", labelText), select);
    return label;
}

// A slider with a label that shows its value. onInput is given the value as a number.

const createSlider = (labelText, slider, value, onInput) => {
    const label = createElement("label", null, "sound-field sound-slider");
    const input = document.createElement("input");
    const output = document.createElement("output");
    const showValue = () => {
        output.textContent = input.value + slider.unit;
    };
    input.type = "range";
    input.min = slider.min;
    input.max = slider.max;
    input.step = slider.step;
    input.value = value;
    input.addEventListener("input", function () {
        showValue();
        onInput(Number(input.value));
    });
    showValue();
    label.append(createElement("span", labelText), input, output);
    return label;
}

// A tick box. onChange is given true or false.

const createCheckbox = (accessibleName, checked, onChange) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.setAttribute("aria-label", accessibleName);
    input.addEventListener("change", function () {
        onChange(input.checked);
    });
    return input;
}

// The key, the mode, and the positions in the scale that the melodies and bass line use

// Shows each position in the scale next to the note it currently stands for, such as "5 · G"

// Bass notes are shown with their octave. Melody notes are not, because their octave comes from the data.

const showDegreeNotes = (select, octave) => {
    Array.from(select.options).forEach((option) => {
        const note = octave === undefined ? getNote(Number(option.value), 0).replace(/-?\d+$/, "") : getNote(Number(option.value), octave);
        option.textContent = option.value + " \u00b7 " + note;
    });
}

const createScaleSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Scale"));
    section.append(createElement("p", "The notes of the song come from a key and a mode. The original is C Ionian."));

    const melodySelects = [];
    const bassSelects = [];
    const showNotes = () => {
        melodySelects.forEach((select) => showDegreeNotes(select));
        bassSelects.forEach((select) => showDegreeNotes(select, bassOctave));
    };

    const scale = createElement("div", null, "sound-notes");
    scale.append(createSelect("Key", noteNames, settings.key, (value) => {
        settings.key = value;
        updateNotes();
        showNotes();
    }));
    scale.append(createSelect("Mode", Object.keys(modes), settings.mode, (value) => {
        settings.mode = value;
        updateNotes();
        showNotes();
    }, modeLabels));

    const melody = createElement("fieldset");
    melody.append(createElement("legend", "Melody notes"));
    melody.append(createElement("p", "Every melody is built from five notes, each chosen by its position in the scale. The original uses the first note of the scale twice."));
    const melodyNotes = createElement("div", null, "sound-notes");
    settings.melodyDegrees.forEach((degree, i) => {
        const field = createSelect("Note " + (i + 1), melodyDegreeOptions, degree, (value) => {
            settings.melodyDegrees[i] = Number(value);
            updateNotes();
        });
        melodySelects.push(field.querySelector("select"));
        melodyNotes.append(field);
    });
    melody.append(melodyNotes);

    const bass = createElement("fieldset");
    bass.append(createElement("legend", "Bass notes"));
    bass.append(createElement("p", "The bass line steps up through these notes when the spot price rises, and back down when it falls. Position 8 is the first note of the scale an octave higher."));
    const bassNotes = createElement("div", null, "sound-notes");
    settings.bassDegrees.forEach((degree, i) => {
        const field = createSelect("Step " + (i + 1), bassDegreeOptions, degree, (value) => {
            settings.bassDegrees[i] = Number(value);
            updateNotes();
        });
        bassSelects.push(field.querySelector("select"));
        bassNotes.append(field);
    });
    bass.append(bassNotes);

    showNotes();
    section.append(scale, melody, bass);
    return section;
}

// The tempo range: one slider with a handle for the slowest tempo and a handle for the fastest.
// The fastest tempo is always kept above the slowest.

const tempoLimits = { min: 10, max: 200 };

const createTempoSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Tempo"));
    section.append(createElement("p", "The song plays at the fastest tempo when demand is at its peak for the day, and slows towards the slowest tempo as demand falls."));

    const range = createElement("div", null, "sound-range");
    const track = createElement("div", null, "sound-range-track");
    const output = document.createElement("output");

    const createHandle = (setting, accessibleName) => {
        const input = document.createElement("input");
        input.type = "range";
        input.min = tempoLimits.min;
        input.max = tempoLimits.max;
        input.step = 1;
        input.value = settings.tempo[setting];
        input.setAttribute("aria-label", accessibleName);
        return input;
    };
    const slowest = createHandle('slowest', "Slowest tempo, in beats per minute");
    const fastest = createHandle('fastest', "Fastest tempo, in beats per minute");

    const showTempo = () => {
        const position = (tempo) => (tempo - tempoLimits.min) / (tempoLimits.max - tempoLimits.min);
        range.style.setProperty("--low", position(settings.tempo.slowest));
        range.style.setProperty("--high", position(settings.tempo.fastest));
        // When both handles are at the top of the slider, the slowest one has to be the one on top, or neither could move
        slowest.style.zIndex = position(settings.tempo.slowest) > 0.5 ? 2 : 1;
        fastest.style.zIndex = position(settings.tempo.slowest) > 0.5 ? 1 : 2;
        output.textContent = settings.tempo.slowest + " to " + settings.tempo.fastest + " beats per minute";
    };

    slowest.addEventListener("input", function () {
        settings.tempo.slowest = Math.min(Number(slowest.value), settings.tempo.fastest - 1);
        slowest.value = settings.tempo.slowest;
        showTempo();
        updateTempo();
    });

    fastest.addEventListener("input", function () {
        settings.tempo.fastest = Math.max(Number(fastest.value), settings.tempo.slowest + 1);
        fastest.value = settings.tempo.fastest;
        showTempo();
        updateTempo();
    });

    showTempo();
    range.append(track, slowest, fastest);
    section.append(range, output);
    return section;
}

// Mute, solo and level for every voice

const createMixerSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Voices"));
    section.append(createElement("p", "Mute a voice to silence it, or solo a voice to hear it without the others. Level makes a voice louder or quieter without changing how its volume follows the data."));

    const table = createElement("table", null, "sound-mixer");
    const headings = createElement("tr");
    ["Voice", "Mute", "Solo", "Level"].forEach((heading) => {
        const cell = createElement("th", heading);
        cell.scope = "col";
        headings.append(cell);
    });
    table.append(headings);

    voices.forEach((voice) => {
        const voiceSettings = settings.voices[voice.name];
        const row = createElement("tr");
        const name = createElement("th", voice.label);
        name.scope = "row";

        const mute = createElement("td");
        mute.append(createCheckbox("Mute " + voice.label, voiceSettings.mute, (checked) => {
            voiceSettings.mute = checked;
            silenceMutedVoices();
        }));

        const solo = createElement("td");
        solo.append(createCheckbox("Solo " + voice.label, voiceSettings.solo, (checked) => {
            voiceSettings.solo = checked;
            silenceMutedVoices();
        }));

        const level = createElement("td");
        const slider = createSlider("Level for " + voice.label, { min: -12, max: 12, step: 1, unit: ' dB' }, voiceSettings.trim, (value) => {
            voiceSettings.trim = value;
            updateLevels();
        });
        slider.firstChild.className = "visually-hidden";
        level.append(slider);

        row.append(name, mute, solo, level);
        table.append(row);
    });

    section.append(table);
    return section;
}

// The wave shape and envelope of each synth voice

const createSynthSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Synths"));
    section.append(createElement("p", "Coal, wind and gas are played by synths. The other voices are played by recorded instruments."));

    voices.filter((voice) => voice.synth).forEach((voice) => {
        const synth = settings.voices[voice.name].synth;
        const details = createElement("details");
        details.append(createElement("summary", voice.label));

        details.append(createSelect("Wave", waveShapes, synth.wave, (value) => {
            synth.wave = value;
            applySynthSettings(voice);
        }));

        synthSliders.forEach((slider) => {
            if (synth[slider.setting] !== undefined) {
                details.append(createSlider(slider.label, slider, synth[slider.setting], (value) => {
                    synth[slider.setting] = value;
                    applySynthSettings(voice);
                }));
            }
        });

        section.append(details);
    });

    return section;
}

// Builds the controls from the current settings

function showSoundControls() {
    const controls = document.getElementById("sound-controls");
    const openSynths = Array.from(controls.querySelectorAll("details")).map((details) => details.open);

    controls.textContent = "";
    controls.append(createScaleSection(), createTempoSection(), createMixerSection(), createSynthSection());

    // Keep the synth sections that were open, open
    controls.querySelectorAll("details").forEach((details, i) => {
        details.open = openSynths[i] || false;
    });
}

// Puts every setting back to the original sound

function resetSound() {
    settings = createOriginalSettings();
    applySettings();
    showSoundControls();
}

window.addEventListener("load", function () {
    const sound = document.getElementById("sound");
    const soundButton = document.getElementById("sound-button");

    const closeSound = () => {
        sound.classList.add("hidden");
        soundButton.focus();
    };

    showSoundControls();

    soundButton.addEventListener("click", function () {
        document.getElementById("about").classList.add("hidden");
        sound.classList.toggle("hidden");
        if (!sound.classList.contains("hidden")) {
            sound.focus(); // So the keyboard carries on from the top of the panel
        }
    });

    document.getElementById("sound-close").addEventListener("click", closeSound);

    document.getElementById("sound-reset").addEventListener("click", resetSound);

    sound.addEventListener("keydown", function (event) {
        if (event.key == "Escape") {
            closeSound();
        }
    });
});
