<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#3498db" />
</svelte:head>

{@render children()}