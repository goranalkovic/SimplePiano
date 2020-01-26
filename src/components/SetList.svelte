<script>
    import {flip} from "svelte/animate";
    import {slide, crossfade} from "svelte/transition";

    import {activeSet, instrumentSets} from "../stores";

    import Button from "./Button.svelte";

    import Card from "./Card.svelte";
    import KeyboardKey from "./KeyboardKey.svelte";

    function normalizedName(name) {
        name = name.replace(/_/g, " ");

        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    let isEditing = false;

    function finishEditing() {
        isEditing = false;

        // instrumentSets.set($instrumentSets);
    }

    function startEditing(id) {
      if($activeSet === id)
        isEditing = true;
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
        transform: translateY(0.2rem) !important;
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
        color: var(--accent-color) !important;
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

  .edit-field {
    background: transparent;
    border: 1px solid var(--body-text);
    border-radius: 2px;
    box-shadow: var(--shadow-small);
    height: 20px;
    font-family: var(--font-family);
    text-transform: uppercase;
    font-size: 13px;
    margin: 0 0 6px 0;
    padding: 4px 8px;
    transition: 0.3s all;
    color: var(--white-key-text)
  }

  .label-field {
    border: none !important;
    height: 10px !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    transform: translateY(0px);
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

                      <input type="text" bind:value={set.name} class="uppercase edit-field {isEditing ? '' : 'label-field'}"
                             class:act={$activeSet === i || isEditing}  >

                        <div >
                            {#if isEditing }
                                 <Button  outline on:click={finishEditing}>Save</Button>
                            {/if}
                        </div>


                        {#each set.instruments as i (i.id) }
                            <span class="info-txt" transition:slide animate:flip>
                          {normalizedName(i.name)}
                            </span>

                        {/each}
                    </div>
                    <div class="f-shrink transform-key">
                        <KeyboardKey square key={i + 1 < 10 ? i + 1 : 0}/>
                    </div>
                </div>

            </Card>
        {:else}
            <p>
                🕳 No instrument sets.
                <br/>
                This is an error.
            </p>
        {/each}
    </div>

</div>
