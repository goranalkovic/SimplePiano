<script>
  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";
  import InstrumentCard from "./InstrumentCard.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Button from "./Button.svelte";
  import Toast from "./Toast.svelte";
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { onMount, afterUpdate } from "svelte";
  import App from "../App.svelte";

  function update(from, to) {
    let newList = [...$instrumentSets[$activeSet].instruments];
    newList[from] = [newList[to], (newList[to] = newList[from])][0];
    $instrumentSets[$activeSet].instruments = [...newList];
    instrumentSets.set($instrumentSets);
  }

  function toggleReorder() {
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
    // console.log($instrumentSets[$activeSet].instruments);
  });
  afterUpdate(() => {
    if (
      $instrumentSets[$activeSet] == null ||
      $instrumentSets[$activeSet] == undefined
    ) {
      activeSet.set(0);
    }
    // console.log($instrumentSets[$activeSet].instruments);
  });

  function removeInstrument(index) {
    event.preventDefault();
    event.stopPropagation();

    let currentInstruments = [...$instrumentSets[$activeSet].instruments];

    currentInstruments.splice(index, 1);

    $instrumentSets[$activeSet].instruments = [...currentInstruments];

    instrumentSets.set([...$instrumentSets]);

    instrumentSets.set($instrumentSets);

    activeSet.set($activeSet);
  }

  $: tempInstrs =
    $instrumentSets[$activeSet] == null
      ? []
      : $instrumentSets[$activeSet].instruments;
</script>

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
    grid-area: l;

    display: flex;
    flex-direction: column;
    padding-top: var(--padding);
  }
</style>

<div class="container">

  {#if $instrumentSets[$activeSet] != null}
    <div class="title-flex">
      <h4>{$instrumentSets[$activeSet].name}</h4>
      {#if $editMode}
        <div transition:slide>
          <Button
            on:click={toggleReorder}
            toggled={$isReordering}
            label="Reorder"
            icon="reorder" />
        </div>
      {/if}
    </div>

    <DragAndDropList
      list={$instrumentSets[$activeSet].instruments}
      canReroder={$isReordering}
      let:item
      let:index
      {update}>
      <InstrumentCard
        {...item}
        {index}
        on:remove={() => removeInstrument(index)}
        nohover={$isReordering} />

      <p slot="error" style="font-size: 0.8rem;padding:0 var(--padding)">
        No instruments in this set
      </p>
    </DragAndDropList>
  {/if}
</div>

<Toast />
