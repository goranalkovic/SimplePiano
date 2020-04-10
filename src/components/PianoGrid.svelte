<script>
  import { isFocused, editMode } from "../stores";
  import { fade } from "svelte/transition";
</script>

<style>
  .blank-black-key {
    background: transparent;
    color: transparent;
    height: 7rem;
    width: 2rem;
    margin-right: 0.2rem;
    pointer-events: none;
  }

  .white-key {
    background: var(--white-key-color);
    color: var(--white-key-text);
    height: 12rem;
  }

  .black-key {
    background: var(--black-key-color);
    color: var(--black-key-text);
    height: 7rem;
    z-index: 1;
  }

  .piano-grid {
    display: flex;
  }

  .black-key,
  .white-key {
    margin-right: 0.2rem;
    width: 2rem;
    border-radius: 0 0 3px 3px;
    box-shadow: var(--shadow-small);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    user-select: none;
    transition: var(--transition);
  }

  .piano-grid-container {
    margin: 2rem auto;
    height: 12rem;
    transition: 0.1s opacity;
    position: relative;
  }

  .piano-grid-container .piano-grid:first-child {
    position: relative;
    top: 0;
    left: 0;
  }

  .piano-grid-container .piano-grid:nth-child(2) {
    position: relative;
    top: -13rem;
    left: 1rem;
  }

  .transparent .piano-grid {
    opacity: 0.2;
  }

  .edit-mode-warn {
    position: absolute;

    left: 40%;
    top: 40%;

    font-weight: 500;
    z-index: 2000;
    opacity: 1;
    letter-spacing: -0.2px;
    color: var(--bg-color);
    background: var(--body-text);
    border-radius: 2px;
    text-align: center;
    padding: 4px 6px;
  }
</style>

<div
  class="piano-grid-container {$isFocused || $editMode ? 'transparent' : ''}">
  <div class="piano-grid">
    <div id="⇪" class="white-key">⇪</div>
    <div id="A" class="white-key">A</div>
    <div id="S" class="white-key">S</div>
    <div id="D" class="white-key">D</div>
    <div id="F" class="white-key">F</div>
    <div id="G" class="white-key">G</div>
    <div id="H" class="white-key">H</div>
    <div id="J" class="white-key">J</div>
    <div id="K" class="white-key">K</div>
    <div id="L" class="white-key">L</div>
    <div id="Č" class="white-key">Č</div>
    <div id="Ć" class="white-key">Ć</div>
    <div id="Ž" class="white-key">Ž</div>
    <div id="↵" class="white-key">↵</div>
  </div>

  <div class="piano-grid">
    <div id="Q" class="black-key">Q</div>
    <div id="W" class="black-key">W</div>
    <div id="E" class="black-key">E</div>
    <div class="blank-black-key" />
    <div id="T" class="black-key">T</div>
    <div id="Z" class="black-key">Z</div>
    <div class="blank-black-key" />
    <div id="I" class="black-key">I</div>
    <div id="O" class="black-key">O</div>
    <div id="P" class="black-key">P</div>
    <div class="blank-black-key" />
    <div id="Đ" class="black-key">Đ</div>
    <div id="⌫" class="black-key">⌫</div>
  </div>

  {#if $editMode}
    <p class="edit-mode-warn" transition:fade>Edit mode</p>
  {/if}
</div>
