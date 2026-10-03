<script>
	import { onMount } from 'svelte';
	import { requestApi } from '../../lib/admin/api.js';

	const resources = [
		{ key: 'news', label: 'Berita', endpoint: 'news', countKey: 'totalItems' },
		{ key: 'projects', label: 'Karya mahasiswa', endpoint: 'projects', countKey: 'totalItems' },
		{ key: 'lecturers', label: 'Dosen', endpoint: 'lecturers', countKey: 'totalItems' },
		{ key: 'accreditation', label: 'Dokumen akreditasi', endpoint: 'accreditation-documents', countKey: 'totalItems' }
	];

	/** @type {Array<{ key: string, label: string, endpoint: string, countKey: string, count: number | null }>} */
	let stats = $state(resources.map((resource) => ({ ...resource, count: null })));
	let loading = $state(true);
	let hasError = $state(false);
	let loadVersion = 0;

	onMount(() => {
		void loadStats();
	});

	async function loadStats() {
		const currentLoad = ++loadVersion;
		loading = true;
		const results = await Promise.all(resources.map(async (resource) => {
			try {
				const result = await requestApi(resource.endpoint, {}, true);
				const value = result?.meta?.[resource.countKey];
				return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
			} catch {
				return null;
			}
		}));
		if (currentLoad !== loadVersion) return;
		stats = resources.map((resource, index) => ({ ...resource, count: results[index] }));
		hasError = results.includes(null);
		loading = false;
	}
</script>

<svelte:head>
	<title>Dashboard Admin — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Ringkasan konten Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="dashboard">
	<header class="page-heading">
		<div>
			<p class="eyebrow">Ruang kerja</p>
			<h1>Dashboard</h1>
			<p class="intro">Ringkasan konten publik yang dikelola oleh program studi.</p>
		</div>
		<button class="refresh-button" type="button" onclick={loadStats} disabled={loading}>
			{loading ? 'Memuat…' : 'Muat ulang'}
		</button>
	</header>

	{#if hasError}
		<p class="stats-notice" role="status">Sebagian jumlah belum dapat dimuat dari API.</p>
	{/if}

	<section class="stat-grid" aria-label="Jumlah konten">
		{#each stats as item (item.key)}
			<article class="stat-item">
				<h2>{item.label}</h2>
				<p class="stat-value" aria-live={loading ? 'polite' : 'off'}>
					{loading ? '…' : item.count === null ? '—' : item.count}
				</p>
				<p class="stat-caption">entri</p>
			</article>
		{/each}
	</section>

	<section class="dashboard-note" aria-labelledby="next-step-title">
		<h2 id="next-step-title">Pengelolaan konten</h2>
		<p>Pilih bagian melalui menu untuk melihat area pengelolaan masing-masing konten.</p>
	</section>
</div>

<style>
	.dashboard { width: min(100%, 1120px); margin: 0 auto; }
	.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; }
	.eyebrow { margin: 0 0 .55rem; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	h1 { margin: 0; font: 500 clamp(1.6rem, 3vw, 1.85rem)/1.2 'Poppins', sans-serif; letter-spacing: -.035em; }
	.intro { margin: .55rem 0 0; font-size: .88rem; line-height: 1.6; opacity: .76; }
	.refresh-button { min-height: 42px; padding: .6rem .8rem; border: 1px solid var(--line); border-radius: 3px; background: Canvas; color: CanvasText; font: 500 .82rem/1.2 'Inter', sans-serif; cursor: pointer; }
	.refresh-button:hover, .refresh-button:focus-visible { text-decoration: underline; text-underline-offset: .25em; }
	.refresh-button:disabled { cursor: wait; opacity: .62; }
	.stats-notice { margin: 0 0 1rem; padding: .7rem .8rem; border-left: 2px solid CanvasText; font-size: .82rem; }
	.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
	.stat-item { min-height: 140px; padding: 1.15rem 1.25rem; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
	.stat-item h2 { margin: 0; font: 500 .85rem/1.4 'Inter', sans-serif; opacity: .76; }
	.stat-value { margin: .7rem 0 0; font: 500 clamp(1.9rem, 4vw, 2.5rem)/1 'Poppins', sans-serif; letter-spacing: -.04em; }
	.stat-caption { margin: .35rem 0 0; font-size: .72rem; opacity: .62; }
	.dashboard-note { margin-top: 2rem; padding-top: 1.1rem; border-top: 1px solid var(--line); }
	.dashboard-note h2 { margin: 0 0 .45rem; font: 500 1rem/1.4 'Poppins', sans-serif; }
	.dashboard-note p { margin: 0; font-size: .84rem; line-height: 1.6; opacity: .76; }
	@media (max-width: 520px) {
		.page-heading { align-items: start; flex-direction: column; gap: 1rem; }
		.stat-grid { grid-template-columns: 1fr; }
		.stat-item { min-height: 110px; padding: 1rem; }
	}
</style>
