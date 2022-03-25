<script>
  import { fade } from "svelte/transition";
  import {
    keyCodes,
    chordNotes,
    chords,
    chordMode,
    keyNotes,
    keysDown,
    instrumentSets,
    activeSet,
  } from "../stores";
  export let keyId;

</script>


<div
  class="flex items-end w-12 h-48 p-0 m-0 text-center transition bg-white border border-t-0 border-gray-200 dark:border-gray-750 group keyboard-key dark:bg-gray-900 rounded-br-md rounded-bl-md">
  <div
    class="flex flex-col pb-2 mx-auto space-y-2 mb-0.5 select-none pointer-events-none ">
   
    <select class="w-11 px-0.5 py-1 m-0 text-center bg-gray-50 rounded appearance-none pointer-events-auto dark:bg-gray-800 font-display" bind:value={$chordNotes[keyId]} style="text-align: center !important; font-size: 0.65rem;">
      <option value="">-</option>
      {#each Object.keys(chords) as item}
        <option value={item}>{item.replace('<br>', '/')}</option>
      {/each}
    </select>
    
    <span
      class="text-sm leading-none text-gray-700 transition transform-gpu font-display dark:text-gray-200">{keyCodes[keyId]}</span>
  </div>
</div>
