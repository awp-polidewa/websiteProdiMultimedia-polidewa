<script>
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
</script>

<svelte:head>
	<title>Karya Mahasiswa — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Showcase karya dan project mahasiswa Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<PageIntro section="Showcase · 04" title="Karya mahasiswa" description="Project mahasiswa dalam bidang multimedia, dipublikasikan sebagai showcase Program Studi TRM." />

<section class="showcase section-rule" aria-labelledby="showcase-title">
	<div class="showcase-aside">
		<p class="eyebrow">Galeri project</p>
		<p class="showcase-note">Karya ditampilkan dengan gambar utama dan kategori sesuai informasi yang tersedia.</p>
	</div>
	<div class="showcase-main">
		<h2 id="showcase-title" class="section-heading">Eksplorasi multimedia</h2>
		<EmptyState label="Belum ada karya yang dipublikasikan." message="Karya mahasiswa akan muncul di sini setelah materi dan gambar project tersedia." />
	</div>
</section>

<style>
	.showcase { display: grid; grid-template-columns: .78fr 1.22fr; gap: 3rem; padding: 1.3rem 0 var(--space-section); }
	.showcase-aside { display: flex; flex-direction: column; align-items: start; }
	.showcase-aside .eyebrow { margin: 0 0 1.2rem; opacity: .65; }
	.showcase-note { max-width: 260px; margin: auto 0 0; padding-top: 2.5rem; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	.showcase-main h2 { margin: 0 0 2rem; }
	@media (max-width: 700px) {
		.showcase { grid-template-columns: 1fr; gap: 2.5rem; }
		.showcase-note { max-width: 420px; margin: 0; padding: 0; }
	}
</style>
