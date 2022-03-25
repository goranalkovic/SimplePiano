<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  import { normalizeName } from '../helpers';
  import Instrument from '../instrument';

  import { currentSoundFont, instrumentSets, ac, activeSet } from '../stores';

  export let availableInstruments = [];

  export const reloadInstrumentList = () => {
    getInstruments();
  };

  const getInstruments = async () => {
    try {
      let data = await fetch(
        `https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`
      );
      availableInstruments = await data.json();
    } catch (error) {
      // window.popToast("Error loading instruments: " + error.message);
      console.log('Error loading instruments: ' + error.message);
    }
  };

  getInstruments();

  const denormalizeInstrumentName = (input) => {
    input = input.replace(/ /g, '_');
    return input.charAt(0).toLowerCase() + input.slice(1);
  };

  let dispatch = createEventDispatcher();

  const addInstrument = (selectedInstrument) => {
    if (selectedInstrument == null) return;

    dispatch('instrumentadd', {
      name: selectedInstrument,
    });
  };

  let filterText = '';

  $: filteredInstruments = availableInstruments.filter((i) =>
    normalizeName(i).toLowerCase().includes(filterText.toLowerCase())
  );
</script>

<div class="fixed right-0 top-0 p-5 bg-gray-50 bottom-0 z-50 flex flex-col min-w-[14rem] w-72 " transition:fade>
  <input
    bind:value={filterText}
    class="px-3 py-1.5 mb-3 w-full text-sm bg-white shadow-2xl dark:bg-gray-800 border-0 rounded-lg"
    placeholder="Search instruments"
  />

  <div class="space-y-1 max-h-96 overflow-y-auto">
    {#each filteredInstruments as instrument (instrument)}
      <button
        class="text-sm w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition"
        on:click={() => addInstrument(instrument)}
      >
        {normalizeName(instrument)}</button
      >
    {:else}
      <span class="inline-block text-sm px-2"
        >No instruments matching <span
          class="font-semibold text-ocean-400 dark:text-azure-400"
          >{filterText}</span
        > found.</span
      >
    {/each}
  </div>
</div>
