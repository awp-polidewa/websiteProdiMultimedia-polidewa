<script>
	import { onMount, tick } from 'svelte';
	import { mediaUrl, requestApi } from '../admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, description: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, category: string, studentName: string | null, projectYear: number | null }} Project */
	/** @typedef {{ id: string, title: string, slug: string, excerpt: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, publishedAt: string }} NewsItem */
	const NEWS_CARD_GAP = 12;
	const NEWS_BUFFER_SLOTS = 2;

	/** @type {Project[]} */
	let projects = $state([]);
	/** @type {NewsItem[]} */
	let news = $state([]);
	let projectLoading = $state(true);
	let newsLoading = $state(true);
	let projectError = $state('');
	let newsError = $state('');
	/** @type {HTMLElement | null} */
	let newsViewport = $state(null);
	let reducedMotion = $state(false);
	let newsSlotCount = $state(13);
	let newsBaseIndex = $state(0);
	let newsProgress = 0;
	let newsLayoutRevision = 0;
	let newsSlots = $derived(news.length ? Array.from({ length: newsSlotCount }, (_, index) => {
		const virtualIndex = newsBaseIndex + index - NEWS_BUFFER_SLOTS;
		const itemIndex = ((virtualIndex % news.length) + news.length) % news.length;
		return { ...news[itemIndex], virtualIndex };
	}) : []);
	let motionFrame = 0;
	let lastFrameTime = 0;
	let pointerDown = false;
	let pointerStartX = 0;
	let pointerLastX = 0;
	let didDrag = false;
	let suppressClick = false;
	let hoverPaused = false;
	let focusPaused = false;
	let pageHidden = false;
	let wheelResumeTimer = 0;
	let wheelPaused = false;

	/** @param {unknown} error @param {string} fallback */
	function getErrorMessage(error, fallback) {
		return error instanceof Error ? error.message : fallback;
	}

	async function measureNewsGroup() {
		if (!newsViewport || news.length === 0) return;
		const nextSlotCount = getRequiredNewsSlotCount(newsViewport.clientWidth);
		if (nextSlotCount !== newsSlotCount) {
			newsSlotCount = nextSlotCount;
			await tick();
		}
		updateNewsLayout();
	}

	/** Return a stable card width that shows about four cards on desktop and fewer at narrower widths. @param {number} viewportWidth */
	function getNewsCardWidth(viewportWidth) {
		if (viewportWidth <= 700) return Math.max(250, Math.min(340, viewportWidth - 48));
		if (viewportWidth <= 1000) return Math.max(280, (viewportWidth - NEWS_CARD_GAP * 2.4) / 2.4);
		return Math.max(280, (viewportWidth - NEWS_CARD_GAP * 3) / 4);
	}

	/** Keep enough fixed-pitch cards rendered to cover the viewport and both edges during looping. @param {number} viewportWidth */
	function getRequiredNewsSlotCount(viewportWidth) {
		const pitch = getNewsCardWidth(viewportWidth) + NEWS_CARD_GAP;
		return Math.ceil(viewportWidth / pitch) + 1 + NEWS_BUFFER_SLOTS * 2;
	}

	function updateNewsLayout() {
		if (!newsViewport || news.length === 0) return;
		const viewportWidth = newsViewport.clientWidth;
		const cardWidth = getNewsCardWidth(viewportWidth);
		const pitch = cardWidth + NEWS_CARD_GAP;
		const fraction = newsProgress - Math.floor(newsProgress);
		for (const card of /** @type {NodeListOf<HTMLAnchorElement>} */ (newsViewport.querySelectorAll('.news-card'))) {
			const slotIndex = Number(card.style.getPropertyValue('--face'));
			card.style.setProperty('--card-x', `${(slotIndex - NEWS_BUFFER_SLOTS) * pitch - fraction * pitch}px`);
			card.style.setProperty('--card-width', `${cardWidth}px`);
		}
	}

	/** @param {number} delta */
	function advanceNewsProgress(delta) {
		newsProgress += delta;
		const nextBaseIndex = Math.floor(newsProgress);
		if (nextBaseIndex !== newsBaseIndex) {
			newsBaseIndex = nextBaseIndex;
			const revision = ++newsLayoutRevision;
			void tick().then(() => {
				if (revision === newsLayoutRevision) updateNewsLayout();
			});
		} else {
			updateNewsLayout();
		}
	}

	function stopNewsMotion() {
		if (motionFrame) window.cancelAnimationFrame(motionFrame);
		motionFrame = 0;
		lastFrameTime = 0;
	}

	function canAnimateNews() {
		return !reducedMotion && !focusPaused && !pointerDown && !wheelPaused && !pageHidden && news.length > 0 && Boolean(newsViewport);
	}

	/** @param {number} timestamp */
	function renderNewsMotion(timestamp) {
		motionFrame = 0;
		if (!canAnimateNews() || !newsViewport) return;
		if (lastFrameTime) advanceNewsProgress(Math.min(timestamp - lastFrameTime, 48) * (hoverPaused ? 0.00018 : 0.00035));
		lastFrameTime = timestamp;
		motionFrame = window.requestAnimationFrame(renderNewsMotion);
	}

	function startNewsMotion() {
		if (canAnimateNews() && !motionFrame) motionFrame = window.requestAnimationFrame(renderNewsMotion);
	}

	function getNewsDragPitch() {
		if (!newsViewport) return 1;
		return getNewsCardWidth(newsViewport.clientWidth) + NEWS_CARD_GAP;
	}

	/** @param {PointerEvent} event */
	function handlePointerDown(event) {
		if (!newsViewport || event.button !== 0) return;
		pointerDown = true;
		pointerStartX = event.clientX;
		pointerLastX = event.clientX;
		didDrag = false;
		stopNewsMotion();
		newsViewport.setPointerCapture(event.pointerId);
	}

	/** @param {PointerEvent} event */
	function handlePointerMove(event) {
		if (!pointerDown || !newsViewport) return;
		const distance = event.clientX - pointerStartX;
		let deltaX = 0;
		if (!didDrag && Math.abs(distance) > 5) {
			didDrag = true;
			deltaX = distance;
		} else if (didDrag) {
			deltaX = event.clientX - pointerLastX;
		}
		pointerLastX = event.clientX;
		if (didDrag && deltaX) advanceNewsProgress(-deltaX / getNewsDragPitch());
	}

	function handlePointerUp() {
		if (!pointerDown) return;
		pointerDown = false;
		if (didDrag) {
			suppressClick = true;
			window.setTimeout(() => { suppressClick = false; }, 0);
		}
		startNewsMotion();
	}

	/** @param {MouseEvent} event */
	function handleCardClick(event) {
		if (!suppressClick) return;
		event.preventDefault();
		suppressClick = false;
	}

	function handlePointerEnter() {
		hoverPaused = true;
		startNewsMotion();
	}

	function handlePointerLeave() {
		hoverPaused = false;
		startNewsMotion();
	}

	/** @param {WheelEvent} event */
	function handleNewsWheel(event) {
		if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
		wheelPaused = true;
		stopNewsMotion();
		advanceNewsProgress(event.deltaX / getNewsDragPitch());
		window.clearTimeout(wheelResumeTimer);
		wheelResumeTimer = window.setTimeout(() => {
			wheelPaused = false;
			startNewsMotion();
		}, 900);
	}

	function handleFocusIn() {
		focusPaused = true;
		stopNewsMotion();
	}

	/** @param {FocusEvent} event */
	function handleFocusOut(event) {
		if (newsViewport?.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) return;
		focusPaused = false;
		startNewsMotion();
	}

	function handleMotionChange() {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) stopNewsMotion();
		else startNewsMotion();
	}

	function handleVisibilityChange() {
		pageHidden = document.visibilityState === 'hidden';
		if (pageHidden) stopNewsMotion();
		else startNewsMotion();
	}

	function handleResize() {
		measureNewsGroup();
	}

	async function loadProjects() {
		projectLoading = true;
		projectError = '';
		try {
			const response = await requestApi('projects?page=1');
			projects = Array.isArray(response?.data) ? response.data.slice(0, 3) : [];
		} catch (error) {
			projectError = getErrorMessage(error, 'Karya belum dapat dimuat.');
		} finally {
			projectLoading = false;
		}
	}

	async function loadNews() {
		newsLoading = true;
		newsError = '';
		try {
			const response = await requestApi('news?page=1');
			news = Array.isArray(response?.data) ? response.data : [];
		} catch (error) {
			newsError = getErrorMessage(error, 'Berita belum dapat dimuat.');
		} finally {
			newsLoading = false;
			await tick();
			measureNewsGroup();
			startNewsMotion();
		}
	}

	/** @param {string} value */
	function formatDate(value) {
		const date = new Date(value);
		if (!value || Number.isNaN(date.getTime())) return '';
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = motionQuery.matches;
		pageHidden = document.visibilityState === 'hidden';
		void loadProjects();
		void loadNews();
		window.addEventListener('resize', handleResize, { passive: true });
		document.addEventListener('visibilitychange', handleVisibilityChange);
		motionQuery.addEventListener('change', handleMotionChange);
		return () => {
			stopNewsMotion();
			window.clearTimeout(wheelResumeTimer);
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			motionQuery.removeEventListener('change', handleMotionChange);
		};
	});
</script>

<section class="work-section section-rule" aria-labelledby="work-title">
	<div class="work-shell">
		<header class="work-heading">
			<div><p class="eyebrow">Showcase · 02</p><h2 id="work-title">Karya mahasiswa</h2></div>
			<div class="work-intro"><p>Project mahasiswa yang menerapkan ide, keterampilan, dan proses produksi multimedia.</p><a class="work-cta" href="/karya">Lihat showcase <span aria-hidden="true">↗</span></a></div>
		</header>
		{#if projectLoading}
			<p class="showcase-state" role="status" aria-live="polite">Memuat karya…</p>
		{:else if projectError}
			<div class="showcase-state" role="alert"><p>{projectError}</p><button type="button" onclick={loadProjects}>Coba lagi</button></div>
		{:else if projects.length === 0}
			<p class="showcase-empty">Belum ada karya yang dipublikasikan.</p>
		{:else}
			<div class="project-grid">
				{#each projects as project (project.id)}
					<a class="project-card" href={`/karya/${encodeURIComponent(project.slug)}`} aria-label={`Lihat karya ${project.title}`}>
						<div class="project-image">{#if project.thumbnailPath}<img src={mediaUrl(project.thumbnailPath)} alt="" loading="lazy" />{:else}<span>Gambar belum tersedia</span>{/if}</div>
						<div class="project-meta"><span>{project.category}</span>{#if project.projectYear}<span>{project.projectYear}</span>{/if}</div>
						<h3>{project.title}</h3>
						{#if project.studentName}<p>{project.studentName}</p>{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<section class="news-section section-rule" aria-labelledby="news-title">
	<div class="news-heading">
		<p class="eyebrow">Publikasi · 03</p>
		<h2 id="news-title">Berita prodi</h2>
		<p class="news-subtitle">Kabar terbaru dari Program Studi Teknologi Rekayasa <span>Multimedia</span></p>
		<a class="news-cta" href="/berita">Semua berita <span class="cta-arrow" aria-hidden="true">↗</span></a>
	</div>
	{#if newsLoading}
		<p class="news-state" role="status" aria-live="polite">Memuat berita…</p>
	{:else if newsError}
		<div class="news-state" role="alert"><p>{newsError}</p><button type="button" onclick={loadNews}>Coba lagi</button></div>
	{:else if news.length === 0}
		<p class="news-empty">Belum ada berita yang dipublikasikan.</p>
	{:else}
		<div
			class="news-wall"
			class:news-wall--reduced={reducedMotion}
			role="region"
			tabindex="-1"
			aria-label="Berita terbaru. Geser atau tarik kartu secara horizontal untuk melihat berita."
			bind:this={newsViewport}
			onwheel={handleNewsWheel}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			onfocusin={handleFocusIn}
			onfocusout={handleFocusOut}
		>
			{#each newsSlots as slot, slotIndex (slot.virtualIndex)}
				<a
					class="news-card"
					style={`--face:${slotIndex};`}
					href={`/berita/${encodeURIComponent(slot.slug)}`}
					onclick={handleCardClick}
				>
					<span class="news-card-content">
					{#if slot.thumbnailPath}
						<img class="news-card-image" src={mediaUrl(slot.thumbnailPath)} alt="" loading={Math.abs(slotIndex - NEWS_BUFFER_SLOTS) < 5 ? 'eager' : 'lazy'} />
					{:else}
						<span class="news-card-image-fallback" aria-label="Foto berita tidak tersedia">Foto tidak tersedia</span>
					{/if}
					<span class="news-card-copy">
						<strong>{slot.title}</strong>
						<span class="news-card-footer">
							<span class="read-label">Baca Berita <span aria-hidden="true">↗</span></span>
							{#if slot.publishedAt}<time datetime={slot.publishedAt}>{formatDate(slot.publishedAt)}</time>{/if}
						</span>
					</span>
					</span>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.work-section, .news-section { box-sizing: border-box; width: 100vw; margin-inline: calc(50% - 50vw); }
	.work-section { display: grid; min-height: 100svh; align-items: center; padding: clamp(6rem, 10svh, 8rem) var(--page-gutter) clamp(3rem, 7svh, 5rem); border-top: 1px solid var(--line); }
	.work-shell { width: min(100%, var(--page-max)); margin-inline: auto; }
	.work-heading { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: end; gap: 3rem; margin-bottom: clamp(2rem, 5svh, 3.5rem); }
	.work-heading .eyebrow, .news-heading .eyebrow { margin: 0 0 1rem; font: 500 .75rem/1.4 'Inter', sans-serif; letter-spacing: .13em; opacity: .65; text-transform: uppercase; }
	.work-heading h2, .news-heading h2 { margin: 0; color: #111; font: 500 clamp(2.5rem, 6vw, 5rem)/1 'Poppins', sans-serif; letter-spacing: -.06em; }
	.work-intro { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }
	.work-intro p { max-width: 430px; margin: 0; font: 400 .95rem/1.7 'Inter', sans-serif; opacity: .78; }
	.work-cta { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .8rem; color: #111; font: 500 .85rem/1.4 'Inter', sans-serif; text-decoration: none; text-underline-offset: .25em; }
	.work-cta:hover, .work-cta:focus-visible { text-decoration: underline; }
	.project-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(1rem, 2.2vw, 2rem); }
	.project-card { min-width: 0; color: inherit; text-decoration: none; }
	.project-image { display: grid; aspect-ratio: 1.34 / 1; overflow: hidden; place-items: center; background: #f0f1f3; color: #5f6062; font: 400 .8rem/1.5 'Inter', sans-serif; }
	.project-image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 240ms ease; }
	.project-card:hover img, .project-card:focus-visible img { transform: scale(1.025); }
	.project-card:focus-visible, .work-cta:focus-visible, .news-cta:focus-visible { outline: 2px solid #002aff; outline-offset: 5px; }
	.project-meta { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem; font: 400 .72rem/1.4 'Inter', sans-serif; opacity: .62; text-transform: capitalize; }
	.project-card h3 { margin: .5rem 0 0; font: 500 clamp(1.1rem, 1.7vw, 1.45rem)/1.3 'Poppins', sans-serif; }
	.project-card p { margin: .35rem 0 0; font: 400 .8rem/1.5 'Inter', sans-serif; opacity: .7; }
	.showcase-state, .showcase-empty { margin: 0; padding: 1.25rem 0; border-top: 1px solid var(--line); font: 400 .9rem/1.65 'Inter', sans-serif; }
	.showcase-state button, .news-state button { min-height: 42px; padding: .55rem .8rem; border: 1px solid currentColor; background: transparent; color: inherit; font: inherit; cursor: pointer; }
	.news-section { display: flex; min-height: 100svh; flex-direction: column; justify-content: flex-start; overflow: hidden; padding: clamp(7rem, 12svh, 8.25rem) 0 0; background: #fff; }
	.news-heading { display: flex; align-items: center; flex-direction: column; padding: 0 1.5rem; text-align: center; }
	.news-heading .eyebrow { margin-bottom: .45rem; }
	.news-heading h2 { font-size: clamp(1.8rem, 3.9vw, 3rem); }
	.news-subtitle { max-width: 1080px; margin: .11rem 0 0; color: #001fbd; font: 600 clamp(1.275rem, 3.825vw, 3.5rem)/1.04 'Poppins', sans-serif; letter-spacing: -.035em; text-wrap: balance; }
	.news-subtitle span { position: relative; z-index: 0; display: inline-block; padding-inline: .12em; color: #1a40ff; white-space: nowrap; }
	.news-subtitle span::before { position: absolute; z-index: -1; inset: 8% -.08em 2%; background: #090808; content: ''; transform: skew(-5deg); }
	.news-cta { display: inline-flex; min-height: 38px; align-items: center; gap: .525rem; margin-top: clamp(.75rem, 1.725svh, 1.125rem); padding: .26rem .38rem .26rem .82rem; border: 1px solid #002aff; border-radius: 999px; color: #585858; font: 500 .69rem/1.2 'Inter', sans-serif; text-decoration: none; transition: background-color 180ms ease, color 180ms ease; }
	.news-cta:hover { background: #002aff; color: #fff; }
	.cta-arrow { display: grid; width: 29px; height: 29px; border-radius: 50%; place-items: center; background: #002aff; color: #fff; font-size: .86rem; transition: background-color 180ms ease, color 180ms ease; }
	.news-cta:hover .cta-arrow { background: #fff; color: #002aff; }
	.news-state, .news-empty { width: min(100% - 2rem, 780px); box-sizing: border-box; align-self: center; margin: auto 0; padding: 1.25rem; border-top: 1px solid var(--line); font: 400 .9rem/1.65 'Inter', sans-serif; text-align: center; }
	.news-state button { margin-left: .7rem; }
	.news-wall { position: relative; width: 100%; height: min(53svh, 545px); min-height: 350px; flex: 0 0 auto; overflow: hidden; margin-top: auto; touch-action: pan-y; cursor: grab; }
	.news-wall:active { cursor: grabbing; }
	.news-card { position: absolute; top: 16px; bottom: 16px; left: var(--card-x, 0px); display: block; box-sizing: border-box; width: var(--card-width, 25%); min-width: 0; overflow: hidden; container-type: inline-size; border-radius: 14px; background: #020b1d; color: #fff; text-decoration: none; transition: filter 180ms ease; }
	.news-card-content { position: relative; display: flex; box-sizing: border-box; width: 100%; height: 100%; min-width: 0; min-height: 0; flex-direction: column; overflow: hidden; border-radius: inherit; background: #020b1d; }
	.news-card:hover, .news-card:focus-visible { filter: brightness(1.12); }
	.news-card:focus-visible { outline: 3px solid #ff5a14; outline-offset: -5px; }
	.news-card-image, .news-card-image-fallback { display: block; box-sizing: border-box; width: 100%; min-width: 0; min-height: 0; flex: 0 0 44%; }
	.news-card-image { object-fit: cover; }
	.news-card-image-fallback { display: grid; place-items: center; background: #172334; color: #a7b1c2; font: 500 clamp(9px, 3.2cqw, 12px)/1.4 'Inter', sans-serif; }
	.news-card-copy { display: flex; box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; min-height: 0; flex: 1 1 auto; flex-direction: column; justify-content: space-between; gap: clamp(5px, 2cqw, 9px); overflow: hidden; padding: clamp(8px, 4.8cqw, 14px); background: #020b1d; color: #fff; }
	.news-card-copy time { flex: 0 1 auto; color: #a7b1c2; font: 400 clamp(9px, 3cqw, 11px)/1.3 'Inter', sans-serif; text-align: right; }
	.news-card-copy strong { display: -webkit-box; min-width: 0; overflow: hidden; overflow-wrap: anywhere; font: 600 clamp(11px, 5.4cqw, 16px)/1.2 'Poppins', sans-serif; line-clamp: 3; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
	.news-card-footer { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: clamp(4px, 2cqw, 9px); }
	.read-label { display: inline-flex; min-height: 27px; box-sizing: border-box; align-items: center; justify-content: center; gap: .3rem; flex: 0 0 auto; border-radius: 999px; padding: 0 clamp(9px, 3.5cqw, 13px); background: #fff; color: #020b1d; font: 500 clamp(9px, 3.2cqw, 11px)/1.2 'Inter', sans-serif; white-space: nowrap; }
	@container (max-width: 220px) {
		.news-card-footer { align-items: flex-start; flex-direction: column; gap: 4px; }
		.news-card-copy time { text-align: left; }
	}
	@media (max-width: 700px) {
		.work-section { min-height: 100svh; padding: 7rem 20px 3rem; }
		.work-heading { grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem; }
		.work-heading h2 { font-size: clamp(2.4rem, 10vw, 3.5rem); }
		.work-intro { align-items: start; flex-direction: column; gap: 1rem; }
		.project-grid { grid-template-columns: 1fr; gap: 1.5rem; }
		.project-image { max-height: 34svh; aspect-ratio: 1.4 / 1; }
		.news-section { min-height: 100svh; padding-top: max(6.5rem, calc(env(safe-area-inset-top, 0px) + 5rem)); }
		.news-heading { padding-inline: 20px; }
		.news-heading h2 { font-size: clamp(1.69rem, 6.75vw, 2.475rem); }
		.news-subtitle { font-size: clamp(1.2rem, 5.25vw, 1.95rem); }
		.news-wall { height: 40svh; min-height: 280px; margin-top: auto; }
		.news-card { top: 12px; bottom: 12px; border-radius: 12px; }
		.news-card-content { border-radius: inherit; }
		.news-card-copy { gap: 4px; padding: clamp(7px, 4.8cqw, 10px); }
		.news-card-copy strong { line-clamp: 2; -webkit-line-clamp: 2; }
		.news-card-footer { align-items: flex-start; flex-direction: column; gap: 4px; }
		.news-card-copy time { text-align: left; }
		.read-label { min-height: 24px; }
	}
	@media (max-width: 390px) {
		.news-section { padding-top: 6.5rem; }
		.news-wall { height: 37svh; min-height: 260px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.project-image img, .news-cta, .cta-arrow { transition: none; }
		.news-card { transition: none; }
	}
</style>
