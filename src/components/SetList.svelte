<script>
  import { slide } from "svelte/transition";

  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";

  import Button from "./Button.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Toast from "./Toast.svelte";

  import SetListItem from "./SetListItem.svelte";

  function randId() {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(2, 10);
  }

  function addSet() {
    instrumentSets.set([
      ...$instrumentSets,
      {
        id: randId(),
        name: "New set",
        instruments: [],
      },
    ]);

    window.pushToast("Instrument set added");
  }

  function downloadObjectAsJson() {
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify($instrumentSets));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    window.pushToast("Backup downloading");
  }

  function restore() {
    let input = prompt("Copy-paste the backup .json contents");

    if (input != null) {
      try {
        let parsed = JSON.parse(input);

        instrumentSets.set([...parsed]);
      } catch (error) {
        window.pushToast("Restore not successful", "error");
      }

      window.pushToast("Restore successful");
    } else {
      window.pushToast("Invalid restore input", "error");
    }
  }

  function update(from, to) {
    let newList = [...$instrumentSets];
    newList[from] = [newList[to], (newList[to] = newList[from])][0];

    $instrumentSets = [...newList];
    instrumentSets.set($instrumentSets);
  }
  const toggleReorder = () => {
    isReordering.set(!$isReordering);
    window.pushToast("Reordering " + ($isReordering ? "on" : "off"));
  };
</script>

<div class="container">
  {#if $editMode}
    <div transition:slide class="title-flex">
      <h4>Edit mode</h4>
      <div style="display:flex;gap:4px;">
        <Button
          on:click={toggleReorder}
          toggled={$isReordering}
          label="Reorder"
          icon="reorder"
        />
        <Button on:click={downloadObjectAsJson} label="Export" icon="save" />
        <Button on:click={restore} label="Import" icon="open" />
        <Button on:click={addSet} label="Add set" icon="add3" />
      </div>
    </div>
  {/if}

  <DragAndDropList
    bind:list={$instrumentSets}
    canReroder={$isReordering}
    let:item={set}
    let:index={i}
    wrap={!$isReordering}
    column={$isReordering}
    {update}
  >
    <SetListItem {set} {i} />

    <p slot="error">
      No instrument sets.
      <br />
      This is an error.
    </p>
  </DragAndDropList>
</div>

<Toast />

<style>
  .container {
    display: flex;
    flex-direction: column;
    margin: 0;
    justify-content: start;
    gap: calc(var(--padding) / 4);
    padding: 0 var(--padding);
    padding-top: calc(var(--padding) / 2);
  }

  h4 {
    margin: 0;
    padding: 0;
    text-align: left;
  }

  .title-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 2 * var(--padding));
    padding: var(--padding) calc(var(--padding) * 2);
    margin: 0;
  }
</style>
