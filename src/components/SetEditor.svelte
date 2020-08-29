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
    padding: 0;
  }

  .error {
    font-size: 0.9rem;
    font-weight: 400;
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

  <div class="title-flex">
    <h4>{$instrumentSets[$activeSet].name}</h4>
    {#if $editMode}
      <div transition:slide>
        <Button
          on:click={toggleReorder}
          toggled={$isReordering}
          label="Reorder items"
          icon="reorder" />
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
