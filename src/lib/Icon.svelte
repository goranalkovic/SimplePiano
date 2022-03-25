<script>
    export let icon = null;
    export let additionalClass = null;
</script>

{#if icon}
    {@html icon.replace('<svg', `<svg class="icon pointer-events-none ${additionalClass ?? ""}"`)}
{/if}

