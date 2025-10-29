<script>
  import CounterDigit from './CounterDigit.svelte';
  import Counter from './Counter.svelte';

  import mobiumBill from '$lib/assets/counter/mobiums.png';

  let { mobiums, digitCount = 7 } = $props();
</script>

<div class="mobiums-counter">
  <h1 class="mobiums-text">{mobiums}</h1>
  <Counter
    number={mobiums}
    height="3.25em"
    padding={digitCount}
    by={18}
    animate={true}
  >
    <img src={mobiumBill} alt="Mobium Bill" draggable="false" class="mobium" />
  </Counter>
</div>

<style>
  .mobiums-counter {
    position: fixed;
    bottom: 0px;
    left: calc(50% - 18em);
    width: 36em;
    z-index: 1;
    height: var(--height, 7em);

    /* Creates the trapezoidal shape */
    clip-path: polygon(
      0% 100%,
      10% 0%,
      90% 0%,
      100% 100%
    );

    background-color: var(--accent);

    & h1 {
      font-size: 4em;
    }
  }

  .mobiums-text {
    display: none;
  }

  .mobium {
    image-rendering: crisp-edges;
    width: 6em;
    margin: 1em 1em;
  }
</style>
