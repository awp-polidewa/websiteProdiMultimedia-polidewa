<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import politeknikDewantaraLogo from '../../assets/politeknik-dewantara.png';

	const publicLinks = [
		{ href: '/profil', label: 'profil' },
		{ href: '/struktur', label: 'Struktur' },
		{ href: '/berita', label: 'Berita' },
		{ href: '/karya', label: 'Karya' },
		{ href: '/akreditasi', label: 'Akreditasi' }
	];

	let hasScrolled = $state(false);
	let menuOpen = $state(false);
	let isMobileViewport = $state(false);
	let navbarHeight = $state(/** @type {number | null} */ (null));
	let headerElement = $state(/** @type {HTMLElement | null} */ (null));

	onMount(() => {
		const updateScrollState = () => {
			hasScrolled = window.scrollY > (isMobileViewport ? 20 : 50);
		};
		const updateNavbarHeight = () => {
			if (headerElement) navbarHeight = Math.ceil(headerElement.getBoundingClientRect().bottom);
		};

		updateScrollState();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		const mobileBreakpoint = window.matchMedia('(max-width: 900px)');
		const updateMobileViewport = () => {
			isMobileViewport = mobileBreakpoint.matches;
			updateScrollState();
			if (!isMobileViewport) menuOpen = false;
		};
		mobileBreakpoint.addEventListener('change', updateMobileViewport);
		updateMobileViewport();

		const resizeObserver = new ResizeObserver(updateNavbarHeight);
		if (headerElement) resizeObserver.observe(headerElement);
		updateNavbarHeight();

		return () => {
			window.removeEventListener('scroll', updateScrollState);
			mobileBreakpoint.removeEventListener('change', updateMobileViewport);
			resizeObserver.disconnect();
		};
	});
</script>

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="navbar-spacer" class:home-route={page.url.pathname === '/'} style:height={navbarHeight === null ? undefined : `${navbarHeight}px`} aria-hidden="true"></div>
<header bind:this={headerElement} class="site-header" class:scrolled={hasScrolled} class:menu-open={menuOpen}>
	<div class="header-top-row">
		<a class="wordmark" href="/" aria-label="TRM — Beranda">
			<img src={politeknikDewantaraLogo} alt="" />
			<span class="program-name">{isMobileViewport ? 'TRM' : 'TEKNOLOGI REKAYASA MULTIMEDIA'}</span>
		</a>
		<button
			class="menu-toggle"
			type="button"
			aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
			aria-expanded={menuOpen}
			aria-controls="public-navigation"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span class="hamburger-icon" class:open={menuOpen} aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</span>
		</button>
	</div>
	<nav
		id="public-navigation"
		aria-label="Navigasi utama"
		aria-hidden={isMobileViewport && !menuOpen}
		inert={isMobileViewport && !menuOpen}
		class:menu-open={menuOpen}
	>
		<ul>
			{#each publicLinks as link (link.href)}
				<li><a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined} onclick={() => (menuOpen = false)}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.navbar-spacer { height: 73px; }
	.navbar-spacer.home-route { display: none; }
	.site-header { position: fixed; z-index: 40; isolation: isolate; top: 19px; left: 50%; width: min(calc(100% - 40px), 1079.38px); box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; border: 0; border-radius: 200px; background: rgb(255 255 255 / 72%); color: #000000; box-shadow: none; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transform: translateX(-50%); transition: border-radius .3s ease, box-shadow 250ms ease; }
	.site-header.scrolled { box-shadow: 0px 4px 6.4px rgba(0, 0, 0, 0.25); }
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.site-header { background: rgb(255 255 255 / 96%); }
	}
	.header-top-row { display: contents; }
	.wordmark { display: inline-flex; max-width: 100%; flex: 0 1 auto; align-items: center; gap: 10.377px; color: #000000; text-decoration: none; }
	.wordmark img { display: block; width: 34px; height: 34px; flex: 0 0 34px; object-fit: contain; }
	.program-name { min-width: 0; font: 500 18px/normal 'Inter', sans-serif; }
	.menu-toggle { display: none; }
	.site-header nav { position: relative; z-index: 1; flex: 0 1 auto; }
	.site-header nav ul { display: flex; flex-wrap: wrap; justify-content: end; gap: .25rem 40px; margin: 0; padding: 0; list-style: none; }
	.site-header nav a { display: inline-flex; align-items: center; min-height: 34px; color: #000000; font: 400 16px/normal 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: 1; transition: opacity var(--motion-fast) var(--ease-out); }
	.site-header nav a:hover, .site-header nav a:focus-visible, .site-header nav a[aria-current='page'] { opacity: 1; text-decoration: underline; }
	.skip-link { position: absolute; z-index: 50; top: .75rem; left: var(--page-gutter); padding: .7rem 1rem; background: #fff; color: #000000; transform: translateY(-180%); transition: transform var(--motion-fast) var(--ease-out); }
	.skip-link:focus { transform: translateY(0); }
	@media (max-width: 900px) {
		.navbar-spacer { height: 64px; }
		.site-header { top: 0; left: 0; width: 100%; max-width: none; align-items: stretch; flex-direction: column; justify-content: center; gap: 0; padding: calc(10px + env(safe-area-inset-top, 0px)) max(20px, env(safe-area-inset-right, 0px)) 10px max(20px, env(safe-area-inset-left, 0px)); border-radius: 0; box-shadow: none; transform: none; transition: padding 220ms ease, box-shadow 220ms ease; }
		.site-header.scrolled { padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-left: max(16px, env(safe-area-inset-left, 0px)); box-shadow: 0 3px 12px rgb(0 0 0 / 8%); }
		.site-header.menu-open { border-radius: 0; }
		.header-top-row { display: flex; width: 100%; min-width: 0; align-items: center; justify-content: space-between; gap: .5rem; }
		.wordmark { min-width: 0; flex: 1 1 auto; }
		.menu-toggle { position: relative; z-index: 2; display: inline-grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #000000; cursor: pointer; }
		.menu-toggle:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
		.hamburger-icon { position: relative; display: block; width: 24px; height: 18px; }
		.hamburger-icon span { position: absolute; left: 0; display: block; width: 24px; height: 2px; border-radius: 2px; background: currentColor; transform-origin: center; transition: top .3s ease, transform .3s ease, opacity .3s ease; }
		.hamburger-icon span:nth-child(1) { top: 0; }
		.hamburger-icon span:nth-child(2) { top: 8px; }
		.hamburger-icon span:nth-child(3) { top: 16px; }
		.hamburger-icon.open span:nth-child(1) { top: 8px; transform: rotate(45deg); }
		.hamburger-icon.open span:nth-child(2) { opacity: 0; transform: scaleX(.4); }
		.hamburger-icon.open span:nth-child(3) { top: 8px; transform: rotate(-45deg); }
		.site-header nav a { min-height: 44px; }
		.site-header nav { max-height: 0; overflow: hidden; padding-top: 0; opacity: 0; pointer-events: none; transform: translateY(-8px); visibility: hidden; transition: max-height .3s ease, opacity .3s ease, padding-top .3s ease, transform .3s ease, visibility 0s linear .3s; }
		.site-header nav.menu-open { max-height: min(320px, calc(100dvh - 100px)); overflow-y: auto; padding-top: 8px; opacity: 1; pointer-events: auto; transform: translateY(0); visibility: visible; transition: max-height .3s ease, opacity .3s ease, padding-top .3s ease, transform .3s ease, visibility 0s; }
		.site-header nav ul { flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 0; }
		.site-header nav a { width: 100%; }
		.program-name { overflow: hidden; white-space: nowrap; }
	}
	@media (max-width: 420px) {
		.navbar-spacer { height: 64px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.menu-toggle *, .site-header, .site-header nav { transition: none !important; }
	}
</style>
