<script>

</script>

<style>
    .titlebar {
        width: 60vw;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .right {
        display: flex;
    }
</style>

<div class="titlebar">
    <slot name="left" />
    <div class="right">
        <slot/>
    </div>
</div>