<script>
  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";
  import InstrumentCard from "./InstrumentCard.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Button from "./Button.svelte";
  import Toast from "./Toast.svelte";
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";

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
</script>

<style>
  h4 {
    margin: 0;
    padding: 0.8rem 0;
    text-transform: uppercase;
  }

  .error {
    font-size: 0.9rem;
    font-weight: 400;
  }

  .title-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    /* padding: 0.8rem 0; */
    padding: 0;
    height: 3rem;
  }
</style>

<div style="width: 22rem;">

  <div class="title-flex">
    <h4>{$instrumentSets[$activeSet].name}</h4>
    {#if $editMode}
      <div transition:slide>
        <Button on:click={toggleReorder} toggled={$isReordering}>
          Reorder
        </Button>
      </div>
    {/if}
  </div>

  <DragAndDropList
    list={$instrumentSets[$activeSet].instruments}
    canReroder={$isReordering}
    let:item
    {update}>
    <InstrumentCard {...item} nohover={$isReordering} />
    <p class="error" slot="error">No instruments</p>
  </DragAndDropList>

</div>

<Toast />
