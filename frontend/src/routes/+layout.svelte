<script>
	import '../app.css';
	import { page } from '$app/state';

	const publicLinks = [
		{ href: '/profil', label: 'Profil' },
		{ href: '/struktur', label: 'Struktur' },
		{ href: '/berita', label: 'Berita' },
		{ href: '/karya', label: 'Karya' },
		{ href: '/akreditasi', label: 'Akreditasi' }
	];

	let { children } = $props();
	let isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:head>
	<meta name="theme-color" content="Canvas" />
</svelte:head>

{#if isAdminRoute}
	{@render children()}
{:else}
	<div class="site-shell">
		<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
		<header class="site-header">
			<a class="wordmark" href="/" aria-label="TRM — Beranda">TRM<span> / POLITEKNIK DEWANTARA</span></a>
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
	</div>
{/if}

<style>
	.site-shell { width: min(calc(100% - 2 * var(--page-gutter)), var(--page-max)); margin: 0 auto; }
	.skip-link { position: absolute; z-index: 10; top: .75rem; left: var(--page-gutter); padding: .7rem 1rem; background: Canvas; color: CanvasText; transform: translateY(-180%); transition: transform var(--motion-fast) var(--ease-out); }
	.skip-link:focus { transform: translateY(0); }
	.site-header { min-height: 84px; display: flex; align-items: center; justify-content: space-between; gap: 2rem; border-bottom: 1px solid var(--line); }
	.wordmark { display: inline-flex; align-items: baseline; gap: .55rem; font: 600 1rem/1 'Poppins', sans-serif; letter-spacing: -.035em; text-decoration: none; white-space: nowrap; }
	.wordmark span { font: 500 .61rem/1 'Inter', sans-serif; letter-spacing: .09em; }
	nav ul { display: flex; flex-wrap: wrap; justify-content: end; gap: .25rem clamp(.8rem, 2.2vw, 2rem); margin: 0; padding: 0; list-style: none; }
	nav a { display: inline-flex; align-items: center; min-height: 44px; font: 400 .82rem/1.4 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: .82; transition: opacity var(--motion-fast) var(--ease-out); }
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
		nav ul { justify-content: start; gap: .1rem .65rem; }
		nav a { font-size: .76rem; }
		.site-footer { grid-template-columns: 1fr 1fr; gap: 2rem 1rem; padding: 2.5rem 0; }
		.footer-brand { grid-column: 1 / -1; }
	}
	@media (max-width: 420px) { .wordmark span { font-size: .54rem; } .site-header nav a { font-size: .72rem; } .footer-bottom { flex-direction: column; gap: .25rem; } }
</style>
