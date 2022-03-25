<script>
	import { onMount, setContext, createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { key } from '../menu.js';

	export let x;
	export let y;
	
	let menuEl;

	// whenever x and y is changed, restrict box to be within bounds
	$: (() => {
		if (!menuEl) return;
		
		const rect = menuEl.getBoundingClientRect();
		x = Math.min(window.innerWidth - rect.width, x);
		if (y > window.innerHeight - rect.height) y -= rect.height;
	});
	
	const dispatch = createEventDispatcher();	
	
	setContext(key, {
		dispatchClick: () => dispatch('click')
	});
	

	function onPageClick(e) {
		if (e.target === menuEl || menuEl.contains(e.target)) return;
		dispatch('clickoutside');
	}
</script>

<svelte:body on:click={onPageClick} />

<div class="grid shadow-xl border border-gray-150 dark:border-gray-800 z-20 mx-6 my-3 context-menu-options w-48 space-y-2 backdrop-blur-lg backdrop-saturate-150  opacity-100  transition duration-200  p-1 rounded-lg absolute text-xs dark:bg-gray-800 bg-gray-100 text-black dark:text-white  bg-opacity-60 dark:bg-opacity-60" transition:slide={{ duration: 100 }} bind:this={menuEl} style="top: {y}px; left: {x}px;">
	<slot />
</div>