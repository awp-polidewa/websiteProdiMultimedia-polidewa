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

	let hasScrolled = $state(false);

	onMount(() => {
		const updateScrollState = () => {
			hasScrolled = window.scrollY > 50;
		};

		updateScrollState();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollState);
	});
</script>

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="navbar-spacer" aria-hidden="true"></div>
<header class="site-header" class:scrolled={hasScrolled}>
	<a class="wordmark" href="/" aria-label="TRM — Beranda">
		<img src={politeknikDewantaraLogo} alt="" />
		<span class="brand-copy"><span class="institution-name">POLITEKNIK DEWANTARA</span><span class="program-name">TEKNOLOGI REKAYASA MULTIMEDIA</span></span>
	</a>
	<nav aria-label="Navigasi utama">
		<ul>
			{#each publicLinks as link (link.href)}
				<li><a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.navbar-spacer { height: 116px; }
	.site-header { position: fixed; z-index: 20; inset: 0 0 auto; width: 100%; min-height: 116px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 0 var(--page-gutter); border-bottom: 1px solid rgb(49 49 49 / 6%); background: rgb(255 255 255 / 84%); color: #313131; box-shadow: none; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: box-shadow 250ms ease; }
	.site-header.scrolled { box-shadow: 0px 4px 6.4px rgba(0, 0, 0, 0.10); }
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.site-header { background: #fff; }
	}
	.wordmark { display: inline-flex; flex: 0 1 auto; align-items: center; gap: .75rem; color: #313131; text-decoration: none; }
	.wordmark img { display: block; width: 34px; height: 34px; flex: 0 0 34px; object-fit: contain; }
	.brand-copy { display: flex; flex-direction: column; gap: .18rem; min-width: 0; }
	.institution-name { font: 500 .68rem/1.15 'Inter', sans-serif; letter-spacing: .07em; }
	.program-name { font: 500 18px/1.2 'Inter', sans-serif; letter-spacing: -.025em; }
	.site-header nav { flex: 0 1 auto; }
	.site-header nav ul { display: flex; flex-wrap: wrap; justify-content: end; gap: .25rem clamp(1.25rem, 2.5vw, 2.25rem); margin: 0; padding: 0; list-style: none; }
	.site-header nav a { display: inline-flex; align-items: center; min-height: 44px; color: #313131; font: 400 16px/1.4 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: .82; transition: opacity var(--motion-fast) var(--ease-out); }
	.site-header nav a:hover, .site-header nav a:focus-visible, .site-header nav a[aria-current='page'] { opacity: 1; text-decoration: underline; }
	.skip-link { position: absolute; z-index: 100; top: .75rem; left: var(--page-gutter); padding: .7rem 1rem; background: #fff; color: #313131; transform: translateY(-180%); transition: transform var(--motion-fast) var(--ease-out); }
	.skip-link:focus { transform: translateY(0); }
	@media (max-width: 900px) {
		.navbar-spacer { height: 136px; }
		.site-header { min-height: 136px; align-items: flex-start; flex-direction: column; justify-content: center; gap: .2rem; padding: .65rem var(--page-gutter); }
		.wordmark { gap: .55rem; }
		.site-header nav { width: 100%; }
		.site-header nav ul { justify-content: flex-start; gap: .1rem clamp(.75rem, 3vw, 1.25rem); }
	}
	@media (max-width: 420px) {
		.navbar-spacer { height: 128px; }
		.site-header { min-height: 128px; gap: .1rem; }
		.program-name { font-size: clamp(14px, 4.2vw, 17px); }
		.institution-name { font-size: .62rem; }
		.site-header nav ul { gap: .1rem clamp(.5rem, 2.5vw, .75rem); }
		.site-header nav a { font-size: 14px; }
	}
</style>
