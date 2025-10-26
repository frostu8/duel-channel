<script>
  import Icon from 'svelte-awesome';
  import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord';

  let { currentUser } = $props();
</script>

<header>
  <h1>DUEL CHANNEL</h1>
  {#if !currentUser}
  <a class="button" href="https://duelchannel.ringrace.rs/api/v1/users/~redirect">
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

    & h1 {
      border-color: var(--bg);
      border-style: solid;
      border-width: 0 2px 0 0;
    }

    & .button {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      height: 100%;
      padding: 0 1.5em;
      margin-right: 1em;
      border-color: var(--bg);
      border-style: solid;
      border-width: 0 2px 0 0;

      color: black;
      background-color: var(--primary-light);
      transition: background-color 0.2s;
      text-decoration: none;

      & p {
        margin-left: 8px;
      }

      &:hover {
        background-color: var(--primary);
      }
    }
  }

  h1 {
    color: var(--bg);
    transform: translate(0, 4px);
    font-size: 3em;
    margin-left: 2em;
    flex-grow: 1;
  }
</style>
