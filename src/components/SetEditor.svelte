<script>
  import {
    soundFont,
    currentSoundFont,
    activeSet,
    instrumentSets,
    ac,
    defaultAdsr,
    showAdsr
  } from "../stores";
  import Button from "./Button.svelte";
  import InstrumentCard from "./InstrumentCard.svelte";

  let selectedInstrument;
  let availInstruments = [];

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

    // resetInstrumentSets();
  }

  function switchAdsrOpt(){
    let curr = $showAdsr;

    showAdsr.set(!curr);
  }
</script>

<style>
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


  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }

  h4 {
    margin-bottom: 0.8rem;
  }

  .sfselect {
    display: flex;
    margin-bottom: 2rem;
    margin-top: 1rem;
  }

  .sfselect span {
    display: inline-block;
    font-size: 0.9rem;
    margin-right: 0.4rem;
    transform: translateY(0.2rem);
  }
</style>

<div style="width: 22rem;">

  <h4> {$instrumentSets[$activeSet].name} </h4>

  <div class="selector">
    <select
      bind:value={selectedInstrument}
      style="height: 32px; border-top-right-radius: 0;
      border-bottom-right-radius: 0;">
      {#each availInstruments as name}
        <option value={name}>{normalizeInstrumentName(name)}</option>
      {/each}
    </select>
    <Button
      on:click={addInstrument}
      style="height: 32px; margin-left: -4px; border-top-left-radius:0;
      border-bottom-left-radius: 0;">
      Add instrument
    </Button>
  </div>



  <div class="sfselect">
    <span>Sound font </span>
    <Button on:click={switchSf}>{$currentSoundFont}</Button>

    <span style="margin-left: 0.8rem">Show ADSR ctrl. </span>
    <Button on:click={switchAdsrOpt}>{$showAdsr ? 'Yes' : 'No'}</Button>
  </div>

  <div class="list">
    {#each $instrumentSets[$activeSet].instruments as instrument, i (instrument.id)}
      <InstrumentCard {...instrument} />
    {:else}
      <p>No instruments</p>
    {/each}
  </div>
</div>
