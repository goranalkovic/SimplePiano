<script>
  import { slide, fade } from "svelte/transition";
  import {
    soundFont,
    currentSoundFont,
    instrumentSets,
    ac,
    showAdsr,
    isFocused,
    activeSet,
    editMode,
    isReordering,
  } from "../stores";

  import Button from "./Button.svelte";
  import Toast from "./Toast.svelte";

  let selectedInstrument;
  let availInstruments = [];

  let filterString = "";

  $: filteredList =
    filterString.trim() === ""
      ? availInstruments
      : availInstruments.filter(
          (item) =>
            item.toLowerCase().indexOf(filterString.toLowerCase()) !== -1
        );

  async function getInstruments() {
    try {
      let data = await fetch(
        `https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`
      );
      availInstruments = await data.json();
      selectedInstrument = availInstruments[0];
    } catch (error) {
      window.popToast("Error loading instruments: " + error.message);
    }
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
      soundfont: $currentSoundFont,
    });

    let newInstr = {
      id: randId(),
      name: selectedInstrument,
      volume: -1,
      octave: 0,
      absoluteVolume: true,
      data: instrumentData,
      soundfont: $currentSoundFont,
      adsr: [-0.01, -0.01, -0.01, -0.01],
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
  h4 {
    margin: 0;
    padding: 0.8rem 0;
  }

  .column {
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--border-color);
    padding: 0 calc(var(--padding) * 2);
    padding-top: var(--padding);
    align-items: center;
  }

  .scrollList {
    height: 50vh;
    overflow-y: scroll;
  }

  .scrollList::-webkit-scrollbar {
    display: none;
  }

  .search-box {
    background: var(--black-key-color);
    color: var(--white-key-text);
    border: none;
    padding: 6px 8px;
    border-radius: var(--border-radius);
    width: 12rem;
    margin-bottom: 1rem;
    font-family: var(--font-family);
    margin-top: 0.5rem;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    width: 7rem;
    border-radius: 3px;
    /* box-shadow: var(--shadow-small); */
    width: 12rem;
    /* background: var(--white-key-color); */
  }

  li {
    font-size: 0.8rem;
    padding: calc(var(--padding) * 0.8) var(--padding);
    transition: var(--transition);
    border-radius: var(--border-radius);
    margin-bottom: 2px;
  }

  li:hover {
    background-color: var(--hover-color);
    cursor: pointer;
  }

  .info-msg {
    font-size: 0.85rem;
    line-height: 150%;
    transform: translateY(-10px);
  }

  .info-msg span {
    font-weight: bold;
  }

  hr {
    width: calc(100% + 4 * var(--padding));
    padding: 0;
    margin: 0;
    display: block;
    margin-top: var(--padding);
    margin-bottom: calc(var(--padding) * 2);
    border-width: 1px;
    border-color: var(--border-color);
    border-style: solid;
  }
</style>

<div class="column">
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
      {#if filteredList.length > 0}
        <ul transition:slide={{ duration: 200 }}>
          {#each filteredList as item (item)}
            <li on:click={(e) => addPickedInstrument(item)}>
              {normalizeInstrumentName(item)}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="info-msg" transition:slide={{ duration: 200 }}>
          No instruments match
          <br />
          <span>{filterString}</span>
        </p>
      {/if}
    </div>

  </div>

  <hr />
  <Button
    on:click={switchAdsrOpt}
    toggled={$showAdsr}
    label="ADSR controls"
    icon="adsr" />
  <br />
  <span style="font-size: 0.8rem; margin-bottom: var(--padding)">
    Soundfont
  </span>

  <Button on:click={switchSf}>{$currentSoundFont}</Button>

</div>
<Toast />
