import { writable } from 'svelte/store';
import store from "store";
import cloneDeep from "lodash.clonedeep";

const createWritableStore = (key, startValue) => {
    const { subscribe, set, update } = writable(startValue);

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

export const chordNotes = createWritableStore('chordNotes', {
    65: "Gm",
    83: "Am",
    68: "Hm",
    70: "C",
    71: "D",
    72: "E",
    74: "F",
    75: "G",
    76: "A",
    186: "H",
    222: "Cm",
    220: "Dm",
    13: "Em",
    81: "F#m<br>Gbm",
    87: "G#m<br>Abm",
    69: "Bm",
    84: "C#<br>Db",
    90: "D#<br>Eb",
    73: "F#<br>Gb",
    79: "G#<br>Ab",
    80: "B",
    221: "C#m<br>Dbm",
    8: "D#m<br>Ebm",
    20: "Fm"
});

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

export const defaultChords = {
    65: "Gm",
    83: "Am",
    68: "Hm",
    70: "C",
    71: "D",
    72: "E",
    74: "F",
    75: "G",
    76: "A",
    186: "H",
    222: "Cm",
    220: "Dm",
    13: "Em",
    81: "F#m<br>Gbm",
    87: "G#m<br>Abm",
    69: "Bm",
    84: "C#<br>Db",
    90: "D#<br>Eb",
    73: "F#<br>Gb",
    79: "G#<br>Ab",
    80: "B",
    221: "C#m<br>Dbm",
    8: "D#m<br>Ebm",
    20: "Fm"
};

export const chords = {
    "C": ["70", "72", "75"],
    "C#<br>Db": ["84", "74", "79"],
    "D": ["71", "73", "76"],
    "D#<br>Eb": ["90", "75", "80"],
    "E": ["72", "79", "186"],
    "F": ["70", "74", "76"],
    "F#<br>Gb": ["84", "73", "80"],
    "G": ["71", "75", "186"],
    "G#<br>Ab": ["70", "90", "79"],
    "A": ["84", "72", "76"],
    "B": ["71", "74", "80"],
    "H": ["90", "73", "186"],
    "Cm": ["70", "90", "75"],
    "C#m<br>Dbm": ["84", "72", "79"],
    "Dm": ["71", "74", "76"],
    "D#m<br>Ebm": ["90", "73", "80"],
    "Em": ["72", "75", "186"],
    "Fm": ["70", "74", "79"],
    "F#m<br>Gbm": ["84", "73", "76"],
    "Gm": ["71", "75", "80"],
    "G#m<br>Abm": ["90", "79", "186"],
    "Am": ["70", "72", "76"],
    "Hm": ["71", "73", "186"],
    "Bm": ["84", "74", "80"],
    "C7": ["70", "72", "75", "80"],
    "C#7<br>Db7": ["84", "74", "79", "186"],
    "D7": ["70", "71", "73", "76"],
    "D#7<br>Eb7": ["84", "90", "75", "80"],
    "E7": ["71", "72", "79", "186"],
    "F7": ["70", "90", "74", "76"],
    "F#7<br>Gb7": ["84", "72", "73", "80"],
    "G7": ["71", "74", "75", "186"],
    "G#7<br>Ab7": ["70", "90", "73", "79"],
    "A7": ["84", "72", "75", "76"],
    "B7": ["71", "74", "79", "80"],
    "H7": ["90", "73", "76", "186"],
    "Cdim": ["70", "90", "73", "76"],
    "C#dim<br>Dbdim": ["84", "72", "75", "80"],
    "Ddim": ["71", "74", "79", "186"],
    "D#dim<br>Ebdim": ["70", "90", "73", "75"],
    "Edim": ["84", "72", "75", "80"],
    "Fdim": ["71", "74", "79", "186"],
    "F#dim<br>Gbdim": ["70", "90", "73", "76"],
    "Gdim": ["84", "72", "75", "80"],
    "G#dim<br>Abdim": ["71", "74", "79", "186"],
    "Adim": ["70", "90", "73", "76"],
    "Bdim": ["84", "72", "75", "80"],
    "Hdim": ["71", "74", "79", "186"],
    "Cm7": ["70", "90", "75", "80"],
    "C#m7<br>Dbm7": ["84", "72", "79", "186"],
    "Dm7": ["70", "71", "74", "76"],
    "D#m7<br>Ebm7": ["84", "90", "73", "80"],
    "Em7": ["71", "72", "75", "186"],
    "Fm7": ["70", "90", "74", "79"],
    "F#m7<br>Gbm7": ["84", "72", "73", "76"],
    "Gm7": ["71", "74", "75", "80"],
    "G#m7<br>Abm7": ["90", "73", "79", "186"],
    "Am7": ["70", "72", "75", "76"],
    "Bm7": ["84", "74", "79", "80"],
    "Hm7": ["71", "73", "76", "186"],
    "Cm6": ["70", "90", "75", "76"],
    "C#m6<br>Dbm6": ["84", "72", "79", "80"],
    "Dm6": ["71", "74", "76", "186"],
    "D#m6<br>Ebm6": ["70", "90", "73", "80"],
    "Em6": ["84", "72", "75", "186"],
    "Fm6": ["70", "71", "74", "79"],
    "F#m6<br>Gbm6": ["84", "90", "73", "76"],
    "Gm6": ["71", "72", "75", "80"],
    "G#m6<br>Abm6": ["90", "74", "79", "186"],
    "Am6": ["70", "72", "73", "76"],
    "Bm6": ["84", "74", "75", "80"],
    "Hm6": ["71", "73", "79", "186"],
    "Cm9": ["70", "71", "90", "75"],
    "C#m9<br>Dbm9": ["84", "90", "72", "79"],
    "Dm9": ["71", "72", "74", "76"],
    "D#m9<br>Ebm9": ["90", "74", "73", "80"],
    "Em9": ["72", "73", "75", "186"],
    "Fm9": ["70", "74", "75", "79"],
    "F#m9<br>Gbm9": ["84", "73", "79", "76"],
    "Gm9": ["71", "75", "76", "80"],
    "G#m9<br>Abm9": ["90", "79", "80", "186"],
    "Am9": ["70", "72", "76", "186"],
    "Bm9": ["70", "84", "74", "80"],
    "Hm9": ["84", "71", "73", "186"],
    "C6": ["70", "72", "75", "76"],
    "C#6<br>Db6": ["84", "74", "79", "80"],
    "D6": ["71", "73", "76", "186"],
    "D#6<br>Eb6": ["70", "90", "75", "80"],
    "E6": ["84", "72", "79", "186"],
    "F6": ["70", "71", "74", "76"],
    "F#6<br>Gb6": ["84", "90", "73", "80"],
    "G6": ["71", "72", "75", "186"],
    "G#6<br>Ab6": ["70", "90", "74", "79"],
    "A6": ["84", "72", "73", "76"],
    "B6": ["71", "74", "75", "80"],
    "H6": ["90", "73", "79", "186"],
    "C9": ["70", "71", "72", "75"],
    "C#9<br>Db9": ["84", "90", "74", "79"],
    "D9": ["71", "72", "73", "76"],
    "D#9<br>Eb9": ["90", "74", "75", "80"],
    "E9": ["72", "73", "79", "186"],
    "F9": ["70", "74", "75", "76"],
    "F#9<br>Gb9": ["84", "73", "79", "80"],
    "G9": ["71", "75", "76", "186"],
    "G#9<br>Ab9": ["70", "90", "79", "80"],
    "A9": ["84", "72", "76", "186"],
    "B9": ["70", "71", "74", "80"],
    "H9": ["84", "90", "73", "186"],
    "Csus4": ["70", "74", "75"],
    "C#sus4<br>Dbsus4": ["84", "73", "79"],
    "Dsus4": ["71", "75", "76"],
    "D#sus4<br>Ebsus4": ["90", "79", "80"],
    "Esus4": ["72", "76", "186"],
    "Fsus4": ["70", "74", "80"],
    "F#sus4<br>Gbsus4": ["84", "73", "186"],
    "Gsus4": ["70", "71", "75"],
    "G#sus4<br>Absus4": ["84", "90", "79"],
    "Asus4": ["71", "72", "76"],
    "Bsus4": ["90", "74", "80"],
    "Hsus4": ["72", "73", "186"],
};