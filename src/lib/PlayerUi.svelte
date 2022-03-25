<script>
  import { onMount, setContext } from 'svelte';
  import { get } from 'svelte/store';
  import { slide, fade } from 'svelte/transition';

  import { getRandomId } from '../helpers';

  import { icons } from '../icons';
  import Instrument from '../instrument';
  import {
    chordMode,
    editMode,
    volumeModifier,
    octaveShift,
    theme,
    volume,
    instrumentSets,
    activeSet,
    tempShiftUp,
    tempShiftDown,
    showVolOctSliders,
    playShiftUp,
    playShiftDown,
    key,
  } from '../stores';

  import Button from './Button.svelte';
  import ChordEditor from './ChordEditor.svelte';
  import ContextMenu from './ContextMenu.svelte';
  import Icon from './Icon.svelte';
  import MenuItem from './MenuItem.svelte';
  import MenuLabel from './MenuLabel.svelte';
  import MenuSeparator from './MenuSeparator.svelte';
  import PianoKeyboard from './PianoKeyboard.svelte';
  import SetEditor from './SetEditor.svelte';
  import Slider from './Slider.svelte';

  let contextMenu;

  const stopAllSounds = () => {
    $instrumentSets
      .find((i) => i.id === $activeSet)
      .instruments.map((instrument) => instrument.stopAll());
    contextMenu.close();
  };

  const adjustVolumeGain = () => {
    const newValue = prompt(
      `Volume gain multiplier (currently ${get(volumeModifier)})`
    );

    if (newValue && parseFloat(newValue) > 0) {
      volumeModifier.set(parseFloat(newValue));
    }
    contextMenu.close();
  };

  const openSetEditor = () => {
    contextMenu.close();
    instrumentEditor.show();
    $editMode = true;
  };

  const openChordEditor = () => {
    contextMenu.close();
    chordEditor.show();
    $editMode = true;
  };

  const addSet = () => {
    $instrumentSets = [
      ...$instrumentSets,
      {
        id: getRandomId(),
        name: 'New set',
        instruments: [],
      },
    ];

    contextMenu.close();
  };

  const backup = () => {
    var dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify($instrumentSets));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'backup.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    contextMenu.close();
  };

  const restore = () => {
    let input = prompt('Copy-paste the backup .json contents');

    if (input != null) {
      try {
        let updateable = JSON.parse(input);

        updateable.forEach((instrumentSet) => {
          instrumentSet.id = getRandomId();

          let newInstruments = [];
          for (const instrument of instrumentSet.instruments) {
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

          instrumentSet.instruments = newInstruments;
        });

        instrumentSets.set([...updateable]);

        $activeSet = updateable[0].id;

        alert('Import successful');
      } catch (error) {
        console.log(error);
        alert('Import error');
        console.error(error);
      }
    } else {
      alert('Input not in correct format');
    }

    contextMenu.close();
  };

  let instrumentEditor;
  let chordEditor;

  setContext(key, {
    getInstrumentEditor: () => instrumentEditor,
    getChordEditor: () => chordEditor,
  });
</script>

<div class="flex flex-col m-auto w-min">
  <div class="flex justify-between mb-5">
    <p class="text-xl font-medium">Piano</p>

    <div class="flex items-center space-x-2 transition">
      <div class="flex items-center px-0.5 select-none">
        {#if $chordMode}
          <div
            class="flex items-center mr-2 text-ocean-500 dark:text-azure-400"
            transition:fade
          >
            <Icon icon={icons.pressMulti} additionalClass="mr-1" />
            <span class="text-sm">Chords</span>
          </div>
        {/if}

        <div class="grid grid-cols-1 grid-rows-1">
          {#if $tempShiftUp}
            <div
              class="col-start-1 row-start-1 -translate-y-4 transform-gpu"
              transition:slide
            >
              <Icon
                icon={icons.caretUp}
                additionalClass="text-ocean-500 dark:text-azure-400"
              />
            </div>
          {/if}
          <Icon
            icon={icons.shift}
            additionalClass="col-start-1 row-start-1 mr-1 text-gray-400"
          />
          {#if $tempShiftDown}
            <div
              class="col-start-1 row-start-1 translate-y-4 transform-gpu"
              transition:slide
            >
              <Icon
                icon={icons.caretDown}
                additionalClass="text-ocean-500 dark:text-azure-400"
              />
            </div>
          {/if}
        </div>
        <span
          transition:slide
          class="text-gray-500 dark:text-gray-300 tabular-nums"
          >{$octaveShift > 0 ? '+' : ''}{$octaveShift}</span
        >
      </div>
      <div class="flex items-center px-0.5 select-none">
        <Icon icon={icons.volume2} additionalClass="mr-1 text-gray-400" />
        <span class="text-gray-500 dark:text-gray-300 tabular-nums"
          >{$volume}</span
        >
      </div>
      <Button
        on:click={stopAllSounds}
        icon={icons.hand}
        label="Stop"
        outlined
      />
      <Button on:click={addSet} icon={icons.add} label="New set" />
      <ContextMenu
        tooltip="Menu"
        icon={icons.menuDotsH}
        bind:this={contextMenu}
      >
        <MenuLabel bolder padded label="Theme" />
        <MenuItem
          on:click={() => ($theme = 0)}
          selected={$theme === 0}
          icon={icons.sync}
          label="Auto"
        />
        <MenuItem
          on:click={() => ($theme = 1)}
          selected={$theme === 1}
          icon={icons.sun}
          label="Light"
        />
        <MenuItem
          on:click={() => ($theme = 2)}
          selected={$theme === 2}
          icon={icons.moon}
          label="Dark"
        />
        <MenuSeparator />
        <MenuLabel bolder padded label="Instrument sets" />

        <MenuItem on:click={backup} padded label="Backup" />
        <MenuItem on:click={restore} padded label="Restore" />
        <MenuSeparator />
        <MenuItem
          on:click={openChordEditor}
          icon={icons.edit}
          label="Edit chords"
        />
        <MenuItem
          on:click={adjustVolumeGain}
          icon={icons.volumeOptions}
          label="Adjust volume gain"
        />
        <MenuItem
          on:click={() => ($showVolOctSliders = !$showVolOctSliders)}
          icon={icons.options}
          label="{$showVolOctSliders ? 'Hide' : 'Show'} sliders"
        />
      </ContextMenu>
    </div>
  </div>

  <PianoKeyboard />

  <SetEditor bind:dialog={instrumentEditor} />

  <ChordEditor bind:dialog={chordEditor} />

  <div class="flex items-center justify-center mx-auto gap-4">
    {#if $showVolOctSliders}
      <Slider
        description="Volume"
        min="0"
        max="100"
        step="1"
        icon={icons.volume2}
        bind:value={$volume}
      />

      <Slider
        description="Octave shift"
        icon={icons.shift}
        min="-3"
        max="3"
        step="1"
        bind:value={$octaveShift}
      />
    {/if}

    <div class="flex">
      <div class="flex items-center mr-2 opacity-40">
        <Icon icon={icons.instrument} />
      </div>
      <Button
        
        label='+ Higher octave (shift + space)'
        toggled={$playShiftUp}
        on:click={() => $playShiftUp = !$playShiftUp}
        outlined
        additionalClass='rounded-tr-none rounded-br-none'
      />

      <div class="rounded-tr-none"></div>
      
      <Button
        label='+ Lower octave  (ctrl + space)'
        toggled={$playShiftDown}
        on:click={() => $playShiftDown = !$playShiftDown}
        outlined
        additionalClass='rounded-tl-none rounded-bl-none -ml-px'
      />
    </div>
   
  </div>
</div>

<slot />
