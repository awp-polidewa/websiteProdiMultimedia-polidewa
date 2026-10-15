<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import PageIntro from '../../lib/PageIntro.svelte';
	import { mediaUrl, requestApi } from '../../lib/admin/api.js';

	const concentrations = ['Web Design', 'Desain Grafis', 'Videografi', 'Animasi'];
	/** @typedef {{ id: string, name: string, title: string, concentration: string | null, photoPath: string | null, photoUrl: string | null, bio: string | null, displayOrder: number }} Lecturer */
	/** @type {Lecturer[]} */
	let lecturers = $state([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let selectedNodeId = $state('');
	let reducedMotion = $state(false);
	let requestVersion = 0;
	let leadLecturer = $derived(lecturers.find((lecturer) => lecturer.concentration === null) ?? null);
	let groups = $derived(concentrations.map((name) => ({ name, lecturers: lecturers.filter((lecturer) => lecturer.concentration === name) })));
	let activeLecturer = $derived(lecturers.find((lecturer) => lecturer.id === selectedNodeId) ?? null);
	let activeEmptyLead = $derived(!leadLecturer && selectedNodeId === 'empty:lead');
	let activeEmptyGroup = $derived(groups.find((group) => group.lecturers.length === 0 && selectedNodeId === `empty:${group.name}`) ?? null);
	let hasPreview = $derived(Boolean(activeLecturer || activeEmptyLead || activeEmptyGroup));

	onMount(() => { void loadLecturers(); });
	onMount(() => {
		const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotionPreference = () => { reducedMotion = motionPreference.matches; };
		updateMotionPreference();
		motionPreference.addEventListener('change', updateMotionPreference);
		return () => motionPreference.removeEventListener('change', updateMotionPreference);
	});

	async function loadLecturers() {
		const version = ++requestVersion;
		loading = true;
		errorMessage = '';
		try {
			const response = await requestApi('lecturers');
			if (version !== requestVersion) return;
			lecturers = Array.isArray(response?.data) ? response.data : [];
			selectedNodeId = '';
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
		selectedNodeId = '';
	}

	/** @param {string} nodeId */
	function selectNode(nodeId) {
		selectedNodeId = nodeId;
	}

	/** @param {Lecturer} lecturer */
	function selectLecturer(lecturer) {
		selectNode(lecturer.id);
	}
	import SeoHead from '../../lib/SeoHead.svelte';
</script>

<SeoHead title="Struktur Dosen TRM | Politeknik Dewantara" description="Lihat struktur dosen Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara beserta bidang konsentrasi yang tersedia." canonicalPath="/struktur" />

<PageIntro section="Program studi · 02" title="Struktur & dosen" description="Struktur utama Program Studi Teknologi Rekayasa Multimedia." />

<section class="organization section-rule" aria-labelledby="organization-title">
	<div class="chart-heading"><p class="eyebrow">Organisasi program studi</p><h2 id="organization-title" class="section-heading">Struktur dosen TRM</h2></div>
	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat data dosen…</p>
	{:else if errorMessage}
		<div class="error-state" role="alert"><p>Data dosen belum dapat dimuat.</p><p>{errorMessage}</p><button class="retry-button" type="button" onclick={loadLecturers}>Coba lagi</button></div>
	{:else}
		<div class="org-chart" class:with-preview={hasPreview} role="group" aria-label="Struktur program studi" onpointerleave={clearPointerPreview} onfocusout={(event) => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) selectedNodeId = ''; }}>
			<div class="chart-main">
				<div class="lead-node" class:active={selectedNodeId === (leadLecturer?.id ?? 'empty:lead')}>
					{#if leadLecturer}
						<button class="node-button" type="button" aria-controls="profile-preview" aria-expanded={selectedNodeId === leadLecturer.id} onclick={() => selectLecturer(leadLecturer)} onpointerenter={(event) => event.pointerType !== 'touch' && selectLecturer(leadLecturer)} onfocus={() => selectLecturer(leadLecturer)}><span class="node-role">{leadLecturer.title || 'Kaprodi'}</span><strong>{leadLecturer.name}</strong><span class="node-note">Informasi dari data dosen program studi</span></button>
					{:else}
						<button class="node-button" type="button" aria-controls="profile-preview" aria-expanded={selectedNodeId === 'empty:lead'} onclick={() => selectNode('empty:lead')} onpointerenter={(event) => event.pointerType !== 'touch' && selectNode('empty:lead')} onfocus={() => selectNode('empty:lead')}><span class="node-role">Kaprodi</span><strong>Data belum tersedia</strong><span class="node-note">Belum ada data dosen tanpa konsentrasi pada API.</span></button>
					{/if}
				</div>
				<div class="chart-connector" aria-hidden="true"></div>
				<ol class="concentration-nodes" aria-label="Bidang konsentrasi">
					{#each groups as group (group.name)}
						<li class="concentration-node" class:active={selectedNodeId === `empty:${group.name}`}>
							{#if group.lecturers.length}
								<p class="node-role">Konsentrasi</p><h3>{group.name}</h3>
								<ul class="lecturer-list">
									{#each group.lecturers as lecturer (lecturer.id)}
										<li><button class="lecturer-button" class:active={selectedNodeId === lecturer.id} type="button" aria-controls="profile-preview" aria-expanded={selectedNodeId === lecturer.id} onclick={() => selectLecturer(lecturer)} onpointerenter={(event) => event.pointerType !== 'touch' && selectLecturer(lecturer)} onfocus={() => selectLecturer(lecturer)}><strong>{lecturer.name}</strong><span>{lecturer.title}</span></button></li>
									{/each}
								</ul>
							{:else}<button class="empty-node-button" type="button" aria-controls="profile-preview" aria-expanded={selectedNodeId === `empty:${group.name}`} onclick={() => selectNode(`empty:${group.name}`)} onpointerenter={(event) => event.pointerType !== 'touch' && selectNode(`empty:${group.name}`)} onfocus={() => selectNode(`empty:${group.name}`)}><span class="node-role">Konsentrasi</span><span class="empty-node-title" role="heading" aria-level="3">{group.name}</span><span class="group-empty">Belum ada data dosen.</span></button>{/if}
						</li>
					{/each}
				</ol>
			</div>
			{#if hasPreview}
				<aside id="profile-preview" class="profile-preview" aria-label="Pratinjau profil dosen" aria-live="polite" aria-atomic="true" transition:fade={{ duration: reducedMotion ? 0 : 280 }}>
					{#if activeLecturer}
						{#if activeLecturer.photoPath}<img class="portrait" src={mediaUrl(activeLecturer.photoPath)} alt={`Foto ${activeLecturer.name}`} />{:else}<div class="portrait-placeholder" aria-hidden="true">Foto dosen belum tersedia</div>{/if}
						<p class="eyebrow">{activeLecturer.concentration ?? 'Program studi'}</p><h3>{activeLecturer.name}</h3><p class="preview-title">{activeLecturer.title}</p>
						{#if activeLecturer.bio}<p>{activeLecturer.bio}</p>{:else}<p>Profil dosen belum tersedia.</p>{/if}
					{:else if activeEmptyGroup}
						<div class="portrait-placeholder" aria-hidden="true">Profil dosen belum tersedia</div>
						<p class="eyebrow">{activeEmptyGroup.name}</p><h3>Data belum tersedia</h3><p>Belum ada data dosen untuk konsentrasi ini.</p>
					{:else}
						<div class="portrait-placeholder" aria-hidden="true">Profil dosen belum tersedia</div>
						<p class="eyebrow">Program studi</p><h3>Data Kaprodi belum tersedia</h3><p>Belum ada data dosen tanpa konsentrasi pada layanan publik.</p>
					{/if}
				</aside>
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
	.node-button { width: 100%; min-height: 100%; display: flex; align-items: center; flex-direction: column; padding: 1.5rem 1.25rem 1.3rem; border: 0; background: transparent; color: inherit; text-align: center; cursor: pointer; }
	.node-button:focus-visible, .lecturer-button:focus-visible, .empty-node-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.node-button strong { font: 500 1.25rem/1.35 'Poppins', sans-serif; }
	.node-role { margin: 0 0 .65rem; font: 500 .7rem/1.3 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	.node-note { margin: .45rem 0 0; font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .72; }
	.chart-connector { position: relative; width: 1px; height: 62px; background: var(--line); }
	.chart-connector::after { position: absolute; right: 0; bottom: 0; left: 0; height: 1px; content: ''; background: var(--line); }
	.concentration-nodes { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); width: 100%; gap: 1.25rem; margin: 0; padding: 0; list-style: none; }
	.concentration-nodes::before { position: absolute; top: -1px; right: 12.5%; left: 12.5%; height: 1px; content: ''; background: var(--line); }
	.concentration-node { min-width: 0; min-height: 138px; display: flex; flex-direction: column; padding: 1.15rem 1rem; border-top: 1px solid var(--line); }
	.concentration-node:nth-child(2) { border-top-color: transparent; }
	.concentration-node h3 { margin: 0 0 .55rem; font: 500 1.05rem/1.35 'Poppins', sans-serif; }
	.lecturer-list { display: grid; gap: .35rem; margin: 0; padding: 0; list-style: none; }
	.lecturer-button { width: 100%; display: grid; gap: .2rem; padding: .55rem 0; border: 0; border-bottom: 1px solid var(--line); background: transparent; color: inherit; text-align: left; cursor: pointer; }
	.lecturer-button strong { font: 500 .83rem/1.4 'Inter', sans-serif; }
	.lecturer-button span { font-size: .72rem; line-height: 1.4; opacity: .68; }
	.lead-node.active, .concentration-node.active { border-color: currentColor; }
	.lecturer-button.active, .lecturer-button:hover, .empty-node-button:hover, .empty-node-button[aria-expanded='true'] { text-decoration: underline; text-underline-offset: .22em; }
	.empty-node-button { width: 100%; min-height: 100px; flex: 1; display: flex; align-items: flex-start; flex-direction: column; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
	.empty-node-button .node-role { margin-bottom: .6rem; }
	.empty-node-title { margin: 0 0 .55rem; font: 500 1.05rem/1.35 'Poppins', sans-serif; }
	.group-empty { margin: 0; font: 400 .76rem/1.5 'Inter', sans-serif; opacity: .68; }
	.empty-node-button:hover .group-empty, .empty-node-button[aria-expanded='true'] .group-empty { opacity: 1; text-decoration: underline; text-underline-offset: .22em; }
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
		.empty-node-button { min-height: 64px; }
		.profile-preview { margin-top: 1.5rem; padding: 1.25rem; border-top: 1px solid var(--line); }
		.portrait-placeholder { min-height: 140px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.org-chart { transition: none; }
	}
</style>
