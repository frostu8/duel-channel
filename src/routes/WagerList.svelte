<script>
  import WagerListEntry from './WagerListEntry.svelte'
  import Counter from './Counter.svelte'

  let { wagers, player, teamColor, float = 'left', status, children } = $props();

  let title = $derived(player?.display_name ?? 'Waiting...');
</script>

<section
  class={[
    teamColor && teamColor,
    {
      'float-left': float === 'left',
      'float-right': float === 'right',
    }
  ]}
>
  <div class="header">
    <h1>{title}</h1>
    <div class="info-bar">
      <p class="status">
      {#if status === 'no-contest'}
        <span>NO CONTEST...</span>
      {:else if status === 'winner'}
        <span>WIN!</span>
      {:else if status === 'forfeit'}
        <span>FORFEIT!</span>
      {:else}
        <!-- We still want it to take up space -->
        <br>
      {/if}
      </p>
      {#if player?.mmr}
      <div class="mmr">
        <p>R</p>
        <p class="mmr-text">{player.mmr}</p>
        {#key player.id}
        <Counter number={player.mmr} animate={true}/>
        {/key}
      </div>
      {/if}
    </div>
  </div>
  <div class="wager-list">
    {#each wagers as wager (wager.user.username)}
      <WagerListEntry {wager} {float}/>
    {/each}
  </div>
  {@render children?.()}
</section>

<style>
  section {
    display: flex;
    flex: 0 0 var(--width, 20em);
    flex-flow: column nowrap;
    background-color: var(--bg-light);
    margin-bottom: 2em;
    min-height: var(--height, 20em);

    /* For mobile viewports */
    @media only screen and (max-width: calc(40em + 500px)) {
      flex: 1 1 auto;
    }

    &.red {
      color: var(--text-red);
      & .header {
        color: var(--text-red-large);
        background: linear-gradient(180deg, var(--bg) 0%, var(--bg) 80%, var(--text-red) 140%);
        border-bottom-color: var(--text-red-large);
      }
    }

    &.blue {
      color: var(--text-blue);
      & .header {
        color: var(--text-blue-large);
        background: linear-gradient(180deg, var(--bg) 0%, var(--bg) 80%, var(--text-blue) 140%);
        border-bottom-color: var(--text-blue-large);
      }
    }

    &.float-left .header {
      text-align: left;
    }

    &.float-right .header {
      text-align: right;
    }

    &.float-left .info-bar, &.float-left .mmr {
      flex-direction: row;
    }

    &.float-right .info-bar, &.float-right .mmr {
      flex-direction: row-reverse;
    }
  }

  .wager-list {
    flex-grow: 1;
  }

  .header {
    background-color: var(--bg);
    width: 100%;
    padding: 0.25em 0.75em;
    border-bottom: 4px solid white;
  }

  .info-bar {
    display: flex;
    flex-flow: row nowrap;

    width: 100%;

    & .status {
      flex-grow: 1;
    }
  }

  .mmr {
    display: flex;
    flex-flow: row nowrap;

    .mmr-text {
      display: none;
    }

    & p {
      margin: 0 0.5em;
    }
  }
</style>
