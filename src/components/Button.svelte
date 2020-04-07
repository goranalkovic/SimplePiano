<script>
  export let spaced = false;
  export let style = null;
  export let outline = false;
  export let toggled = false;
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

  button:not(.outline).toggled {
    border-bottom: 2px solid var(--accent-color);
  }

  button:not(.outline).toggled:hover {
    border-bottom: 2px solid var(--body-text);
  }

  button.outline.toggled {
    border: 1px solid var(--accent-color);
  }

  button.outline.toggled:hover {
    border: 1px solid rgba(var(--body-text-values), 0.6);
  }
</style>

<button class:spaced class:outline class:toggled {style} on:click>
  <slot />
</button>
