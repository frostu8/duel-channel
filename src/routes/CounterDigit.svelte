<script>
  import digitZero from '$lib/assets/counter/digit_zero.png';
  import digitOne from '$lib/assets/counter/digit_one.png';
  import digitTwo from '$lib/assets/counter/digit_two.png';
  import digitThree from '$lib/assets/counter/digit_three.png';
  import digitFour from '$lib/assets/counter/digit_four.png';
  import digitFive from '$lib/assets/counter/digit_five.png';
  import digitSix from '$lib/assets/counter/digit_six.png';
  import digitSeven from '$lib/assets/counter/digit_seven.png';
  import digitEight from '$lib/assets/counter/digit_eight.png';
  import digitNine from '$lib/assets/counter/digit_nine.png';

  let { number: baseNumber, digitNum = 0 } = $props();

  let digit = $derived.by(() => {
    // Find the digit of this counter digit
    let number = Math.abs(Math.trunc(baseNumber));

    // Divide 10 away until we get the digit we want
    let ghosted = false;
    for (let i = 0; i < digitNum; i++) {
      number = Math.trunc(number / 10);

      if (number === 0) {
        // We have exhausted the digits! Let the renderer know.
        ghosted = true;
        break;
      }
    }

    if (isNaN(number))
      throw new Error('number is nan');

    // Get the digit image from the digit
    switch (number % 10) {
      case 0:
        return { src: digitZero, alt: 'Digit 0', ghosted };
      case 1:
        return { src: digitOne, alt: 'Digit 1', ghosted };
      case 2:
        return { src: digitTwo, alt: 'Digit 2', ghosted };
      case 3:
        return { src: digitThree, alt: 'Digit 3', ghosted };
      case 4:
        return { src: digitFour, alt: 'Digit 4', ghosted };
      case 5:
        return { src: digitFive, alt: 'Digit 5', ghosted };
      case 6:
        return { src: digitSix, alt: 'Digit 6', ghosted };
      case 7:
        return { src: digitSeven, alt: 'Digit 7', ghosted };
      case 8:
        return { src: digitEight, alt: 'Digit 8', ghosted };
      case 9:
        return { src: digitNine, alt: 'Digit 9', ghosted };
      default:
        throw new Error('unreachable');
    }
  });
</script>

<img
  src={digit.src}
  alt={digit.alt}
  class={{ ghosted: digit.ghosted }}
  draggable="false"
/>

<style>
  .ghosted {
    opacity: 30%;
  }

  img {
    image-rendering: crisp-edges;
    height: var(--height, 1em);
  }
</style>
