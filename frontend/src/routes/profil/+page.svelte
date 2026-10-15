<script>
	import PageIntro from '../../lib/PageIntro.svelte';
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Profil TRM Polidewa | Politeknik Dewantara" description="Profil Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara, meliputi informasi program studi dan kegiatan pembelajaran." canonicalPath="/profil" />

<PageIntro section="Tentang TRM · 01" title="Teknologi Rekayasa Multimedia" description="Program Studi Teknologi Rekayasa Multimedia di Politeknik Dewantara." />

<section class="overview section-rule">
	<p class="eyebrow">Mengenal program studi</p>
	<div class="overview-copy">
		<h2 class="section-heading">Informasi program studi dalam satu tempat.</h2>
		<p>Website ini menjadi pusat informasi profil, struktur dosen, berita, karya mahasiswa, serta informasi akreditasi Program Studi Teknologi Rekayasa Multimedia.</p>
	</div>
</section>

<section class="fields" aria-labelledby="fields-heading">
	<div class="fields-heading"><p class="eyebrow">Struktur program</p><h2 id="fields-heading" class="section-heading">Bidang konsentrasi</h2></div>
	<ol>
		<li><span>01</span><strong>Web Design</strong><a href="/struktur" aria-label="Lihat struktur dosen Web Design">↗</a></li>
		<li><span>02</span><strong>Desain Grafis</strong><a href="/struktur" aria-label="Lihat struktur dosen Desain Grafis">↗</a></li>
		<li><span>03</span><strong>Videografi</strong><a href="/struktur" aria-label="Lihat struktur dosen Videografi">↗</a></li>
	</ol>
</section>

<section class="official section-rule">
	<div><p class="eyebrow">Visi, misi & tujuan</p><h2 class="section-heading">Arah program studi</h2></div>
	<p class="official-note">Informasi visi, misi, dan tujuan akan dimuat setelah materi resmi diberikan atau diverifikasi oleh pihak program studi.</p>
</section>

<style>
	.overview { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding: 1.2rem 0 var(--space-section); }
	.overview > .eyebrow { margin: .25rem 0 0; opacity: .65; }
	.overview-copy { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; }
	.overview-copy h2 { max-width: 540px; }
	.overview-copy p { max-width: 410px; margin: 0; font: 400 .98rem/1.75 'Inter', sans-serif; opacity: .85; }
	.fields { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding-bottom: var(--space-section); }
	.fields-heading .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.fields ol { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
	.fields li { display: grid; grid-template-columns: 3rem 1fr auto; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--line); }
	.fields li span { font: 400 .75rem/1 'Inter', sans-serif; opacity: .62; }
	.fields li strong { font: 500 1.05rem/1.4 'Poppins', sans-serif; }
	.fields li a { font-size: 1rem; text-decoration: none; }
	.official { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem 0 var(--space-section); }
	.official .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.official-note { max-width: 500px; align-self: end; margin: 0; font: 400 .95rem/1.7 'Inter', sans-serif; opacity: .82; }
	@media (max-width: 760px) { .overview, .fields { grid-template-columns: 1fr; gap: 1.4rem; } .overview-copy { grid-template-columns: 1fr; gap: 1rem; } .official { grid-template-columns: 1fr; gap: 1rem; } }
</style>
