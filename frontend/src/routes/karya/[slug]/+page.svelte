<script>
	import { page as routePage } from '$app/state';
	import PageIntro from '../../../lib/PageIntro.svelte';
	import { ApiError, mediaUrl, requestApi } from '../../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, description: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, category: string, studentName: string | null, projectYear: number | null, externalUrl: string | null }} Project */
	let project = $state(/** @type {Project | null} */ (null));
	let loading = $state(true);
	let errorMessage = $state('');
	let notFound = $state(false);
	let requestVersion = 0;
	let slug = $derived(routePage.params.slug ?? '');

	$effect(() => { const currentSlug = slug; if (currentSlug) void loadProject(currentSlug); });

	/** @param {string} currentSlug */
	async function loadProject(currentSlug) {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		notFound = false;
		try {
			const response = await requestApi(`projects/${encodeURIComponent(currentSlug)}`);
			if (version !== requestVersion) return;
			project = response?.data ?? null;
			if (!project) notFound = true;
		} catch (error) {
			if (version !== requestVersion) return;
			if (error instanceof ApiError && error.status === 404) notFound = true;
			else errorMessage = error instanceof Error ? error.message : 'Karya belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {string} value */
	function categoryLabel(value) {
		return ({ desain: 'Desain', coding: 'Coding', '3d': '3D', multimedia: 'Multimedia', lainnya: 'Lainnya' })[value] ?? value;
	}
</script>

<svelte:head>
	<title>{project ? `${project.title} — Karya TRM` : 'Karya mahasiswa — Teknologi Rekayasa Multimedia'}</title>
	{#if project?.description}<meta name="description" content={project.description} />{/if}
</svelte:head>

{#if loading}
	<main class="detail-state" role="status" aria-live="polite">Memuat karya…</main>
{:else if notFound}
	<main class="detail-state" aria-labelledby="not-found-title"><p class="eyebrow">Showcase</p><h1 id="not-found-title">Karya tidak ditemukan</h1><p>Karya yang diminta tidak tersedia.</p><a class="text-link" href="/karya">Kembali ke karya <span aria-hidden="true">↗</span></a></main>
{:else if errorMessage}
	<main class="detail-state" aria-labelledby="error-title"><p class="eyebrow">Showcase</p><h1 id="error-title">Karya belum dapat dimuat</h1><p role="alert">{errorMessage}</p><button type="button" class="retry-button" onclick={() => loadProject(slug)}>Coba lagi</button><a class="text-link" href="/karya">Kembali ke karya <span aria-hidden="true">↗</span></a></main>
{:else if project}
	<PageIntro section="Showcase · Karya mahasiswa" title={project.title} description={project.description ?? ''} />
	<article class="project-detail section-rule">
		<div class="project-meta"><span>{categoryLabel(project.category)}</span>{#if project.projectYear}<span>{project.projectYear}</span>{/if}{#if project.studentName}<span>{project.studentName}</span>{/if}<a href="/karya">Semua karya</a></div>
		<div class="project-content">
			{#if project.thumbnailPath}<figure class="project-image"><img src={mediaUrl(project.thumbnailPath)} alt="" /><figcaption>{project.title}</figcaption></figure>{:else}<div class="image-placeholder" role="img" aria-label="Gambar karya belum tersedia">Gambar karya belum tersedia</div>{/if}
			{#if project.externalUrl}<p class="external-link"><a class="text-link" href={project.externalUrl} target="_blank" rel="noreferrer">Buka karya eksternal <span aria-hidden="true">↗</span></a></p>{/if}
		</div>
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
	.project-detail { display: grid; grid-template-columns: minmax(130px, .55fr) minmax(0, 1.45fr); gap: 1rem 3rem; padding: 1.2rem 0 var(--space-section); }
	.project-meta { display: flex; align-items: start; flex-direction: column; gap: .7rem; font-size: .8rem; }
	.project-meta span { opacity: .7; }
	.project-meta a { margin-top: .5rem; font-size: .78rem; text-underline-offset: .2em; }
	.project-content { min-width: 0; }
	.project-image { margin: 0; }
	.project-image img { display: block; width: 100%; max-height: 640px; object-fit: cover; border: 1px solid var(--line); }
	.project-image figcaption { margin-top: .4rem; font-size: .72rem; opacity: .65; }
	.image-placeholder { display: grid; min-height: 220px; place-items: center; border: 1px solid var(--line); font-size: .82rem; opacity: .72; }
	.external-link { margin: 1rem 0 0; }
	@media (max-width: 700px) { .detail-state { min-height: 50vh; padding: 4.5rem 0 3rem; } .project-detail { grid-template-columns: 1fr; gap: 1rem; } .project-meta { align-items: center; flex-direction: row; flex-wrap: wrap; justify-content: space-between; } .project-meta a { margin-top: 0; } }
</style>
