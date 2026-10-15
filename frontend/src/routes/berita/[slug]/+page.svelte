<script>
	import { page as routePage } from '$app/state';
	import SeoHead from '../../../lib/SeoHead.svelte';
	import PageIntro from '../../../lib/PageIntro.svelte';
	import { ApiError, mediaUrl, requestApi } from '../../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, excerpt: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, publishedAt: string, content: string }} NewsArticle */
	let article = $state(/** @type {NewsArticle | null} */ (null));
	let loading = $state(true);
	let errorMessage = $state('');
	let notFound = $state(false);
	let requestVersion = 0;
	let slug = $derived(routePage.params.slug ?? '');

	$effect(() => { const currentSlug = slug; if (currentSlug) void loadArticle(currentSlug); });

	/** @param {string} currentSlug */
	async function loadArticle(currentSlug) {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		notFound = false;
		try {
			const response = await requestApi(`news/${encodeURIComponent(currentSlug)}`);
			if (version !== requestVersion) return;
			article = response?.data ?? null;
			if (!article) notFound = true;
		} catch (error) {
			if (version !== requestVersion) return;
			if (error instanceof ApiError && error.status === 404) notFound = true;
			else errorMessage = error instanceof Error ? error.message : 'Berita belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {string} value */
	function formatDate(value) {
		const date = new Date(value);
		if (!value || Number.isNaN(date.getTime())) return '';
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}
</script>

<SeoHead
	title={article ? `${article.title} — Berita TRM Polidewa` : 'Berita TRM — Politeknik Dewantara'}
	description={article?.excerpt ?? 'Berita dan aktivitas Program Studi Teknologi Rekayasa Multimedia Politeknik Dewantara.'}
	noindex={notFound || Boolean(errorMessage)}
/>

{#if loading}
	<main class="detail-state" role="status" aria-live="polite">Memuat berita…</main>
{:else if notFound}
	<main class="detail-state" aria-labelledby="not-found-title"><p class="eyebrow">Publikasi</p><h1 id="not-found-title">Berita tidak ditemukan</h1><p>Berita mungkin tidak tersedia atau belum dipublikasikan.</p><a class="text-link" href="/berita">Kembali ke berita <span aria-hidden="true">↗</span></a></main>
{:else if errorMessage}
	<main class="detail-state" aria-labelledby="error-title"><p class="eyebrow">Publikasi</p><h1 id="error-title">Berita belum dapat dimuat</h1><p role="alert">{errorMessage}</p><button type="button" class="retry-button" onclick={() => loadArticle(slug)}>Coba lagi</button><a class="text-link" href="/berita">Kembali ke berita <span aria-hidden="true">↗</span></a></main>
{:else if article}
	<PageIntro section="Publikasi · Berita" title={article.title} description={article.excerpt ?? ''} />
	<article class="article section-rule">
		<div class="article-meta"><time datetime={article.publishedAt}>{formatDate(article.publishedAt)}</time><a href="/berita">Semua berita</a></div>
		{#if article.thumbnailPath}<figure class="hero-image"><img src={mediaUrl(article.thumbnailPath)} alt="" /><figcaption>{article.title}</figcaption></figure>{/if}
		<div class="article-content">{article.content}</div>
	</article>
{/if}

<style>
	.detail-state { width: min(100%, 780px); min-height: 42vh; margin: 0 auto; padding: clamp(5rem, 11vw, 9.5rem) 0; }
	.detail-state .eyebrow { margin: 0 0 1rem; font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; opacity: .7; }
	.detail-state h1 { margin: 0; font: 500 clamp(2rem, 6vw, 4rem)/1.08 'Poppins', sans-serif; letter-spacing: -.05em; }
	.detail-state > p:not(.eyebrow) { max-width: 560px; margin: .8rem 0 1.2rem; line-height: 1.7; opacity: .78; }
	.detail-state .text-link { margin-top: .8rem; }
	.retry-button { min-height: 42px; margin-right: 1rem; padding: .55rem .75rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .82rem/1 'Inter', sans-serif; cursor: pointer; }
	.retry-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.article { display: grid; grid-template-columns: minmax(130px, .55fr) minmax(0, 1.45fr); gap: 1rem 3rem; padding: 1.2rem 0 var(--space-section); }
	.article-meta { display: flex; align-items: start; flex-direction: column; gap: .7rem; font-size: .78rem; opacity: .7; }
	.article-meta a { text-underline-offset: .25em; }
	.hero-image { grid-column: 2; margin: 0 0 1rem; }
	.hero-image img { display: block; width: 100%; max-height: 560px; object-fit: cover; border: 1px solid var(--line); }
	.hero-image figcaption { margin-top: .4rem; font-size: .72rem; opacity: .65; }
	.article-content { grid-column: 2; font: 400 1rem/1.85 'Inter', sans-serif; white-space: pre-wrap; overflow-wrap: anywhere; }
	@media (max-width: 700px) { .detail-state { min-height: 50vh; padding: 4.5rem 0 3rem; } .article { grid-template-columns: 1fr; gap: 1rem; } .hero-image, .article-content { grid-column: 1; } .article-meta { align-items: center; flex-direction: row; justify-content: space-between; } }
</style>
