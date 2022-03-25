<script>
  import {
    keyCodes,
    keyNotes,
    activeSet,
    instrumentSets,
    keysDown,
    volume,
    octaveShift,
    editMode,
    theme,
    tempShiftDown,
    tempShiftUp,
    chordMode,
    chordNotes,
    chords,
    playShiftUp,
    playShiftDown,
  } from './stores.js';
  import Instrument from './instrument';
  import { beforeUpdate, onMount } from 'svelte';
  import PlayerUi from './lib/PlayerUi.svelte';
  import SetList from './lib/SetList.svelte';
  import { clamp } from './helpers';

  const onKeyDown = (event) => {
    if ($editMode) return;

    event.preventDefault();
    event.stopPropagation();
    const { keyCode, altKey, shiftKey, ctrlKey } = event;

    if ($keysDown[keyCode] === true) return;
    if (
      !Array.isArray(
        $instrumentSets.find((i) => i.id === $activeSet).instruments
      )
    )
      return;
    if (!Object.keys(keyCodes).includes(keyCode.toString())) return;

    window.focus();

    if (document.activeElement) {
      document?.activeElement?.blur();
    }

    const currentSet = $instrumentSets.find((i) => i.id === $activeSet);

    $tempShiftDown = altKey;
    $tempShiftUp = shiftKey;

    if (!currentSet.instruments) return;

    if ($chordMode) {
      const notesToPlay = chords[$chordNotes[keyCode]].map((k) => keyNotes[k]);

      currentSet.instruments.forEach((instrument) => {
        instrument.playNotes(notesToPlay, shiftKey, altKey);

        if ($playShiftUp) {
          instrument.playNotes(notesToPlay, shiftKey, altKey, 1);
        }

        if ($playShiftDown) {
          instrument.playNotes(notesToPlay, shiftKey, altKey, -1);
        }
      });
    } else {
      const noteToPlay = keyNotes[keyCode];

      currentSet.instruments.forEach((instrument) => {
        instrument.playNote(noteToPlay, shiftKey, altKey);

        if ($playShiftUp) {
          instrument.playNote(noteToPlay, shiftKey, altKey, 1);
        }

        if ($playShiftDown) {
          instrument.playNote(noteToPlay, shiftKey, altKey, -1);
        }
      });
    }

    $keysDown[keyCode] = true;
  };

  const onKeyUp = (event) => {
    if ($editMode) return;

    event.preventDefault();
    event.stopPropagation();
    const { keyCode, ctrlKey, shiftKey, altKey, key } = event;

    if (keyCode === 27) {
      $instrumentSets
        .find((i) => i.id === $activeSet)
        .instruments.map((instrument) => instrument.stopAll());
      return;
    }

    if (parseInt(key) >= 0 && parseInt(key) <= 9 && keyCode < 100) {
      let newId = parseInt(key);
      if (newId - 1 < 0) {
        newId = 9;
      } else {
        newId -= 1;
      }

      const id = $instrumentSets[newId]?.id;
      if (id) {
        $activeSet = id;
      }
      return;
    }

    if (keyCode === 32) {
      if (!shiftKey && !ctrlKey) {
        $playShiftUp = false;
        $playShiftDown = false;
      }
      
      if (shiftKey && !ctrlKey) {
        $playShiftUp = !$playShiftUp;
      }
      
      if (ctrlKey && !shiftKey) {
        $playShiftDown = !$playShiftDown;
      }
      
      if (ctrlKey && shiftKey) {
        $playShiftUp = !$playShiftUp;
        $playShiftDown = !$playShiftDown;
      }
    }

    if (keyCode === 40) {
      if (ctrlKey) {
        $volume = clamp($volume - 5, 0, 100);
      } else if (shiftKey) {
        $volume = clamp($volume - 1, 0, 100);
      } else {
        $volume = clamp($volume - 10, 0, 100);
      }
      return;
    }

    if (keyCode === 38) {
      if (ctrlKey) {
        $volume = clamp($volume + 5, 0, 100);
      } else if (shiftKey) {
        $volume = clamp($volume + 1, 0, 100);
      } else {
        $volume = clamp($volume + 10, 0, 100);
      }
      return;
    }

    if (keyCode === 39) {
      if (ctrlKey) {
        $octaveShift = clamp($octaveShift + 0.5, -3, 3);
      } else if (shiftKey) {
        $octaveShift = 3;
      } else {
        $octaveShift = clamp($octaveShift + 1, -3, 3);
      }
      return;
    }

    if (keyCode === 37) {
      if (ctrlKey) {
        $octaveShift = clamp($octaveShift - 0.5, -3, 3);
      } else if (shiftKey) {
        $octaveShift = -3;
      } else {
        $octaveShift = clamp($octaveShift - 1, -3, 3);
      }
      return;
    }

    if (keyCode === 192) {
      $chordMode = !$chordMode;
      return;
    }

    if ($keysDown[keyCode] === false) return;
    if (
      !Array.isArray(
        $instrumentSets.find((i) => i.id === $activeSet).instruments
      )
    )
      return;
    if (!Object.keys(keyCodes).includes(keyCode.toString())) return;

    $tempShiftDown = altKey;
    $tempShiftUp = shiftKey;

    const currentSet = $instrumentSets.find((i) => i.id === $activeSet);

    if (!currentSet.instruments) return;

    if ($chordMode) {
      let notesToStop = chords[$chordNotes[keyCode]].map((k) => keyNotes[k]);

      currentSet.instruments.forEach((instrument) => {
        instrument.stopNotes(notesToStop);
      });
    } else {
      const noteToStop = keyNotes[keyCode];

      currentSet.instruments.forEach((instrument) => {
        instrument.stopNote(noteToStop);
        if ($playShiftUp) {
          instrument.stopNote(noteToStop);
        }
        if ($playShiftDown) {
          instrument.stopNote(noteToStop);
        }
      });
    }

    $keysDown[keyCode] = false;
  };

  const changeTheme = () => {
    if ($theme === 0) {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        document.querySelector('html').classList.add('dark');
      } else {
        document.querySelector('html').classList.remove('dark');
      }
    } else if ($theme === 2) {
      document.querySelector('html').classList.add('dark');
    } else {
      document.querySelector('html').classList.remove('dark');
    }
  };

  const regenInstruments = () => {
    // Regenerate instrument sets
    for (const set of $instrumentSets) {
      let newInstruments = [];
      for (const instrument of set.instruments) {
        newInstruments = [
          ...newInstruments,
          new Instrument(
            instrument.name,
            instrument._volume,
            instrument.soundfont,
            instrument._octaveShift,
            instrument._absoluteVolume,
            instrument._adsr
          ),
        ];
      }

      set.instruments = newInstruments;
    }
  };

  beforeUpdate(() => {
    changeTheme();
  });

  onMount(() => {
    // Theme management
    changeTheme();

    if ($theme === 0) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => changeTheme());
    }

    regenInstruments();
  });
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<main class="block w-full h-full gap-y-8 p-10 m-auto space-y-4">
  <PlayerUi>
    <SetList />
  </PlayerUi>
</main>
