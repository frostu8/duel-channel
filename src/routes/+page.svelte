<script>
  import StreamPlayer from './StreamPlayer.svelte';
  import MobiumsCounter from './MobiumsCounter.svelte';
  import Header from './Header.svelte';
  import WagerList from './WagerList.svelte';
  import WagerControls from './WagerControls.svelte';
  import WagerTimerBar from './WagerTimerBar.svelte';

  const TEAM_RED = 0;
  const TEAM_BLUE = 1;

  const BATTLE_STATUS_ONGOING = 0;
  const BATTLE_STATUS_CONCLUDED = 1;
  const BATTLE_STATUS_CANCELLED = 2;

  const INDUCED_DELAY = 1_500; // in ms

  // Twitch player; lets us add an artificial delay to bet events
  let player;

  // The actual socket
  let socket;

  let heartbeatInterval = 30_000;
  let heartbeatSeq = 1;
  let heartbeatId;

  // User details
  let currentUser = $state(null);
  let currentMobiums = $derived(currentUser?.mobiums);

  // Session details
  let currentBattle = $state(null);
  let isBattleTrivial = $derived.by(() => {
    if (!currentBattle) return currentBattle;

    // A trivial battle is one where only one team or no teams exist
    const teamNumbers = currentBattle.participants.map((player) => player.team);
    const uniqTeams = [...new Set(teamNumbers)];

    return uniqTeams.length < 2;
  });

  let acceptingBets = $state(false);
  let betDuration = $state(0);

  let wagers = $state([]);

  // TEAM HELL.
  let redWagers = $derived.by(() => wagers.filter((wager) => wager.victor === TEAM_RED));
  let redPlayerName = $state('Waiting...');
  let redStatus = $derived.by(() => {
    // If there is no match, there is no winner
    if (!currentBattle) return 'none';

    // If the match hasn't ended, there is no winner
    if (currentBattle.status === BATTLE_STATUS_ONGOING) return 'none';

    const player = currentBattle.participants.find((player) => player.team === TEAM_RED);
    if (!player) return 'none'; // Don't bother for players that don't exist.

    if (player.no_contest) {
      return 'no-contest';
    } else {
      return 'winner';
    }
  });

  let blueWagers = $derived.by(() => wagers.filter((wager) => wager.victor === TEAM_BLUE));
  let bluePlayerName = $state('Waiting...');
  let blueStatus = $derived.by(() => {
    // If there is no match, there is no winner
    if (!currentBattle) return 'none';

    // If the match hasn't ended, there is no winner
    if (currentBattle.status === BATTLE_STATUS_ONGOING) return 'none';

    const player = currentBattle.participants.find((player) => player.team === TEAM_BLUE);
    if (!player) return 'none'; // Don't bother for players that don't exist.

    if (player.no_contest) {
      return 'no-contest';
    } else {
      return 'winner';
    }
  });

  function streamReady(newPlayer) {
    player = newPlayer;
  }

  function replaceWager(wager) {
    const existingWager = wagers.findIndex((innerWager) => {
      return innerWager.user.username === wager.user.username;
    });

    if (existingWager < 0) {
      // this is a new wager, slap it in
      wagers.push(wager);
    } else {
      // replace the old wager
      wagers[existingWager] = wager;
    }
  }

  function fetchWagers(battleId) {
    fetch(`/api/v1/matches/${battleId}/wagers`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('failed to fetch wagers');
        }
      })
      .then((body) => {
        // replace wagers wholesale
        wagers = body;
      })
      .catch((error) => console.error(error));
  }

  function fetchCurrentUser() {
    fetch('/api/v1/users/~me')
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('failed to fetch current user');
        }
      })
      .then((body) => {
        currentUser = body;
      })
      .catch((error) => console.error(error));
  }

  function onBetTimeup() {
    acceptingBets = false;
  }

  function setBetTimer() {
    // Do not let players do trivial bets
    // Players *can* bet in the case one team has no participants, but they
    // won't win anything. This just skips that confusion.
    if (!isBattleTrivial && currentBattle.accepting_bets) {
      const closesIn = currentBattle.closes_in;

      if (closesIn > 0) {
        acceptingBets = true;
        betDuration = closesIn;
      } else {
        // date already passed?
        acceptingBets = false;
      }
    } else {
      betDuration = 0;
      acceptingBets = false;
    }
  }

  function handleMessage(msg) {
    switch (msg.op) {
      case 'new-battle':
        // update current battle
        currentBattle = msg.d;

        // change team names to names of player
        const redPlayer = currentBattle.participants.find((player) => {
          return player.team === TEAM_RED;
        })
        if (redPlayer) redPlayerName = redPlayer.display_name;
        else redPlayerName = 'Waiting...'; // reset to a sensible default

        const bluePlayer = currentBattle.participants.find((player) => {
          return player.team === TEAM_BLUE;
        })
        if (bluePlayer) bluePlayerName = bluePlayer.display_name;
        else bluePlayerName = 'Waiting...'; // reset to a sensible default

        // Fetch existing wagers
        fetchWagers(currentBattle.id);

        // wait for wagers to close
        setBetTimer();
        break;
      case 'battle-update':
        // Is this battle update for an old battle? Discard if so.
        if (currentBattle.id !== msg.d.id) return;

        currentBattle = msg.d;

        // wait for wagers to close, or close wagers if the battle is concluded
        setBetTimer();
        break;
      case 'wager-update':
        // add wager to list
        replaceWager(msg.d);
        break;
      case 'mobiums-change':
        if (!currentUser) return;

        // Update user's mobiums
        currentUser.mobiums = msg.d.mobiums;
        break;
      case 'heartbeat-ack':
        break;
      default:
        break;
    }
  }

  function putWager(wager) {
    const battle = $state.snapshot(currentBattle);
    // if there is no battle, return
    if (!battle) return;

    // Set the CSRF token of the wager
    const csrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf="))
      ?.split("=")[1];

    wager.csrf = csrf;

    fetch(
      `/api/v1/matches/${battle.id}/wagers/~me`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wager),
        mode: 'same-origin',
      }
    )
    .then((res) => {
      if (!res.ok) {
        console.error('failed to submit wager', res);
      }
    })
    .catch((error) => console.error(error));
  }

  function socketHeartbeat() {
    // Send heartbeat to server
    socket.send(JSON.stringify({
      op: "heartbeat",
      d: {
        seq: heartbeatSeq,
      },
    }));

    heartbeatSeq += 1;
  }

  function setupSocket() {
    if (heartbeatId) clearInterval(heartbeatId);
    socket = new WebSocket('/api/v1/socket');

    socket.addEventListener('open', (event) => {
      // start heartbeating
      heartbeatId = setInterval(socketHeartbeat, heartbeatInterval);
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      // Here, we add a little bit of artificial delay to increase tension
      if (data.op === 'mobiums-change' || data.op === 'battle-update') {
        const broadcasterLatency = player.getPlaybackStats().hlsLatencyBroadcaster;
        console.log('broadcaster delay:', broadcasterLatency);

        // add a little bit of extra delay
        const delay = Math.trunc(broadcasterLatency * 1_000 + INDUCED_DELAY);
        setTimeout(() => handleMessage(data), delay);
      } else {
        handleMessage(data);
      }
    });

    socket.addEventListener('close', (event) => {
      console.log('close received', event.reason);
      console.log('reconnecting in 1 sec');

      setTimeout(setupSocket, 1_000);
    });
  }

  $effect(() => {
    setupSocket();
    fetchCurrentUser();

    return () => {
      clearInterval(heartbeatId);
      if (socket.readyState === 1) {
        socket.close(1000, 'Bye!');
      }
    };
  });
</script>

<Header {currentUser}/>
<main>
  <WagerList
    wagers={redWagers}
    title={redPlayerName}
    float="left"
    status={redStatus}
    teamColor="red"
  >
    <WagerControls
      disabled={!acceptingBets}
      team={TEAM_RED}
      mobiumsTotal={currentUser?.mobiums}
      selections={[0.1, 0.3, 0.6, 1.0].reverse()}
      create={putWager}
    />
  </WagerList>
  <article>
    <StreamPlayer channel="duelringracers" onready={streamReady}/>
    {#key currentBattle?.id}
    <WagerTimerBar duration={betDuration} ontimeup={onBetTimeup}/>
    {/key}
    <section class="info-panel">
      {#if currentBattle}
        <p>Now playing on:</p>
        <h1>{currentBattle.level_name}</h1>
      {/if}
    </section>
  </article>
  <WagerList
    wagers={blueWagers}
    title={bluePlayerName}
    float="right"
    status={blueStatus}
    teamColor="blue"
  >
    <WagerControls
      disabled={!acceptingBets}
      team={TEAM_BLUE}
      mobiumsTotal={currentUser?.mobiums}
      selections={[0.1, 0.3, 0.6, 1.0]}
      create={putWager}
    />
  </WagerList>
  {#if currentMobiums}
  <MobiumsCounter mobiums={currentMobiums} by={18}/>
  {/if}
</main>

<style>
  main {
    margin-top: 3em;
    min-height: calc(100vh - 3em);
    display: flex;
    flex-flow: row nowrap;
  }

  .info-panel {
    padding: 1em;
  }
</style>
