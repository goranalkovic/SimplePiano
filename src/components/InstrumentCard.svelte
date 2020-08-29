<script>
  import { slide, fade } from "svelte/transition";

  import Card from "./Card.svelte";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";
  import SlideControl from "./SlideControl.svelte";

  import {
    instrumentSets,
    activeSet,
    octaveShift,
    currentSoundFont,
    defaultAdsr,
    showAdsr,
    editMode,
  } from "../stores";

  export let id;
  export let name;
  export let volume;
  export let octave;
  export let data;
  export let soundfont;
  export let adsr;
  export let absoluteVolume;
  export let nohover = false;

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
        : `${volume}${absoluteVolume ? "%" : ""}`
      : "Custom volume not set";

  function clamp(value, min, max) {
    if (value <= min) return min;
    if (value >= max) return max;
    return value;
  }

  function octavePlus() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    let currentShift = currentSets[$activeSet].instruments[index].octave;
    currentSets[$activeSet].instruments[index].octave = clamp(
      currentShift + 1,
      -3,
      3
    );

    instrumentSets.set(currentSets);
  }

  function octaveMinus() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    let currentShift = currentSets[$activeSet].instruments[index].octave;
    currentSets[$activeSet].instruments[index].octave = clamp(
      currentShift - 1,
      -3,
      3
    );

    instrumentSets.set(currentSets);
  }

  function removeInstrument() {
    let currentSets = $instrumentSets;

    currentSets[$activeSet].instruments = currentSets[
      $activeSet
    ].instruments.filter((i) => i.id !== id);

    instrumentSets.set(currentSets);
  }

  function setVolume() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].volume = volume;

    instrumentSets.set(currentSets);
  }

  function setOctaveShift() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].octave = octave;

    instrumentSets.set(currentSets);
  }

  function toggleAbsoluteVolume() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].absoluteVolume = !currentSets[
      $activeSet
    ].instruments[index].absoluteVolume;

    instrumentSets.set(currentSets);
  }

  function setAdsr() {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].adsr = adsr;

    instrumentSets.set(currentSets);
  }
</script>

<style>
  .toolbar {
    /* display: flex; */
    margin-top: var(--padding);
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: calc(var(--padding) / 2);
  }

  .status {
    flex-grow: 1;
  }

  .info-txt {
    display: inline-block;
    font-size: 0.8rem;

    margin: 0;
  }

  h4 {
    margin: 0;
    font-weight: normal;
    font-size: 0.95rem;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .uppercase {
    /* text-transform: uppercase; */
    font-size: 0.8rem;
    font-weight: 400 !important;
    /* letter-spacing: 1.2px; */
  }
</style>

<Card
  passive={!$editMode}
  on:mouseover={() => (optionsVisible = nohover ? false : true)}
  on:mouseleave={() => (optionsVisible = false)}>
  <div class="row">
    <h4 class="uppercase status">{normalizedName(name)}</h4>

    {#if !optionsVisible}
      <div
        transition:slide
        style="opacity: 0.6; display: flex;
        align-items:center;justify-content:center; gap: 4px">
        {#if volume > -1}
          <Icon style="opacity: 0.5" icon="volume" />
          <span class="info-txt">{volTxt}</span>
        {/if}
        {#if octave != 0}
          <Icon style="opacity: 0.5; margin-left: 8px" icon="octaveAdjust" />
          <span class="info-txt">
            {octave == 0 ? '—' : octave > 0 ? `+${octave}` : octave}
          </span>
        {/if}

      </div>
    {/if}

    {#if $editMode}
      <div transition:fade style="margin-left: 2px;">
        <Button square inline icon="delete" on:click={removeInstrument} />
      </div>
    {/if}

  </div>

  {#if optionsVisible && $editMode}
    <div transition:slide class="toolbar">

      <SlideControl
        darker
        min="-3"
        max="3"
        step="1"
        icon="octaveAdjust"
        bind:value={octave}
        on:change={setOctaveShift} />

      <div
        style="display:flex;align-items:center;justify-content: space-between;">

        <SlideControl
          darker
          min="-1"
          max="100"
          step="1"
          icon="volume"
          bind:value={volume}
          on:change={setVolume}
          customValueDisplay={{ '-1': absoluteVolume ? 'Current' : 'Default', '0': 'Muted' }} />
        <Button
          inline
          on:click={toggleAbsoluteVolume}
          iconStyle="opacity: 0.6"
          icon="audioOptions"
          label={absoluteVolume ? '% of current' : 'Absolute'} />

      </div>

      <p class="info-txt">Sound font: {normalizedName(soundfont)}</p>

      {#if $showAdsr && $editMode}
        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'A'}
          bind:value={adsr[0]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.005': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'D'}
          bind:value={adsr[1]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.395': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'S'}
          bind:value={adsr[2]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '0.8': 'Default' }} />

        <SlideControl
          min={-0.01}
          max={1}
          step={0.01}
          title={'R'}
          bind:value={adsr[3]}
          on:change={setAdsr}
          customValueDisplay={{ '-0.01': 'Default', '1.2': 'Default' }} />
      {/if}
    </div>
  {/if}
</Card>
