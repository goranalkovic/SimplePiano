<script>
  import { activeSet, instrumentSets, editMode, isReordering } from "../stores";
  export let set;
  export let i;

  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  import { flip } from "svelte/animate";
  import { slide, fade, scale } from "svelte/transition";

  const updateValue = (item, prop, value) => {
    // either this...
    item[prop] = value;
    instrumentSets.set($instrumentSets); // force an update

    // ...or this:
    // instrumentSets.set(
    //   $instrumentSets.map(i => (i === item ? { ...i, [prop]: value } : i))
    // );
  };

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

  function normalizedName(name) {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  let isHovering = false;
</script>

<style>
  .flex {
    width: 14rem;
    padding: var(--padding);
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .horizontal {
    display: flex;
    gap: var(--padding);
    align-items: center;
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
  }

  .setname {
    font-size: 0.8rem;
  }

  .active {
    background-color: var(--accent-color);
    color: var(--on-accent);
  }

  .flex:not(.active):hover {
    background-color: var(--hover-color);
    cursor: pointer;
  }

  input {
    border: none;
    font-family: var(--font-family);
    border-radius: var(--border-radius);
    padding: calc(var(--padding) / 2) var(--padding);
    width: 100%;
    transition: var(--transition);
  }

  .active input {
    background-color: var(--on-accent);
  }

  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: calc(var(--padding) / 4);
    padding: var(--padding);
    margin-bottom: calc(var(--padding) * -1);
    margin-top: calc(var(--padding) * -1 / 2);
    margin-left: calc(var(--padding) + 4px);
  }
  ul li {
    font-size: 0.75rem;
    opacity: 0.6;
    font-weight: 300;
  }
</style>

<div
  on:mouseenter={() => (isHovering = true)}
  on:mouseleave={() => (isHovering = false)}
  class="flex"
  class:active={$activeSet === i}
  class:disabled={set.instruments.length < 1 && !$editMode}
  on:click={() => activeSet.set(i)}>

  <div class="horizontal">
    <span class="kbdkey" style={i >= 10 ? 'visibility:hidden' : ''}>
      {i + 1 < 10 ? i + 1 : i >= 10 ? '' : 0}
    </span>

    {#if $editMode}
      <input
        type="text"
        value={set.name}
        on:input={(e) => updateValue(set, 'name', e.target.value)}
        class="uppercase {$editMode ? 'edit-field' : 'label-field'}"
        class:act={$activeSet === i && !$editMode}
        style="transition-delay: {50 * i}ms;"
        disabled={!$editMode} />
    {:else}
      <span class="setname">{set.name}</span>
    {/if}

    {#if $editMode}
      <div class="f-shrink transform-key" transition:fade={{ duration: 150 }}>
        <Button
          on:click={(e) => deleteSet(i, e)}
          inline
          icon="delete"
          disabled={i === $activeSet || $instrumentSets.length < 2} />
      </div>
    {/if}
  </div>
  {#if set.instruments.length > 0}
    <ul transition:slide>
      {#each set.instruments as i (i.id)}
        <li transition:slide animate:flip>
          <span>{normalizedName(i.name)}</span>

        </li>
      {/each}
    </ul>
  {/if}
</div>
