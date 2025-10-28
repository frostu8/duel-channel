<script>
  import StreamPlayer from './StreamPlayer.svelte';
  import MobiumsCounter from './MobiumsCounter.svelte';
  import Header from './Header.svelte';
  import TimerBar from './TimerBar.svelte';
  import WagerList from './WagerList.svelte';
  import WagerControls from './WagerControls.svelte';

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
  // Deferred mobiums; this resets to the user's current mobiums when a new
  // battle is received. This gives the illusion that a player's mobium count
  // is reduced to zero before receiving their bailout when the next match
  // starts, when in reality it all happens in one transaction betwee the
  // client and the server.
  let deferredMobiums = $derived(currentMobiums);

  // Session details
  let currentBattle = $state(null);
  let isBattleTrivial = $derived.by(() => {
    if (!currentBattle) return currentBattle;

    // A trivial battle is one where only one team or no teams exist
    const teamNumbers = currentBattle.participants.map((player) => player.team);
    const uniqTeams = [...new Set(teamNumbers)];

    return uniqTeams.length < 2;
  });

  let acceptingBets = $state(false); // Whether the match is accepting bets
  let betDuration = $state(0); // How long the last bet was
  let betCountdown = $state(0); // How much time left is on the current bet

  let wagers = $state([]);

  let redWagers = $derived.by(() => {
    return wagers.filter((wager) => wager.victor === TEAM_RED && wager.mobiums > 0);
  });
  let redPlayerName = $state('Waiting...');

  let blueWagers = $derived.by(() => {
    return wagers.filter((wager) => wager.victor === TEAM_BLUE && wager.mobiums > 0);
  });
  let bluePlayerName = $state('Waiting...');

  // Status calculations
  function getStatusFor(team) {
    // If there is no match, there is no winner
    if (!currentBattle) return 'none';

    // If the match hasn't ended, there is no winner
    if (currentBattle.status === BATTLE_STATUS_ONGOING) return 'none';

    const player = currentBattle.participants.find((player) => player.team === team);
    if (!player) return 'none'; // Don't bother for players that don't exist.

    if (player.no_contest) {
      // This player lost...
      if (currentBattle.status === BATTLE_STATUS_CANCELLED) return 'forfeit';
      else return 'no-contest';
    } else {
      // This player won!
      // NOTE: we don't want this to say they "won," because that gives the
      // impression the pots will be distributed!
      if (currentBattle.status === BATTLE_STATUS_CANCELLED) return 'none';
      else return 'winner';
    }
  }

  let redStatus = $derived(getStatusFor(TEAM_RED));
  let blueStatus = $derived(getStatusFor(TEAM_BLUE));

  // Odds calculations
  // I decided I like FFTs odds display better since it's obvious: for every
  // dollar you bet in that pot, if you win, you get back your bet and x0.33
  // more.
  function calculatePotFor(team) {
    let adversaryTeam;
    if (team === TEAM_RED)
      adversaryTeam = TEAM_BLUE;
    else
      adversaryTeam = TEAM_RED;

    // Calculate our pot
    let pot = wagers
      .filter((w) => w.victor == team)
      .reduce((acc, w) => acc + w.mobiums, 0);

    // Calculate enemy pot
    let adversaryPot = wagers
      .filter((w) => w.victor == adversaryTeam)
      .reduce((acc, w) => acc + w.mobiums, 0);

    let potInfo = { pot };
    if (adversaryPot > 0 && pot > 0) {
      // Find fractional difference
      potInfo.odds = `x${(adversaryPot / pot).toFixed(3)}`;
    }

    return potInfo
  }

  let redPot = $derived(calculatePotFor(TEAM_RED));
  let bluePot = $derived(calculatePotFor(TEAM_BLUE));

  function streamReady(newPlayer) {
    player = newPlayer;
  }

  function replaceWager(wager) {
    let newWagers = wagers.filter((innerWager) => {
      return innerWager.user.username !== wager.user.username;
    });

    // Add new wager after removing the old one (if it existed)
    newWagers.push(wager);

    // sort
    newWagers.sort((a, b) => b.mobiums - a.mobiums);

    wagers = newWagers;
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

        // Reset deferred mobiums if they were set
        deferredMobiums = currentUser?.mobiums;
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

        if (msg.d.bailout) {
          // Set mobiums to 0 to give the illusion that you lost all your money
          // (you did, but grandma Sonic was nice enough to lend some money in
          // milliseconds).
          deferredMobiums = 0;
        } else {
          deferredMobiums = currentUser.mobiums;
        }
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
  <article class="main-content">
    <StreamPlayer
      channel="duelringracers"
      onready={streamReady}
      --min-width="500px"
    />
    <section class="wager-odds-panel">
      {#if !isBattleTrivial}
        <p class="red">M${redPot.pot}</p>
        <p>
          {#if redPot.odds}
            <span class="red">{redPot.odds}</span>
          {/if}
          |
          {#if bluePot.odds}
            <span class="blue">{bluePot.odds}</span>
          {/if}
        </p>
        <p class="blue">M${bluePot.pot}</p>
      {/if}
    </section>
    <section class="bet-timer-panel">
      {#key currentBattle?.id}
        <TimerBar
          duration={betDuration}
          oncountdown={(time) => betCountdown = time}
          ontimeup={onBetTimeup}
        />
      {/key}
      {#if betCountdown > 1}
        <p>Bets close in {Math.ceil(betCountdown / 1_000)} seconds</p>
      {:else if betCountdown > 0}
        <p>Bets close in {Math.ceil(betCountdown / 1_000)} second</p>
      {/if}
    </section>
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
  {#if typeof deferredMobiums === 'number'}
  <MobiumsCounter mobiums={deferredMobiums} by={18} --height="7em"/>
  {/if}
</main>

<style>
  /* For mobile viewports */
  @media only screen and (max-width: calc(40em + 500px)) {
    .main-content {
      flex: 0 0 100%;
      order: 3;
    }
  }

  main {
    display: flex;
    flex-flow: row wrap;

    margin-top: 3em;
    min-height: calc(100vh - 3em);
  }

  .main-content {
    display: flex;
    flex-flow: column nowrap;

    flex-grow: 2;
  }

  .wager-odds-panel {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    height: 0;

    & > p {
      font-size: 1.2em;
      transform: translate(0, 32px);
    }

    & p.red, & p.blue {
      color: white;
      height: fit-content;
      border-radius: 4px;
      padding: 0.2em 0.5em;
      margin: 0 1em;
    }

    & span {
      font-weight: bold;
    }

    & p.red {
      background-color: var(--bg-red);
    }

    & p.blue {
      background-color: var(--bg-blue);
    }

    & span.red {
      color: var(--text-red);
    }

    & span.blue {
      color: var(--text-blue);
    }
  }

  .bet-timer-panel {
    text-align: right;
    margin: 0 0 2em;

    & p {
      margin: 0.25em 1em;
    }
  }

  .info-panel {
    padding: 1em;
    margin-bottom: 8em;
  }
</style>
