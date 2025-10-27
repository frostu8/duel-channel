<script>
  let { channel, onready } = $props();

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

<div class="stream-container">
  <div id="twitch-embed"></div>
</div>
<svelte:head>
  <script async src="https://embed.twitch.tv/embed/v1.js" onload={twitchLoaded}></script>
</svelte:head>

<style>
  .stream-container {
    height: 65vh;
  }

  #twitch-embed {
    width: 100%;
    height: 100%;
  }
</style>
