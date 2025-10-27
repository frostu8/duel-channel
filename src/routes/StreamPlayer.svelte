<script>
  let { channel, onready } = $props();

  const ASPECT_RATIO = 32 / 15;

  let width = $state(720);
  let height = $derived(width / ASPECT_RATIO);

  function twitchLoaded() {
    const player = new Twitch.Embed("twitch-embed", {
      width: '100%',
      height: '100%',
      channel: channel,
      parent: ["duelchannel.ringrace.rs"]
    });

    player.addEventListener(Twitch.Player.READY, () => {
      console.log('twitch player loaded');
      if (onready) onready(player);
    });
  }
</script>

<div
  class="stream-container"
  bind:clientWidth={width}
>
  <!-- style:max-height="{height}px" -->
  <div id="twitch-embed"></div>
</div>
<svelte:head>
  <script async src="https://embed.twitch.tv/embed/v1.js" onload={twitchLoaded}></script>
</svelte:head>

<style>
  /* For mobile viewports */
  @media only screen and (max-width: calc(40em + 500px)) {
    .stream-container {
      min-height: 120vw;
    }
  }

  .stream-container {
    min-width: var(--min-width);
    flex-grow: 1;
  }

  #twitch-embed {
    width: 100%;
    height: 100%;
  }
</style>
