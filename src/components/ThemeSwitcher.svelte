<script>
  import Button from "./Button.svelte";
  import Toast from "./Toast.svelte";

  import { theme } from "../stores.js";

  let optionsVisible = false;

  function applyTheme(newVal) {
    theme.set(newVal);

    if (
      ($theme === 0 &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      $theme === 2
    ) {
      document.querySelector("html").className = "dark";
    } else {
      document.querySelector("html").className = "";
    }

    toggleOptionsVisibility();

    window.pushToast(
      "Theme set to <i>" +
        (newVal == 0 ? "auto" : newVal == 1 ? "light" : "dark") +
        "</i>"
    );
  }

  function toggleOptionsVisibility() {
    optionsVisible = !optionsVisible;
  }
</script>

<style>
  .container {
    position: relative;

    z-index: 2000;
  }

  .options.visible {
    /* top: 1.4rem; */
    opacity: 1;
    transform: scaleY(1) scaleX(1);
    /* padding: 0.6rem 0; */
  }

  .options {
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-big);
    background: var(--black-key-color);
    padding: 0.5rem 0;
    border-radius: 6px;
    position: absolute;
    top: 1.5rem;
    left: 0;
    transform-origin: top left;
    opacity: 0;
    transition: var(--transition);
    transform: scaleY(0.1) scaleX(0.4);
    box-sizing: border-box;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    width: 7rem;
  }

  li {
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
    transition: var(--transition);
  }

  li:not(.active):hover {
    background: rgba(var(--body-text-values), 0.06);
    cursor: pointer;
  }

  li.active {
    color: var(--accent-color);
    pointer-events: none;
  }

  .backdrop {
    background: transparent;
    margin: 0;
    padding: 0;

    position: fixed;
    left: 0;
    top: 0;

    width: 100vw;
    height: 100vh;

    z-index: 1000;

    overflow: hidden;
  }
</style>

<div class="container">
  <div>
    <Button on:click={toggleOptionsVisibility} active={optionsVisible}>
      Theme
    </Button>
  </div>
  <div class="options" class:visible={optionsVisible}>
    <ul>
      <li class:active={$theme === 0} on:click={() => applyTheme(0)}>Auto</li>
      <li class:active={$theme === 1} on:click={() => applyTheme(1)}>Light</li>
      <li class:active={$theme === 2} on:click={() => applyTheme(2)}>Dark</li>
    </ul>

  </div>
</div>

{#if optionsVisible}
  <div class="backdrop" on:click={() => (optionsVisible = false)} />
{/if}

<Toast />
