<script>

</script>

<style>
  .titlebar {
    width: 85%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--padding);
    /* margin-bottom: 2rem; */
  }

  @media (max-width: 850px) {
    .titlebar {
      justify-content: center;
    }
  }
</style>

<div class="titlebar">

  <slot />
</div>
