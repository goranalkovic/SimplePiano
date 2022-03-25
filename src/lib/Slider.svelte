<script>
    import Icon from "./Icon.svelte";
    import Tooltip from "./Tooltip.svelte";

    export let icon = null;
    export let description = null;

    export let min;
    export let max;
    export let step;
    export let value;
    export let customValueDisplay = null;
    export let disabled = false;
    export let stackableLabel = false;

    $: parsedValue =
        customValueDisplay != null && customValueDisplay[value] != null
            ? customValueDisplay[value]
            : value.toString();

    $: valueOutput =
        parsedValue.length > 4 ? `${parsedValue.slice(0, 3)}.` : parsedValue;
</script>

<div class="flex items-center justify-center h-6 space-x-2" class:disabled>
    {#if icon}
        <Tooltip tooltip={description}>
            <Icon {icon} additionalClass="text-gray-500 dark:text-gray-300 {stackableLabel ? 'mr-16' : ''}" />
        </Tooltip>
    {:else if description}
        <span
            class="{stackableLabel ? 'w-20 mr-0.5' : ''} inline-block p-0 m-0 tracking-wide text-gray-500 uppercase select-none text-xxs dark:text-gray-400"
        >{description}</span>
    {/if}
    <input type="range" {min} {max} {step} {disabled} bind:value on:change />

    <Tooltip tooltip={parsedValue.length > 4 ? parsedValue : null}>
        <span
            class="inline-block p-0 pr-1 m-0 text-sm leading-none text-gray-600 pointer-events-auto select-none dark:text-gray-300 w-max tabular-nums"
        >{valueOutput}</span>
    </Tooltip>
</div>

<style lang="postcss" global>
    input[type="range"] {
        @apply m-0 box-content p-0 bg-none w-32 h-4.5 transition  rounded-full appearance-none bg-transparent border border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 focus-within:outline-none dark:focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-800;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        @apply appearance-none m-0 p-0 bg-gray-150 dark:bg-gray-700 hover:ring-0 hover:ring-offset-0 transition  bg-transparent rounded-full border-0;
    }

    input[type="range"]::-webkit-slider-thumb {
        @apply cursor-pointer appearance-none w-4.5 h-4.5 border-0 bg-gray-400 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full transition ;
    }

    .disabled {
        @apply pointer-events-none select-none;
    }

    .disabled span,
    .disabled svg {
        @apply text-gray-300 dark:text-gray-600;
    }

    .disabled input[type=range] {
        @apply pointer-events-none;
    }

    .disabled input[type=range]::-webkit-slider-runnable-track {
        @apply bg-transparent border-gray-300 dark:border-gray-500;
    }

    .disabled input[type=range]::-webkit-slider-thumb {
        @apply bg-gray-150 dark:bg-gray-700 transform scale-75;
    }
</style>
