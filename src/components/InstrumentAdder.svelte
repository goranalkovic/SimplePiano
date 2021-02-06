<script>
  import Toast from "./Toast.svelte";
  import { currentSoundFont, instrumentSets, ac, activeSet } from "../stores";

  export let availableInstruments = [];

  function normalizeInstrumentName(input) {
    input = input.replace(/_/g, " ");

    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  const denormalizeInstrumentName = (input) => {
    input = input.replace(/ /g, "_");
    return input.charAt(0).toLowerCase() + input.slice(1);
  };

  const getRandomId = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(2, 10);

  const addInstrument = (selectedInstrument) => {
    if (selectedInstrument == null) return;

    let instrumentData = Soundfont.instrument(ac, selectedInstrument, {
      soundfont: $currentSoundFont,
    });

    let newInstr = {
      id: getRandomId(),
      name: selectedInstrument,
      volume: -1,
      octave: 0,
      absoluteVolume: true,
      data: instrumentData,
      soundfont: $currentSoundFont,
      adsr: [-0.01, -0.01, -0.01, -0.01],
    };

    $instrumentSets[$activeSet].instruments.push(newInstr);

    instrumentSets.set([...$instrumentSets]);
  };

  const handleKeyPress = (event) => {
    event.preventDefault();
    const pickedInstrument = denormalizeInstrumentName(event.target.value);
    if (availableInstruments.includes(pickedInstrument)) {
      addInstrument(pickedInstrument);
    }
    event.target.value = "";
  };
</script>

<input
  on:change={handleKeyPress}
  placeholder="Add instrument"
  list="instruments"
/>

<datalist id="instruments">
  {#each availableInstruments as instrument (instrument)}
    <option value={normalizeInstrumentName(instrument)} />
  {/each}
</datalist>

<Toast />

<style>
  input {
    background: var(--black-key-color);
    color: var(--white-key-text);
    border: none;
    padding: 6px 8px;
    border-radius: var(--border-radius);
    width: 12rem;
    margin-bottom: 1rem;
    font-family: var(--font-family);
    margin-top: 0.5rem;
    margin-left: auto;
    margin-right: auto;
  }
</style>
