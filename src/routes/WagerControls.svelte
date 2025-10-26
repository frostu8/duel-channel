<script>
  let { disabled, create, team, mobiumsTotal, selections } = $props();

  let buttons = $derived.by(() => {
    if (mobiumsTotal === undefined || mobiumsTotal === null) return [];

    return selections.map((fraction) => {
      let button = {
        wagerAmount: Math.trunc(mobiumsTotal * fraction),
      };

      if (fraction >= 1.0) {
        button.wagerAmount = mobiumsTotal;
        button.label = "ALL IN";
      } else {
        button.label = `${Math.trunc(fraction * 100)}%`;
        button.subLabel = `${button.wagerAmount}`;
      }

      return button;
    });
  });

  function onClick(amount) {
    if (create) {
      // Create the wager
      create({
        victor: $state.snapshot(team),
        mobiums: amount,
      });
    }
  }
</script>

<div class="wager-controls">
  {#each buttons as button}
    <button onclick={() => onClick(button.wagerAmount)} {disabled}>
      <p class="label">{button.label}</p>
      {#if button.subLabel}
        <p>{button.subLabel}</p>
      {/if}
    </button>
  {/each}
</div>

<style>
  .wager-controls {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
    background-color: var(--bg);

    & button {
      flex-grow: 1;
      background-color: var(--primary);
      border: 0;
      transition: background-color 0.2s;
      cursor: pointer;

      & .label {
        font-weight: bold;
        font-size: 1.25em;
      }

      &:disabled {
        background-color: var(--bg-light);
        color: white;
        cursor: default;
      }

      &:active:enabled {
        background-color: var(--primary-dark);
      }
    }
  }
</style>
