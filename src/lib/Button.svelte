<script>
    import Icon from "./Icon.svelte";
import Tooltip from "./Tooltip.svelte";

    export let outlined = false;
    export let highlighted = false;
    export let disabled = false;
    export let toggled = false;
    export let label = null;
    export let icon = null;
    export let tooltip = null;
    export let tooltipPosition = null;
    export let additionalClass = '';

    $: paddingX = icon == null ? "px-2" : "px-2.5";
</script>

<Tooltip {tooltip} position={tooltipPosition}>
<button
    on:click
    class:outlined
    class:highlighted
    class:highlighted-outlined={highlighted && outlined}
    class:toggled
    {disabled}
    class="select-none dark:outline-none focus:outline-none focus:border-transparent dark:focus:border-transparent dark:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer flex items-center {paddingX} py-1 space-x-1 text-xs text-gray-900 transition  bg-gray-150 border border-transparent dark:border-transparent rounded-md hover:bg-gray-500 hover:text-white dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 focus:ring-opacity-30 dark:focus:ring-opacity-50 focus:ring-ocean-500 dark:focus:ring-azure-300 {additionalClass}"
>
    {#if icon}
        <Icon {icon} />
    {/if}

    {#if label}
    <span class="inline-block pointer-events-none">{@html label}</span>
    {/if}

        
    
</button>
</Tooltip>

<style lang="postcss" global>

    :local(.highlighted) {
        @apply bg-ocean-500 dark:bg-azure-500 text-white hover:bg-ocean-700 dark:hover:bg-azure-400;
    }

    :local(.outlined) {
        @apply border border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-500 hover:border-gray-500 hover:text-white dark:hover:text-white;
    }

    :local(.highlighted-outlined) {
        @apply bg-transparent dark:bg-transparent border-ocean-500 dark:border-azure-500 text-ocean-500 dark:text-azure-400 hover:bg-ocean-700 hover:border-ocean-700 dark:hover:bg-azure-400 dark:hover:border-azure-400 hover:text-white;
    }

    :local(.toggled) {
        @apply ring-1 focus:ring-2 ring-ocean-400 dark:ring-azure-400 ring-opacity-100 bg-ocean-500 dark:bg-azure-500 border-ocean-400 dark:border-azure-400 text-white shadow-inner;
    }

    :local(button:disabled) {
        @apply shadow-none ring-0 bg-transparent border-gray-50 text-gray-300 pointer-events-none dark:bg-transparent dark:border-gray-600 dark:text-gray-600;
    }
</style>
