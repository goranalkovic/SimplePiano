<script>
  import { volume, octaveShift, editMode } from "../stores";
  import SlideControl from "./SlideControl.svelte";

  let volumeControl = {
    title: "Volume",
    icon: "volume",
    min: 0,
    max: 100,
    step: 1,
    keyboardKeys: [
      { label: "-1", key: "←" },
      { label: "+1", key: "→" },
      { label: "+10", key: "↑" },
      { label: "-10", key: "↓" },
    ],
  };

  let octaveControl = {
    title: "Octave shift",
    icon: "octaveAdjust",
    min: -3,
    max: 3,
    step: 0.5,
    keyboardKeys: [
      { label: "Up", key: "⇧", square: false },
      { label: "Dn", key: "<small>Ctrl</small>", square: false },
    ],
    customValueDisplay: {
      "0": "—",
      "1": "+1",
      "2": "+2",
      "3": "+3",
    },
  };
</script>

<style>
  .flex {
    display: flex;
    flex-direction: column;
    gap: calc(var(--padding) / 2);
  }

  .spacer {
    display: inline-block;
    content: "";
    width: 2rem;
  }

  .transparent {
    opacity: 0.2;
    pointer-events: none;
  }
</style>

<div class="flex" class:transparent={$editMode}>
  <SlideControl {...volumeControl} bind:value={$volume} />
  <div class="spacer" />
  <SlideControl {...octaveControl} bind:value={$octaveShift} />
</div>
