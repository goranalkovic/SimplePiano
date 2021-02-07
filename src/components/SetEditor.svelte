<script>
  import { activeSet, instrumentSets, editMode, isReordering, currentSoundFont, showAdsr } from "../stores";
  import InstrumentCard from "./InstrumentCard.svelte";
  import InstrumentAdder from "./InstrumentAdder.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Button from "./Button.svelte";
  import Toast from "./Toast.svelte";
  import { slide } from "svelte/transition";
  import { onMount, afterUpdate } from "svelte";

  let deleteDialog;
  let availableInstruments = [];

  const getInstruments = async () => {
    try {
      let data = await fetch(
        `https://gleitz.github.io/midi-js-soundfonts/${$currentSoundFont}/names.json`
      );
      availableInstruments = await data.json();
    } catch (error) {
      // window.popToast("Error loading instruments: " + error.message);
      console.log("Error loading instruments: " + error.message);
    }
  };

  getInstruments();

  const update = (from, to) => {
    let newList = [...$instrumentSets[$activeSet].instruments];
    newList[from] = [newList[to], (newList[to] = newList[from])][0];
    $instrumentSets[$activeSet].instruments = [...newList];
    instrumentSets.set($instrumentSets);
  }

  const toggleReorder = () => {
    isReordering.set(!$isReordering);
    window.pushToast("Reordering " + ($isReordering ? "on" : "off"));
  }

  onMount(() => {
    if (
      $instrumentSets[$activeSet] == null ||
      $instrumentSets[$activeSet] == undefined
    ) {
      activeSet.set(0);
    }
  });

  afterUpdate(() => {
    if (
      $instrumentSets[$activeSet] == null ||
      $instrumentSets[$activeSet] == undefined
    ) {
      activeSet.set(0);
    }
  });

  const removeInstrument = (index) => {
    let currentInstruments = [...$instrumentSets[$activeSet].instruments];

    currentInstruments.splice(index, 1);

    $instrumentSets[$activeSet].instruments = [...currentInstruments];

    instrumentSets.set([...$instrumentSets]);

    instrumentSets.set($instrumentSets);

    activeSet.set($activeSet);
  }

  const deleteSet = (event) => {
    const i = $activeSet;
    const name = $instrumentSets[$activeSet].name;

    event.preventDefault();
    event.stopPropagation();

    let newSets = [...$instrumentSets];
    newSets.splice(i, 1);
    instrumentSets.set(newSets);

    if (newSets.length < 2) {
      activeSet.set(0);
    }
    if ($activeSet >= newSets.length) {
      activeSet.set(newSets.length - 1);
    }

    deleteDialog.close();
    window.pushToast("Removed <i>" + name + "</i>");
  };

  const switchAdsrOpt = () => {
    let curr = $showAdsr;

    showAdsr.set(!curr);
  }
 
 const renameSet = () => {
    let name = prompt('New name');

    if (name != null && name.toString().length > 1) {
      $instrumentSets[$activeSet].name = name.toString();
      instrumentSets.set($instrumentSets); // force an update
    }
 };
</script>

<div class="container">
  {#if $instrumentSets[$activeSet] != null}
    <div class="title-flex">
      <h4>{$instrumentSets[$activeSet].name}</h4>
      {#if $editMode}
        <div class="control-flex" transition:slide>
          <Button
          outline
          label="Rename"
          on:click={renameSet}
        />
          <Button
          outline
          on:click={switchAdsrOpt}
          toggled={$showAdsr}
          tooltip="ADSR controls"
          icon="adsr"
        />
          <Button
            on:click={toggleReorder}
            toggled={$isReordering}
            tooltip="Reorder"
            icon="reorder"
          />

          <Button
            on:click={() => deleteDialog.showModal()}
            icon="delete"
            tooltip="Delete set"
            disabled={$instrumentSets.length < 2}
          />
        
        </div>
      {/if}
    </div>

    <InstrumentAdder {availableInstruments} />

    <DragAndDropList
      list={$instrumentSets[$activeSet].instruments}
      canReroder={$isReordering}
      let:item
      let:index
      column
      {update}
    >
      <InstrumentCard
        {item}
        {index}
        on:remove={() => removeInstrument(index)}
        nohover={$isReordering}
      />

      <p slot="error" style="font-size: 0.8rem;padding:0 var(--padding)">
        No instruments in this set
      </p>
    </DragAndDropList>
  {/if}
</div>

<dialog bind:this={deleteDialog}>
  <h4>Do you want to delete {$instrumentSets[$activeSet].name}</h4>

  <div class="actions">
    <Button outline label="No" on:click={() => deleteDialog.close()} />
    <Button label="Yes" on:click={deleteSet} />
  </div>
</dialog>

<Toast />

<style>
  h4 {
    margin: 0;
    padding: 0;
  }

  .title-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 2 * var(--padding));
    padding: var(--padding);
    margin: 0;
  }

  .container {
    display: flex;
    flex-direction: column;

    width: 30rem;
    height: 48rem;
  }

  .control-flex {
    display: flex;
    gap: 0.5rem;
  }
</style>
