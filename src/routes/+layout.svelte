<script>
	import '../reset.css';
	import '../app.css';

	import favicon24x from '$lib/assets/favicon-24x24.png';
	import favicon48x from '$lib/assets/favicon-48x48.png';
	import favicon96x from '$lib/assets/favicon-96x96.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="24x24" href={favicon24x} />
	<link rel="icon" type="image/png" sizes="48x48" href={favicon48x} />
	<link rel="icon" type="image/png" sizes="96x96" href={favicon96x} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Pixelify+Sans:wght@400..700&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

{@render children?.()}
