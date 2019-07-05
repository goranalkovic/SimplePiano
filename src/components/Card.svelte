<script>
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let disabled = false;
  export let active = false;
  export let selectable = false;
  export let passive = true;
</script>

<style>
  .card,
  .card.passive {
    box-shadow: var(--shadow-small);
    padding: 8px;
    border-radius: var(--border-radius);
    background: var(--white-key-color);
    margin: 8px 0;
    transition: var(--transition);
    user-select: none;
    box-sizing: border-box;
  }

  .card:not(.passive) {
    cursor: pointer;
    pointer-events: all;
  }

  .card.active {
    box-shadow: var(--shadow-big-accent);
  }

  .card.disabled {
    opacity: 0.4;
  }

  .card:not(.passive):hover {
    opacity: 1;
    box-shadow: var(--shadow-big);
  }
</style>

{#if passive}
  <div
    on:mouseover
    on:mouseleave
    transition:slide
    animation:flip={{ duration: 300 }}
    class="card passive"
    class:active
    class:disabled
    class:selectable>
    <slot />
  </div>
{:else}
  <div
    on:click
    on:mouseover
    on:mouseleave
    transition:slide
    animation:flip={{ duration: 300 }}
    class="card"
    class:active
    class:disabled={disabled && !active}
    class:selectable>
    <slot />
  </div>
{/if}
