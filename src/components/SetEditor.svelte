<script>
  import InstrumentCard from "./InstrumentCard.svelte";
  import {
    activeSet,
    instrumentSets
  } from "../stores";
</script>

<style>
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }

  h4 {
    margin-bottom: 0.8rem;
  }

  .error {
    font-size: 0.9rem;
    font-weight: 400;
  }

</style>

<div style="width: 22rem;">

  <h4> {$instrumentSets[$activeSet].name} </h4>



  <div class="list">
    {#each $instrumentSets[$activeSet].instruments as instrument, i (instrument.id)}
      <InstrumentCard {...instrument} />
    {:else}
      <p class="error">🕳 No instruments</p>
    {/each}
  </div>
</div>
