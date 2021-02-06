<script>
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { backOut } from "svelte/easing";

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
        msg,
      },
    ];
    setTimeout(() => {
      unshiftToast(id);
    }, retainMs);
  };

  const unshiftToast = () => {
    toasts = toasts.filter((a, i) => i > 0);
  };

  onMount(() => {
    window.pushToast = pushToast;
  });

  function getCurrentTime() {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes().toString().padStart(2, '0');
    return time;
  }
</script>

<style>
  .toast-wrapper {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0.5rem;
    transition: all 0.15s ease;
  }

  .toast-item {
    border-radius: 4px;
    padding: 0.3rem 0.5rem;
    margin: 0.2rem;
    background: rgba(var(--body-text-values), 0.7);
    color: var(--bg-color);
    font-size: 0.8rem;
    cursor: pointer;
    transition: width 0.2s ease, height 0.2s ease;
    transform-origin: bottom left;
    backdrop-filter: blur(30px) saturate(125%) brightness(125%);
  }
  .toast-item span {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.1rem;
    opacity: 0.6;
    margin-right: auto;
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
      in:fly={{ delay: 0, duration: 200, x: 0, y: 50, opacity: 0.1, easing: backOut }}
      out:slide={{ duration: 200 }}
      on:click={() => unshiftToast(toast._id)}
      class:error={toast.type == 'error'}>
      {@html toast.msg}
      <br />
      <span>{getCurrentTime()}</span>
    </div>
  {/each}
</div>
