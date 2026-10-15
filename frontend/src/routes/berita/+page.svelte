<script>
	import { onMount } from 'svelte';
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
	import { mediaUrl, requestApi } from '../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, excerpt: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, publishedAt: string }} NewsItem */
	/** @type {NewsItem[]} */
	let items = $state([]);
	let page = $state(1);
	let totalPages = $state(0);
	let loading = $state(true);
	let errorMessage = $state('');
	let requestVersion = 0;

	onMount(() => { void loadNews(); });

	/** @param {number} requestedPage */
	async function loadNews(requestedPage = page) {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		try {
			const response = await requestApi(`news?page=${requestedPage}`);
			if (version !== requestVersion) return;
			items = Array.isArray(response?.data) ? response.data : [];
			page = Number(response?.meta?.page) || requestedPage;
			totalPages = Number(response?.meta?.totalPages) || 0;
		} catch (error) {
			if (version === requestVersion) errorMessage = error instanceof Error ? error.message : 'Berita belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {string} value */
	function formatDate(value) {
		const date = new Date(value);
		if (!value || Number.isNaN(date.getTime())) return 'Tanggal belum tersedia';
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Berita TRM Polidewa | Politeknik Dewantara" description="Berita, kegiatan, dan informasi terbaru Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara." canonicalPath="/berita" />

<PageIntro section="Publikasi · 03" title="Berita prodi" description="Berita dan aktivitas terbaru Program Studi Teknologi Rekayasa Multimedia." />

<section class="news-layout section-rule" aria-labelledby="news-list-title">
	<div class="news-heading"><p class="eyebrow">Arsip publikasi</p><h2 id="news-list-title" class="section-heading">Terbaru</h2></div>
	<div class="news-content">
		{#if loading}
			<p class="state" role="status" aria-live="polite">Memuat berita…</p>
		{:else if errorMessage}
			<div class="error-state" role="alert"><p class="state-title">Berita belum dapat dimuat.</p><p>{errorMessage}</p><button class="retry-button" type="button" onclick={() => loadNews(page)}>Coba lagi</button></div>
		{:else if items.length === 0}
			<EmptyState label="Belum ada berita yang dipublikasikan." message="Berita resmi program studi akan muncul di sini setelah diterbitkan." />
		{:else}
			<div class="news-list">
				{#each items as item (item.id)}
					<article class="news-item">
						{#if item.thumbnailPath}<a class="thumbnail-link" href={`/berita/${encodeURIComponent(item.slug)}`} tabindex="-1" aria-hidden="true"><img src={mediaUrl(item.thumbnailPath)} alt="" loading="lazy" /></a>{/if}
						<div class="item-copy"><p class="item-date">{formatDate(item.publishedAt)}</p><h3><a href={`/berita/${encodeURIComponent(item.slug)}`}>{item.title}</a></h3>{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}<a class="text-link" href={`/berita/${encodeURIComponent(item.slug)}`}>Baca berita <span aria-hidden="true">↗</span></a></div>
					</article>
				{/each}
			</div>
			{#if totalPages > 1}<nav class="pagination" aria-label="Pagination berita"><button type="button" disabled={page <= 1 || loading} onclick={() => loadNews(page - 1)}>Sebelumnya</button><span>Halaman {page} dari {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onclick={() => loadNews(page + 1)}>Berikutnya</button></nav>{/if}
		{/if}
	</div>
</section>

<style>
	.news-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding: 1.2rem 0 var(--space-section); }
	.news-heading .eyebrow { margin: 0 0 .85rem; opacity: .65; }
	.news-content { min-width: 0; max-width: 780px; }
	.state { margin: 0; padding: 1rem 0; border-top: 1px solid var(--line); font-size: .9rem; line-height: 1.6; }
	.error-state { padding: 1rem 0; border-top: 1px solid var(--line); }
	.error-state p { margin: .35rem 0 .8rem; font-size: .88rem; line-height: 1.6; }
	.error-state .state-title { font-weight: 500; }
	.retry-button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .82rem/1 'Inter', sans-serif; cursor: pointer; }
	.retry-button:focus-visible, .pagination button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.news-list { border-top: 1px solid var(--line); }
	.news-item { display: grid; grid-template-columns: minmax(0, 1fr); padding: 1.25rem 0 1.5rem; border-bottom: 1px solid var(--line); }
	.news-item:has(.thumbnail-link) { grid-template-columns: minmax(140px, .36fr) minmax(0, 1fr); gap: 1.2rem; }
	.thumbnail-link { display: block; align-self: start; overflow: hidden; aspect-ratio: 4 / 3; border: 1px solid var(--line); }
	.thumbnail-link img { display: block; width: 100%; height: 100%; object-fit: cover; }
	.item-date { margin: 0 0 .5rem; font-size: .75rem; opacity: .65; }
	.news-item h3 { margin: 0; font: 500 clamp(1.1rem, 2vw, 1.45rem)/1.35 'Poppins', sans-serif; letter-spacing: -.025em; }
	.news-item h3 a { text-decoration: none; text-underline-offset: .25em; }
	.news-item h3 a:hover, .news-item h3 a:focus-visible { text-decoration: underline; }
	.excerpt { max-width: 620px; margin: .65rem 0 0; font-size: .88rem; line-height: 1.65; opacity: .78; }
	.news-item .text-link { margin-top: .9rem; font-size: .8rem; }
	.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.4rem; }
	.pagination button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: Canvas; color: inherit; font: 500 .8rem/1 'Inter', sans-serif; cursor: pointer; }
	.pagination button:disabled { opacity: .55; cursor: not-allowed; }
	.pagination span { font-size: .78rem; }
	@media (max-width: 700px) { .news-layout { grid-template-columns: 1fr; gap: 1.5rem; } }
	@media (max-width: 480px) { .news-item:has(.thumbnail-link) { grid-template-columns: 1fr; } .thumbnail-link { max-width: 360px; } .pagination { gap: .55rem; } .pagination button { padding-inline: .55rem; font-size: .74rem; } }
</style>
