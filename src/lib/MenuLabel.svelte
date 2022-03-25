<script>
    import Icon from "./Icon.svelte";

    export let icon = null;
    export let label = null;
    export let padded = false;
    export let bolder = false;
</script>

<span
    class:padded
    class:bolder
    class="menu-label w-full flex select-none items-center pointer-events-none px-3 py-1.5 text-gray-700 dark:text-gray-400 transition bg-transparent  border-0  rounded-none"
    on:click
>
    {#if icon}
        <Icon {icon} additionalClass="mr-3" />
    {/if}

    {#if label}
        <span>{@html label}</span>
    {/if}
</span>

<style global lang="postcss">

    .menu-label.padded {
        @apply pl-9.5;
    }

    .menu-label.bolder {
        @apply font-semibold;
    }
</style>
