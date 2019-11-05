<script>
  import KeyboardKey from "./KeyboardKey.svelte";

  export let title;
  export let min;
  export let max;
  export let step;
  export let value;
  export let keyboardKeys = null;
  export let customValueDisplay = null;

  $: formattedValue = (customValueDisplay != null && customValueDisplay[value] != null) ? customValueDisplay[value] : value;

  let hovering = false;
</script>

<style>
  .slide-ctrl {
    /*margin-right: 60px;*/
    display: flex;
    flex-direction: column;
  }

  .title {
    display: block;
    opacity: 0.9;
    margin-bottom: 0.4rem;
    margin-left: 0.05rem;
    font-size: 0.9rem;
  }

  .value {
    display: inline-block;
    width: 2rem;
    margin-left: 0.2rem;
    font-size: 0.9rem;
    opacity: 0.8;
    transform: translateY(-0.35rem);
  }

  .hints {
    display: flex;
    margin-left: 0.2rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
    width: 70%;
  }

  .title,
  .value {
    user-select: none;
  }

  input[type="range"] {
    -webkit-appearance: none;
    margin: 0;
    padding: 0;
    background: none;
    display: inline-block;
    transform: translateY(-8px);
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    background: rgba(var(--body-text-values), 0.4);
    border-radius: 1px;
    cursor: pointer;
    transition: var(--transition);
  }

  input[type="range"]::-webkit-slider-thumb {
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: var(--body-text);
    cursor: cursor;
    -webkit-appearance: none;
    margin-top: -6px;
  }
</style>

<div class="slide-ctrl" >
  <label  >
    <span class="title">{title}</span>
    <input type="range" {min} {max} {step} bind:value on:change />
    <span class="value">{formattedValue}</span>
  </label>

  {#if keyboardKeys && hovering}
    <div class="hints">
      {#each keyboardKeys as kbKey}
        <KeyboardKey {...kbKey} />
      {/each}
    </div>
  {/if}

</div>
