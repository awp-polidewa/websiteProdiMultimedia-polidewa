<script>
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
</script>

<svelte:head>
	<title>Akreditasi — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Informasi dan dokumen akreditasi resmi Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<PageIntro section="Informasi resmi · 05" title="Akreditasi" description="Informasi status dan dokumen akreditasi Program Studi Teknologi Rekayasa Multimedia." />

<section class="accreditation section-rule" aria-labelledby="status-title">
	<div class="status-heading">
		<p class="eyebrow">Status program studi</p>
		<h2 id="status-title" class="section-heading">Informasi akreditasi</h2>
	</div>
	<div class="status-content">
		<EmptyState label="Informasi resmi belum tersedia." message="Status akreditasi hanya akan ditampilkan setelah sumber resmi diterima dan diverifikasi oleh program studi." />
	</div>
</section>

<section class="documents" aria-labelledby="documents-title">
	<div class="documents-heading"><p class="eyebrow">Dokumen resmi</p><h2 id="documents-title" class="section-heading">PDF akreditasi</h2></div>
	<div class="documents-content">
		<EmptyState label="Belum ada PDF untuk ditampilkan." message="Surat keterangan akreditasi ditampilkan sebagai PDF resmi setelah dokumennya tersedia. Website tidak membuat isi surat secara otomatis." />
	</div>
</section>

<style>
	.accreditation { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; padding: 1.4rem 0 var(--space-section); }
	.status-heading .eyebrow, .documents-heading .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.documents { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; padding: 2rem 0 var(--space-section); border-top: 1px solid var(--line); }
	.documents-content { max-width: 700px; }
	@media (max-width: 700px) { .accreditation, .documents { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
