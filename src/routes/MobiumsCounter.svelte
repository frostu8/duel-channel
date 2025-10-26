<script>
  let { mobiums } = $props();
</script>

<div class="mobiums-counter">
  <p>Mobiums:</p>
  <h1>{mobiums}</h1>
</div>

<style>
  .mobiums-counter {
    position: fixed;
    bottom: 0px;
    left: calc(50% - 8em);
    width: 16em;

    background-color: var(--bg);

    & h1 {
      font-size: 4em;
    }
  }
</style>
