import { writable, readable } from 'svelte/store';

export const soundFont = {
    fluid: 'FluidR3_GM',
    mk: 'MusyngKite',
    fatboy: 'FatBoy'
}

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
    20: "52",
    65: "55",
    83: "57",
    68: "59",
    70: "60",
    71: "62",
    72: "64",
    74: "65",
    75: "67",
    76: "69",
    186: "71",
    222: "72",
    220: "74",
    13: "76",
    81: "54",
    87: "56",
    69: "58",
    84: "61",
    90: "63",
    73: "66",
    79: "68",
    80: "70",
    221: "73",
    8: "75"
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

export const currentSoundFont = writable(soundFont.fatboy);
export const activeSet = writable(0);
export const volume = writable(25);
export const octaveShift = writable(0);
export const showAdsr = writable(false);

export const instrumentSets = writable(
    [
        {
            name: 'Set 1',
            instruments: []
        },
        {
            name: 'Set 2',
            instruments: []
        },
        {
            name: 'Set 3',
            instruments: []
        },
        {
            name: 'Set 4',
            instruments: []
        },
        {
            name: 'Set 5',
            instruments: []
        },
        {
            name: 'Set 6',
            instruments: []
        },
        {
            name: 'Set 7',
            instruments: []
        },
        {
            name: 'Set 8',
            instruments: []
        },
        {
            name: 'Set 9',
            instruments: []
        },
        {
            name: 'Set 10',
            instruments: []
        }
    ]
);

