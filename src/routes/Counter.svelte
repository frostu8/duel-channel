<script>
  import CounterDigit from './CounterDigit.svelte';

  let {
    number,
    padding = 0,
    animate = false,
    by = 1,
    height = "1.5em",
    children
  } = $props();

  let currentNumber = $state(number);

  function tick(targetNumber) {
    if (!animate) {
      // Just set the number... No fun today...
      currentNumber = number;
      return;
    }

    const differenceSign = Math.sign(targetNumber - currentNumber);

    // Increase mobiums by amount
    currentNumber = currentNumber + differenceSign * by;

    // Check if we overshot it
    const newDifferenceSign = Math.sign(targetNumber - currentNumber);
    if (newDifferenceSign * differenceSign < 0) {
      // Correct
      currentNumber = targetNumber;
    }

    // Continue ticking if there's more room left between mobiums and current
    // mobiums
    if (newDifferenceSign !== 0) {
      requestAnimationFrame(() => tick(targetNumber));
    }
  }

  let digitCount = $derived.by(() => {
    let ix = 0;
    let number = currentNumber;

    while (number > 0) {
      number = Math.trunc(number / 10);
      ix++;
    }

    return ix;
  });

  let digits = $derived([...Array(Math.max(digitCount, padding)).keys()].reverse());

  $effect(() => {
    let newNumber = number;
    requestAnimationFrame(() => tick(newNumber));
  });
</script>

<div class="counter">
  {#each digits as digitNum}
    <CounterDigit number={currentNumber} {digitNum} --height={height} />
  {/each}
  {@render children?.()}
</div>

<style>
  .counter {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  }
</style>
