<script>
  import { fade } from 'svelte/transition';
  import {
    keyCodes,
    chordNotes,
    chords,
    chordMode,
    keyNotes,
    keysDown,
    instrumentSets,
    activeSet,
    playShiftDown,
    playShiftUp,
  } from '../stores';
  export let keyId;

  const playAll = () => {
    if ($keysDown[keyId] === true) return;

    const currentSet = $instrumentSets.find((i) => i.id === $activeSet);

    if ($chordMode) {
      const notesToPlay = chords[$chordNotes[keyId]].map((k) => keyNotes[k]);

      currentSet.instruments.forEach((instrument) => {
        instrument.playNotes(notesToPlay);
      });
    } else {
      const noteToPlay = keyNotes[keyId];
      currentSet.instruments.forEach((instrument) => {
        instrument.playNote(noteToPlay);

        if ($playShiftUp) {
          instrument.playNote(noteToPlay, false, false, 1);
        }

        if ($playShiftDown) {
          instrument.playNote(noteToPlay, false, false, -1);
        }
      });
    }

    $keysDown[keyId] = true;
  };

  const stopAll = () => {
    const currentSet = $instrumentSets.find((i) => i.id === $activeSet);

    if ($chordMode) {
      let notesToStop = chords[$chordNotes[keyId]].map((k) => keyNotes[k]);

      currentSet.instruments.forEach((instrument) => {
        instrument.stopNotes(notesToStop);
      });
    } else {
      const noteToStop = keyNotes[keyId];
      currentSet.instruments.forEach((instrument) => {
        instrument.stopNote(noteToStop);

        if ($playShiftUp) {
          instrument.stopNote(noteToStop, false, false, 1);
        }

        if ($playShiftDown) {
          instrument.stopNote(noteToStop, false, false, -1);
        }
      });
    }

    $keysDown[keyId] = false;
  };
</script>

<div
  class:active={$keysDown[keyId] === true}
  on:mousedown={playAll}
  on:mouseup={stopAll}
  on:mouseout={stopAll}
  on:blur={stopAll}
  class="flex items-end w-9 h-40 p-0 m-0 text-center transition border-0 cursor-pointer bg-gray-50 group keyboard-key dark:bg-gray-700 rounded-br-md rounded-bl-md"
>
  <div
    class="flex flex-col pb-2 mx-auto space-y-2 mb-0.5 select-none pointer-events-none "
  >
    {#if $chordMode && $chordNotes[keyId]}
      <span
        transition:fade
        class="leading-none text-gray-400 transition-colors transform scale-95 dark:text-gray-500 text-xxs"
        >{@html $chordNotes[keyId]}</span
      >
    {/if}
    <span
      class="text-xs leading-none text-gray-700 transition group-hover:text-ocean-500 dark:group-hover:text-azure-300 transform-gpu group-hover:scale-125 font-display dark:text-gray-200"
      >{@html keyCodes[keyId]}</span
    >
  </div>
</div>

<style global lang="postcss">
  .keyboard-key.active {
    @apply scale-[99%];
    box-shadow: inset 0 -1px 1.5rem rgb(0 0 0 / 0.2);
  }

  .dark .keyboard-key.active {
    box-shadow: inset 0 -1px 1.5rem rgb(12 12 12 / 0.5);
  }

  .keyboard-key.active span:first-of-type {
    @apply text-ocean-500 dark:text-azure-400;
  }

  .keyboard-key.active span:last-of-type {
    @apply text-ocean-500 dark:text-azure-200;
  }
</style>
