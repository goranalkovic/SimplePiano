<script>
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  let toasts = [];
  let retainMs = 2000;

  let toastId = 0;
  const pushToast = (msg = "", type) => {
    let id = ++toastId;
    toasts = [
      ...toasts,
      {
        _id: id,
        type: type,
        msg
      }
    ];
    setTimeout(() => {
      unshiftToast(id);
    }, retainMs);
  };

  const unshiftToast = () => {
    toasts = toasts.filter((a, i) => i > 0);
  };
  // const unshiftToast = id => {
  //   toasts.splice(id - 1, 1);
  //   toasts = [...toasts];
  // };

  onMount(() => {
    window.pushToast = pushToast;
  });

  function getCurrentTime() {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();
    return time;
  }
</script>

<style>
  .toast-wrapper {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    padding: 0.5rem;
    text-align: right;
    transition: all 0.15s ease;
  }

  .toast-item {
    border-radius: 4px;
    padding: 0.5rem 0.7rem;
    margin: 0.2rem;
    background: rgba(var(--body-text-values), 0.7);
    color: var(--bg-color);
    font-size: 0.9rem;
    cursor: pointer;
    transition: width 0.2s ease, height 0.2s ease;
    transform-origin: top right;
  }
  .toast-item span {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.1rem;
    opacity: 0.6;
  }

  .toast-item.error {
    background: rgba(216, 58, 66, 0.7);
    color: #fff;
  }
</style>

<div class="toast-wrapper">
  {#each toasts as toast (toast._id)}
    <div
      class="toast-item"
      in:fly={{ delay: 0, duration: 300, x: 50, y: 0, opacity: 0.1, easing: backOut }}
      out:slide={{ duration: 300 }}
      on:click={() => unshiftToast(toast._id)}
      class:error={toast.type == 'error'}>
      {@html toast.msg}
      <br />
      <span>{getCurrentTime()}</span>
    </div>
  {/each}
</div>
