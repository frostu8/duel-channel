<script>
  let { channel, onready } = $props();

  $effect(() => {
    const player = new Twitch.Embed("twitch-embed", {
      width: 1080,
      height: 600,
      channel: channel,
      parent: ["duelchannel.ringrace.rs"]
    });

    player.addEventListener(Twitch.Player.READY, () => {
      if (onready) onready(player);
    });
  })
</script>

<div id="twitch-embed"></div>
<svelte:head>
    <script async src="https://embed.twitch.tv/embed/v1.js"></script>
</svelte:head>
