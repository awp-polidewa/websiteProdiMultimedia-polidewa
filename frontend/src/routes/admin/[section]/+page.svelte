<script>
	import { page } from '$app/state';

	/** @type {Record<string, string>} */
	const sectionNames = {
		berita: 'Berita',
		karya: 'Karya mahasiswa',
		dosen: 'Dosen',
		akreditasi: 'Akreditasi'
	};
	let section = $derived(page.params.section ?? '');
	let title = $derived(sectionNames[section] ?? 'Bagian tidak ditemukan');
</script>

<svelte:head>
	<title>{title} — Admin TRM</title>
</svelte:head>

<section class="placeholder" aria-labelledby="section-title">
	<p class="eyebrow">Pengelolaan konten</p>
	<h1 id="section-title">{title}</h1>
	{#if sectionNames[section]}
		<p>Area ini disiapkan untuk pengelolaan {title.toLowerCase()}. Antarmuka konten belum tersedia.</p>
	{:else}
		<p>Bagian admin yang diminta tidak tersedia.</p>
	{/if}
	<a href="/admin">Kembali ke dashboard</a>
</section>

<style>
	.placeholder { width: min(100%, 740px); margin: .5rem auto; }
	.eyebrow { margin: 0 0 .55rem; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	h1 { margin: 0; font: 500 clamp(1.6rem, 3vw, 1.85rem)/1.2 'Poppins', sans-serif; letter-spacing: -.035em; }
	p:not(.eyebrow) { max-width: 560px; margin: .7rem 0 1.2rem; font-size: .88rem; line-height: 1.65; opacity: .78; }
	a { display: inline-flex; min-height: 44px; align-items: center; font-size: .85rem; text-underline-offset: .25em; }
</style>
