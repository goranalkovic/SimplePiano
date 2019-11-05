<script>
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";

  import { activeSet, instrumentSets } from "../stores";

  import Card from "./Card.svelte";
  import KeyboardKey from "./KeyboardKey.svelte";

  function normalizedName(name) {
    name = name.replace(/_/g, " ");

    return name.charAt(0).toUpperCase() + name.slice(1);
  }
</script>

<style>
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    margin: 0 2rem;
  }

  h4 {
    margin-bottom: 0.8rem;
    margin-right: auto;
    text-align: left;
  }

  h5 {
    margin: 0;
    padding: 0;
    font-size: 1rem;
  }

  .fixed-card {
    width: 14rem;
    display: flex;
    padding: 0;
    margin: 0;
  }

  .remove-btm-margin {
    margin-bottom: -0.6rem;
  }

  .shift-name {
    transform: translateY(0.2rem);
  }

  .instrument {
    display: block;
    opacity: 0.6;
    margin: 0;
    font-size: 0.9rem;
  }

  .f-grow {
    flex-grow: 1;
    margin: 0;
    padding: 0;
  }
  .f-shrink {
    margin: 0;
    padding: 0;
  }

  .act {
    color: var(--accent-color);
  }

  .uppercase {
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 400 !important;
    letter-spacing: 1.2px;
    margin: 0;
    padding: 0;
    transition: 0.2s transform;
  }

  .info-txt {
    display: block;
    font-size: 0.8rem;
    opacity: 0.6;
    margin: 0.05rem 0;
  }

  .transform-key {
    transform: translateX(0.6rem) translateY(-0.1rem);
  }
</style>

<div class="container">

  <h4 style="font-weight: 400">Instrument sets</h4>
  <div class="list">
    {#each $instrumentSets as set, i}
      <Card
        disabled={set.instruments.length < 1}
        passive={false}
        active={$activeSet === i}
        on:click={() => {
          activeSet.set(i);
        }}>
        <div class="fixed-card {set.instruments.length > 0 ? '' : 'remove-btm-margin'}">
          <div class="f-grow">
            <h5 class="uppercase {set.instruments.length > 0 ? '' : 'shift-name'}" class:act={$activeSet === i}>{set.name}</h5>

            {#each set.instruments as i (i.id)}
              <span transition:slide animate:flip class="info-txt">
                {normalizedName(i.name)}
              </span>
            {/each}

          </div>
          <div class="f-shrink transform-key">
            <KeyboardKey square key={i + 1 < 10 ? i + 1 : 0} />
          </div>
        </div>

      </Card>
    {:else}
      <p>
        🕳 No instrument sets.
        <br />
        This is an error.
      </p>
    {/each}
  </div>

</div>
