<script>
    import {volume, octaveShift} from '../stores';
    import SlideControl from './SlideControl.svelte';

    let volumeControl = {
        title: 'Volume',
        min: 0,
        max: 100,
        step: 1,
        keyboardKeys: [
            {label: '-1', key: '←'},
            {label: '+1', key: '→'},
            {label: '+10', key: '↑'},
            {label: '-10', key: '↓'},
        ]
    };

    let octaveControl = {
        title: 'Octave shift',
        min: -3,
        max: 3,
        step: 0.5,
        keyboardKeys: [
            {label: 'Up', key: '⇧', square: false},
            {label: 'Dn', key: '<small>Ctrl</small>', square: false}
        ]
    };

     
</script>

<style>
    .flex {
        display: flex;
    }
</style>

<div class="flex">
    <SlideControl {...volumeControl} bind:value={$volume}  />
    <SlideControl {...octaveControl} bind:value={$octaveShift}  />
</div>