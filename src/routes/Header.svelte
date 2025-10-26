<script>
  import Icon from 'svelte-awesome';
  import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord';

  let { currentUser } = $props();

  let hasButtons = $derived.by(() => {
    return !currentUser;
  });
</script>

<header>
  <h1>DUEL CHANNEL</h1>
  {#if !currentUser}
  <a class="button" href="https://duelchannel.ringrace.rs/api/v1/users/~redirect">
    <Icon data={faDiscord} scale={1.5}/>
    <p>Login</p>
  </a>
  {/if}
  {#if hasButtons}
  <div class="seperator"></div>
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
    /* border-bottom: 4px solid var(--bg); */

    & .seperator {
      height: 100%;
      width: 2em;

      border-color: var(--bg);
      border-style: solid;
      border-width: 0 0 0 2px;
    }

    & .button {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      height: 100%;
      padding: 0 1.5em;
      border-color: var(--bg);
      border-style: solid;
      border-width: 0 0 0 2px;

      color: black;
      background-color: var(--primary-light);
      transition: background-color 0.2s;
      text-decoration: none;

      & p {
        margin-left: 16px;
      }

      &:hover {
        background-color: var(--primary);
      }
    }
  }

  h1 {
    color: var(--bg);
    font-size: 2.5em;
    margin-left: 2em;
    flex-grow: 1;
  }
</style>
