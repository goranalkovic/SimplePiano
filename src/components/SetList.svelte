<script>
  import { flip } from "svelte/animate";
  import { slide, fade, scale } from "svelte/transition";

  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";

  import Button from "./Button.svelte";
  import DragAndDropList from "./DragAndDropList.svelte";
  import Toast from "./Toast.svelte";

  import Card from "./Card.svelte";
  import KeyboardKey from "./KeyboardKey.svelte";

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

  function deleteSet(set, event) {
    event.preventDefault();
    event.stopPropagation();

    const name = $instrumentSets[set].name;

    if (confirm("Delete instrument set?")) {
      let newSets = [...$instrumentSets];
      newSets.splice(set, 1);
      instrumentSets.set([...newSets]);
    }

    window.pushToast("Removed <i>" + name + "</i>");
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
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    margin: 0 2rem;
  }

  h4 {
    /* margin-bottom: 0.8rem; */
    margin: 0;
    padding: 0;
    text-align: left;
  }

  .fixed-card {
    width: 14rem;
    display: flex;
    padding: 0;
    margin: 0;
    transition: 0.2s all;
  }

  .remove-btm-margin {
    margin-bottom: -0.6rem;
  }

  .f-grow {
    flex-grow: 1;
    margin: 0;
    padding: 0;
  }

  .f-shrink {
    margin: 0;
    padding: 0;
  }

  .act {
    color: var(--accent-color) !important;
  }

  .uppercase {
    /* text-transform: uppercase; */
    font-size: 0.8rem;
    font-weight: 500 !important;
    /* letter-spacing: 1.2px; */
    margin: 0;
    padding: 0;
    transition: 0.2s transform;
    font-family: var(--font-family);
  }

  .info-txt {
    display: block;
    font-size: 0.8rem;
    opacity: 0.6;
    margin: 0.05rem 0;
  }

  .transform-key {
    transform: translateX(0.6rem) translateY(-0.1rem);
  }

  .edit-field {
    /* background: transparent; */
    /* background: var(--white-key-color); */
    background: rgba(var(--body-text-values), 0.03);
    border: 1px solid transparent;
    border-bottom: 1px solid rgba(var(--body-text-values), 0.2);
    border-radius: 3px;
    /* box-shadow: var(--shadow-small); */
    height: 20px;
    font-family: var(--font-family);
    /* text-transform: uppercase; */
    font-size: 13px;
    margin: 0 0 11px 0;
    padding: 4px 8px;
    transition: var(--transition);
    color: var(--white-key-text);
  }

  .edit-field:hover {
    border-bottom: 1px solid rgba(var(--body-text-values), 0.6);
  }

  .edit-field:focus {
    border: 1px solid transparent;
    border-bottom: 1px solid var(--accent);
  }

  input.act.edit-field {
    font-weight: 900;
  }

  .label-field {
    background: transparent;
    border: none !important;
    height: 10px !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    /* transform: translateY(0px); */
    transition: var(--transition);
    color: var(--body-text);
  }

  .title-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    padding: 0.8rem 0;
  }
</style>

<div class="container">

  <div class="title-flex">
    <h4 style="font-weight: 400">Instrument sets</h4>
    {#if $editMode}
      <div transition:slide>
        <Button on:click={addSet}>Add</Button>
      </div>
    {/if}
  </div>

  <DragAndDropList
    bind:list={$instrumentSets}
    canReroder={$isReordering}
    let:item={set}
    let:index={i}
    {update}>
    <Card
      disabled={set.instruments.length < 1 && !$editMode}
      passive={false}
      active={$activeSet === i}
      on:click={() => {
        activeSet.set(i);
      }}>
      <div
        class="fixed-card {set.instruments.length > 0 ? '' : 'remove-btm-margin'}">
        <div class="f-grow">

          <input
            type="text"
            value={set.name}
            on:input={(e) => updateValue(set, 'name', e.target.value)}
            class="uppercase {$editMode ? 'edit-field' : 'label-field'}"
            class:act={$activeSet === i && !$editMode}
            style="transition-delay: {50 * i}ms;"
            disabled={!$editMode} />

          <!-- <div>
              {#if isEditing}
                <Button outline on:click={finishEditing}>Save</Button>
              {/if}
            </div> -->

          {#each set.instruments as i (i.id)}
            <span class="info-txt" transition:slide animate:flip>
              {normalizedName(i.name)}
            </span>
          {/each}
        </div>
        {#if !$editMode}
          <div
            class="f-shrink transform-key"
            transition:fade={{ duration: 150, delay: 50 * i }}>
            <KeyboardKey square key={i + 1 < 10 ? i + 1 : i >= 10 ? '' : 0} />
          </div>
        {:else if $editMode && i >= 1 && i !== $activeSet}
          <div
            class="f-shrink transform-key"
            transition:fade={{ duration: 150 }}>
            <Button
              on:click={(e) => deleteSet(i, e)}
              outline
              style="font-family: 'Inter', sans-serif; transform:
              translateX(-8px) translateY(1px); padding: 0.3rem; font-size:
              1rem;">
              ⌫
            </Button>
          </div>
        {/if}
      </div>

    </Card>

    <p slot="error">
      🕳 No instrument sets.
      <br />
      This is an error.
    </p>
  </DragAndDropList>

  {#if $editMode}
    <div class="title-flex" transition:slide>
      <Button on:click={downloadObjectAsJson}>Backup</Button>
      <Button on:click={restore}>Restore</Button>
    </div>
  {/if}
</div>

<Toast />
