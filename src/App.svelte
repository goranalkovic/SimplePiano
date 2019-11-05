<script>
  import Button from "./components/Button.svelte";
  import TitleBar from "./components/TitleBar.svelte";
  import Controls from "./components/Controls.svelte";
  import PianoGrid from "./components/PianoGrid.svelte";
  import SetEditor from "./components/SetEditor.svelte";
  import SetList from "./components/SetList.svelte";
  import InstrumentList from "./components/InstrumentList.svelte";

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
    defaultAdsr
  } from "./stores.js";

  import Soundfont from "soundfont-player";

  let theme = 0;
  $: themeName = theme === 0 ? 'Auto' : (theme === 1 ? 'Light' : 'Dark');

  function clamp(value, min, max) {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
  }

  function stopAllSounds() {
    if ($instrumentSets[$activeSet].instruments.length < 1) return;

    for (let instr of $instrumentSets[$activeSet].instruments) {
      instr.data.then(k => {
        k.stop();
      });
    }

    for (let i in keyCodes) {
      document
              .querySelector("#" + keyCodes[i])
              .classList.remove("piano-key-highlight");
    }
  }

  function switchDark() {
    theme++;

    if (theme === 3) {
      theme = 0;
    }

    applyTheme();
  }

  function applyTheme() {
    if ((theme === 0 && window.matchMedia("(prefers-color-scheme: dark)").matches) || theme === 2) {
      document.querySelector("html").className = "dark";
    } else {
      document.querySelector("html").className = "";
    }

    // console.log(`Current theme: ${themeName}`);
  }

  function handleKeyDown(e) {
    let kCode = e.keyCode;

    if ($instrumentSets[$activeSet].instruments.length < 1) return;
    if (keyCodes[kCode] == null) return;
    if (keyNotes[kCode] == null) return;
    if ($keysPressed[kCode] === null) return;
    if ($keysDown[kCode] === true) return;

    document
            .querySelector("#" + keyCodes[kCode])
            .classList.add("piano-key-highlight");

    keysDown.update(kd => {
      kd[kCode] = true;
      return kd;
    });

    for (let instrument of $instrumentSets[$activeSet].instruments) {

      let vol =
              instrument.volume > -1 ? (instrument.absoluteVolume ? ($volume * (instrument.volume / 100)) / 100 : instrument.volume / 100)  : $volume / 100;

      let adjustedOctShift = clamp($octaveShift + instrument.octave, -3, 3);

      instrument.data.then(instr => {
        let newAdsr = instrument.adsr;

        if (newAdsr[0] < 0) newAdsr[0] = defaultAdsr[0];
        if (newAdsr[1] < 0) newAdsr[1] = defaultAdsr[1];
        if (newAdsr[2] < 0) newAdsr[2] = defaultAdsr[2];
        if (newAdsr[3] < 0) newAdsr[3] = defaultAdsr[3];

        let note = (
                parseInt(keyNotes[kCode]) +
                12 * adjustedOctShift
        ).toString();

        let inst = instr.play(note, ac.currentTime, {
          loop: true,
          adsr: newAdsr,
          gain: vol
        });
        if ($keysPressed[kCode].indexOf(inst) === -1) {
          let currentPressed = $keysPressed[kCode];

          keysPressed.update(kp => {
            kp[kCode] = [...currentPressed, inst];
            return kp;
          });
        }
      });
    }

  }

  function handleKeyUp(e) {
    let kCode = e.keyCode;

    if (kCode >= 48 && kCode <= 58) {
      stopAllSounds();

      let newCode = kCode - 49;

      if (kCode == 48) {
        newCode = 9;
      }

      activeSet.set(newCode);
    }

    if (kCode === 16) {
      if ($octaveShift <= 2) {
        octaveShift.update(os => os + 1);
      }
      return;
    }

    if (kCode === 17) {
      if ($octaveShift >= -2) {
        octaveShift.update(os => os - 1);
      }
      return;
    }

    if (kCode === 37) {
      if ($volume >= 1) volume.update(v => v - 1);
      return;
    }

    if (kCode === 40) {
      if ($volume >= 10) volume.update(v => v - 10);
      if ($volume - 10 < 0) volume.update(v => v = 0);
      return;
    }

    if (kCode === 39) {
      if ($volume < 99) volume.update(v => v + 1);
      return;
    }

    if (kCode === 38) {
      if ($volume <= 90) volume.update(v => v + 10);
      if($volume + 10 > 100) volume.update(v => v = 100);
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

    keysDown.update(kd => {
      kd[kCode] = false;
      return kd;
    });

    for (var i of $keysPressed[kCode]) {
      try {
        i.stop();
      } catch (err) {
        console.error("Errored stop, stopping all.");
        console.error("Error: ", err.message);
        stopAllSounds();
      }
    }

    keysPressed.update(kp => {
      kp[kCode] = [];
      return kp;
    });

  }

  applyTheme();
</script>

<style>
  .split {
    display: flex;
  }

  h3, h4 {
    font-weight: 400;
  }
</style>

<div class="container">

  <TitleBar>
    <h3 slot="left">Piano</h3>

    <Button outline on:click={stopAllSounds}>Stop all sounds</Button>
    <Button spaced outline on:click={switchDark}>{themeName} theme</Button>
  </TitleBar>

  <Controls />

  <PianoGrid />

  <div class="split">
    <InstrumentList />
    <SetEditor />
    <SetList />
  </div>

</div>

<svelte:window
  on:keydown|preventDefault={handleKeyDown}
  on:keyup|preventDefault={handleKeyUp} />