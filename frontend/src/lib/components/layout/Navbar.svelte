<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import politeknikDewantaraLogo from '../../assets/politeknik-dewantara.png';

	const publicLinks = [
		{ href: '/profil', label: 'Profil' },
		{ href: '/struktur', label: 'Struktur' },
		{ href: '/berita', label: 'Berita' },
		{ href: '/karya', label: 'Karya' },
		{ href: '/akreditasi', label: 'Akreditasi' }
	];

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

<style>
	.site-header { position: sticky; z-index: 20; top: 19px; width: min(100%, 1183px); min-height: 97px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin: 19px auto 0; padding: 9px 50px; border: 1px solid transparent; border-radius: 49px; background: transparent; box-shadow: none; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); transition: background-color 250ms ease, box-shadow 250ms ease, border-color 250ms ease; }
	.site-header.scrolled { border-color: rgb(0 0 0 / 5%); background: rgb(255 255 255 / 78%); box-shadow: 0 4px 16px rgb(0 0 0 / 6%); }
	.wordmark { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .7rem; font: 600 1rem/1 'Inter', sans-serif; letter-spacing: .06em; text-decoration: none; white-space: nowrap; }
	.wordmark img { display: block; width: 74px; height: 74px; object-fit: contain; }
	.wordmark span { font: 500 .82rem/1.2 'Inter', sans-serif; letter-spacing: .06em; }
	.site-header nav { flex: 0 1 auto; }
	.site-header nav ul { display: flex; flex-wrap: wrap; justify-content: end; gap: .25rem clamp(1.5rem, 3vw, 2.75rem); margin: 0; padding: 0; list-style: none; }
	nav a { display: inline-flex; align-items: center; min-height: 44px; font: 400 1rem/1.4 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: .82; transition: opacity var(--motion-fast) var(--ease-out); }
	nav a:hover, nav a:focus-visible, nav a[aria-current='page'] { opacity: 1; text-decoration: underline; }
	.skip-link { position: absolute; z-index: 10; top: .75rem; left: var(--page-gutter); padding: .7rem 1rem; background: Canvas; color: CanvasText; transform: translateY(-180%); transition: transform var(--motion-fast) var(--ease-out); }
	.skip-link:focus { transform: translateY(0); }
	@media (max-width: 780px) {
		.site-header { align-items: flex-start; flex-direction: column; justify-content: center; gap: 1.2rem; padding: 1.2rem 0; }
		nav { width: 100%; }
		.site-header { top: 10px; min-height: 0; gap: .65rem; margin-top: 10px; padding: .6rem .9rem; border-radius: 25px; }
		.wordmark { gap: .55rem; }
		.wordmark img { width: 51px; height: 51px; }
		.wordmark span { font-size: .72rem; }
		.site-header nav ul { justify-content: center; gap: .1rem .85rem; }
		.site-header nav a { font-size: .9rem; }
	}
	@media (max-width: 420px) {
		.site-header { align-items: flex-start; flex-direction: column; gap: .4rem; }
		.wordmark img { width: 43px; height: 43px; }
		.wordmark span { font-size: .67rem; }
		.site-header nav { width: 100%; }
		.site-header nav ul { justify-content: flex-start; gap: .1rem .65rem; }
		.site-header nav a { font-size: .82rem; }
	}
</style>
