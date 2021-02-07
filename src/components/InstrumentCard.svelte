<script>
  import { slide, fade } from "svelte/transition";

  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";
  import SlideControl from "./SlideControl.svelte";
  import { createEventDispatcher } from "svelte";

  import {
    instrumentSets,
    activeSet,
    showAdsr,
    editMode,
  } from "../stores";

  export let item;

  let {
    id, name, volume, octave, soundfont, adsr, absoluteVolume
  } = item;

  // export let id;
  // export let name;
  // export let volume;
  // export let octave;
  // export let soundfont;
  // export let adsr;
  // export let absoluteVolume;
  export let nohover = false;
  export let index;

  let optionsVisible = false;

  const dispatch = createEventDispatcher();

  const normalizedName = (name) => {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  $: volTxt =
    volume > -1
      ? volume < 1
        ? "Muted"
        : `${volume}${absoluteVolume ? "%" : ""}`
      : "Custom volume not set";

  const setVolume = () => {
    let currentSets = $instrumentSets;
    currentSets[$activeSet].instruments[index].volume = volume;
    instrumentSets.set(currentSets);
  }

  const setOctaveShift = () => {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].octave = octave;

    instrumentSets.set(currentSets);
  }

  const toggleAbsoluteVolume = () => {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].absoluteVolume = !currentSets[
      $activeSet
    ].instruments[index].absoluteVolume;

    instrumentSets.set(currentSets);
  }

  const setAdsr = () => {
    let currentSets = $instrumentSets;

    let index = currentSets[$activeSet].instruments.findIndex(
      (i) => i.id === id
    );

    currentSets[$activeSet].instruments[index].adsr = adsr;

    instrumentSets.set(currentSets);
  }

  const remove = () => dispatch("remove");
</script>

<style>
  .toolbar {
    margin-top: var(--padding);
    display: flex;
    flex-wrap: wrap;
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
    font-size: 0.8rem;
    font-weight: 400 !important;
  }

  .card {
    padding: var(--padding);
    border-radius: var(--border-radius);
    background: var(--bg-color);
    transition: var(--transition-colors);
    user-select: none;
    box-sizing: border-box;
    border: none;
  }

  .card:not(.nohover):hover {
    background-color: var(--hover-color);
  }
  .nohover {
    pointer-events: none;
  }

  .soundfont {
    background-color: var(--white-key-color);
    font-size: 0.7rem;
    padding: 4px;
    border-radius: var(--border-radius);
    opacity: 0.6;
    margin-left: 0.5rem;
  }
</style>

<div
  transition:slide
  class="card"
  on:mouseover={() => (optionsVisible = nohover ? false : true)}
  on:mouseleave={() => (optionsVisible = false)}
  class:nohover={nohover || !$editMode}>
  <div class="row">
    <h4 class="uppercase status">
      {normalizedName(name)}
      {#if optionsVisible}
      <span transition:fade class="soundfont">
        {normalizedName(soundfont)}
      </span>
    {/if}
    </h4>
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

        <Button square inline icon="delete" on:click={remove} />
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
        on:change={setOctaveShift}
        customValueDisplay={{ '0': '—', '1': '+1', '2': '+2', '3': '+3' }} />

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
          spaced
          on:click={toggleAbsoluteVolume}
          iconStyle="opacity: 0.6"
          icon="audioOptions"
          label={absoluteVolume ? '% of current' : 'Absolute'} />

      </div>

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
</div>
