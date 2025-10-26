<script>
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

    // Get the digit image from the digit
    switch (number % 10) {
      case 0:
        return { src: '/counter/digit_zero.png', alt: 'Digit 0', ghosted };
      case 1:
        return { src: '/counter/digit_one.png', alt: 'Digit 1', ghosted };
      case 2:
        return { src: '/counter/digit_two.png', alt: 'Digit 2', ghosted };
      case 3:
        return { src: '/counter/digit_three.png', alt: 'Digit 3', ghosted };
      case 4:
        return { src: '/counter/digit_four.png', alt: 'Digit 4', ghosted };
      case 5:
        return { src: '/counter/digit_five.png', alt: 'Digit 5', ghosted };
      case 6:
        return { src: '/counter/digit_six.png', alt: 'Digit 6', ghosted };
      case 7:
        return { src: '/counter/digit_seven.png', alt: 'Digit 7', ghosted };
      case 8:
        return { src: '/counter/digit_eight.png', alt: 'Digit 8', ghosted };
      case 9:
        return { src: '/counter/digit_nine.png', alt: 'Digit 9', ghosted };
      default:
        throw new Error('unreachable');
    }
  });

  function counter(node, { by = 1 }) {
    
  }
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
    width: 3em;
  }
</style>
