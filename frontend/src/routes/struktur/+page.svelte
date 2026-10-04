<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import PageIntro from '../../lib/PageIntro.svelte';
	import { mediaUrl, requestApi } from '../../lib/admin/api.js';

	const concentrations = ['Web Design', 'Desain Grafis', 'Videografi'];
	/** @typedef {{ id: string, name: string, title: string, concentration: string | null, photoPath: string | null, photoUrl: string | null, bio: string | null, displayOrder: number }} Lecturer */
	/** @type {Lecturer[]} */
	let lecturers = $state([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let selectedLecturerId = $state('');
	let requestVersion = 0;
	let leadLecturer = $derived(lecturers.find((lecturer) => lecturer.concentration === null) ?? null);
	let groups = $derived(concentrations.map((name) => ({ name, lecturers: lecturers.filter((lecturer) => lecturer.concentration === name) })));
	let activeLecturer = $derived(lecturers.find((lecturer) => lecturer.id === selectedLecturerId) ?? null);

	onMount(() => { void loadLecturers(); });

	async function loadLecturers() {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		try {
			const response = await requestApi('lecturers');
			if (version !== requestVersion) return;
			lecturers = Array.isArray(response?.data) ? response.data : [];
			selectedLecturerId = '';
		} catch (error) {
			if (version === requestVersion) errorMessage = error instanceof Error ? error.message : 'Data dosen belum dapat dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	/** @param {PointerEvent & { currentTarget: HTMLElement }} event */
	function clearPointerPreview(event) {
		if (event.pointerType === 'touch') return;
		if (document.activeElement instanceof Node && event.currentTarget.contains(document.activeElement)) return;
		selectedLecturerId = '';
	}

	/** @param {Lecturer} lecturer */
	function selectLecturer(lecturer) {
		selectedLecturerId = lecturer.id;
	}
</script>

<svelte:head>
	<title>Struktur Dosen — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Struktur program studi dan bidang konsentrasi dosen TRM Politeknik Dewantara." />
</svelte:head>

<PageIntro section="Program studi · 02" title="Struktur & dosen" description="Struktur utama Program Studi Teknologi Rekayasa Multimedia." />

<section class="organization section-rule" aria-labelledby="organization-title">
	<div class="chart-heading"><p class="eyebrow">Organisasi program studi</p><h2 id="organization-title" class="section-heading">Struktur dosen TRM</h2></div>
	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat data dosen…</p>
	{:else if errorMessage}
		<div class="error-state" role="alert"><p>Data dosen belum dapat dimuat.</p><p>{errorMessage}</p><button class="retry-button" type="button" onclick={loadLecturers}>Coba lagi</button></div>
	{:else}
		<div class="org-chart" class:with-preview={Boolean(activeLecturer)} role="group" aria-label="Struktur program studi" onpointerleave={clearPointerPreview} onfocusout={(event) => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) selectedLecturerId = ''; }}>
			<div class="chart-main">
				<div class="lead-node" class:active={selectedLecturerId === leadLecturer?.id}>
					{#if leadLecturer}
						<button class="node-button" type="button" aria-expanded={selectedLecturerId === leadLecturer.id} onclick={() => selectLecturer(leadLecturer)} onpointerenter={(event) => event.pointerType !== 'touch' && selectLecturer(leadLecturer)} onfocus={() => selectLecturer(leadLecturer)}><span class="node-role">{leadLecturer.title || 'Kaprodi'}</span><strong>{leadLecturer.name}</strong><span class="node-note">Informasi dari data dosen program studi</span></button>
					{:else}
					<div class="lead-placeholder"><span class="node-role">Kaprodi</span><strong>Data belum tersedia</strong><span class="node-note">Belum ada data dosen tanpa konsentrasi pada API.</span></div>
					{/if}
				</div>
				<div class="chart-connector" aria-hidden="true"></div>
				<ol class="concentration-nodes" aria-label="Bidang konsentrasi">
					{#each groups as group (group.name)}
						<li class="concentration-node">
							<p class="node-role">Konsentrasi</p><h3>{group.name}</h3>
							{#if group.lecturers.length}
								<ul class="lecturer-list">
									{#each group.lecturers as lecturer (lecturer.id)}
										<li><button class="lecturer-button" class:active={selectedLecturerId === lecturer.id} type="button" aria-expanded={selectedLecturerId === lecturer.id} onclick={() => selectLecturer(lecturer)} onpointerenter={(event) => event.pointerType !== 'touch' && selectLecturer(lecturer)} onfocus={() => selectLecturer(lecturer)}><strong>{lecturer.name}</strong><span>{lecturer.title}</span></button></li>
									{/each}
								</ul>
							{:else}<p class="group-empty">Belum ada data dosen.</p>{/if}
						</li>
					{/each}
				</ol>
			</div>
			{#if activeLecturer}
				{#key activeLecturer.id}
					<aside class="profile-preview" aria-label="Pratinjau profil dosen" aria-live="polite" aria-atomic="true" transition:fade={{ duration: 280 }}>
						{#if activeLecturer.photoPath}<img class="portrait" src={mediaUrl(activeLecturer.photoPath)} alt={`Foto ${activeLecturer.name}`} />{:else}<div class="portrait-placeholder" aria-hidden="true">Foto dosen belum tersedia</div>{/if}
						<p class="eyebrow">{activeLecturer.concentration ?? 'Program studi'}</p><h3>{activeLecturer.name}</h3><p class="preview-title">{activeLecturer.title}</p>
						{#if activeLecturer.bio}<p>{activeLecturer.bio}</p>{:else}<p>Profil dosen belum tersedia.</p>{/if}
					</aside>
				{/key}
			{/if}
		</div>
		{#if lecturers.length === 0}<p class="chart-caption">Belum ada data dosen pada layanan publik.</p>{:else}<p class="chart-caption">Pilih nama dosen untuk melihat profil. Informasi yang tersedia ditampilkan sesuai data program studi.</p>{/if}
	{/if}
</section>

<style>
	.organization { padding: 1.5rem 0 var(--space-section); }
	.chart-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; margin-bottom: 3.5rem; }
	.chart-heading .eyebrow { margin: 0 0 .7rem; opacity: .65; }
	.state { margin: 0; padding: 1rem 0; border-top: 1px solid var(--line); font-size: .9rem; line-height: 1.6; }
	.error-state { padding: 1rem 0; border-top: 1px solid var(--line); }
	.error-state p { margin: .3rem 0 .7rem; font-size: .88rem; line-height: 1.6; }
	.retry-button { min-height: 42px; padding: .55rem .75rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .82rem/1 'Inter', sans-serif; cursor: pointer; }
	.retry-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.org-chart { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0fr); align-items: start; transition: grid-template-columns var(--motion-slow) var(--ease-state), gap var(--motion-slow) var(--ease-state); }
	.org-chart.with-preview { grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr); gap: clamp(1.5rem, 4vw, 4rem); }
	.chart-main { display: flex; align-items: center; flex-direction: column; min-width: 0; }
	.lead-node { width: min(100%, 440px); border: 1px solid var(--line); }
	.node-button, .lead-placeholder { width: 100%; min-height: 100%; display: flex; align-items: center; flex-direction: column; padding: 1.5rem 1.25rem 1.3rem; color: inherit; text-align: center; }
	.node-button { background: transparent; border: 0; cursor: pointer; }
	.node-button:focus-visible, .lecturer-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.node-button strong, .lead-placeholder strong { font: 500 1.25rem/1.35 'Poppins', sans-serif; }
	.node-role { margin: 0 0 .65rem; font: 500 .7rem/1.3 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	.node-note { margin: .45rem 0 0; font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .72; }
	.chart-connector { position: relative; width: 1px; height: 62px; background: var(--line); }
	.chart-connector::after { position: absolute; right: 0; bottom: 0; left: 0; height: 1px; content: ''; background: var(--line); }
	.concentration-nodes { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; gap: 1.25rem; margin: 0; padding: 0; list-style: none; }
	.concentration-nodes::before { position: absolute; top: -1px; right: 16.66%; left: 16.66%; height: 1px; content: ''; background: var(--line); }
	.concentration-node { min-width: 0; min-height: 138px; padding: 1.15rem 1rem; border-top: 1px solid var(--line); }
	.concentration-node:nth-child(2) { border-top-color: transparent; }
	.concentration-node h3 { margin: 0 0 .55rem; font: 500 1.05rem/1.35 'Poppins', sans-serif; }
	.lecturer-list { display: grid; gap: .35rem; margin: 0; padding: 0; list-style: none; }
	.lecturer-button { width: 100%; display: grid; gap: .2rem; padding: .55rem 0; border: 0; border-bottom: 1px solid var(--line); background: transparent; color: inherit; text-align: left; cursor: pointer; }
	.lecturer-button strong { font: 500 .83rem/1.4 'Inter', sans-serif; }
	.lecturer-button span { font-size: .72rem; line-height: 1.4; opacity: .68; }
	.lecturer-button.active, .lecturer-button:hover { text-decoration: underline; text-underline-offset: .22em; }
	.group-empty { margin: 0; font-size: .76rem; line-height: 1.5; opacity: .68; }
	.profile-preview { min-width: 0; padding-top: 1rem; }
	.portrait-placeholder, .portrait { display: grid; width: 100%; min-height: 180px; place-items: center; margin: 0 0 1.4rem; border: 1px solid var(--line); font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .75; }
	.portrait { height: 240px; object-fit: cover; }
	.profile-preview .eyebrow { margin: 0 0 .55rem; opacity: .65; }
	.profile-preview h3 { margin: 0; font: 500 1.3rem/1.3 'Poppins', sans-serif; }
	.profile-preview > p:not(.eyebrow) { max-width: 360px; margin: .6rem 0 0; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	.profile-preview .preview-title { opacity: .68; }
	.chart-caption { margin: 2rem 0 0; font: 400 .8rem/1.6 'Inter', sans-serif; opacity: .7; }
	@media (max-width: 760px) {
		.org-chart, .org-chart.with-preview { grid-template-columns: minmax(0, 1fr); gap: 0; }
		.chart-heading { align-items: start; flex-direction: column; gap: .8rem; margin-bottom: 2.5rem; }
		.lead-node { width: 100%; }
		.chart-connector { height: 2rem; }
		.chart-connector::after { right: auto; bottom: 0; left: 0; width: 1px; height: 1rem; }
		.concentration-nodes { grid-template-columns: 1fr; gap: 0; padding-left: 1rem; border-left: 1px solid var(--line); }
		.concentration-nodes::before { display: none; }
		.concentration-node, .concentration-node:nth-child(2) { min-height: 0; padding: 1rem; border-top: 1px solid var(--line); }
		.concentration-node:nth-child(2) { border-top-color: var(--line); }
		.profile-preview { margin-top: 1.5rem; padding: 1.25rem; border-top: 1px solid var(--line); }
		.portrait-placeholder { min-height: 140px; }
	}
</style>
