<script>
  import { onMount, onDestroy } from "svelte";

  import Button from "./components/Button.svelte";
  import TitleBar from "./components/TitleBar.svelte";
  import Controls from "./components/Controls.svelte";
  import PianoGrid from "./components/PianoGrid.svelte";
  import SetEditor from "./components/SetEditor.svelte";
  import SetList from "./components/SetList.svelte";
  import InstrumentList from "./components/InstrumentList.svelte";
  import ThemeSwitcher from "./components/ThemeSwitcher.svelte";
  import Toast from "./components/Toast.svelte";
  import Icon from "./components/Icon.svelte";
  import KeyboardKey from "./components/KeyboardKey.svelte";

  import {
    soundFont,
    keyCodes,
    keyNotes,
    activeSet,
    instrumentSets,
    keysDown,
    keysPressed,
    volume,
    octaveShift,
    currentSoundFont,
    ac,
    defaultAdsr,
    isFocused,
    showAdsr,
    editMode,
    theme,
    isReordering,
    chordMode,
    chordNotes,
    chords,
    defaultChords,
  } from "./stores.js";

  import Soundfont from "soundfont-player";

  instrumentSets.useLocalStorage();
  showAdsr.useLocalStorage();
  currentSoundFont.useLocalStorage();
  activeSet.useLocalStorage();
  volume.useLocalStorage();
  octaveShift.useLocalStorage();
  editMode.useLocalStorage();
  theme.useLocalStorage();
  isReordering.useLocalStorage();
  chordMode.useLocalStorage();
  chordNotes.useLocalStorage();

  $: themeName = $theme === 0 ? "Auto" : $theme === 1 ? "Light" : "Dark";

  function clamp(value, min, max) {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
  }

  function stopAllSounds() {
    try {
      if ($instrumentSets[$activeSet].instruments.length < 1) return;

      for (let instr of $instrumentSets[$activeSet].instruments) {
        console.log(instr);
        instr.data.then((k) => {
          k.stop();
        });
      }

      for (let i in keyCodes) {
        document
          .querySelector("#" + keyCodes[i])
          .classList.remove("piano-key-highlight");
      }

      window.pushToast("Stopped all sounds", "error");
    } catch (error) {}
  }

  function applyTheme() {
    if (
      ($theme === 0 &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      $theme === 2
    ) {
      document.querySelector("html").className = "dark";
    } else {
      document.querySelector("html").className = "";
    }
  }

  function toggleEditMode() {
    editMode.set(!$editMode);
    instrumentSets.set([...$instrumentSets]);
    if ($editMode === false) isReordering.set(false);

    window.pushToast("Edit mode " + ($editMode ? "on" : "off"));
  }
  function toggleChordMode() {
    chordMode.set(!$chordMode);

    window.pushToast("Chord mode " + ($chordMode ? "on" : "off"));
  }

  function handleKeyDown(e) {
    if ($isFocused || $editMode) {
      return;
    } else if (e.keyCode !== 116) {
      e.preventDefault();
      e.stopPropagation();
    }

    let kCode = e.keyCode;

    // console.log(kCode);

    if ($instrumentSets[$activeSet].instruments.length < 1) return;
    if (keyCodes[kCode] == null) return;
    if (keyNotes[kCode] == null) return;
    if ($keysPressed[kCode] === null) return;
    if ($keysDown[kCode] === true) return;

    document
      .querySelector("#" + keyCodes[kCode])
      .classList.add("piano-key-highlight");

    $keysDown[kCode] = true;
    // keysDown.update(kd => {
    //   kd[kCode] = true;
    //   return kd;
    // });

    for (let instrument of $instrumentSets[$activeSet].instruments) {
      let vol =
        instrument.volume > -1
          ? instrument.absoluteVolume
            ? ($volume * (instrument.volume / 100)) / 100
            : instrument.volume / 100
          : $volume / 100;

      let adjustedOctShift = clamp($octaveShift + instrument.octave, -3, 3);

      instrument.data.then((instr) => {
        let newAdsr = instrument.adsr;

        if (newAdsr[0] < 0) newAdsr[0] = defaultAdsr[0];
        if (newAdsr[1] < 0) newAdsr[1] = defaultAdsr[1];
        if (newAdsr[2] < 0) newAdsr[2] = defaultAdsr[2];
        if (newAdsr[3] < 0) newAdsr[3] = defaultAdsr[3];

        let noteCollection = $chordMode
          ? chords[$chordNotes[kCode]]
          : keyNotes[kCode];

        if (noteCollection == null) return;

        for (let noteCode of noteCollection) {
          let note = (
            parseInt($chordMode ? keyNotes[noteCode] : noteCode) +
            12 * adjustedOctShift
          ).toString();

          try {
            let inst = instr.play(note, ac.currentTime, {
              loop: true,
              adsr: newAdsr,
              gain: vol,
            });
            if ($keysPressed[kCode].indexOf(inst) === -1) {
              let currentPressed = $keysPressed[kCode];

              $keysPressed[kCode] = [...currentPressed, inst];
              // keysPressed.update(kp => {
              //   kp[kCode] = [...currentPressed, inst];
              //   return kp;
              // });
            }
          } catch (error) {
            window.popToast("Error: " + error.message);
          }
        }
      });
    }
  }

  function handleKeyUp(e) {
    if ($isFocused || $editMode) {
      return;
    } else if (e.keyCode !== 116) {
      e.preventDefault();
      e.stopPropagation();
    }

    let kCode = e.keyCode;

    if (kCode >= 48 && kCode <= 58) {
      stopAllSounds();

      let newCode = kCode - 49;

      if (kCode == 48) {
        newCode = 9;
      }

      if ($instrumentSets[newCode] != undefined) activeSet.set(newCode);
      else activeSet.set(0);
    }

    if (kCode === 16) {
      if ($octaveShift <= 2) {
        // octaveShift.update(os => os + 1);
        octaveShift.set($octaveShift + 1);
      }
      return;
    }

    if (kCode === 17) {
      if ($octaveShift >= -2) {
        // octaveShift.update(os => os - 1);
        octaveShift.set($octaveShift - 1);
      }
      return;
    }

    if (kCode === 37) {
      // if ($volume >= 1) volume.update(v => v - 1);
      if ($volume >= 1) volume.set($volume - 1);
      return;
    }

    if (kCode === 40) {
      // if ($volume >= 10) volume.update(v => v - 10);
      // if ($volume - 10 < 0) volume.update(v => v = 0);
      if ($volume >= 10) volume.set($volume - 10);
      if ($volume - 10 < 0) volume.set(0);
      return;
    }

    if (kCode === 39) {
      // if ($volume < 99) volume.update(v => v + 1);
      if ($volume < 99) volume.set($volume + 1);
      return;
    }

    if (kCode === 38) {
      // if ($volume <= 90) volume.update(v => v + 10);
      // if($volume + 10 > 100) volume.update(v => v = 100);
      if ($volume <= 90) volume.set($volume + 10);
      if ($volume + 10 > 100) volume.set(100);
      return;
    }

    if (kCode === 192) {
      toggleChordMode();
      return;
    }

    if ($instrumentSets[$activeSet].instruments.length < 1) return;
    if (keyCodes[kCode] == null) return;
    if (keyNotes[kCode] == null) return;
    if ($keysPressed[kCode] === null) return;
    if ($keysDown[kCode] === false) return;

    document
      .querySelector("#" + keyCodes[kCode])
      .classList.remove("piano-key-highlight");

    $keysDown[kCode] = false;
    // keysDown.update(kd => {
    //   kd[kCode] = false;
    //   return kd;
    // });

    for (var i of $keysPressed[kCode]) {
      try {
        i.stop();
      } catch (err) {
        console.error("Errored stop, stopping all.");
        console.error("Error: ", err.message);
        stopAllSounds();
      }
    }

    $keysPressed[kCode] = [];
    // keysPressed.update(kp => {
    //   kp[kCode] = [];
    //   return kp;
    // });

    // console.log('Pressed key ' + keyCodes[kCode] + ' (key code ' + kCode + ', note ' + keyNotes[kCode] + ')')
  }

  onMount(() => {
    let colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeQuery.addEventListener("change", applyTheme);

    applyTheme();

    for (let set of $instrumentSets) {
      if (set.id == null) {
        set.id = randId();
      }
    }
  });

  function randId() {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(2, 10);
  }
</script>

<style>
  h3 {
    font-weight: 400;
    font-family: "Rubik", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    margin: 0 var(--padding) 0 0;
  }

  .chord-controls {
    display: flex;
    justify-content: center;
  }

  .titlebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--padding) * 2);
    grid-area: tl;
  }

  .split {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: "l r";
    grid-area: br;
    padding: 0 calc(var(--padding) * 2);
    padding-right: 0;
    margin: 0;
    margin-left: calc(var(--padding) * -1);
    gap: calc(var(--padding) * 2);
    border-top: 1px solid var(--border-color);
  }

  @media (max-width: 1100px) {
    .split {
      display: flex;
      flex-direction: column;
      padding-right: calc(var(--padding) * 2);
      /* margin-right: calc(var(--padding) * 2); */
      /* width: 90%; */
    }

    .titlebar {
      flex-direction: row;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 2rem;
      margin-bottom: -2rem;
    }
  }
</style>

<div class="grid-container">

  <div class="titlebar">

    <h3>Piano</h3>
    <div style="display: flex; align-items:center;justify-content:center; ">
      <Button
        spaced
        on:click={stopAllSounds}
        icon="stopAll2"
        disabled={$editMode} />
      <Button
        spaced
        toggled={$editMode}
        on:click={toggleEditMode}
        icon="edit" />

      <Button
        spaced
        disabled={$editMode}
        toggled={$chordMode}
        on:click={toggleChordMode}
        icon="chordMode" />
      <ThemeSwitcher />
    </div>

    <Controls />

    {#if $editMode}
      <div class="chord-controls">
        <Button
          spaced
          icon="chordMode"
          label="Clear"
          on:click={() => {
            let temp = $chordNotes;
            for (let keyboardKey of Object.keys(defaultChords)) {
              temp[keyboardKey] = '';
            }
            chordNotes.set(temp);
            for (let sel of document.querySelectorAll('.piano-grid select')) {
              sel.value = null;
            }
          }} />
        <Button
          spaced
          icon="chordMode"
          label="Reset"
          on:click={() => {
            chordNotes.set(defaultChords);
          }} />
      </div>
    {/if}

  </div>

  <PianoGrid />

  <SetList />
  <div class="split">
    <SetEditor />

    {#if $editMode}
      <InstrumentList />
    {/if}
  </div>

</div>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<Toast />
