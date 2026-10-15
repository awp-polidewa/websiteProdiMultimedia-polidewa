<script>
	import { onMount } from 'svelte';
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
	import { mediaUrl, requestApi } from '../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, description: string | null, filePath: string | null, fileUrl: string | null, sourceUrl: string | null, publishedAt: string | null }} AccreditationDocument */
	/** @type {AccreditationDocument[]} */
	let documents = $state([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let requestVersion = 0;

	onMount(() => { void loadDocuments(); });

	async function loadDocuments() {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		try {
			const response = await requestApi('accreditation-documents');
			if (version !== requestVersion) return;
			documents = Array.isArray(response?.data) ? response.data : [];
		} catch (error) {
			if (version === requestVersion) errorMessage = error instanceof Error ? error.message : 'Dokumen akreditasi belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {string | null} value */
	function formatDate(value) {
		if (!value) return null;
		const date = new Date(`${value}T00:00:00+08:00`);
		if (Number.isNaN(date.getTime())) return null;
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Akreditasi TRM | Politeknik Dewantara" description="Informasi status dan dokumen akreditasi resmi Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara." canonicalPath="/akreditasi" />

<PageIntro section="Informasi resmi · 05" title="Akreditasi" description="Informasi status dan dokumen akreditasi Program Studi Teknologi Rekayasa Multimedia." />

<section class="accreditation section-rule" aria-labelledby="status-title">
	<div class="status-heading"><p class="eyebrow">Status program studi</p><h2 id="status-title" class="section-heading">Informasi akreditasi</h2></div>
	<div class="status-content"><EmptyState label="Informasi resmi belum tersedia." message="Status akreditasi hanya akan ditampilkan setelah sumber resmi diterima dan diverifikasi oleh program studi." /></div>
</section>

<section class="documents" aria-labelledby="documents-title">
	<div class="documents-heading"><p class="eyebrow">Dokumen resmi</p><h2 id="documents-title" class="section-heading">PDF akreditasi</h2></div>
	<div class="documents-content">
		{#if loading}
			<p class="state" role="status" aria-live="polite">Memuat dokumen akreditasi…</p>
		{:else if errorMessage}
			<div class="error-state" role="alert"><p class="state-title">Dokumen belum dapat dimuat.</p><p>{errorMessage}</p><button type="button" class="retry-button" onclick={loadDocuments}>Coba lagi</button></div>
		{:else if documents.length === 0}
			<EmptyState label="Belum ada PDF untuk ditampilkan." message="Surat keterangan akreditasi ditampilkan sebagai PDF resmi setelah dokumennya tersedia. Website tidak membuat isi surat secara otomatis." />
		{:else}
			<ul class="document-list">
				{#each documents as document (document.id)}
					<li class="document-item"><div class="document-copy"><h3>{document.title}</h3>{#if document.description}<p>{document.description}</p>{/if}{#if formatDate(document.publishedAt)}<time datetime={document.publishedAt}>{formatDate(document.publishedAt)}</time>{/if}</div><div class="document-links">{#if document.filePath}<a class="text-link" href={mediaUrl(document.filePath)} target="_blank" rel="noreferrer">Lihat PDF <span aria-hidden="true">↗</span></a>{/if}{#if document.sourceUrl}<a class="source-link" href={document.sourceUrl} target="_blank" rel="noreferrer">Sumber <span aria-hidden="true">↗</span></a>{/if}{#if !document.filePath && !document.sourceUrl}<span class="file-unavailable">File belum tersedia</span>{/if}</div></li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.accreditation { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; padding: 1.4rem 0 var(--space-section); }
	.status-heading .eyebrow, .documents-heading .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.documents { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; padding: 2rem 0 var(--space-section); border-top: 1px solid var(--line); }
	.documents-content { min-width: 0; max-width: 700px; }
	.state { margin: 0; padding: 1rem 0; border-top: 1px solid var(--line); font-size: .9rem; line-height: 1.6; }
	.error-state { padding: 1rem 0; border-top: 1px solid var(--line); }
	.error-state p { margin: .35rem 0 .8rem; font-size: .88rem; line-height: 1.6; }
	.error-state .state-title { font-weight: 500; }
	.retry-button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .82rem/1 'Inter', sans-serif; cursor: pointer; }
	.retry-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.document-list { margin: 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
	.document-item { display: flex; align-items: start; justify-content: space-between; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid var(--line); }
	.document-copy { min-width: 0; }
	.document-copy h3 { margin: 0; font: 500 1rem/1.4 'Poppins', sans-serif; }
	.document-copy p { margin: .35rem 0; font-size: .84rem; line-height: 1.6; opacity: .78; }
	.document-copy time { font-size: .74rem; opacity: .64; }
	.document-links { display: grid; justify-items: end; gap: .45rem; flex: 0 0 auto; }
	.document-links .text-link { font-size: .82rem; }
	.source-link { font-size: .75rem; text-underline-offset: .2em; }
	.file-unavailable { font-size: .72rem; opacity: .65; text-align: right; }
	@media (max-width: 700px) { .accreditation, .documents { grid-template-columns: 1fr; gap: 1.5rem; } .document-item { flex-direction: column; gap: .75rem; } .document-links { display: flex; align-items: center; flex-wrap: wrap; justify-items: start; } .file-unavailable { text-align: left; } }
</style>
