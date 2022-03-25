<script>
  import {
    chordMode,
    editMode,
    volumeModifier,
    octaveShift,
    theme,
    volume,
    instrumentSets,
    activeSet,
    tempShiftUp,
    tempShiftDown,
    currentSoundFont,
    soundFont,
  } from "../stores";
  import { icons } from "../icons";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import { beforeUpdate, onDestroy, onMount } from "svelte";
  import Button from "./Button.svelte";

  import Dialog from "./Dialog.svelte";
  import { get } from "svelte/store";
  import Instrument from "../instrument.js";
  import { normalizeName } from "../helpers";
  import Icon from "./Icon.svelte";
  import Slider from "./Slider.svelte";
  import InstrumentAdder from "./InstrumentAdder.svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import MenuItem from "./MenuItem.svelte";
  import { displayPositions } from "../display-positions";

  const handleDndConsider = (e) => {
    items = e.detail.items;
  };

  const handleDndFinalize = (e) => {
    let reconfigured = [];

    e.detail.items.forEach((item) => {
      const newInstr = new Instrument(
        item.name,
        item._volume,
        item.soundfont,
        item._octaveShift,
        item._absoluteVolume,
        item._adsr
      );

      newInstr.id = item.id;

      reconfigured = [...reconfigured, newInstr];
    });

    items = reconfigured;

    $instrumentSets.find(
      (i) => i.id === currentSet.id
    ).instruments = reconfigured;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };

  export let dialog;

  let items = [];

  let currentSet;

  // const unsubscribe = activeSet.subscribe((setId) => {
  //   currentSet = get(instrumentSets).find((i) => i.id === setId);

  //   items = [...currentSet.instruments];
  // });

  onMount(() => {
    currentSet = get(instrumentSets).find((i) => i.id === $activeSet);

    items = [...currentSet.instruments];
  });

  const closeDialog = () => {
    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
    dialog.close();
    $editMode = false;
  };

  // onDestroy(() => {
  //   unsubscribe();
  // });

  const deleteInstrument = (instrumentId) => {
    items = items.filter((i) => i.id !== instrumentId);
    $instrumentSets.find((i) => i.id === currentSet.id).instruments = items;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };

  const addInstrument = (event) => {
    const newInstrument = new Instrument(event.detail.name);

    items = [...items, newInstrument];
    $instrumentSets.find((i) => i.id === currentSet.id).instruments = items;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };

  let soundfontContextMenu;
  let instrumentAdder;

</script>

<Dialog bind:this={dialog}>
  <div class="flex items-center justify-between" slot="top-actions">
    <input
      class="transition bg-transparent w-min hover:shadow-inner"
      type="text"
      bind:value={currentSet.name} />

    <div>
      <Button icon={icons.close} on:click={closeDialog} />
    </div>
  </div>
  <div class="flex gap-8 py-2 w-full max-w-screen-sm">
    <InstrumentAdder
      on:instrumentadd={addInstrument}
      bind:this={instrumentAdder}
      />
    <section
      tabindex="-1"
      class="w-full p-px mt-3 overflow-visible overflow-y-scroll transition rounded-lg h-96"
      use:dndzone={{ items, flipDurationMs: 150, dropTargetClasses: ['drop-target'], type: 'instrumentList' }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}>
      {#each items as instrument (instrument.id)}
        <div
          class="p-2 border border-gray-200 rounded-lg dark:border-gray-800 group"
          animate:flip={{ duration: 150 }}>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <p class="text-sm">{instrument.displayName}</p>
              <p
                class="transition opacity-0 group-hover:opacity-100 py-0 px-1.5 bg-gray-900 rounded-lg text-xxs text-gray-500">
                {instrument.soundfont}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              {#if instrument._volume > -1}
                <div
                  class="transition opacity-100 flex items-center group-hover:opacity-0 py-0 px-1.5 bg-gray-900 rounded-lg text-xxs text-gray-500">
                  <Icon
                    additionalClass="transform scale-75 -ml-1"
                    icon={icons.volume1} />
                  <span> {instrument._volume} </span>
                </div>
              {/if}

              {#if instrument._octaveShift !== 0}
                <div
                  class="transition opacity-100 flex items-center group-hover:opacity-0 py-0 px-1.5 bg-gray-900 rounded-lg text-xxs text-gray-500">
                  <Icon
                    additionalClass="transform scale-75 -ml-1"
                    icon={icons.shift} />
                  <span>
                    {instrument._octaveShift > 0 ? `+${instrument._octaveShift}` : instrument._octaveShift}
                  </span>
                </div>
              {/if}

              {#if items.length > 1}
                <Icon
                  additionalClass="text-gray-400 dark:text-gray-700 mr-1 pointer-events-auto"
                  icon={icons.reorderDotsH} />
              {/if}
            </div>
          </div>
          <div
            class="flex flex-col items-start h-0 gap-2 pt-0 overflow-y-hidden transition-all pointer-events-auto group-hover:h-28 group-hover:pt-2">
            <Slider
              description="Octave"
              min="-3"
              max="3"
              step="1"
              stackableLabel
              bind:value={instrument._octaveShift} />
            <div class="flex items-center space-x-2">

                <Slider
                description="Volume"
                min="-1"
                max="100"
                step="1"
                stackableLabel
                customValueDisplay={{'-1': 'auto', '0' : 'mute' }}
                bind:value={instrument._volume} />

                <Button
                on:click={() => (instrument.absoluteVolume = !instrument.absoluteVolume)}
                outlined
                highlighted={!instrument.absoluteVolume}
                label={instrument.absoluteVolume ? '%' : 'total'} />
            </div>
            <div class="flex items-center justify-between w-full mt-auto">
              <Button
                on:click={() => deleteInstrument(instrument.id)}
                outlined
                label="Remove" />
            </div>
          </div>
        </div>
      {/each}
    </section>
  </div>
  <div class="flex flex-col" slot="bottom-actions">
    <div class="h-px w-44 mt-1 mb-3 rounded bg-gray-800"></div>
    <ContextMenu bind:this={soundfontContextMenu}>
      <Button on:click={() => soundfontContextMenu.open()} label="Soundfont" />
      <div slot="menu-items" class="flex flex-col space-y-1">
        <MenuItem
          on:click={() => {
            $currentSoundFont = soundFont.fluid;
            instrumentAdder.reloadInstrumentList();
          }}
          padded
          selected={$currentSoundFont == soundFont.fluid}
          label="FluidR3_GM" />
        <MenuItem
          on:click={() => {
            $currentSoundFont = soundFont.mk;
            instrumentAdder.reloadInstrumentList();
          }}
          padded
          selected={$currentSoundFont == soundFont.mk}
          label="MusyngKyte" />
        <MenuItem
          on:click={() => {
            $currentSoundFont = soundFont.fatboy;
            instrumentAdder.reloadInstrumentList();
          }}
          padded
          selected={$currentSoundFont == soundFont.fatboy}
          label="FatBoy" />
      </div>
    </ContextMenu>
  </div>
</Dialog>
<!-- 
<Button
  label="Open dialog"
  on:click={() => {
    $editMode = true;
    dialog.show();
  }} /> -->
