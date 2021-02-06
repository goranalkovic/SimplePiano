<script>
  import { activeSet, editMode, soundFont, currentSoundFont } from "../stores";
  export let set;
  export let i;

  import Button from "./Button.svelte";
  import SetEditor from "./SetEditor.svelte";
  import Icon from "./Icon.svelte";

  import { slide, fade, scale } from "svelte/transition";

  const normalizedName = (name) => {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const switchSf = () => {
    let curr = $currentSoundFont;

    if (curr == soundFont.fluid) currentSoundFont.set(soundFont.mk);
    if (curr == soundFont.mk) currentSoundFont.set(soundFont.fatboy);
    if (curr == soundFont.fatboy) currentSoundFont.set(soundFont.fluid);
  };

  const showEditDialog = () => {
    activeSet.set(i);

    setEditDialog.showModal();

    setEditDialog.addEventListener("click", (e) => {
      if (e.target == setEditDialog) {
        setEditDialog.close();
      }
    });
  };

  let setEditDialog;
</script>

<div
  class="flex"
  class:active={$activeSet === i && !$editMode}
  class:disabled={set.instruments.length < 1 && !$editMode}
  class:editing={$editMode}
  on:click={() => ($editMode ? showEditDialog() : activeSet.set(i))}
>
  {#if $editMode}
    <Icon icon="edit" />
  {:else}
    <span class="kbdkey" style={i >= 10 ? "visibility:hidden" : ""}>
      {i + 1 < 10 ? i + 1 : i >= 10 ? "" : 0}
    </span>
  {/if}
  <span class="setname">{set.name}</span>

  {#if set.instruments.length > 0 && !$editMode}
    <ul transition:slide>
      {#each set.instruments as i (i.id)}
        <li>
          <span>{normalizedName(i.name)}</span>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $editMode}
    <ul transition:slide style="grid-area: list">
      <li>
        <span
          >{set.instruments.length} instrument{set.instruments.length != 1
            ? "s"
            : ""}</span
        >
      </li>
    </ul>
  {/if}
</div>

<dialog bind:this={setEditDialog}>
  <SetEditor />

  <div class="actions">
    <div
      style="display: flex; flex-direction:column; gap: 0.2rem; margin-right: auto; align-items: center; justify-content: center;"
    >
      <span
        style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6;"
        >Soundfont</span
      >
      <Button outline on:click={switchSf}>{$currentSoundFont}</Button>
    </div>
    <div style="margin-top: auto;">
      <Button label="Close" on:click={() => setEditDialog.close()} />
    </div>
  </div>
</dialog>

<style>
  .flex {
    width: 14rem;
    padding: var(--padding);
    border-radius: var(--border-radius);
    transition: var(--transition-colors);

    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1.1rem 1fr;
    grid-template-areas: "kbd name" "- list";
    row-gap: calc(var(--padding) / 4);
    column-gap: var(--padding);
    height: 100%;
    box-sizing: border-box;
  }

  .flex.editing {
    cursor: pointer;
  }

  .kbdkey {
    font-size: 10px;
    border: 1px solid var(--border-color);
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0;
    margin: 0;
    grid-area: kbd;
    pointer-events: none;
    user-select: none;
  }

  .setname {
    font-size: 0.8rem;
    grid-area: name;
    pointer-events: none;
    user-select: none;
  }

  .active {
    background-color: var(--accent-color);
    color: var(--on-accent);
  }

  .flex:not(.active):hover {
    background-color: var(--hover-color);
    cursor: pointer;
  }

  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: calc(var(--padding) / 4);
    padding: 0;
    margin: 0;
    grid-area: list;
    pointer-events: none;
    user-select: none;
    align-self: start;
    justify-self: start;
  }
  ul li {
    font-size: 0.75rem;
    opacity: 0.6;
    font-weight: 300;
  }
</style>
