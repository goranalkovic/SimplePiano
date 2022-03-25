<script>
  import { getContext } from 'svelte';
  import { get } from 'svelte/store';
  import { flip } from 'svelte/animate';

  import { editMode, key, instrumentSets, activeSet } from '../stores';

  import Instrument from '../instrument.js';
  import { normalizeName } from '../helpers';
  import { icons } from '../icons';
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';
  import Button from './Button.svelte';
  import InstrumentAdder from './InstrumentAdder.svelte';
  import Slider from './Slider.svelte';
  export let set;
  export let i;
  export let active = false;

  import { dndzone } from 'svelte-dnd-action';

  const { getInstrumentEditor } = getContext(key);
  const instrumentEditor = getInstrumentEditor();

  $: instrumentsToShow =
    set.instruments.length > 9
      ? set.instruments.slice(0, 8)
      : set.instruments;

  let leftoverInstruments = '';

  if (set.instruments.length > 9) {
    const leftovers = [
      ...set.instruments.slice(8).map((instr) => normalizeName(instr.name)),
    ];
    const joinedLeftovers = [...leftovers].join(', ');
    leftoverInstruments = joinedLeftovers;
  }

  $: items = instrumentsToShow;

  const handleDndConsider = (e) => {
    set.instruments = e.detail.items;
  };

  const handleDndFinalize = (e) => {
    let reconfigured = [];

    e.detail.items.forEach((item) => {
      const newInstr = new Instrument(
        item.name,
        item._volume,
        item.soundfont,
        item._octaveShift,
        item._absoluteVolume,
        item._adsr
      );

      newInstr.id = item.id;

      reconfigured = [...reconfigured, newInstr];
    });

    set.instruments = reconfigured;

    $instrumentSets.find((i) => i.id === set.id).instruments = reconfigured;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };

  const deleteInstrument = (instrumentId) => {
    items = items.filter((i) => i.id !== instrumentId);
    $instrumentSets.find((i) => i.id === set.id).instruments = items;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };

  let isEditingSet = false;

  const regenInstruments = () => {
    // Regenerate instrument sets
    for (const set of $instrumentSets) {
      let newInstruments = [];
      for (const instrument of set.instruments) {
        newInstruments = [
          ...newInstruments,
          new Instrument(
            instrument.name,
            instrument._volume,
            instrument.soundfont,
            instrument._octaveShift,
            instrument._absoluteVolume,
            instrument._adsr
          ),
        ];
      }

      set.instruments = newInstruments;
    }

    $instrumentSets = [...$instrumentSets];
  };

  const openSetEditor = () => {
    instrumentEditor.show();

    $editMode = true;
  };

  const deleteSet = () => {
    $editMode = false;
    instrumentSets.set(get(instrumentSets).filter((i) => i.id !== $activeSet));

    if ($instrumentSets.length > 0) {
      $activeSet = $instrumentSets[0].id;
    }
  };

  const addInstrument = (event) => {
    const newInstrument = new Instrument(event.detail.name);

    instrumentsToShow = [...instrumentsToShow, newInstrument];
    $instrumentSets.find((i) => i.id === set.id).instruments =
      instrumentsToShow;

    instrumentSets.set([...$instrumentSets]);
    activeSet.set($activeSet);
  };
</script>

<button
  on:click
  class:active
  class:is-editing={isEditingSet && active}
  class="flex flex-col flex-grow-0 flex-shrink-0 p-2 overflow-hidden transition-all bg-white border rounded-md group border-gray-150 hover:border-gray-400 focus:outline-none set-card dark:border-gray-700 dark:hover:border-gray-500 focus:border-transparent dark:outline-none dark:focus:outline-none focus:ring-2 focus:ring-offset-4 dark:focus:ring-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-opacity-30 dark:focus:ring-opacity-50 focus:ring-ocean-500 dark:focus:ring-azure-300 dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md pointer-events-auto"
  tabindex="0"
>
  <div
    class="flex items-center justify-between w-full h-5 space-x-2 select-none"
  >
    <div class="flex items-center space-x-2">
      <span
        class="{i > 10
          ? 'invisible'
          : ''} set-key-number flex items-center justify-center w-4 h-4.5 p-0 m-0 leading-none text-gray-500 border-0 rounded dark:text-gray-500 text-xxs transition-colors  tabular-nums bg-gray-100 dark:bg-gray-750"
        >{i == 10 ? '0' : i}</span
      >
      <span
        class="p-0 m-0 mr-auto text-sm leading-none text-gray-700 transition-colors set-name dark:text-gray-100"
        >{set.name}</span
      >
    </div>
    <Icon
      additionalClass="transition opacity-0 group-hover:opacity-100 text-gray-200 dark:text-gray-600"
      icon={icons.reorderLines}
    />
  </div>
  <div class="flex flex-col ml-6 text-xs items-start overflow-y-hidden mt-0.5">
    {#if set.instruments.length < 1}
      <span
        class="text-gray-500 transition-colors select-none dark:text-gray-400"
        >no instruments</span
      >
    {/if}

    {#if !isEditingSet}
      {#each instrumentsToShow as instrument (instrument.id)}
        <span
          animate:flip
          class="text-gray-500 transition-colors select-none dark:text-gray-400 flex items-center gap-2"
        >
          {normalizeName(instrument.name)}

          {#if instrument._volume > -1}
            <div
              class="flex items-center py-0 px-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xxs text-gray-500"
            >
              <Icon
                additionalClass="transform scale-75 -ml-1"
                icon={icons.volume1}
              />
              <span> {instrument._volume} </span>
            </div>
          {/if}

          {#if instrument._octaveShift !== 0}
            <div
              class="flex items-center py-0 px-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xxs text-gray-500"
            >
              <Icon
                additionalClass="transform scale-75 -ml-1"
                icon={icons.shift}
              />
              <span>
                {instrument._octaveShift > 0
                  ? `+${instrument._octaveShift}`
                  : instrument._octaveShift}
              </span>
            </div>
          {/if}
        </span>
      {/each}
    {/if}

    {#if isEditingSet && active}
      <section
        tabindex="-1"
        class="p-px mt-3 overflow-y-auto mb-5 transition flex flex-col gap-3 w-[32rem]"
        use:dndzone={{
          items,
          flipDurationMs: 150,
          dropTargetClasses: ['drop-target'],
          type: 'instrumentList',
        }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
      >
        {#each instrumentsToShow as instrument (instrument.id)}
          <div
            class="p-2 border border-gray-200 rounded-lg dark:border-gray-800 group"
            animate:flip={{ duration: 150 }}
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <p class="text-sm">{instrument.displayName}</p>
                <p
                  class="transition py-0 px-1.5 ml-auto bg-gray-50 dark:bg-gray-900 rounded-lg text-xxs text-gray-500"
                >
                  {instrument.soundfont}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <Button
                  on:click={() => deleteInstrument(instrument.id)}
                  outlined
                  label="Remove"
                />
                {#if items.length > 1}
                  <Icon
                    additionalClass="text-gray-400 dark:text-gray-700 mr-1 pointer-events-auto"
                    icon={icons.reorderDotsH}
                  />
                {/if}
              </div>
            </div>
            <div
              class="flex items-center gap-12  transition-all pointer-events-auto mt-3"
            >
              <Slider
                icon={icons.shift}
                min="-3"
                max="3"
                step="1"
                bind:value={instrument._octaveShift}
              />
              <div class="flex items-center space-x-2">
                <Slider
                  icon={icons.volumeOptions}
                  min="-1"
                  max="100"
                  step="1"
                  customValueDisplay={{ '-1': 'auto', '0': 'mute' }}
                  bind:value={instrument._volume}
                />

                <Button
                  on:click={() =>
                    (instrument.absoluteVolume = !instrument.absoluteVolume)}
                  outlined
                  label={instrument.absoluteVolume ? '%' : 'total'}
                />
              </div>
              <div class="flex items-center justify-between w-full mt-auto" />
            </div>
          </div>
        {/each}
      </section>
    {/if}
  </div>
  {#if set.instruments.length > 9}
    <Tooltip tooltip={leftoverInstruments}>
      <span
        class="ml-6 text-xs text-gray-400 transition-colors select-none hover:text-ocean-400 dark:hover:text-azure-400 dark:text-gray-500"
        >{set.instruments.length - 9}
        more
        {set.instruments.length - 9 != 1 ? 'instruments' : 'instrument'}</span
      >
    </Tooltip>
  {/if}

  <div class="flex gap-1 mt-auto w-full">
    {#if active}
      <Button
        on:click={() => {
          isEditingSet = !isEditingSet;
          $editMode = isEditingSet;
        }}
        icon={icons.instrument}
        label="Edit"
        toggled={isEditingSet}
        outlined
      />
    {/if}

    {#if isEditingSet}
      <Button outlined on:click={deleteSet} label="Delete set" />

      <Button
        outlined
        label="Add instrument"
        icon={icons.add}
        additionalClass="ml-auto"
      />
    {/if}
  </div>

  {#if isEditingSet && active}
    <InstrumentAdder on:instrumentadd={addInstrument} />
  {/if}
</button>

<style global lang="postcss">
  .set-card.active {
    @apply border-ocean-500 dark:border-azure-400;
  }

  .set-card.active .set-name,
  .set-card.active .set-key-number {
    @apply text-ocean-500 dark:text-azure-400;
  }

  .set-card.active .set-key-number {
    @apply bg-ocean-100 bg-opacity-40 dark:bg-azure-400 dark:bg-opacity-10;
  }

  .set-card {
    @apply h-64 w-72;
  }

  .set-card.is-editing {
    width: 54rem;
    height: 48rem;
  }
</style>
