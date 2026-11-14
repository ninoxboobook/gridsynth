// The sound panel: controls for changing the sound settings while the song plays

const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// The bass line can use any note from C1 to C3

const bassNoteNames = [];
['1', '2'].forEach((octave) => {
    noteNames.forEach((noteName) => {
        bassNoteNames.push(noteName + octave);
    });
});
bassNoteNames.push('C3');

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

const createSelect = (labelText, options, value, onChange) => {
    const label = createElement("label", null, "sound-field");
    const select = document.createElement("select");
    options.forEach((optionValue) => {
        const option = createElement("option", optionValue);
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

// The melody and bass notes

const createNotesSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Notes"));

    const melody = createElement("fieldset");
    melody.append(createElement("legend", "Melody notes"));
    melody.append(createElement("p", "Every melody is built from these five notes. The original uses C twice."));
    const melodyNotes = createElement("div", null, "sound-notes");
    settings.melodyNotes.forEach((note, i) => {
        melodyNotes.append(createSelect("Note " + (i + 1), noteNames, note, (value) => {
            settings.melodyNotes[i] = value;
            updateNotes();
        }));
    });
    melody.append(melodyNotes);

    const bass = createElement("fieldset");
    bass.append(createElement("legend", "Bass notes"));
    bass.append(createElement("p", "The bass line steps up through these notes when the spot price rises, and back down when it falls."));
    const bassNotes = createElement("div", null, "sound-notes");
    settings.bassNotes.forEach((note, i) => {
        bassNotes.append(createSelect("Step " + (i + 1), bassNoteNames, note, (value) => {
            settings.bassNotes[i] = value;
            updateNotes();
        }));
    });
    bass.append(bassNotes);

    section.append(melody, bass);
    return section;
}

// The tempo range. The fastest tempo is always kept above the slowest.

const createTempoSection = () => {
    const section = createElement("section");
    section.append(createElement("h3", "Tempo"));
    section.append(createElement("p", "The song plays at the fastest tempo when demand is at its peak for the day, and slows towards the slowest tempo as demand falls."));

    const createTempoField = (labelText, setting) => {
        const label = createElement("label", null, "sound-field");
        const input = document.createElement("input");
        input.type = "number";
        input.min = 10;
        input.max = 240;
        input.step = 1;
        input.value = settings.tempo[setting];
        input.addEventListener("change", function () {
            let tempo = Math.round(Number(input.value));
            if (!Number.isFinite(tempo)) {
                tempo = settings.tempo[setting];
            }
            if (setting == 'slowest') {
                tempo = Math.min(Math.max(tempo, 10), settings.tempo.fastest - 1);
            } else {
                tempo = Math.min(Math.max(tempo, settings.tempo.slowest + 1), 240);
            }
            settings.tempo[setting] = tempo;
            input.value = tempo;
            updateTempo();
        });
        label.append(createElement("span", labelText), input);
        return label;
    };

    const fields = createElement("div", null, "sound-notes");
    fields.append(createTempoField("Slowest (beats per minute)", 'slowest'), createTempoField("Fastest (beats per minute)", 'fastest'));
    section.append(fields);
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
    controls.append(createNotesSection(), createTempoSection(), createMixerSection(), createSynthSection());

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
