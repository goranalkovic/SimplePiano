<script>
  import { slide } from "svelte/transition";

  import Card from "./Card.svelte";
  import Button from "./Button.svelte";
  import SlideControl from "./SlideControl.svelte";

  import {
    instrumentSets,
    activeSet,
    octaveShift,
    currentSoundFont,
    defaultAdsr,
    showAdsr
  } from "../stores";

  export let id;
  export let name;
  export let volume;
  export let octave;
  export let data;
  export let soundfont;
  export let adsr;

  let optionsVisible = false;

  function normalizedName(name) {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  $: octShift =
    octave == 0
      ? "No octave shift"
      : octave < 0
      ? `Octave ${octave}`
      : `Octave +${octave}`;

  $: volTxt =
    volume > -1
      ? volume < 1
        ? "Muted"
        : `Volume ${volume}`
      : "Custom volume not set";

  function clamp(value, min, max) {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
  }

  function octavePlus() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

    let currentShift = currentSets[$activeSet].instruments[index].octave;
    currentSets[$activeSet].instruments[index].octave = clamp(
      currentShift + $octaveShift + 1,
      -3,
      3
    );

    instrumentSets.set(currentSets);
  }

  function octaveMinus() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

    let currentShift = currentSets[$activeSet].instruments[index].octave;
    currentSets[$activeSet].instruments[index].octave = clamp(
      currentShift + $octaveShift - 1,
      -3,
      3
    );

    instrumentSets.set(currentSets);
  }

  function removeInstrument() {
    let currentSets = $instrumentSets;

    currentSets[$activeSet].instruments = currentSets[
      $activeSet
    ].instruments.filter(i => i.id !== id);

    instrumentSets.set(currentSets);
  }

  function setVolume() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

    currentSets[$activeSet].instruments[index].volume = volume;

    instrumentSets.set(currentSets);
  }

  function setAdsr() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(i => i.id === id);

    currentSets[$activeSet].instruments[index].adsr = adsr;

    instrumentSets.set(currentSets);
  }
</script>

<style>
  .toolbar {
    /* display: flex; */
    margin-top: 0.6rem;
  }

  .status {
    display: flex;
    flex-direction: column;
  }

  .status span {
    display: inline-block;
    font-size: 0.8rem;
    opacity: 0.6;
    margin: 0.05rem 0;
  }

  h4 {
    margin: 0 0 0.2rem 0;
    font-weight: normal;
    font-size: 0.95rem;
  }
</style>

<Card
  on:mouseover={() => (optionsVisible = true)}
  on:mouseleave={() => (optionsVisible = false)}>
  <h4>{normalizedName(name)}</h4>

  <div class="status">
    <span>{octShift}</span>
    <span transition:slide>Sound font: {normalizedName(soundfont)}</span>
    {#if volume > -1}
      <span transition:slide>{volTxt}</span>
    {/if}
  </div>

  {#if optionsVisible}
    <div transition:slide class="toolbar">
      <Button outline on:click={octavePlus}>Octave +</Button>
      <Button outline on:click={octaveMinus} spaced>Octave -</Button>
      <Button outline on:click={removeInstrument}>Remove</Button>
      <br />
      <br />

      <SlideControl
        min={-1}
        max={100}
        step={1}
        title={'Volume'}
        bind:value={volume}
        on:change={setVolume}
        customValueDisplay={{ '-1': 'Default', '0': 'Muted' }} />
      {#if $showAdsr}
        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'Attack'}
          bind:value={adsr[0]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.005': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'Delay'}
          bind:value={adsr[1]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.395': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'Sustain'}
          bind:value={adsr[2]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.8': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'Release'}
          bind:value={adsr[3]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '1.2': 'Default' }} />
      {/if}
    </div>
  {/if}
</Card>
