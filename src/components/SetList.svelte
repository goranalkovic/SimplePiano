<script>
  import { flip } from "svelte/animate";
  import { slide, fade, scale } from "svelte/transition";

  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";

  import Button from "./Button.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Toast from "./Toast.svelte";

  import Card from "./Card.svelte";
  import KeyboardKey from "./KeyboardKey.svelte";
  import SetListItem from "./SetListItem.svelte";

  function normalizedName(name) {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

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
        console.log(parsed);

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

  const updateValue = (item, prop, value) => {
    // either this...
    item[prop] = value;
    instrumentSets.set($instrumentSets); // force an update

    // ...or this:
    // instrumentSets.set(
    //   $instrumentSets.map(i => (i === item ? { ...i, [prop]: value } : i))
    // );
  };

  function deleteSet(i, event, name) {
    event.preventDefault();
    event.stopPropagation();

    console.log("ActSet " + $activeSet);

    if (confirm("Delete instrument set?")) {
      let newSets = [...$instrumentSets];
      newSets.splice(i, 1);
      instrumentSets.set(newSets);

      console.log("len: " + newSets.length);

      if (newSets.length < 2) {
        activeSet.set(0);
      }
      if ($activeSet >= newSets.length) {
        activeSet.set(newSets.length - 1);
      }
      // else if (i < $activeSet) {
      //   activeSet.set(currSet - 1);
      // } else {
      //   activeSet.set(0);
      // }
    }

    console.log("ActSet " + $activeSet);
    console.log($instrumentSets[$activeSet]);
    window.pushToast("Removed <i>" + name + "</i>");
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    margin: 0;
    justify-content: start;
    /* padding: var(--padding); */
    gap: calc(var(--padding) / 4);
    padding: 0 var(--padding);
    border-right: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    grid-area: bl;
    padding-top: var(--padding);
  }

  h4 {
    /* margin-bottom: 0.8rem; */
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

<div class="container">

  <div class="title-flex">
    <h4>Sets</h4>
    {#if $editMode}
      <div transition:slide style="display:flex;gap:4px;">
        <Button on:click={downloadObjectAsJson} icon="save" />
        <Button on:click={restore} icon="open" />
        <Button on:click={addSet} icon="add3" />
      </div>
    {/if}
  </div>

  <DragAndDropList
    bind:list={$instrumentSets}
    canReroder={$isReordering}
    let:item={set}
    let:index={i}
    {update}>

    <SetListItem
      {set}
      {i}
      on:remove={(e) => deleteSet(i, e, $instrumentSets[i].name)} />

    <p slot="error">
      No instrument sets.
      <br />
      This is an error.
    </p>
  </DragAndDropList>

</div>

<Toast />
