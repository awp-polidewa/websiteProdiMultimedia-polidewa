<script>
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
</script>

<svelte:head>
	<title>Berita Prodi — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Berita dan aktivitas terbaru Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<PageIntro section="Publikasi · 03" title="Berita prodi" description="Berita dan aktivitas terbaru Program Studi Teknologi Rekayasa Multimedia." />

<section class="news-layout section-rule" aria-labelledby="news-list-title">
	<div class="news-heading">
		<p class="eyebrow">Arsip publikasi</p>
		<h2 id="news-list-title" class="section-heading">Terbaru</h2>
	</div>
	<div class="news-content">
		<EmptyState label="Belum ada berita yang dipublikasikan." message="Berita resmi program studi akan muncul di sini setelah diterbitkan." />
	</div>
</section>

<style>
	.news-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding: 1.2rem 0 var(--space-section); }
	.news-heading .eyebrow { margin: 0 0 .85rem; opacity: .65; }
	.news-content { max-width: 780px; }
	@media (max-width: 700px) { .news-layout { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
