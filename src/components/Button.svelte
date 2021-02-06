<script>
  import Icon from "./Icon.svelte";
  import { fly } from "svelte/transition";

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
  export let tooltip = null;
  export let inlineTooltip = false;

  let isHovering = false;
</script>

<button
  on:mouseover={tooltip != null && inlineTooltip
    ? () => (isHovering = true)
    : null}
  on:mouseout={tooltip != null && inlineTooltip
    ? () => (isHovering = false)
    : null}
  data-tooltip={tooltip ?? label ?? ""}
  class:tooltip={!inlineTooltip && tooltip != null}
  class:inline
  class:spaced
  class:square
  class:outline
  class:toggled
  class:active
  class:rectangular
  {style}
  {disabled}
  on:click
>
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

  {#if isHovering}
    <span
      in:fly={{ duration: 300, x: -20, opacity: 0 }}
      out:fly={{ duration: 200, x: -20, opacity: 0 }}
      class="inline-tooltip"
    >
      {tooltip}
    </span>
  {/if}
</button>

<style>
  button {
    border: none;
    background: var(--black-key-color);
    color: var(--body-text);
    padding: calc(var(--padding) / 2) var(--padding);
    border-radius: var(--border-radius);
    transition: var(--transition-colors), 0.2s border ease-in-out;
    cursor: pointer;
    font-family: var(--font-family);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--padding) / 2);
  }

  button.active {
    background-color: var(--accent-color);
    color: var(--on-accent);
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

  .tooltip {
    position: relative;
  }
  .tooltip::before {
    content: attr(data-tooltip);
    position: absolute;
    top: 80%;
    transform: translateY(-100%) translateX(-50%) scale(0.2);
    transform-origin: bottom center;
    opacity: 0;
    left: 50%;
    padding: 0.3rem 0.6rem;
    border-radius: 10px;
    background: var(--tooltip-background);
    backdrop-filter: blur(20px) saturate(150%);
    font-size: 0.8rem;
    color: var(--tooltip-text);
    text-align: center;
    transition: var(--transition);
    pointer-events: none;
    width: max-content;
    z-index: 10000;
  }

  .tooltip:hover::before {
    opacity: 1;
    transform: translateY(0.5rem) translateX(-50%) scale(1);
  }
  .inline-tooltip {
    font-size: 0.8rem;
    pointer-events: none;
  }
</style>
