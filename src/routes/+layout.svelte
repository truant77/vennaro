<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vennaro | Instant Data Matching</title>
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#3498db" />
	<script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
</svelte:head>

{@render children()}