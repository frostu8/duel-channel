<script>
  import { fly } from 'svelte/transition';

  let { wager, float = 'left' } = $props();

  const TRANSITION_DURATION = 400;
  const TRANSITION_FLY_DIST = 20; // dist in px

  let flyX = $derived.by(() => {
    if (float === 'left')
      return TRANSITION_FLY_DIST;
    else if (float === 'right') // flip fly if this is floating on the other side
      return TRANSITION_FLY_DIST * -1;
  });
</script>

<div class="wager-entry">
  <div class="wager-inner" transition:fly={{ x: flyX, duration: TRANSITION_DURATION }}>
    <img
      class="avatar"
      src={wager.user.avatar}
      alt="{wager.user.display_name}'s avatar"
      width="32"
    />
    <p class="display-name">{wager.user.display_name}</p>
    <p class="wager">{wager.mobiums}</p>
  </div>
</div>

<style>
  .wager-inner {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0.25em 0.75em;
  }

  .avatar {
    clip-path: circle(50%);
  }

  .display-name {
    flex-grow: 1;
    padding: 0 1em;
  }

  .wager {
    font-weight: bold;
  }

  .wager-entry:nth-child(even) {
    background-color: var(--bg-light);
  }

  .wager-entry:nth-child(odd) {
    background-color: var(--bg);
  }
</style>
