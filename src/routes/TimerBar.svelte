<script>
  let { oncountdown, ontimeup, duration } = $props();

  let counter = $state(duration);

  let destroyed = false;
  let lastTimestamp;

  function animateBar(timestamp) {
    // If this component has been destroyed, stop updating. You've done enough.
    if (destroyed) return;

    if (lastTimestamp === undefined) {
      lastTimestamp = timestamp;
    }

    // Decrease bar
    const timeDelta = timestamp - lastTimestamp;
    counter = Math.max(counter - timeDelta, 0);

    oncountdown?.(counter);

    // Update last timestamp
    lastTimestamp = timestamp;

    if (counter > 0) {
      requestAnimationFrame(animateBar);
    } else {
      ontimeup?.();
    }
  }

  $effect(() => {
    requestAnimationFrame(animateBar)

    return () => { destroyed = true; }
  });
</script>

<div class="timer-bar">
  {#if duration > 0}
  <div style:width="{counter / duration * 100}%"></div>
  {:else}
  <div style:width="0"></div>
  {/if}
</div>

<style>
  .timer-bar {
    height: 4px;
    width: 100%;
    background-color: var(--bg-light);

    & div {
      height: 100%;
      background-color: var(--primary);
    }
  }
</style>
