<script>
  import {
    isFocused,
    editMode,
    chordMode,
    chords,
    chordNotes,
  } from "../stores";
  import { fade, slide } from "svelte/transition";
  import Button from "./Button.svelte";
</script>

<style>
  .blank-black-key {
    background: transparent;
    color: transparent;
    height: 7rem;
    width: 2.5rem;
    margin-right: 0.2rem;
    pointer-events: none;
  }

  .white-key {
    background: var(--white-key-color);
    color: var(--white-key-text);
    height: 12rem;
  }

  .black-key {
    background: var(--black-key-color);
    color: var(--black-key-text);
    height: 7rem;
    z-index: 1;
  }

  .piano-grid {
    display: flex;
  }

  .black-key,
  .white-key {
    margin-right: 0.2rem;
    width: 2.5rem;
    border-radius: 0 0 3px 3px;
    box-shadow: var(--shadow-small);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    user-select: none;
    transition: var(--transition);
    position: relative;
  }

  .piano-grid-container {
    margin: 2rem auto;
    height: 12rem;
    transition: 0.1s opacity;
    position: relative;
  }

  .piano-grid-container .piano-grid:first-child {
    position: relative;
    top: 0;
    left: 0;
  }

  .piano-grid-container .piano-grid:nth-child(2) {
    position: relative;
    top: -13rem;
    left: 1rem;
  }

  /* .transparent .piano-grid {
    opacity: 0.2;
  } */

  .transparent .black-key,
  .transparent .white-key {
    /* background: var(--white-key-color); */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    width: 4rem;
  }

  .transparent .blank-black-key {
    width: 4rem;
  }

  .edit-mode-warn {
    position: absolute;

    left: 40%;
    top: -15%;

    font-weight: 500;
    z-index: 2000;
    opacity: 1;
    letter-spacing: -0.2px;
    color: var(--bg-color);
    background: var(--body-text);
    border-radius: 2px;
    text-align: center;
    padding: 4px 6px;
  }

  .chord {
    opacity: 0.6;
    font-size: 85%;
    margin-bottom: 0.2rem;
    text-align: center;
  }

  select {
    width: 3.5rem;
    border: none;
    padding: 0.5rem 0;
    margin-bottom: 0.1rem;
    font-family: "Rubik", sans-serif;
    font-size: 0.8rem;
  }

  .white-key select {
    background: var(--black-key-color);
  }

  .black-key select {
    background: var(--white-key-color);
  }
</style>

<div
  class="piano-grid-container {$isFocused || $editMode ? 'transparent' : ''}">
  <div class="piano-grid">
    <div id="⇪" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[20]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[20]}
        </span>
      {/if}
      <span>⇪</span>
    </div>
    <div id="A" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[65]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[65]}
        </span>
      {/if}
      <span>A</span>
    </div>
    <div id="S" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[83]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[83]}
        </span>
      {/if}
      <span>S</span>
    </div>
    <div id="D" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[68]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[68]}
        </span>
      {/if}
      <span>D</span>
    </div>
    <div id="F" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[70]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[70]}
        </span>
      {/if}
      <span>F</span>
    </div>
    <div id="G" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[71]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[71]}
        </span>
      {/if}
      <span>G</span>
    </div>
    <div id="H" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[72]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[72]}
        </span>
      {/if}
      <span>H</span>
    </div>
    <div id="J" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[74]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[74]}
        </span>
      {/if}
      <span>J</span>
    </div>
    <div id="K" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[75]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[75]}
        </span>
      {/if}
      <span>K</span>
    </div>
    <div id="L" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[76]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[76]}
        </span>
      {/if}
      <span>L</span>
    </div>
    <div id="Č" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[186]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[186]}
        </span>
      {/if}
      <span>Č</span>
    </div>
    <div id="Ć" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[222]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[222]}
        </span>
      {/if}
      <span>Ć</span>
    </div>
    <div id="Ž" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[220]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[220]}
        </span>
      {/if}
      <span>Ž</span>
    </div>
    <div id="↵" class="white-key">
      {#if $editMode}
        <select bind:value={$chordNotes[13]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[13]}
        </span>
      {/if}
      <span>↵</span>
    </div>
  </div>

  <div class="piano-grid">
    <div id="Q" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[81]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[81]}
        </span>
      {/if}
      <span>Q</span>
    </div>
    <div id="W" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[87]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[87]}
        </span>
      {/if}
      <span>W</span>
    </div>
    <div id="E" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[69]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[69]}
        </span>
      {/if}
      <span>E</span>
    </div>
    <div class="blank-black-key" />
    <div id="T" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[84]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[84]}
        </span>
      {/if}
      <span>T</span>
    </div>
    <div id="Z" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[90]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[90]}
        </span>
      {/if}
      <span>Z</span>
    </div>
    <div class="blank-black-key" />
    <div id="I" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[73]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[73]}
        </span>
      {/if}
      <span>I</span>
    </div>
    <div id="O" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[79]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[79]}
        </span>
      {/if}
      <span>O</span>
    </div>
    <div id="P" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[80]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[80]}
        </span>
      {/if}
      <span>P</span>
    </div>
    <div class="blank-black-key" />
    <div id="Đ" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[221]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[221]}
        </span>
      {/if}
      <span>Đ</span>
    </div>
    <div id="⌫" class="black-key">
      {#if $editMode}
        <select bind:value={$chordNotes[8]} transition:fade>
          <option value="">-</option>
          {#each Object.keys(chords) as item}
            <option value={item}>{item.replace('<br>', '/')}</option>
          {/each}
        </select>
      {:else if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          {@html $chordNotes[8]}
        </span>
      {/if}
      <span>⌫</span>
    </div>
  </div>

  {#if $editMode}
    <p class="edit-mode-warn" transition:slide={{ y: 80, duration: 300 }}>
      Edit mode
    </p>
  {/if}
</div>
