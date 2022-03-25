<script>
  import { fade, scale } from "svelte/transition";
  export const show = () => {
    document.body.style.overflow = "hidden";
    isOpen = true;
  };
  export const close = () => {
    document.body.style.overflow = "auto";
    isOpen = false;
  };

  export let softDismiss = false;

  let isOpen = false;
</script>

<style global lang="postcss">
  .modal-backdrop {
    @apply bg-gray-150 dark:bg-black bg-opacity-80 dark:bg-opacity-90 flex items-center justify-center fixed top-0 left-0 z-30 overflow-hidden w-full h-full;
    margin: 0 !important;
    padding: 0 !important;
  }

  .modal {
    @apply max-h-full max-w-full m-0 bg-white dark:bg-gray-900 bg-opacity-40 dark:bg-opacity-60 backdrop-filter backdrop-blur-md rounded-lg p-3 shadow-2xl;
  }
</style>

{#if isOpen}
  <div
    transition:fade
    class="modal-backdrop"
    on:click={softDismiss ? () => close() : null}>
    <div
      transition:scale={{ start: 0.8, opacity: 0 }}
      class="modal"
      role="dialog">
      <slot name="top-actions" />
      <slot />
      <slot name="bottom-actions" />
    </div>
  </div>
{/if}
