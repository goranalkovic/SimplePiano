<script>
  import { slide, crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  export let list;
  export let update;
  export let canReroder = false;

  // DRAG AND DROP
  let isOver = false;
  const getDraggedParent = (node) =>
    (node.dataset.index && node.dataset) || getDraggedParent(node.parentNode);
  const start = (ev) => {
    ev.dataTransfer.setData("source", ev.target.dataset.index);
  };
  const over = (ev) => {
    ev.preventDefault();
    let dragged = getDraggedParent(ev.target);
    if (isOver !== dragged.id) isOver = dragged.id;
  };
  const leave = (ev) => {
    let dragged = getDraggedParent(ev.target);
    if (isOver === dragged.id) isOver = false;
  };
  const drop = (ev) => {
    isOver = false;
    ev.preventDefault();
    let dragged = getDraggedParent(ev.target);
    let from = ev.dataTransfer.getData("source");
    let to = dragged.index;
    reorder({ from, to });
  };

  // DISPATCH REORDER
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const reorder = ({ from, to }) => {
    update(from, to);
  };

  // UTILS
  let key = "id";

  const getKey = (item) => (key ? item[key] : item);
</script>

<style>
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style-type: none;
    gap: calc(var(--padding) / 2);
    max-height: 70vh;
    overflow-y: scroll;
  }

  .list {
    scrollbar-width: thin;
    scrollbar-color: var(--white-key-color) transparent;
  }

  /* Works on Chrome/Edge/Safari */
  *::-webkit-scrollbar {
    width: 2px;
  }
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  *::-webkit-scrollbar-thumb {
    background-color: var(--white-key-color);
    border-radius: 20px;
    border: none;
  }

  .reordering,
  .reordering * {
    cursor: move !important;
  }
</style>

<ul class="list">
  {#each list as item, index (item.id)}
    <li
      class:reordering={canReroder}
      data-index={index}
      data-id={item.id}
      draggable={canReroder}
      on:dragstart={start}
      on:dragover={over}
      on:dragleave={leave}
      on:drop={drop}
      animate:flip={{ duration: 200 }}>
      <slot {item} {index} />
    </li>
  {:else}
    <slot name="error">No items</slot>
  {/each}
</ul>
