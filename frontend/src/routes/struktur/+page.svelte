<script>
	import PageIntro from '../../lib/PageIntro.svelte';
	import { fade } from 'svelte/transition';

	const organizationNodes = [
		{ id: 'kaprodi', title: 'Kaprodi', name: 'Nama belum tersedia', note: 'Profil resmi menunggu data dari program studi' },
		{ id: 'web-design', title: 'Konsentrasi', name: 'Web Design', note: 'Nama dosen belum tersedia' },
		{ id: 'desain-grafis', title: 'Konsentrasi', name: 'Desain Grafis', note: 'Nama dosen belum tersedia' },
		{ id: 'videografi', title: 'Konsentrasi', name: 'Videografi', note: 'Nama dosen belum tersedia' }
	];

	let selectedNodeId = $state('');
	const activeNode = $derived(organizationNodes.find((node) => node.id === selectedNodeId));

	/** @param {PointerEvent & { currentTarget: HTMLElement }} event */
	function clearPointerPreview(event) {
		if (event.pointerType === 'touch') return;
		if (document.activeElement instanceof Node && event.currentTarget.contains(document.activeElement)) return;
		selectedNodeId = '';
	}

</script>

<svelte:head>
	<title>Struktur Dosen — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Struktur program studi dan bidang konsentrasi dosen TRM Politeknik Dewantara." />
</svelte:head>

<PageIntro section="Program studi · 02" title="Struktur & dosen" description="Struktur utama Program Studi Teknologi Rekayasa Multimedia. Informasi nama dan profil dosen akan ditampilkan setelah data resmi tersedia." />

<section class="organization section-rule" aria-labelledby="organization-title">
	<div class="chart-heading"><p class="eyebrow">Organisasi program studi</p><h2 id="organization-title" class="section-heading">Struktur dosen TRM</h2></div>
	<div
		class="org-chart"
		class:with-preview={Boolean(activeNode)}
		role="group"
		aria-label="Struktur program studi"
		onpointerleave={clearPointerPreview}
		onfocusout={(event) => {
			if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) selectedNodeId = '';
		}}
	>
		<div class="chart-main">
			<div class="lead-node" class:active={selectedNodeId === organizationNodes[0].id}>
				<button
					class="node-button"
					type="button"
					aria-expanded={selectedNodeId === organizationNodes[0].id}
					onpointerenter={(event) => event.pointerType !== 'touch' && (selectedNodeId = organizationNodes[0].id)}
					onfocus={() => (selectedNodeId = organizationNodes[0].id)}
					onclick={() => (selectedNodeId = organizationNodes[0].id)}
				>
					<span class="node-role">{organizationNodes[0].title}</span>
					<strong>{organizationNodes[0].name}</strong>
					<span class="node-note">{organizationNodes[0].note}</span>
				</button>
			</div>
			<div class="chart-connector" aria-hidden="true"></div>
			<ol class="concentration-nodes" aria-label="Bidang konsentrasi">
				{#each organizationNodes.slice(1) as node (node.id)}
					<li class="concentration-node" class:active={selectedNodeId === node.id}>
						<button
							class="node-button"
							type="button"
							aria-expanded={selectedNodeId === node.id}
							onpointerenter={(event) => event.pointerType !== 'touch' && (selectedNodeId = node.id)}
							onfocus={() => (selectedNodeId = node.id)}
							onclick={() => (selectedNodeId = node.id)}
						>
							<span class="node-role">{node.title}</span>
							<strong>{node.name}</strong>
							<span class="node-note">{node.note}</span>
						</button>
					</li>
				{/each}
			</ol>
		</div>
		{#if activeNode}
			{#key activeNode.id}
				<aside class="profile-preview" aria-label="Pratinjau profil dosen" aria-live="polite" aria-atomic="true" transition:fade={{ duration: 280 }}>
					<div class="portrait-placeholder" aria-hidden="true">Foto resmi belum tersedia</div>
					<p class="eyebrow">Informasi belum tersedia</p>
					<h3>{activeNode.name}</h3>
					<p>{activeNode.title} · Nama dan profil dosen menunggu data resmi dari program studi.</p>
				</aside>
			{/key}
		{/if}
	</div>
	<p class="chart-caption">Pilih node untuk melihat area profil. Informasi dosen hanya ditampilkan setelah data resmi tersedia.</p>
</section>

<style>
	.organization { padding: 1.5rem 0 var(--space-section); }
	.chart-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; margin-bottom: 3.5rem; }
	.chart-heading .eyebrow { margin: 0 0 .7rem; opacity: .65; }
	.org-chart { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0fr); align-items: start; transition: grid-template-columns var(--motion-slow) var(--ease-state), gap var(--motion-slow) var(--ease-state); }
	.org-chart.with-preview { grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr); gap: clamp(1.5rem, 4vw, 4rem); }
	.chart-main { display: flex; align-items: center; flex-direction: column; min-width: 0; }
	.lead-node { width: min(100%, 440px); border: 1px solid var(--line); }
	.node-button { width: 100%; min-height: 100%; display: flex; align-items: center; flex-direction: column; padding: 1.5rem 1.25rem 1.3rem; color: inherit; text-align: center; background: transparent; border: 0; cursor: pointer; }
	.node-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.node-button strong { font: 500 1.25rem/1.35 'Poppins', sans-serif; }
	.node-role { margin: 0 0 .85rem; font: 500 .7rem/1.3 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	.node-note { margin: .45rem 0 0; font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .72; }
	.chart-connector { position: relative; width: 1px; height: 62px; background: var(--line); }
	.chart-connector::after { position: absolute; right: 0; bottom: 0; left: 0; height: 1px; content: ''; background: var(--line); }
	.concentration-nodes { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; gap: 1.25rem; margin: 0; padding: 0; list-style: none; }
	.concentration-nodes::before { position: absolute; top: -1px; right: 16.66%; left: 16.66%; height: 1px; content: ''; background: var(--line); }
	.concentration-node { min-width: 0; min-height: 138px; border-top: 1px solid var(--line); }
	.concentration-node:nth-child(2) { border-top-color: transparent; }
	.concentration-node .node-role { margin-bottom: .6rem; }
	.concentration-node .node-button { align-items: flex-start; padding: 1.25rem 1.1rem; text-align: left; }
	.concentration-node .node-button strong { font-size: 1.1rem; }
	.concentration-node.active, .lead-node.active { border-color: currentColor; }
	.profile-preview { min-width: 0; padding-top: 1rem; }
	.portrait-placeholder { display: grid; width: 100%; min-height: 180px; place-items: center; margin: 0 0 1.4rem; border: 1px solid var(--line); font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .75; }
	.profile-preview .eyebrow { margin: 0 0 .55rem; opacity: .65; }
	.profile-preview h3 { margin: 0; font: 500 1.3rem/1.3 'Poppins', sans-serif; }
	.profile-preview > p:last-child { max-width: 360px; margin: .6rem 0 0; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	.chart-caption { margin: 2rem 0 0; font: 400 .8rem/1.6 'Inter', sans-serif; opacity: .7; }
	@media (max-width: 760px) {
		.org-chart, .org-chart.with-preview { grid-template-columns: minmax(0, 1fr); gap: 0; }
		.chart-heading { align-items: start; flex-direction: column; gap: .8rem; margin-bottom: 2.5rem; }
		.lead-node { width: 100%; }
		.chart-connector { height: 2rem; }
		.chart-connector::after { right: auto; bottom: 0; left: 0; width: 1px; height: 1rem; }
		.concentration-nodes { grid-template-columns: 1fr; gap: 0; padding-left: 1rem; border-left: 1px solid var(--line); }
		.concentration-nodes::before { display: none; }
		.concentration-node, .concentration-node:nth-child(2) { min-height: 0; padding: 0; border-top: 1px solid var(--line); }
		.concentration-node .node-button { padding: 1rem; }
		.profile-preview { margin-top: 1.5rem; padding: 1.25rem; border-top: 1px solid var(--line); }
		.portrait-placeholder { min-height: 140px; }
	}
</style>
