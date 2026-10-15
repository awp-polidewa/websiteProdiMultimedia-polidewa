<script>
	import { onMount } from 'svelte';
	import PageIntro from '../../lib/PageIntro.svelte';
	import EmptyState from '../../lib/EmptyState.svelte';
	import { mediaUrl, requestApi } from '../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, description: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, category: string, studentName: string | null, projectYear: number | null, externalUrl: string | null }} Project */
	const categories = [
		{ value: '', label: 'Semua kategori' },
		{ value: 'desain', label: 'Desain' },
		{ value: 'coding', label: 'Coding' },
		{ value: '3d', label: '3D' },
		{ value: 'multimedia', label: 'Multimedia' },
		{ value: 'lainnya', label: 'Lainnya' }
	];
	/** @type {Project[]} */
	let items = $state([]);
	let page = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);
	let category = $state('');
	let loading = $state(true);
	let errorMessage = $state('');
	let requestVersion = 0;

	onMount(() => { void loadProjects(); });

	/** @param {number} requestedPage @param {string} [requestedCategory] */
	async function loadProjects(requestedPage = page, requestedCategory = category) {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		const query = new URLSearchParams({ page: String(requestedPage) });
		if (requestedCategory) query.set('category', requestedCategory);
		try {
			const response = await requestApi(`projects?${query.toString()}`);
			if (version !== requestVersion) return;
			items = Array.isArray(response?.data) ? response.data : [];
			page = Number(response?.meta?.page) || requestedPage;
			totalPages = Number(response?.meta?.totalPages) || 0;
			totalItems = Number(response?.meta?.totalItems) || 0;
		} catch (error) {
			if (version === requestVersion) errorMessage = error instanceof Error ? error.message : 'Karya belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {Event} event */
	function changeCategory(event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		category = select.value;
		page = 1;
		void loadProjects(1, category);
	}

	/** @param {string} value */
	function categoryLabel(value) {
		return categories.find((item) => item.value === value)?.label ?? value;
	}
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Karya Mahasiswa TRM | Politeknik Dewantara" description="Jelajahi showcase karya mahasiswa Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara dalam desain, coding, 3D, dan multimedia." canonicalPath="/karya" />

<PageIntro section="Showcase · 04" title="Karya mahasiswa" description="Project mahasiswa dalam bidang multimedia, dipublikasikan sebagai showcase Program Studi TRM." />

<section class="showcase section-rule" aria-labelledby="showcase-title">
	<div class="showcase-aside"><p class="eyebrow">Galeri project</p><p class="showcase-note">Karya ditampilkan dengan gambar utama dan kategori sesuai informasi yang tersedia.</p></div>
	<div class="showcase-main">
		<div class="showcase-heading"><h2 id="showcase-title" class="section-heading">Eksplorasi multimedia</h2><label class="filter-label">Kategori<select value={category} onchange={changeCategory} aria-label="Filter karya berdasarkan kategori">{#each categories as item (item.value)}<option value={item.value}>{item.label}</option>{/each}</select></label></div>
		{#if loading}
			<p class="state" role="status" aria-live="polite">Memuat karya…</p>
		{:else if errorMessage}
			<div class="error-state" role="alert"><p class="state-title">Karya belum dapat dimuat.</p><p>{errorMessage}</p><button class="retry-button" type="button" onclick={() => loadProjects(page, category)}>Coba lagi</button></div>
		{:else if items.length === 0}
			<EmptyState label="Belum ada karya yang dipublikasikan." message="Karya mahasiswa akan muncul di sini setelah materi dan gambar project tersedia." />
		{:else}
			<p class="result-count">{totalItems} karya</p>
			<div class="project-grid">
				{#each items as project (project.id)}
					<article class="project-card">
						<a class="project-image" href={`/karya/${encodeURIComponent(project.slug)}`} aria-label={`Lihat karya ${project.title}`}>
							{#if project.thumbnailPath}<img src={mediaUrl(project.thumbnailPath)} alt="" loading="lazy" />{:else}<span>Gambar karya belum tersedia</span>{/if}
						</a>
						<div class="card-meta"><span>{categoryLabel(project.category)}</span>{#if project.projectYear}<span>{project.projectYear}</span>{/if}</div>
						<h3><a href={`/karya/${encodeURIComponent(project.slug)}`}>{project.title}</a></h3>
						{#if project.studentName}<p class="student">{project.studentName}</p>{/if}
						{#if project.description}<p class="description">{project.description}</p>{/if}
						<a class="text-link" href={`/karya/${encodeURIComponent(project.slug)}`}>Lihat karya <span aria-hidden="true">↗</span></a>
					</article>
				{/each}
			</div>
			{#if totalPages > 1}<nav class="pagination" aria-label="Pagination karya"><button type="button" disabled={page <= 1 || loading} onclick={() => loadProjects(page - 1)}>Sebelumnya</button><span>Halaman {page} dari {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onclick={() => loadProjects(page + 1)}>Berikutnya</button></nav>{/if}
		{/if}
	</div>
</section>

<style>
	.showcase { display: grid; grid-template-columns: .78fr 1.22fr; gap: 3rem; padding: 1.3rem 0 var(--space-section); }
	.showcase-aside { display: flex; flex-direction: column; align-items: start; }
	.showcase-aside .eyebrow { margin: 0 0 1.2rem; opacity: .65; }
	.showcase-note { max-width: 260px; margin: auto 0 0; padding-top: 2.5rem; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	.showcase-main { min-width: 0; }
	.showcase-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
	.showcase-main h2 { margin: 0; }
	.filter-label { display: grid; gap: .35rem; min-width: 155px; font-size: .74rem; }
	.filter-label select { min-height: 42px; padding: .5rem .65rem; border: 1px solid var(--line); background: Canvas; color: CanvasText; font: 400 .8rem/1.3 'Inter', sans-serif; }
	.filter-label select:focus-visible, .retry-button:focus-visible, .pagination button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.state { margin: 0; padding: 1rem 0; border-top: 1px solid var(--line); font-size: .9rem; line-height: 1.6; }
	.error-state { padding: 1rem 0; border-top: 1px solid var(--line); }
	.error-state p { margin: .35rem 0 .8rem; font-size: .88rem; line-height: 1.6; }
	.error-state .state-title { font-weight: 500; }
	.retry-button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .82rem/1 'Inter', sans-serif; cursor: pointer; }
	.result-count { margin: 0 0 .65rem; font-size: .75rem; opacity: .65; }
	.project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 1.2rem; }
	.project-card { min-width: 0; }
	.project-image { display: grid; min-height: 155px; aspect-ratio: 4 / 3; overflow: hidden; place-items: center; border: 1px solid var(--line); text-decoration: none; font-size: .78rem; opacity: .74; }
	.project-image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--motion-normal) var(--ease-out); }
	.project-image:hover img, .project-image:focus-visible img { transform: scale(1.025); }
	.card-meta { display: flex; justify-content: space-between; gap: .7rem; margin-top: .75rem; font-size: .7rem; opacity: .68; }
	.project-card h3 { margin: .4rem 0 0; font: 500 1.05rem/1.35 'Poppins', sans-serif; }
	.project-card h3 a { text-decoration: none; text-underline-offset: .25em; }
	.project-card h3 a:hover, .project-card h3 a:focus-visible { text-decoration: underline; }
	.student { margin: .35rem 0 0; font-size: .78rem; opacity: .72; }
	.description { display: -webkit-box; overflow: hidden; margin: .5rem 0 0; font-size: .8rem; line-height: 1.55; opacity: .76; line-clamp: 3; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
	.project-card .text-link { margin-top: .65rem; font-size: .8rem; }
	.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
	.pagination button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: Canvas; color: inherit; font: 500 .8rem/1 'Inter', sans-serif; cursor: pointer; }
	.pagination button:disabled { opacity: .55; cursor: not-allowed; }
	.pagination span { font-size: .78rem; }
	@media (max-width: 700px) { .showcase { grid-template-columns: 1fr; gap: 2.5rem; } .showcase-note { max-width: 420px; margin: 0; padding: 0; } }
	@media (max-width: 520px) { .showcase-heading { align-items: start; flex-direction: column; } .filter-label { width: 100%; } .project-grid { grid-template-columns: 1fr; gap: 1.7rem; } .project-image { max-height: 360px; } .pagination { gap: .55rem; } .pagination button { padding-inline: .55rem; font-size: .74rem; } }
</style>
