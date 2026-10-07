<svelte:head>
	<title>Teknologi Rekayasa Multimedia — Politeknik Dewantara</title>
	<meta name="description" content="Pusat informasi dan publikasi Program Studi Teknologi Rekayasa Multimedia Politeknik Dewantara." />
</svelte:head>

<script>
	import OvalDotsBackground from '../lib/OvalDotsBackground.svelte';

	const heroLineOne = Array.from('Teknologi Rekayasa');
	const heroLineTwo = Array.from('Multimedia');
</script>

<div class="home-page">
<OvalDotsBackground />
<div class="home-content">
<section class="hero" aria-labelledby="home-title">
	<div class="hero-label"><p>Politeknik Dewantara</p><span>Program Studi</span></div>
	<h1 id="home-title">
		<span class="visually-hidden">Teknologi Rekayasa Multimedia</span>
		<span class="hero-line" aria-hidden="true">{#each heroLineOne as character}{#if character === ' '}{' '}{:else}<span class="hero-character">{character}</span>{/if}{/each}</span>
		<span class="hero-line" aria-hidden="true">{#each heroLineTwo as character}<span class="hero-character">{character}</span>{/each}</span>
	</h1>
	<div class="hero-bottom">
		<p class="intro">Pusat informasi program studi, aktivitas, dan karya mahasiswa TRM</p>
		<div class="hero-actions">
			<a class="primary-action" href="https://wa.me/62887436943503" target="_blank" rel="noreferrer">Daftar Polidewa</a>
			<a class="secondary-action" href="/profil">Tentang Program Studi</a>
		</div>
	</div>
</section>

<section class="disciplines section-rule" aria-labelledby="disciplines-title">
	<div class="section-top"><p class="eyebrow">Program studi</p><p class="section-index">01 — 03</p></div>
	<div class="discipline-intro">
		<h2 id="disciplines-title" class="section-heading">Bidang dalam struktur prodi</h2>
		<p>Jelajahi informasi resmi mengenai struktur dosen dan konsentrasi yang tersedia.</p>
	</div>
	<div class="discipline-list">
		<a href="/struktur"><span>01</span><strong>Web Design</strong><span aria-hidden="true">↗</span></a>
		<a href="/struktur"><span>02</span><strong>Desain Grafis</strong><span aria-hidden="true">↗</span></a>
		<a href="/struktur"><span>03</span><strong>Videografi</strong><span aria-hidden="true">↗</span></a>
	</div>
</section>

<section class="latest section-rule" aria-label="Berita dan karya mahasiswa">
	<div class="latest-panel">
		<div class="section-top"><p class="eyebrow">Publikasi</p><span class="section-index">02</span></div>
		<h2 class="section-heading">Berita prodi</h2>
		<p class="latest-copy">Aktivitas dan kabar terbaru dari Program Studi TRM.</p>
		<p class="empty-note">Belum ada berita yang dipublikasikan.</p>
		<a class="text-link" href="/berita">Semua berita <span aria-hidden="true">↗</span></a>
	</div>
	<div class="latest-panel">
		<div class="section-top"><p class="eyebrow">Showcase</p><span class="section-index">03</span></div>
		<h2 class="section-heading">Karya mahasiswa</h2>
		<p class="latest-copy">Project mahasiswa dalam bidang multimedia.</p>
		<p class="empty-note">Belum ada karya yang dipublikasikan.</p>
		<a class="text-link" href="/karya">Lihat showcase <span aria-hidden="true">↗</span></a>
	</div>
</section>

<section class="accreditation-band">
	<div><p class="eyebrow">Informasi resmi</p><h2 class="section-heading">Akreditasi</h2></div>
	<p>Dokumen dan informasi akreditasi tersedia melalui halaman khusus.</p>
	<a class="text-link" href="/akreditasi">Lihat informasi <span aria-hidden="true">↗</span></a>
</section>
</div>
</div>

<style>
	.home-page { position: relative; isolation: isolate; text-align: center; background: transparent; }
	.home-content { position: relative; z-index: 1; }
	.hero { position: relative; min-height: min(680px, 78vh); display: flex; align-items: center; flex-direction: column; justify-content: center; padding: clamp(4rem, 8vw, 7rem) 0; }
	.hero-label { display: flex; align-items: baseline; justify-content: center; gap: 1rem; }
	.hero-label p { margin: 0; font: 500 25px/1.35 'Inter', sans-serif; }
	.hero-label span { font: 400 18px/1.4 'Inter', sans-serif; opacity: .72; }
	h1 { max-width: 1120px; margin: 1.5rem 0 1.2rem; font: 600 clamp(2.6rem, 4.45vw, 4rem)/1.08 'Inter', sans-serif; letter-spacing: -.045em; text-wrap: balance; }
	h1 > .hero-line { display: block; white-space: nowrap; }
	.hero-character { display: inline-block; transform-origin: 50% 70%; }
	/* Character color remains unchanged until the controlled palette in 02-desain.md is approved. */
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.hero-character:hover { animation: hero-wobble var(--motion-normal) var(--ease-out) both; }
	}
	@keyframes hero-wobble {
		0%, 100% { transform: rotate(0); }
		35% { transform: rotate(calc(var(--hero-wobble) * -1)); }
		70% { transform: rotate(var(--hero-wobble)); }
	}
	.hero-bottom { display: flex; align-items: center; flex-direction: column; gap: 1.6rem; max-width: 790px; padding: 0 1rem; }
	.intro { max-width: 680px; margin: 0; font: 500 clamp(1rem, 1.4vw, 1.25rem)/1.65 'Inter', sans-serif; opacity: .86; }
	.hero-actions { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: .85rem; }
	.primary-action, .secondary-action { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; padding: 12px 25px; border-radius: 34px; font: 500 16px/1.4 'Inter', sans-serif; text-decoration: none; transition: background-color var(--motion-fast) var(--ease-out), color var(--motion-fast) var(--ease-out), transform var(--motion-fast) var(--ease-out); }
	.primary-action { color: #fff; background: #3A41FB; }
	.primary-action:hover { background: #2d34df; transform: translateY(-1px); }
	.secondary-action { color: #000; background: transparent; border: 1px solid #000; }
	.secondary-action:hover { color: #fff; background: #000; }
	.primary-action:focus-visible, .secondary-action:focus-visible { outline: 2px solid #000; outline-offset: 3px; }
	.disciplines { padding: 1rem 0 var(--space-section); }
	.section-top { display: flex; justify-content: center; gap: 1rem; margin: 0 0 2.5rem; }
	.section-top .eyebrow { margin: 0; opacity: .65; }
	.section-index { margin: 0; font: 400 .72rem/1.4 'Inter', sans-serif; opacity: .65; }
	.discipline-intro { display: grid; grid-template-columns: 1fr; justify-items: center; gap: .9rem; margin: 0 0 2.5rem; }
	.discipline-intro p { max-width: 600px; margin: 0; font: 400 .95rem/1.7 'Inter', sans-serif; opacity: .82; }
	.discipline-list { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); }
	.discipline-list a { display: grid; grid-template-columns: 1fr auto; justify-items: center; gap: 2.6rem .6rem; padding: 1rem 1.25rem 1.1rem 0; text-decoration: none; border-bottom: 1px solid var(--line); }
	.discipline-list a + a { padding-left: 1.2rem; border-left: 1px solid var(--line); }
	.discipline-list span:first-child { grid-column: 1 / -1; font: 400 .72rem/1 'Inter', sans-serif; opacity: .62; }
	.discipline-list strong { font: 500 1.1rem/1.35 'Poppins', sans-serif; }
	.discipline-list span:last-child { align-self: end; }
	.latest { display: grid; grid-template-columns: 1fr 1fr; padding: var(--space-section) 0; }
	.latest-panel { min-height: 315px; display: flex; align-items: center; flex-direction: column; padding: 0 2.2rem 0 0; }
	.latest-panel + .latest-panel { padding: 0 0 0 2.2rem; border-left: 1px solid var(--line); }
	.latest-panel .section-top { width: 100%; margin-bottom: 2rem; }
	.latest-panel .section-heading { margin-bottom: .7rem; }
	.latest-copy { margin: 0; font: 400 .9rem/1.65 'Inter', sans-serif; opacity: .82; }
	.empty-note { width: 100%; margin: auto 0 1.6rem; padding-top: 1rem; border-top: 1px solid var(--line); font: 400 .88rem/1.6 'Inter', sans-serif; opacity: .75; }
	.latest-panel .text-link { margin-top: 0; }
	.accreditation-band { display: grid; grid-template-columns: 1fr; justify-items: center; gap: 1rem; padding: 2.25rem 0 var(--space-section); border-top: 1px solid var(--line); }
	.accreditation-band .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.accreditation-band p:not(.eyebrow) { max-width: 370px; margin: 0; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	@media (max-width: 700px) {
		.hero { min-height: auto; padding: 6rem 0 5rem; }
		.hero-label p { font-size: clamp(1.15rem, 5vw, 1.5rem); }
		.hero-label span { font-size: .95rem; }
		h1 { font-size: clamp(1.8rem, 8.4vw, 3.4rem); }
		.hero-bottom { align-items: center; }
		.section-top { margin-bottom: 1.6rem; }
		.discipline-intro { grid-template-columns: 1fr; gap: .9rem; }
		.discipline-list { grid-template-columns: 1fr; }
		.discipline-list a, .discipline-list a + a { grid-template-columns: 2.4rem 1fr auto; align-items: center; gap: 1rem; padding: 1rem 0; border-left: 0; }
		.discipline-list span:first-child { grid-column: auto; }
		.latest { grid-template-columns: 1fr; }
		.latest-panel { min-height: 290px; padding: 0 0 2.5rem; }
		.latest-panel + .latest-panel { padding: 2.5rem 0; border-top: 1px solid var(--line); border-left: 0; }
		.accreditation-band { grid-template-columns: 1fr; align-items: start; gap: 1rem; }
	}
	@media (max-width: 420px) {
		.hero-label { align-items: center; flex-direction: column; gap: .15rem; }
		.hero-label p { font-size: 1.2rem; }
		.hero-label span { font-size: .9rem; }
		.hero-actions { width: 100%; flex-direction: column; }
		.primary-action, .secondary-action { width: min(100%, 280px); box-sizing: border-box; }
	}
</style>
