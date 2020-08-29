<script>
  export let label = null;
  export let key;
  export let square = false;

  function convertToInter(key) {
    switch (key) {
      case 0:
        return square ? "" : "⓪";
        break;
      case 1:
        return square ? "" : "①";
        break;
      case 2:
        return square ? "" : "②";
        break;
      case 3:
        return square ? "" : "③";
        break;
      case 4:
        return square ? "" : "④";
        break;
      case 5:
        return square ? "" : "⑤";
        break;
      case 6:
        return square ? "" : "⑥";
        break;
      case 7:
        return square ? "" : "⑦";
        break;
      case 8:
        return square ? "" : "⑧";
        break;
      case 9:
        return square ? "" : "⑨";
        break;
      default:
        return key;
        break;
    }
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
    opacity: 0.6;
    margin-right: 10px;

    pointer-events: none;
    user-select: none;

    margin: 0;
    padding: 0;
  }

  .container span {
    display: inline-block;
    margin-bottom: 0.4rem;
  }

  .label {
    font-size: 0.8rem;
    font-family: var(--font-family);
    width: 1.4rem;
    text-align: right;
  }

  .inter-key {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: 0.8rem;
    transform: translateY(3px);
    margin-bottom: 4px;
    height: 1.4rem;
    font-weight: 500;
    opacity: 0.7;
  }
</style>

<div class="container">
  {#if label}
    <span class="label">{label}</span>
  {/if}
  <span class="inter-key">
    {@html convertToInter(key)}
  </span>
</div>
