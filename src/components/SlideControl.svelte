<script>
  import KeyboardKey from "./KeyboardKey.svelte";
  import Icon from "./Icon.svelte";

  export let title = null;
  export let min;
  export let max;
  export let step;
  export let value;
  export let keyboardKeys = null;
  export let customValueDisplay = null;
  export let icon = null;
  export let darker = false;

  $: formattedValue =
    customValueDisplay != null && customValueDisplay[value] != null
      ? customValueDisplay[value]
      : value;

  let hovering = false;
</script>

<style>
  .slide-ctrl label {
    /*margin-right: 60px;*/
    display: flex;
    align-items: center;
    gap: calc(var(--slider-size) / 2);
  }

  .title {
    display: block;
    opacity: 0.9;
    margin-bottom: 0.4rem;
    margin-left: 0.05rem;
    font-size: 0.8rem;
    margin: 0;
    font-weight: 500;
    /* transform: translateY(-6px); */
  }

  .value {
    display: inline-block;
    width: 2rem;
    margin-left: 0.2rem;
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
    /* transform: translateY(calc(var(--slider-size) * -1 + 6px)); */
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
    /* transform: translateY(-8px); */
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--slider-size);
    background: var(--black-key-color);
    cursor: pointer;
    transition: var(--transition);
    border-radius: calc(var(--slider-size) / 2);
  }

  input[type="range"]::-webkit-slider-thumb {
    height: var(--slider-size);
    width: var(--slider-size);
    border-radius: 50%;
    background: var(--body-text);
    cursor: cursor;
    -webkit-appearance: none;
    opacity: 0.4;
    /* margin-top: -6px; */
    transition: 0.3s opacity;
    margin: 0;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    opacity: 0.8;
  }

  .darker input[type="range"]::-webkit-slider-runnable-track {
    background: var(--white-key-color);
  }
</style>

<div class="slide-ctrl" class:darker>

  <label>

    {#if icon != null}
      <Icon {icon} />
    {:else if title != null}
      <span class="title">{title}</span>
    {/if}

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
