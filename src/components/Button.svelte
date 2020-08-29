<script>
  import Icon from "./Icon.svelte";

  export let spaced = false;
  export let style = null;
  export let outline = false;
  export let toggled = false;
  export let active = false;
  export let rectangular = false;
  export let icon = null;
  export let label = null;
  export let square = false;
  export let inline = false;
  export let disabled = false;
  export let iconStyle = null;
</script>

<style>
  button {
    border: none;
    background: var(--black-key-color);
    color: var(--body-text);
    padding: calc(var(--padding) / 2) var(--padding);
    /* box-shadow: var(--shadow-small); */
    border-radius: var(--border-radius);
    transition: var(--transition);
    cursor: pointer;
    font-family: var(--font-family);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--padding) / 2);
  }

  button.active {
    /*font-weight: 600;*/
    background-color: var(--accent-color);
    color: var(--on-accent);
    /* box-shadow: var(--shadow-big); */
  }

  button:hover {
    background-color: var(--button-hover-color);
  }

  button.outline {
    background: transparent;
    border: 1px solid rgba(var(--body-text-values), 0.3);
    color: rgba(var(--body-text-values), 0.8);
    box-shadow: none;
  }

  button.outline:hover,
  button.outline.active {
    background: var(--accent-color);
    color: var(--black-key-color);
    border: 1px solid var(--accent-color);
  }

  .spaced {
    margin-right: 2px;
  }

  button.toggled,
  button.inline:hover {
    background: var(--accent-color);
    color: var(--on-accent);
  }

  button.outline.toggled:hover {
    border: 1px solid rgba(var(--body-text-values), 0.6);
  }

  button.rectangular {
    border-radius: 0;
  }

  button.square {
    width: 24px;
    height: 24px;
  }

  .label {
    font-size: 0.8rem;
  }

  button.inline {
    border: none;
    padding: 2px;
    background-color: transparent;
  }

  button:disabled {
    pointer-events: none;
    background-color: var(--button-hover-color);
    color: var(--text-color);
    opacity: 0.24;
  }

  button.inline:disabled {
    background-color: transparent;
  }
</style>

<button
  class:inline
  class:spaced
  class:square
  class:outline
  class:toggled
  class:active
  class:rectangular
  {style}
  {disabled}
  on:click>
  {#if icon == null && label == null}
    <slot />
  {:else if label == null && icon != null}
    <Icon style={iconStyle} {icon} />
  {:else if label != null && icon == null}
    <span class="label">{label}</span>
  {:else}
    <Icon style={iconStyle} {icon} />
    <span class="label">{label}</span>
  {/if}
</button>
