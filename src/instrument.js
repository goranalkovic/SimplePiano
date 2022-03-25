/* eslint-disable no-underscore-dangle */
import { get } from 'svelte/store';
import Soundfont from 'soundfont-player';
import {
  getRandomId, normalizeName, clamp, sleep,
} from './helpers';
import {
  ac, currentSoundFont, noteKeys, octaveShift, volume, volumeModifier,
} from './stores';

export default class Instrument {
  // id, name, volume, absoluteVolume (y/n), soundfont, asdr, instrumentData
  constructor(
    name,
    vol = -1,
    soundfont = get(currentSoundFont),
    octShift = 0,
    absoluteVolume = true,
    adsr = null,
  ) {
    this.id = getRandomId();
    this.name = name;
    this._volume = vol;
    this._octaveShift = octShift;
    this._absoluteVolume = absoluteVolume;
    this.soundfont = soundfont;
    this._adsr = adsr;

    this.data = Soundfont.instrument(ac, name, { soundfont });

    this.currentlyPlaying = {
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
      8: [],
      46: [],
      35: [],
      34: [],
      103: [],
      104: [],
      105: [],
      107: [],
      45: [],
      36: [],
      33: [],
      111: [],
      106: [],
    };
  }

  async refreshData() {
    this.data = Soundfont.instrument(ac, this.name, { soundfont: this.soundfont });

    this.instrument = await this.data;
  }

  get displayName() {
    return normalizeName(this.name);
  }

  get adjustedVolume() {
    if (this._volume > -1) {
      if (this._absoluteVolume === true) {
        return (get(volume) * (this._volume / 100)) / 100;
      }
      return this._volume / 100;
    }
    return get(volume) / 100;
  }

  get volume() {
    return this._volume;
  }

  set volume(newVolume) {
    this._volume = newVolume;
  }

  get absoluteVolume() {
    return this._absoluteVolume;
  }

  set absoluteVolume(absoluteVolume) {
    this._absoluteVolume = absoluteVolume;
  }

  get adsr() {
    return this._adsr ?? [0.005, 0.395, 0.8, 1.2];
  }

  set adsr(asdr) {
    this._adsr = asdr;
  }

  get octave() {
    return clamp(get(octaveShift) + this._octaveShift, -3, 3);
  }

  set octave(octave) {
    this._octaveShift = octave;
  }

  async stopNotes(noteCodes) {
    noteCodes.map((code) => this.stopNote(code));
  }

  getAdjustedNote(noteCode, shiftUp = false, shiftDown = false, extraShift = 0) {
    return parseInt(noteCode, 10) + 12 * (this.octave + extraShift + (shiftUp ? 1 : 0) - (shiftDown ? 1 : 0));
  }

  async playNotes(noteCodes, shiftUp = false, shiftDown = false, extraShift = 0) {
    noteCodes.map((noteCode) => this.playNote(noteCode, shiftUp, shiftDown, extraShift));
  }

  async playNote(noteCode, shiftUp = false, shiftDown = false, extraShift = 0) {
    if (this.instrument === undefined) {
      this.instrument = await this.data;
    }

    const note = this.getAdjustedNote(noteCode, shiftUp, shiftDown, extraShift);
    const instrEvent = this.instrument.play(note, ac.currentTime, {
      loop: true,
      adsr: this.adsr,
      gain: this.adjustedVolume * get(volumeModifier),
    });

    this.currentlyPlaying[noteKeys[noteCode]] = [
      ...this.currentlyPlaying[noteKeys[noteCode]],
      instrEvent,
    ];
  }

  async stopAll() {
    Object.values(this.currentlyPlaying).forEach((list) => {
      while (list.length > 0) {
        list.shift()?.stop();
      }
    });
  }

  async stopNote(noteCode) {
    try {
      this.currentlyPlaying[noteKeys[noteCode]]?.shift()?.stop(ac.currentTime);
    } catch (error) {
      this.stopAll();
    }
    await sleep(50);
  }
}
