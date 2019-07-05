<script>
  export let label = null;
  export let key;
  export let square = true;
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    opacity: 0.6;
    margin-right: 10px;

    pointer-events: none;
    user-select: none;

    margin: 0;
    padding: 0;
  }

  .container span {
    display: inline-block;
    margin-bottom: 0.4rem;
  }

  .label {
    font-size: 0.8rem;
    font-family: var(--font-family);
    width: 1.4rem;
    text-align: right;
  }

  .keyboard-key {
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    line-height: 1.3rem;
    text-align: left;

    border-radius: var(--border-radius);
    border: 1px solid rgba(var(--body-text-values), 0.4);

    height: 1.4rem;
    width: 2.4rem;

    padding: 0 0 0 0.3rem;
    margin: 0 0.4rem;
  }

  .keyboard-key.square {
    width: 1.4rem;
    text-align: center;
    padding: 0;
  }
</style>

<div class="container">
  {#if label}
    <span class="label">{label}</span>
  {/if}
  <span class="keyboard-key" class:square>
    {@html key}
  </span>
</div>
