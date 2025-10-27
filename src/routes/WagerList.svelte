<script>
  import WagerListEntry from './WagerListEntry.svelte'

  let { wagers, teamColor, title, float = 'left', status, children } = $props();
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
    <p>
    {#if status === 'no-contest'}
      <span>NO CONTEST...</span>
    {:else if status === 'winner'}
      <span>WIN!</span>
    {:else}
      <!-- We still want it to take up space -->
      <br>
    {/if}
    </p>
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
    /* flex: 1 1 0px; */
    flex-flow: column nowrap;
    background-color: var(--bg-light);
    margin-bottom: 2em;
    width: var(--width, 24em);

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
</style>
