import { writable, readable } from 'svelte/store';
import store from "store";
import cloneDeep from "lodash.clonedeep";

const createWritableStore = (key, startValue) => {
    const { subscribe, set } = writable(startValue);

    return {
        subscribe,
        set,
        useLocalStorage: () => {
            const json = store.get(key);

            if (key === 'instruments' && json) {
                let updateable = [...json];

                for (let instrSet of updateable) {
                    if (instrSet.instruments.length < 1) continue;
                    for (let instr of instrSet.instruments) {

                        let instrumentData = Soundfont.instrument(ac, instr.name, {
                            soundfont: instr.soundfont
                        });

                        instr.data = instrumentData;

                    }
                }

                set(updateable);
            }

            // const json = localStorage.getItem(key);
            if (json) {
                set(json);
            }

            subscribe(current => {
                store.set(key, cloneDeep(current));
                // localStorage.setItem(key, JSON.stringify(current));
            });
        }
    };
};

export const soundFont = {
    fluid: 'FluidR3_GM',
    mk: 'MusyngKite',
    fatboy: 'FatBoy'
};

export const keyCodes = {
    20: "⇪",
    65: "A",
    83: "S",
    68: "D",
    70: "F",
    71: "G",
    72: "H",
    74: "J",
    75: "K",
    76: "L",
    186: "Č",
    222: "Ć",
    220: "Ž",
    13: "↵",
    81: "Q",
    87: "W",
    69: "E",
    84: "T",
    90: "Z",
    73: "I",
    79: "O",
    80: "P",
    221: "Đ",
    8: "⌫"
};

export const keyNotes = {
    65: ["55"],
    83: ["57"],
    68: ["59"],
    70: ["60"],
    71: ["62"],
    72: ["64"],
    74: ["65"],
    75: ["67"],
    76: ["69"],
    186: ["71"],
    222: ["72"],
    220: ["74"],
    13: ["76"],
    81: ["54"],
    87: ["56"],
    69: ["58"],
    84: ["61"],
    90: ["63"],
    73: ["66"],
    79: ["68"],
    80: ["70"],
    221: ["73"],
    8: ["75"],
    20: ["53"]
};

export const chordNotes = {
    65: ["71", "75", "80"],
    83: ["70", "72", "76"],
    68: ["84", "73", "186"],
    70: ["70", "72", "75"],
    71: ["75", "73", "76"],
    72: ["72", "79", "186"],
    74: ["70", "74", "76"],
    75: ["71", "75", "186"],
    76: ["84", "72", "76"],
    186: ["90", "73", "186"],
    222: ["70", "90", "75"],
    220: ["71", "74", "76"],
    13: ["72", "75", "186"],
    81: ["84", "73", "76"],
    87: ["90", "79", "186"],
    69: ["84", "74", "80"],
    84: ["84", "74", "79"],
    90: ["90", "75", "80"],
    73: ["84", "73", "80"],
    79: ["70", "90", "79"],
    80: ["71", "74", "80"],
    221: ["84", "72", "79"],
    8: ["90", "73", "80"],
    20: ["70", "74", "79"]
};

export const keysPressed = writable({
    20: [],
    65: [],
    83: [],
    68: [],
    70: [],
    71: [],
    72: [],
    74: [],
    75: [],
    76: [],
    186: [],
    222: [],
    220: [],
    13: [],
    81: [],
    87: [],
    69: [],
    84: [],
    90: [],
    73: [],
    79: [],
    80: [],
    221: [],
    8: []
});

export const defaultAdsr = [0.005, 0.395, 0.8, 1.2];

export const keysDown = writable(
    {
        20: false,
        65: false,
        83: false,
        68: false,
        70: false,
        71: false,
        72: false,
        74: false,
        75: false,
        76: false,
        186: false,
        222: false,
        220: false,
        13: false,
        81: false,
        87: false,
        69: false,
        84: false,
        90: false,
        73: false,
        79: false,
        80: false,
        221: false,
        8: false
    }
);

export let ac = new AudioContext();

export const currentSoundFont = createWritableStore('currentSoundFont', soundFont.fatboy);
export const activeSet = createWritableStore('activeSet', 0);
export const volume = createWritableStore('volume', 25);
export const octaveShift = createWritableStore('octaveShift', 0);
export const showAdsr = createWritableStore('showAdsr', false);
export const editMode = createWritableStore('editMode', false);
export const chordMode = createWritableStore('chordMode', false);
export const theme = createWritableStore('theme', 0);
export const isReordering = createWritableStore('isReordering', false);
export const isFocused = writable(false);

export const instrumentSets = createWritableStore('instruments',
    [
        {
            name: 'Set 1',
            instruments: []
        }
    ]
);

