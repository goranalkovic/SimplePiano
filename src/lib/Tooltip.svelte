<script>
    import { displayPositions } from "../display-positions";

    export let tooltip = null;
    export let position = displayPositions.below;
</script>

{#if tooltip}
    <div class="relative z-20 group">
        <slot />

        <span
            class="select-none leading-tight backdrop-blur-md group-hover:shadow-md opacity-0 group-hover:opacity-100 transition duration-200  scale-0 group-hover:scale-100 px-1.5 py-0.5 rounded-md absolute text-xs transform bg-gray-800 dark:bg-gray-100 dark:text-black text-white pointer-events-none w-max bg-opacity-60 dark:bg-opacity-60 {position ?? displayPositions.below}"
        >{@html tooltip}</span>
    </div>
{:else}
    <slot />
{/if}
