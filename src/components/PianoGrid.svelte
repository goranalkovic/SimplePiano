<script>
  import { isFocused, editMode, chordMode } from "../stores";
  import { fade, slide } from "svelte/transition";
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
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    user-select: none;
    transition: var(--transition);
    position: relative;
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

  .chord {
    opacity: 0.6;
    font-size: 85%;
    margin-bottom: 0.2rem;
    text-align: center;
  }
</style>

<div
  class="piano-grid-container {$isFocused || $editMode ? 'transparent' : ''}">
  <div class="piano-grid">
    <div id="⇪" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Fm
        </span>
      {/if}
      <span>⇪</span>
    </div>
    <div id="A" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Gm
        </span>
      {/if}
      <span>A</span>
    </div>
    <div id="S" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Am
        </span>
      {/if}
      <span>S</span>
    </div>
    <div id="D" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Hm
        </span>
      {/if}
      <span>D</span>
    </div>
    <div id="F" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>C</span>
      {/if}
      <span>F</span>
    </div>
    <div id="G" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>D</span>
      {/if}
      <span>G</span>
    </div>
    <div id="H" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>E</span>
      {/if}
      <span>H</span>
    </div>
    <div id="J" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>F</span>
      {/if}
      <span>J</span>
    </div>
    <div id="K" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>G</span>
      {/if}
      <span>K</span>
    </div>
    <div id="L" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>A</span>
      {/if}
      <span>L</span>
    </div>
    <div id="Č" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>H</span>
      {/if}
      <span>Č</span>
    </div>
    <div id="Ć" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Cm
        </span>
      {/if}
      <span>Ć</span>
    </div>
    <div id="Ž" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Dm
        </span>
      {/if}
      <span>Ž</span>
    </div>
    <div id="↵" class="white-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Em
        </span>
      {/if}
      <span>↵</span>
    </div>
  </div>

  <div class="piano-grid">
    <div id="Q" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          F#m
          <br />
          Gbm
        </span>
      {/if}
      <span>Q</span>
    </div>
    <div id="W" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          G#m
          <br />
          Abm
        </span>
      {/if}
      <span>W</span>
    </div>
    <div id="E" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          Bm
        </span>
      {/if}
      <span>E</span>
    </div>
    <div class="blank-black-key" />
    <div id="T" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          C#
        </span>
      {/if}
      <span>T</span>
    </div>
    <div id="Z" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          D#
          <br />
          Eb
        </span>
      {/if}
      <span>Z</span>
    </div>
    <div class="blank-black-key" />
    <div id="I" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          F#
          <br />
          Gb
        </span>
      {/if}
      <span>I</span>
    </div>
    <div id="O" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          G#
          <br />
          Ab
        </span>
      {/if}
      <span>O</span>
    </div>
    <div id="P" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>B</span>
      {/if}
      <span>P</span>
    </div>
    <div class="blank-black-key" />
    <div id="Đ" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          C#m
          <br />
          Dbm
        </span>
      {/if}
      <span>Đ</span>
    </div>
    <div id="⌫" class="black-key">
      {#if $chordMode}
        <span class="chord" transition:slide={{ y: 80, duration: 300 }}>
          D#m
          <br />
          Ebm
        </span>
      {/if}
      <span>⌫</span>
    </div>
  </div>

  {#if $editMode}
    <p class="edit-mode-warn" transition:slide={{ y: 80, duration: 300 }}>
      Edit mode
    </p>
  {/if}
</div>
