<script>
	import '../app.css';
	import { page } from '$app/state';
	import Chatbot from '../lib/Chatbot.svelte';
	import Navbar from '../lib/components/layout/Navbar.svelte';
	import Footer from '../lib/components/layout/Footer.svelte';

	let { children } = $props();
	let isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
	let isHomePage = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<meta name="theme-color" content="Canvas" />
</svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<Navbar />
	<div class="home-background-page" class:active={isHomePage}>
		<div class="site-shell" class:home-shell={isHomePage}>
		<div class:home-content-shell={isHomePage}>
		<main id="main-content" tabindex="-1">
			{@render children()}
		</main>
		<Footer />
		<Chatbot />
		</div>
	</div>
	</div>
{/if}

<style>
	.site-shell { width: min(calc(100% - 2 * var(--page-gutter)), var(--page-max)); margin: 0 auto; }
	.home-background-page.active { position: relative; display: flow-root; isolation: isolate; min-height: 100vh; overflow: clip; background: #fff; }
	.site-shell.home-shell { position: relative; z-index: 1; }
	.site-shell.home-shell > .home-content-shell { position: relative; z-index: 1; }
	main:focus { outline: none; }
</style>
