<script>
  import {
    soundFont,
    currentSoundFont,
    instrumentSets,
    ac,
    showAdsr,
    isFocused,
    activeSet,
    editMode
  } from "../stores";

  import Button from "./Button.svelte";

  let selectedInstrument;
  let availInstruments = [];

  let filterString = "";

  $: filteredList =
    filterString.trim() === ""
      ? availInstruments
      : availInstruments.filter(
          item => item.toLowerCase().indexOf(filterString.toLowerCase()) !== -1
        );

  async function getInstruments() {
    let data = await fetch(
      `https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`
    );
    availInstruments = await data.json();
    selectedInstrument = availInstruments[0];
  }

  getInstruments();

  function normalizeInstrumentName(input) {
    input = input.replace(/_/g, " ");

    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  function randId() {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(2, 10);
  }

  function addPickedInstrument(instrument) {
    if (instrument == null) return;

    selectedInstrument = instrument;
    addInstrument();
  }

  function addInstrument() {
    if (selectedInstrument == null) return;

    let instrumentData = Soundfont.instrument(ac, selectedInstrument, {
      soundfont: $currentSoundFont
    });

    let newInstr = {
      id: randId(),
      name: selectedInstrument,
      volume: -1,
      octave: 0,
      absoluteVolume: true,
      data: instrumentData,
      soundfont: $currentSoundFont,
      adsr: [-0.01, -0.01, -0.01, -0.01]
    };

    let currentSets = $instrumentSets;

    currentSets[$activeSet].instruments.push(newInstr);

    instrumentSets.set(currentSets);
  }

  function switchSf() {
    let curr = $currentSoundFont;

    if (curr == soundFont.fluid) currentSoundFont.set(soundFont.mk);
    if (curr == soundFont.mk) currentSoundFont.set(soundFont.fatboy);
    if (curr == soundFont.fatboy) currentSoundFont.set(soundFont.fluid);

    getInstruments();
    // resetInstrumentSets();
  }

  function switchAdsrOpt() {
    let curr = $showAdsr;

    showAdsr.set(!curr);
  }

  function setFocused() {
    isFocused.set(true);
  }

  function setUnfocused() {
    isFocused.set(false);
  }
</script>

<style>
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }

  h4 {
    margin-bottom: 0.8rem;
  }

  select {
    background: var(--white-key-color);
    color: var(--white-key-text);
    border: none;
    padding: 6px 8px;
    box-shadow: var(--shadow-small);
    border-radius: var(--border-radius);
    -webkit-appearance: none;
    cursor: s-resize;
    transition: var(--transition);
    font-family: var(--font-family);
    width: 12rem;
  }

  select:hover {
    box-shadow: var(--shadow-big);
  }

  .column {
    display: flex;
    flex-direction: column;
    width: 14rem;
  }

  .scrollList {
    height: 28rem;
    overflow-y: scroll;
  }

  .scrollList::-webkit-scrollbar {
    display: none;
  }

  .search-box {
    background: var(--white-key-color);
    color: var(--white-key-text);
    border: none;
    padding: 6px 8px;
    box-shadow: var(--shadow-small);
    border-radius: var(--border-radius);
    width: 12rem;
    margin-bottom: 1rem;
    font-family: var(--font-family);
    margin-top: 0.5rem;
  }

  .mini-column {
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
    margin-top: 1rem;
    width: 11.4rem;
    margin-left: 0.5rem;
  }

  .mini-column span {
    margin-bottom: 0.4rem;
    flex-grow: 1;
  }

  .row {
    display: flex;
    height: 2rem;
    align-items: baseline;
  }

  .transparent {
    opacity: 0.2;
    pointer-events: none;
  }
</style>

<div class="column" class:transparent={!$editMode}>
  <h4>Instruments</h4>

  <div class="selector">

    <input
      on:focus={setFocused}
      on:blur={setUnfocused}
      class="search-box"
      placeholder="Search..."
      type="search"
      bind:value={filterString} />

    <div class="scrollList">
      {#each filteredList as item (item)}
        <Button
          style="width: 12rem; height: 2rem; margin-bottom: 0.4rem; text-align:
          left;"
          on:click={e => addPickedInstrument(item)}>
          {normalizeInstrumentName(item)}
        </Button>
      {/each}
    </div>

  </div>

  <div class="mini-column">
    <div class="row">
      <span>Sound font</span>
      <Button on:click={switchSf}>{$currentSoundFont}</Button>
    </div>

    <div class="row" style="align-items: flex-end;">
      <!-- <span style="margin-top: 0.8rem"></span> -->
      <Button on:click={switchAdsrOpt} toggled={$showAdsr} style="width: 100%">
        Show ADSR controls
      </Button>
    </div>
  </div>
</div>
