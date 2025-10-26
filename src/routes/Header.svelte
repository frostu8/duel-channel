<script>
  import Icon from 'svelte-awesome';
  import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord';

  let { currentUser } = $props();
</script>

<header>
  <h1>DUEL CHANNEL</h1>
  {#if !currentUser}
  <a class="discord-button" href="/api/v1/users/~redirect">
    <Icon data={faDiscord} scale={1.5}/>
    <p>Login</p>
  </a>
  {/if}
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;

    height: 3em;
    width: 100%;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    background-color: var(--primary-light);
    border-bottom: 4px solid var(--bg);
  }

  h1 {
    color: var(--bg);
    transform: translate(0, 4px);
    font-size: 3em;
    margin-left: 2em;
    flex-grow: 1;
  }

  a.discord-button {
    text-decoration: none;
  }

  .discord-button {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    background-color: #5865F2;
    color: white;
    padding: 0.25em 1.5em;
    border-radius: 8px;

    margin: 2em;

    & p {
      margin-left: 8px;
    }

    &:active {
      background-color: #3744d4;
    }
  }
</style>
