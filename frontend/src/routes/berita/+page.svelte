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
	/** @type {HTMLDivElement | null} */
	let newsListElement = $state(null);
	let activeMobileIndex = $state(0);

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
			activeMobileIndex = 0;
			newsListElement?.scrollTo({ left: 0 });
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

	function handleMobileNewsScroll() {
		if (!newsListElement || items.length < 2) return;
		const firstCard = newsListElement.querySelector('.news-item');
		if (!firstCard) return;
		const cardWidth = firstCard.getBoundingClientRect().width;
		const styles = getComputedStyle(newsListElement);
		const gap = Number.parseFloat(styles.columnGap) || 0;
		activeMobileIndex = Math.max(0, Math.min(items.length - 1, Math.round(newsListElement.scrollLeft / (cardWidth + gap))));
	}
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Berita TRM Polidewa | Politeknik Dewantara" description="Berita, kegiatan, dan informasi terbaru Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara." canonicalPath="/berita" />

<div class="desktop-intro"><PageIntro section="Publikasi · 03" title="Berita prodi" description="Berita dan aktivitas terbaru Program Studi Teknologi Rekayasa Multimedia." /></div>

<header class="mobile-news-intro">
	<h1>Berita <span>Teknologi</span><br />Rekayasa Multimedia</h1>
	<p>Geser ke samping untuk melihat lebih banyak</p>
</header>

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
			<div class="news-list" bind:this={newsListElement} onscroll={handleMobileNewsScroll} role="region" aria-label="Daftar berita. Geser ke samping untuk melihat berita lainnya.">
				{#each items as item (item.id)}
					<article class="news-item">
						{#if item.thumbnailPath}<a class="thumbnail-link" href={`/berita/${encodeURIComponent(item.slug)}`} tabindex="-1" aria-hidden="true"><img src={mediaUrl(item.thumbnailPath)} alt="" loading="lazy" /></a>{/if}
						<div class="item-copy"><p class="item-date">{formatDate(item.publishedAt)}</p><h3><a href={`/berita/${encodeURIComponent(item.slug)}`}>{item.title}</a></h3>{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}<a class="text-link" href={`/berita/${encodeURIComponent(item.slug)}`}>Baca berita <span aria-hidden="true">↗</span></a></div>
					</article>
				{/each}
			</div>
			{#if items.length > 1}
				<div class="mobile-progress" role="progressbar" aria-label="Posisi berita pada carousel" aria-valuemin="1" aria-valuemax={items.length} aria-valuenow={activeMobileIndex + 1} style={`--progress:${((activeMobileIndex + 1) / items.length) * 100}%`}><span></span></div>
			{/if}
			<a class="mobile-work-link" href="/karya">Lihat semua karya <span aria-hidden="true">↗</span></a>
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
	.mobile-news-intro, .mobile-progress, .mobile-work-link { display: none; }
	.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.4rem; }
	.pagination button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: Canvas; color: inherit; font: 500 .8rem/1 'Inter', sans-serif; cursor: pointer; }
	.pagination button:disabled { opacity: .55; cursor: not-allowed; }
	.pagination span { font-size: .78rem; }
	@media (max-width: 700px) {
		.desktop-intro, .news-heading { display: none; }
		.mobile-news-intro { display: block; margin: 0 15px 34px; padding-top: 1.75rem; }
		.mobile-news-intro h1 { margin: 0; color: #101114; font: 400 clamp(1.55rem, 7vw, 1.9rem)/1.16 'Inter', sans-serif; letter-spacing: -.045em; }
		.mobile-news-intro h1 span { color: #315aa0; font-weight: 700; }
		.mobile-news-intro p { max-width: 300px; margin: .65rem 0 0; color: #161719; font: 400 .9rem/1.3 'Inter', sans-serif; }
		.news-layout { display: block; padding: 0 0 2rem; }
		.news-content { width: 100%; max-width: none; }
		.news-list {
			display: flex;
			width: calc(100% + 32px);
			box-sizing: border-box;
			gap: 16px;
			margin: 0 -16px;
			overflow-x: auto;
			overscroll-behavior-inline: contain;
			padding: 0 31px 8px;
			scroll-padding-inline: 31px;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
			touch-action: pan-x pan-y;
			border: 0;
		}
		.news-list::-webkit-scrollbar { display: none; }
		.news-item, .news-item:has(.thumbnail-link) {
			display: flex;
			width: calc(100vw - 62px);
			max-width: 360px;
			min-width: 0;
			flex: 0 0 calc(100vw - 62px);
			flex-direction: column;
			gap: 0;
			box-sizing: border-box;
			overflow: hidden;
			padding: 10px;
			border: 0;
			border-radius: 14px;
			background: #000a1d;
			color: #fff;
			scroll-snap-align: start;
		}
		.news-item:not(:has(.thumbnail-link))::before { display: grid; flex: 0 0 auto; aspect-ratio: 1.42 / 1; place-items: center; border-radius: 10px; background: #101d34; color: rgb(255 255 255 / 70%); content: 'Foto belum tersedia'; font: 400 .75rem/1 'Inter', sans-serif; }
		.thumbnail-link { width: 100%; max-width: none; flex: 0 0 auto; overflow: hidden; aspect-ratio: 1.42 / 1; border: 0; border-radius: 10px; }
		.item-copy { display: grid; min-height: 78px; flex: 1 0 auto; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: 'title title' 'cta date'; align-items: end; gap: 8px; padding: 12px 1px 1px; }
		.item-date { grid-area: date; justify-self: end; margin: 0; color: rgb(255 255 255 / 78%); font-size: .62rem; line-height: 1.25; text-align: right; }
		.news-item h3 { grid-area: title; align-self: start; margin: 0; color: #fff; font: 500 1rem/1.3 'Inter', sans-serif; letter-spacing: -.02em; }
		.news-item h3 a { color: inherit; }
		.excerpt { display: none; }
		.news-item .text-link { grid-area: cta; display: inline-flex; width: fit-content; min-height: 32px; align-items: center; justify-content: center; gap: .25rem; margin: 0; padding: 0 .75rem; border: 0; border-radius: 999px; background: #fff; color: #07111f; font: 400 .68rem/1 'Inter', sans-serif; text-decoration: none; text-transform: capitalize; }
		.news-item .text-link span { display: none; }
		.mobile-progress { position: relative; display: block; width: min(56%, 220px); height: 3px; overflow: hidden; margin: 9px auto 22px; border-radius: 999px; background: #d9e2ff; }
		.mobile-progress span { display: block; width: var(--progress, 0%); height: 100%; border-radius: inherit; background: #315aa0; transition: width 180ms ease-out; }
		.mobile-work-link { display: inline-flex; min-height: 28px; align-items: center; gap: .45rem; margin: 0 15px; padding: 0 .6rem; border: 1px solid #627cff; border-radius: 999px; color: #2642e8; font: 400 .62rem/1 'Inter', sans-serif; text-decoration: none; }
		.mobile-work-link:focus-visible { outline: 2px solid #315aa0; outline-offset: 3px; }
		.pagination { gap: .55rem; margin: 1.25rem 15px 0; }
		.pagination button { padding-inline: .55rem; font-size: .74rem; }
	}
</style>
