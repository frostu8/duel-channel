<script>
  let { wager } = $props();

  let username = $derived(wager.user.username);
  let wagerAmount = $derived(wager.mobiums);
</script>

<div class="wager-entry">
  <p class="username">{username}</p>
  <p class="wager">{wagerAmount}</p>
</div>

<style>
  .wager-entry {
    display: flex;
    flex-flow: row nowrap;
    padding: 0.5em;

    & .username {
      flex-grow: 1;
      padding: 0 1em;
    }
  }

  .wager-entry:nth-child(even) {
    background-color: var(--bg-light);
  }

  .wager-entry:nth-child(odd) {
    background-color: var(--bg);
  }
</style>
