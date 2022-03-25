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
    chordNotes,
    defaultChords,
  } from "../stores";
  import { icons } from "../icons";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import { beforeUpdate, onDestroy } from "svelte";
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
  import WhiteChordKey from "./WhiteChordKey.svelte";
  import BlackChordKey from "./BlackChordKey.svelte";

  export let dialog;

  const closeDialog = () => {
    dialog.close();
    $editMode = false;
  };
</script>

<Dialog bind:this={dialog}>
  <div class="flex items-center justify-between" slot="top-actions">
    <span>Chord editor</span>

    <div class="flex items-center space-x-2">
      <Button
        outlined
        label="Default"
        on:click={() => chordNotes.set(defaultChords)} />
      <Button
        outlined
        label="Clear all"
        on:click={() => {
          let temp = $chordNotes;
          for (let keyboardKey of Object.keys(defaultChords)) {
            temp[keyboardKey] = '';
          }
          chordNotes.set(temp);
          for (let sel of document.querySelectorAll('.piano-grid select')) {
            sel.value = null;
          }
        }} />
      <Button icon={icons.close} on:click={closeDialog} />
    </div>
  </div>

  <div
    class="h-48 p-0 m-0 mt-3 border-t border-gray-200 select-none piano-grid dark:border-gray-750">
    <div class="white-keys flex space-x-0.5 w-max h-max">
      <WhiteChordKey keyId="20" />
      <WhiteChordKey keyId="65" />
      <WhiteChordKey keyId="83" />
      <WhiteChordKey keyId="68" />
      <WhiteChordKey keyId="70" />
      <WhiteChordKey keyId="71" />
      <WhiteChordKey keyId="72" />
      <WhiteChordKey keyId="74" />
      <WhiteChordKey keyId="75" />
      <WhiteChordKey keyId="76" />
      <WhiteChordKey keyId="186" />
      <WhiteChordKey keyId="222" />
      <WhiteChordKey keyId="220" />
      <WhiteChordKey keyId="13" />
    </div>
    <div class="black-keys mx-6 flex space-x-0.5">
      <BlackChordKey keyId={81} />
      <BlackChordKey keyId={87} />
      <BlackChordKey keyId={69} />
      <BlackChordKey dummy />
      <BlackChordKey keyId={84} />
      <BlackChordKey keyId={90} />
      <BlackChordKey dummy />
      <BlackChordKey keyId={73} />
      <BlackChordKey keyId={79} />
      <BlackChordKey keyId={80} />
      <BlackChordKey dummy />
      <BlackChordKey keyId={221} />
      <BlackChordKey keyId={8} />
    </div>
  </div>
</Dialog>

<!-- <Button
  label="Open dialog"
  on:click={() => {
    $editMode = true;
    dialog.show();
  }} /> -->
