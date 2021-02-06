<script>
  import { fade } from "svelte/transition";

  export let disabled = false;
  export let active = false;
  export let selectable = false;
  export let passive = true;
  export let addClass = "";
  export let style = null;
</script>

<style>
  .card,
  .card.passive {
    padding: var(--padding);
    border-radius: var(--border-radius);
    background: var(--bg-color);
    transition: var(--transition-colors), 0.2s opacity ease-in-out;
    user-select: none;
    box-sizing: border-box;
    border: none;
    /* pointer-events: none; */
  }

  .card:not(.passive) {
    cursor: pointer;
    pointer-events: all;
  }

  .card.active {
    background-color: var(--accent-color);
    /* pointer-events: none; */
    color: var(--on-accent);
  }

  .card.disabled {
    opacity: 0.4;
  }

  .card:not(.passive):hover {
    opacity: 1;
    /* box-shadow: var(--shadow-big); */
    color: var(--on-accent);
    background-color: var(--hover-color);
  }

  .card:not(.active):hover {
    background-color: var(--hover-color);
    color: var(--text-color);
  }
</style>

{#if passive}
  <div
    {style}
    on:mouseover
    on:mouseleave
    transition:fade
    class="card passive {addClass}"
    class:active
    class:disabled
    class:selectable>
    <slot />
  </div>
{:else}
  <div
    {style}
    on:click
    on:mouseover
    on:mouseleave
    transition:fade
    class="card {addClass}"
    class:active
    class:disabled={disabled && !active}
    class:selectable>
    <slot />
  </div>
{/if}
