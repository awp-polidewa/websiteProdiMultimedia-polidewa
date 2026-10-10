<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { page } from '$app/state';
	import Chatbot from '../lib/Chatbot.svelte';
	import politeknikDewantaraLogo from '../lib/assets/politeknik-dewantara.png';

	const publicLinks = [
		{ href: '/profil', label: 'Profil' },
		{ href: '/struktur', label: 'Struktur' },
		{ href: '/berita', label: 'Berita' },
		{ href: '/karya', label: 'Karya' },
		{ href: '/akreditasi', label: 'Akreditasi' }
	];

	let { children } = $props();
	let isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
	let isHomePage = $derived(page.url.pathname === '/');
	let hasScrolled = $state(false);

	onMount(() => {
		const updateScrollState = () => {
			hasScrolled = window.scrollY >= 50;
		};

		updateScrollState();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollState);
	});
</script>

<svelte:head>
	<meta name="theme-color" content="Canvas" />
</svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<div class="home-background-page" class:active={isHomePage}>
		<div class="site-shell" class:home-shell={isHomePage}>
		<div class:home-content-shell={isHomePage}>
		<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
		<header class="site-header" class:scrolled={isHomePage && hasScrolled}>
			<a class="wordmark" href="/" aria-label="TRM — Beranda"><img src={politeknikDewantaraLogo} alt="" /> <span>POLITEKNIK DEWANTARA</span></a>
			<nav aria-label="Navigasi utama">
				<ul>
					{#each publicLinks as link (link.href)}
						<li><a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a></li>
					{/each}
				</ul>
			</nav>
		</header>
		<main id="main-content" tabindex="-1">
			{@render children()}
		</main>
		<footer class="site-footer">
			<div class="footer-brand">
				<a class="wordmark" href="/">TRM<span> / POLITEKNIK DEWANTARA</span></a>
				<p>Pusat informasi, publikasi, dan karya Program Studi Teknologi Rekayasa Multimedia.</p>
			</div>
			<nav class="footer-links" aria-label="Jelajahi">
				<p class="eyebrow">Jelajahi</p>
				<ul><li><a href="/profil">Profil</a></li><li><a href="/struktur">Struktur dosen</a></li><li><a href="/berita">Berita</a></li></ul>
			</nav>
			<nav class="footer-links" aria-label="Publikasi">
				<p class="eyebrow">Publikasi</p>
				<ul><li><a href="/karya">Karya mahasiswa</a></li><li><a href="/akreditasi">Akreditasi</a></li></ul>
			</nav>
		</footer>
		<div class="footer-bottom"><span>© Politeknik Dewantara</span><span>Program Studi Teknologi Rekayasa Multimedia</span></div>
		<Chatbot />
		</div>
	</div>
	</div>
{/if}

<style>
	.site-shell { width: min(calc(100% - 2 * var(--page-gutter)), var(--page-max)); margin: 0 auto; }
	.home-background-page.active { position: relative; display: flow-root; isolation: isolate; min-height: 100vh; overflow: hidden; background: #fff; }
	.site-shell.home-shell { position: relative; z-index: 1; }
	.site-shell.home-shell > .home-content-shell { position: relative; z-index: 1; }
	.skip-link { position: absolute; z-index: 10; top: .75rem; left: var(--page-gutter); padding: .7rem 1rem; background: Canvas; color: CanvasText; transform: translateY(-180%); transition: transform var(--motion-fast) var(--ease-out); }
	.skip-link:focus { transform: translateY(0); }
	.site-header { position: sticky; z-index: 20; top: 19px; width: min(100%, 1183px); min-height: 97px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin: 19px auto 0; padding: 9px 50px; border: 1px solid transparent; border-radius: 49px; background: transparent; box-shadow: none; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); transition: background-color 250ms ease, box-shadow 250ms ease, border-color 250ms ease; }
	.site-header.scrolled { border-color: rgb(0 0 0 / 5%); background: rgb(255 255 255 / 78%); box-shadow: 0 4px 16px rgb(0 0 0 / 6%); }
	.wordmark { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .7rem; font: 600 1rem/1 'Inter', sans-serif; letter-spacing: .06em; text-decoration: none; white-space: nowrap; }
	.wordmark img { display: block; width: 74px; height: 74px; object-fit: contain; }
	.wordmark span { font: 500 .82rem/1.2 'Inter', sans-serif; letter-spacing: .06em; }
	.site-header nav { flex: 0 1 auto; }
	.site-header nav ul { display: flex; flex-wrap: wrap; justify-content: end; gap: .25rem clamp(1.5rem, 3vw, 2.75rem); margin: 0; padding: 0; list-style: none; }
	nav a { display: inline-flex; align-items: center; min-height: 44px; font: 400 1rem/1.4 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: .82; transition: opacity var(--motion-fast) var(--ease-out); }
	nav a:hover, nav a:focus-visible, nav a[aria-current='page'] { opacity: 1; text-decoration: underline; }
	.site-footer { display: grid; grid-template-columns: minmax(240px, 2fr) 1fr 1fr; gap: 3rem; padding: 3.5rem 0; border-top: 1px solid var(--line); }
	.footer-brand p { max-width: 350px; margin: 1.1rem 0 0; font: 400 .88rem/1.7 'Inter', sans-serif; opacity: .78; }
	.footer-links { display: flex; flex-direction: column; align-items: start; gap: .4rem; }
	.footer-links .eyebrow { margin: 0; opacity: .62; }
	.footer-links ul { align-items: start; flex-direction: column; gap: 0; }
	.footer-links a { font: 400 .86rem/1.45 'Inter', sans-serif; text-decoration: none; }
	.footer-links a:hover, .footer-links a:focus-visible { text-decoration: underline; text-underline-offset: .3em; }
	main:focus { outline: none; }
	.footer-bottom { display: flex; justify-content: space-between; gap: 1rem; padding: 1.1rem 0 1.5rem; border-top: 1px solid var(--line); font: 400 .72rem/1.5 'Inter', sans-serif; opacity: .7; }
	@media (max-width: 780px) {
		.site-header { align-items: flex-start; flex-direction: column; justify-content: center; gap: 1.2rem; padding: 1.2rem 0; }
		nav { width: 100%; }
		.site-header { top: 10px; min-height: 0; gap: .65rem; margin-top: 10px; padding: .6rem .9rem; border-radius: 25px; }
		.wordmark { gap: .55rem; }
		.wordmark img { width: 51px; height: 51px; }
		.wordmark span { font-size: .72rem; }
		.site-header nav ul { justify-content: center; gap: .1rem .85rem; }
		.site-header nav a { font-size: .9rem; }
		.site-footer { grid-template-columns: 1fr 1fr; gap: 2rem 1rem; padding: 2.5rem 0; }
		.footer-brand { grid-column: 1 / -1; }
	}
	@media (max-width: 420px) { .site-header { align-items: flex-start; flex-direction: column; gap: .4rem; } .wordmark img { width: 43px; height: 43px; } .wordmark span { font-size: .67rem; } .site-header nav { width: 100%; } .site-header nav ul { justify-content: flex-start; gap: .1rem .65rem; } .site-header nav a { font-size: .82rem; } .footer-bottom { flex-direction: column; gap: .25rem; } }
</style>
