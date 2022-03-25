<script>
    import Icon from "./Icon.svelte";

    export let icon = null;
    export let label = null;
    export let selected = false;
    export let padded = false;
    export let disabled = false;
    export let toggleable = false;
</script>

<button
    disabled={disabled && !toggleable}
    class:selected
    class:padded
    class="menu-item w-full flex pointer-events-auto select-none items-center px-3 py-1.5 text-gray-900 dark:text-gray-300 transition bg-transparent hover:bg-gray-200 hover:bg-opacity-80 dark:hover:bg-gray-600 dark:hover:bg-opacity-40 border-0 rounded"
    on:click|stopPropagation
>
    {#if icon}
        <Icon {icon} additionalClass="mr-3" />
    {/if}

    {#if label}
        <span>{@html label}</span>
    {/if}
</button>

<style global lang="postcss">
    .menu-item.selected {
        @apply bg-ocean-500 text-white dark:bg-azure-500 dark:text-white;
    }

    .menu-item.padded {
        @apply pl-9.5;
    }

    :local(button:disabled) {
        @apply pointer-events-none text-gray-300 dark:text-gray-650;
    }
</style>
