<script>
    export let spaced = false;
    export let style = null;
    export let outline = false;
</script>

<style>
  button {
    border: none;
    background: var(--white-key-color);
    color: var(--body-text);
    padding: 4px 8px;
    box-shadow: var(--shadow-small);
    border-radius: 3px;
    transition: var(--transition);
    cursor: pointer;
	font-family: var(--font-family);
  }

  button:hover {
    /*font-weight: 600;*/
    background: var(--accent-color);
    color: var(--black-key-color);
    box-shadow: var(--shadow-big);
  }

  button.outline {
    background: transparent;
    border: 1px solid rgba(var(--body-text-values), 0.3);
    color: rgba(var(--body-text-values), 0.8);
    box-shadow: none;
  }

button.outline:hover {
  background: var(--accent-color);
    color: var(--black-key-color);
    border: 1px solid var(--accent-color);
}

  .spaced {
      margin-left: 6px;
      margin-right: 6px;
  }
</style>

<button class:spaced class:outline {style} on:click>
  <slot />
</button>
