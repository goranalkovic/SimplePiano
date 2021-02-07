<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
  
	import Button from "./components/Button.svelte";
	import Controls from "./components/Controls.svelte";
	import PianoGrid from "./components/PianoGrid.svelte";
	import SetList from "./components/SetList.svelte";
	import ThemeSwitcher from "./components/ThemeSwitcher.svelte";
	import Toast from "./components/Toast.svelte";
  
	import {
	  keyCodes,
	  keyNotes,
	  activeSet,
	  instrumentSets,
	  keysDown,
	  keysPressed,
	  volume,
	  octaveShift,
	  currentSoundFont,
	  ac,
	  defaultAdsr,
	  isFocused,
	  showAdsr,
	  editMode,
	  theme,
	  isReordering,
	  chordMode,
	  chordNotes,
	  chords,
	  defaultChords,
	} from "./stores.js";
  
	instrumentSets.useLocalStorage();
	showAdsr.useLocalStorage();
	currentSoundFont.useLocalStorage();
	activeSet.useLocalStorage();
	volume.useLocalStorage();
	octaveShift.useLocalStorage();
	editMode.useLocalStorage();
	theme.useLocalStorage();
	isReordering.useLocalStorage();
	chordMode.useLocalStorage();
	chordNotes.useLocalStorage();
  
	function clamp(value, min, max) {
	  if (value <= min) return min;
	  if (value >= max) return max;
	  return value;
	}
  
	async function stopAllSounds() {
	  try {
		if ($instrumentSets[$activeSet].instruments.length < 1) return;
  
		for (let instr of $instrumentSets[$activeSet].instruments) {
		  
			let k = instr.data;
			k.stop();
		
		}
  
		for (let i in keyCodes) {
		  document
			.querySelector("#" + keyCodes[i])
			.classList.remove("piano-key-highlight");
		}
  
		window.pushToast("Stopped all sounds", "error");
	  } catch (error) {}
	}
  
	let isDark = false;
  
	function applyTheme() {
	  if (
		($theme === 0 &&
		  window.matchMedia("(prefers-color-scheme: dark)").matches) ||
		$theme === 2
	  ) {
		document.querySelector("html").className = "dark";
		document
		  .querySelector('meta[name="theme-color"]')
		  .setAttribute("content", "#242424");
		isDark = true;
	  } else {
		document.querySelector("html").className = "";
		document
		  .querySelector('meta[name="theme-color"]')
		  .setAttribute("content", "#ffffff");
		isDark = false;
	  }
	}
  
	function toggleEditMode() {
	  editMode.set(!$editMode);
	  instrumentSets.set([...$instrumentSets]);
	  if ($editMode === false) isReordering.set(false);
  
	  window.pushToast("Edit mode " + ($editMode ? "on" : "off"));
	}
	function toggleChordMode() {
	  chordMode.set(!$chordMode);
  
	  window.pushToast("Chord mode " + ($chordMode ? "on" : "off"));
	}
  
	function handleKeyDown(e) {
	  if ($isFocused || $editMode) {
		return;
	  } else if (e.keyCode !== 116) {
		e.preventDefault();
		e.stopPropagation();
	  }
  
	  let kCode = e.keyCode;
  
	  if ($instrumentSets[$activeSet].instruments.length < 1) return;
	  if (keyCodes[kCode] == null) return;
	  if (keyNotes[kCode] == null) return;
	  if ($keysPressed[kCode] === null) return;
	  if ($keysDown[kCode] === true) return;
  
	  document
		.querySelector("#" + keyCodes[kCode])
		.classList.add("piano-key-highlight");
  
	  $keysDown[kCode] = true;
  
	  for (let instrument of $instrumentSets[$activeSet].instruments) {
		let vol =
		  instrument.volume > -1
			? instrument.absoluteVolume
			  ? ($volume * (instrument.volume / 100)) / 100
			  : instrument.volume / 100
			: $volume / 100;
  
		let adjustedOctShift = clamp($octaveShift + instrument.octave, -3, 3);
  
		instrument.data.then((instr) => {
		  let newAdsr = instrument.adsr;
  
		  if (newAdsr[0] < 0) newAdsr[0] = defaultAdsr[0];
		  if (newAdsr[1] < 0) newAdsr[1] = defaultAdsr[1];
		  if (newAdsr[2] < 0) newAdsr[2] = defaultAdsr[2];
		  if (newAdsr[3] < 0) newAdsr[3] = defaultAdsr[3];
  
		  let noteCollection = $chordMode
			? chords[$chordNotes[kCode]]
			: keyNotes[kCode];
  
		  if (noteCollection == null) return;
  
		  for (let noteCode of noteCollection) {
			let note = (
			  parseInt($chordMode ? keyNotes[noteCode] : noteCode) +
			  12 * adjustedOctShift
			).toString();
  
			try {
			  let inst = instr.play(note, ac.currentTime, {
				loop: true,
				adsr: newAdsr,
				gain: vol,
			  });
			  if ($keysPressed[kCode].indexOf(inst) === -1) {
				let currentPressed = $keysPressed[kCode];
  
				$keysPressed[kCode] = [...currentPressed, inst];
			  }
			} catch (error) {
			  window.popToast("Error: " + error.message);
			}
		  }
		});
	  }
	}
  
	function handleKeyUp(e) {
	  if ($isFocused || $editMode) {
		return;
	  } else if (e.keyCode !== 116) {
		e.preventDefault();
		e.stopPropagation();
	  }
  
	  let kCode = e.keyCode;
  
	  if (kCode >= 48 && kCode <= 58) {
		stopAllSounds();
  
		let newCode = kCode - 49;
  
		if (kCode == 48) {
		  newCode = 9;
		}
  
		if ($instrumentSets[newCode] != undefined) activeSet.set(newCode);
		else activeSet.set(0);
	  }
  
	  if (kCode === 16) {
		if ($octaveShift <= 2) {
		  octaveShift.set($octaveShift + 1);
		}
		return;
	  }
  
	  if (kCode === 17) {
		if ($octaveShift >= -2) {
		  octaveShift.set($octaveShift - 1);
		}
		return;
	  }
  
	  if (kCode === 37) {
		if ($volume >= 1) volume.set($volume - 1);
		return;
	  }
  
	  if (kCode === 40) {
		if ($volume >= 10) volume.set($volume - 10);
		if ($volume - 10 < 0) volume.set(0);
		return;
	  }
  
	  if (kCode === 39) {
		if ($volume < 99) volume.set($volume + 1);
		return;
	  }
  
	  if (kCode === 38) {
		if ($volume <= 90) volume.set($volume + 10);
		if ($volume + 10 > 100) volume.set(100);
		return;
	  }
  
	  if (kCode === 192) {
		toggleChordMode();
		return;
	  }
  
	  if ($instrumentSets[$activeSet].instruments.length < 1) return;
	  if (keyCodes[kCode] == null) return;
	  if (keyNotes[kCode] == null) return;
	  if ($keysPressed[kCode] === null) return;
	  if ($keysDown[kCode] === false) return;
  
	  document
		.querySelector("#" + keyCodes[kCode])
		.classList.remove("piano-key-highlight");
  
	  $keysDown[kCode] = false;
  
	  for (var i of $keysPressed[kCode]) {
		try {
		  i.stop();
		} catch (err) {
		  console.error("Errored stop, stopping all.");
		  console.error("Error: ", err.message);
		  stopAllSounds();
		}
	  }
  
	  $keysPressed[kCode] = [];
	}
  
	onMount(() => {
	  let colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
	  colorSchemeQuery.addEventListener("change", applyTheme);
  
	  applyTheme();
  
	  for (let set of $instrumentSets) {
		if (set.id == null) {
		  set.id = randId();
		}
	  }
	});
  
	function randId() {
	  return Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, "")
		.substr(2, 10);
	}
  </script>
  
  <div class="grid-container" class:edit-mode={$editMode}>
	<div class="titlebar">
	  <h3>Piano</h3>
	  <div style="display: flex; align-items:center;justify-content:center; ">
		{#if $editMode}
		  <div transition:fade class="chord-controls">
			<Button
			  spaced
			  outline
			  icon="chordMode"
			  label="Clear chords"
			  on:click={() => {
				let temp = $chordNotes;
				for (let keyboardKey of Object.keys(defaultChords)) {
				  temp[keyboardKey] = "";
				}
				chordNotes.set(temp);
				for (let sel of document.querySelectorAll(".piano-grid select")) {
				  sel.value = null;
				}
			  }}
			/>
			<Button
			  spaced
			  outline
			  icon="chordMode"
			  label="Reset chords"
			  on:click={() => {
				chordNotes.set(defaultChords);
			  }}
			/>
		  </div>
		{/if}
		<Button
		  spaced
		  on:click={stopAllSounds}
		  tooltip="Stop all sounds"
		  icon="stopAll2"
		  disabled={$editMode}
		/>
		<Button
		  spaced
		  tooltip="Edit mode"
		  toggled={$editMode}
		  on:click={toggleEditMode}
		  icon="edit"
		/>
  
		<Button
		  spaced
		  disabled={$editMode}
		  toggled={$chordMode}
		  on:click={toggleChordMode}
		  tooltip="Chord mode"
		  icon="chordMode"
		/>
		<ThemeSwitcher />
	  </div>
	</div>
  
	<PianoGrid />
  
	<Controls />
  
	<SetList />
  </div>
  
  <svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />
  
  <Toast />
  
  <svelte:head>
	<meta name="theme-color" content="#{isDark ? '242424' : 'ffffff'}" />
  </svelte:head>
  
  <style>
	h3 {
	  font-weight: 400;
	  font-family: "Rubik", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
		Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
		sans-serif;
	  margin: 0 var(--padding) 0 0;
	}
  
	.chord-controls {
	  display: flex;
	}
  
	.titlebar {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  gap: calc(var(--padding) * 2);
	  width: 37.5rem;
	  margin: 3rem auto 0;
	}
  
	.edit-mode .titlebar {
	  width: 44rem;
	}
  
	@media (max-width: 700px) {
	  .titlebar {
		width: 30.25rem;
	  }
	  .edit-mode .titlebar {
		width: 35.8rem;
	  }
	}
  </style>
  