<script>
  import { clickOutside } from 'svelte-use-click-outside';

  import { slide } from 'svelte/transition';
  import { icons } from '../icons';

  import Button from './Button.svelte';

  export let tooltip = '';
  export let icon = icons.menuDotsH;

  let x = 0;
  let y = 0;
  let isOpen = false;

  const open = ({ target }) => {
    const { x: rectX, height } = target.getBoundingClientRect();
    x = rectX;
    y = height;

    if (rectX + 192 > window.innerWidth) {
      x = window.innerWidth - 112;
    }

    isOpen = true;
  };
  
  export const close = () => {
    isOpen = false;
  };
</script>

<Button on:click={(e) => open(e)} {tooltip} {icon} />

{#if isOpen}
  <div
    class="grid shadow-xl border border-gray-150 dark:border-gray-800 z-20 mx-6 my-3 context-menu-options w-48 space-y-2 backdrop-blur-lg backdrop-saturate-150  opacity-100  transition duration-200  p-1 rounded-lg absolute text-xs dark:bg-gray-800 bg-gray-100 text-black dark:text-white  bg-opacity-60 dark:bg-opacity-60"
    style="top: {y}px; left: {x}px;"
    transition:slide={{ duration: 100 }}
    use:clickOutside={() => (isOpen = false)}
  >
    <slot />
  </div>
{/if}
