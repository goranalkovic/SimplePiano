<script>
  import {
    keyCodes,
    keyNotes,
    activeSet,
    instrumentSets,
    keysDown,
    volume,
    octaveShift,
    currentSoundFont,
    ac,
    isFocused,
    showAdsr,
    editMode,
    theme,
    isReordering,
    chordMode,
    chordNotes,
    chords,
    defaultChords,
  } from '../stores.js';
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import SetCard from './SetCard.svelte';
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import Instrument from '../instrument.js';
  import { get } from 'svelte/store';

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

    items = [...$instrumentSets];
  };

  const handleDndConsider = (e) => {
    items = e.detail.items;
  };

  const handleDndFinalize = (e) => {
    instrumentSets.set(e.detail.items);
    items = e.detail.items;

    regenInstruments();
  };

  let items = [];

  const unsubscribe = instrumentSets.subscribe((sets) => {
    items = [...sets];
  });

  onDestroy(() => {
    unsubscribe();
  });

  onMount(() => {
    regenInstruments();
  });
</script>

<section
  tabindex="-1"
  class="flex flex-wrap gap-3 p-2 pb-8 transition-all rounded-lg mx-auto max-w-screen-xl justify-center"
  use:dndzone={{
    items,
    flipDurationMs: 150,
    dropTargetClasses: ['drop-target'],
    type: 'instrumentSets',
    dragDisabled: $editMode,
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each items as item, i (item.id)}
    <div class="pointer-events-none" animate:flip={{ duration: 150 }}>
      <SetCard
        set={item}
        i={i + 1}
        active={$activeSet === item.id}
        on:click={() => ($activeSet = item.id)}
      />
    </div>
  {/each}
</section>

<style global lang="postcss">
  .drop-target {
    @apply shadow-inner;
  }
</style>
