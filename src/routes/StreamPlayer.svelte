<script>
  let { channel, onready } = $props();

  function twitchLoaded() {
    const player = new Twitch.Embed("twitch-embed", {
      width: 1080,
      height: 600,
      channel: channel,
      parent: ["duelchannel.ringrace.rs"]
    });

    player.addEventListener(Twitch.Player.READY, () => {
      console.log('twitch player loaded');
      if (onready) onready(player);
    });
  }
</script>

<div id="twitch-embed"></div>
<svelte:head>
  <script async src="https://embed.twitch.tv/embed/v1.js" onload={twitchLoaded}></script>
</svelte:head>
