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
	let brokenNewsImages = $state(new Set());
	/** @type {HTMLElement | null} */
	let newsViewport = $state(null);
	let reducedMotion = $state(false);
	let newsBaseIndex = $state(0);
	let newsProgress = $state(0);
	let newsLayoutRevision = 0;
	let newsSlots = $derived.by(() => {
		if (!news.length) return [];
		return Array.from({ length: NEWS_BUFFER_SLOTS * 2 + 1 }, (_, index) => {
			const virtualIndex = newsBaseIndex + index - NEWS_BUFFER_SLOTS;
			const itemIndex = ((virtualIndex % news.length) + news.length) % news.length;
			return { ...news[itemIndex], virtualIndex, visualKey: `news-visual-${virtualIndex}` };
		});
	});
	let pointerDown = $state(false);
	let pointerStartX = 0;
	let pointerLastX = 0;
	let didDrag = false;
	let suppressClick = false;
	let wheelSnapTimer = 0;

	/** @param {unknown} error @param {string} fallback */
	function getErrorMessage(error, fallback) {
		return error instanceof Error ? error.message : fallback;
	}

	async function measureNewsGroup() {
		if (!newsViewport || news.length === 0) return;
		updateNewsLayout();
	}

	function updateNewsLayout() {
		if (!newsViewport || news.length === 0) return;
		const viewportWidth = newsViewport.clientWidth;
		const wallHeight = newsViewport.getBoundingClientRect().height;
		const activeWidth = Math.min(520.8, Math.max(0, viewportWidth - 48));
		const activeHeight = wallHeight >= 539 ? 539.14 : wallHeight;
		const sideWidth = Math.min(395.48, activeWidth * (395.48 / 520.8));
		const sideHeight = Math.min(409.41, activeHeight * (409.41 / 539.14));
		const pitch = viewportWidth <= 700
			? activeWidth * 0.72 + NEWS_CARD_GAP
			: (activeWidth + sideWidth) / 2 + NEWS_CARD_GAP;
		const center = viewportWidth / 2;
		for (const card of /** @type {NodeListOf<HTMLAnchorElement>} */ (newsViewport.querySelectorAll('.news-card'))) {
			const slotIndex = Number(card.style.getPropertyValue('--face'));
			const offset = newsSlots[slotIndex].virtualIndex - newsProgress;
			const distance = Math.abs(offset);
			const sizeProgress = Math.min(1, distance);
			const width = activeWidth - (activeWidth - sideWidth) * sizeProgress;
			const height = activeHeight - (activeHeight - sideHeight) * sizeProgress;
			const opacity = 1 - Math.max(0, Math.min(1, (distance - 1.08) / 0.72));
			card.style.setProperty('--card-x', `${center + offset * pitch}px`);
			card.style.setProperty('--card-width', `${width}px`);
			card.style.setProperty('--card-height', `${height}px`);
			card.style.setProperty('--card-opacity', String(opacity));
			card.style.setProperty('--card-depth', String(20 - Math.round(distance * 10)));
			card.setAttribute('tabindex', distance <= 1.15 ? '0' : '-1');
			card.setAttribute('aria-hidden', String(distance > 1.15));
		}
	}

	/** @param {number} delta */
	function advanceNewsProgress(delta) {
		if (news.length === 0) return;
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

	function getNewsDragPitch() {
		if (!newsViewport) return 1;
		const viewportWidth = newsViewport.clientWidth;
		const activeWidth = Math.min(520.8, Math.max(0, viewportWidth - 48));
		const sideWidth = Math.min(395.48, activeWidth * (395.48 / 520.8));
		return viewportWidth <= 700
			? activeWidth * 0.72 + NEWS_CARD_GAP
			: (activeWidth + sideWidth) / 2 + NEWS_CARD_GAP;
	}

	function snapNewsToNearestCard() {
		advanceNewsProgress(Math.round(newsProgress) - newsProgress);
	}

	/** @param {KeyboardEvent} event */
	function handleNewsKeydown(event) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		advanceNewsProgress(event.key === 'ArrowRight' ? 1 : -1);
	}

	/** @param {PointerEvent} event */
	function handlePointerDown(event) {
		if (!newsViewport || event.button !== 0) return;
		window.clearTimeout(wheelSnapTimer);
		pointerDown = true;
		pointerStartX = event.clientX;
		pointerLastX = event.clientX;
		didDrag = false;
	}

	/** @param {PointerEvent} event */
	function handlePointerMove(event) {
		if (!pointerDown || !newsViewport) return;
		const distance = event.clientX - pointerStartX;
		let deltaX = 0;
		if (!didDrag && Math.abs(distance) > 5) {
			didDrag = true;
			newsViewport.setPointerCapture(event.pointerId);
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
			snapNewsToNearestCard();
			suppressClick = true;
			window.setTimeout(() => { suppressClick = false; }, 0);
		}
	}

	/** @param {MouseEvent} event */
	function handleCardClick(event) {
		if (!suppressClick) return;
		event.preventDefault();
		suppressClick = false;
	}

	/** @param {WheelEvent} event */
	function handleNewsWheel(event) {
		if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
		advanceNewsProgress(event.deltaX / getNewsDragPitch());
		window.clearTimeout(wheelSnapTimer);
		wheelSnapTimer = window.setTimeout(snapNewsToNearestCard, 140);
	}

	function handleMotionChange() {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/** @param {string} id */
	function handleNewsImageError(id) {
		brokenNewsImages = new Set(brokenNewsImages).add(id);
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
			const firstPage = await requestApi('news?page=1');
			const allNews = Array.isArray(firstPage?.data) ? [...firstPage.data] : [];
			const totalPages = Number(firstPage?.meta?.totalPages) || 1;
			for (let page = 2; page <= totalPages; page += 1) {
				const response = await requestApi(`news?page=${page}`);
				if (Array.isArray(response?.data)) allNews.push(...response.data);
			}
			news = allNews;
		} catch (error) {
			newsError = getErrorMessage(error, 'Berita belum dapat dimuat.');
		} finally {
			newsLoading = false;
			await tick();
			measureNewsGroup();
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
		void loadProjects();
		void loadNews();
		window.addEventListener('resize', handleResize, { passive: true });
		motionQuery.addEventListener('change', handleMotionChange);
		return () => {
			window.clearTimeout(wheelSnapTimer);
			window.removeEventListener('resize', handleResize);
			motionQuery.removeEventListener('change', handleMotionChange);
		};
	});
</script>

<svelte:window onpointermove={handlePointerMove} onpointerup={handlePointerUp} onpointercancel={handlePointerUp} />

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

<section id="news-section" class="news-section section-rule" aria-labelledby="news-title">
	<div class="news-heading">
		<h2 id="news-title">Berita teknologi rekayasa multimedia</h2>
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
			class:news-wall--dragging={pointerDown}
			role="region"
			aria-label="Carousel berita. Gunakan tombol panah kiri dan kanan, geser, atau tarik kartu untuk menjelajahi berita."
			bind:this={newsViewport}
		>
			{#each newsSlots as slot, slotIndex (slot.visualKey)}
				<a
					class="news-card"
					class:news-card--active={Math.abs(slot.virtualIndex - newsProgress) < 0.5}
					class:news-card--inactive={Math.abs(slot.virtualIndex - newsProgress) >= 0.5}
					style={`--face:${slotIndex};`}
					href={`/berita/${encodeURIComponent(slot.slug)}`}
					aria-label={`Baca berita: ${slot.title}`}
					tabindex={Math.abs(slot.virtualIndex - newsProgress) <= 1.15 ? 0 : -1}
					onkeydown={handleNewsKeydown}
					onwheel={handleNewsWheel}
					onpointerdown={handlePointerDown}
					onclick={handleCardClick}
				>
					<span class="news-card-content">
					{#if slot.thumbnailPath && !brokenNewsImages.has(slot.id)}
						<img class="news-card-image" src={mediaUrl(slot.thumbnailPath)} alt="" loading={Math.abs(slotIndex - NEWS_BUFFER_SLOTS) < 5 ? 'eager' : 'lazy'} onerror={() => handleNewsImageError(slot.id)} />
					{:else}
						<span class="news-card-image-fallback" role="img" aria-label="Foto berita tidak tersedia">Foto tidak tersedia</span>
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
			<button class="news-nav news-nav--previous" type="button" aria-label="Berita sebelumnya" onclick={() => advanceNewsProgress(-1)}><span aria-hidden="true">←</span></button>
			<button class="news-nav news-nav--next" type="button" aria-label="Berita berikutnya" onclick={() => advanceNewsProgress(1)}><span aria-hidden="true">→</span></button>
		</div>
	{/if}
	<a class="news-cta" href="/berita">Lihat semua berita <span class="cta-arrow" aria-hidden="true">→</span></a>
</section>

<style>
	.work-section, .news-section { box-sizing: border-box; width: 100vw; margin-inline: calc(50% - 50vw); }
	.work-section { display: grid; min-height: 100svh; align-items: center; padding: clamp(6rem, 10svh, 8rem) var(--page-gutter) clamp(3rem, 7svh, 5rem); border-top: 1px solid var(--line); }
	.work-shell { width: min(100%, var(--page-max)); margin-inline: auto; }
	.work-heading { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: end; gap: 3rem; margin-bottom: clamp(2rem, 5svh, 3.5rem); }
	.work-heading .eyebrow { margin: 0 0 1rem; font: 500 .75rem/1.4 'Inter', sans-serif; letter-spacing: .13em; opacity: .65; text-transform: uppercase; }
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
	.news-section { display: flex; box-sizing: border-box; width: 100vw; height: 100vh; height: 100dvh; min-height: 620px; flex-direction: column; align-items: center; overflow: hidden; margin-inline: calc(50% - 50vw); padding: clamp(7rem, 12vh, 8.25rem) 0 1.5rem; background: #fff; }
	.news-heading { display: flex; align-items: center; flex-direction: column; padding: 0 1.5rem; text-align: center; }
	.news-heading h2 { max-width: 850px; color: #071650; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.12; letter-spacing: -.04em; text-wrap: balance; }
	.news-cta { display: inline-flex; min-height: 52px; flex: 0 0 auto; align-items: center; gap: .9rem; margin-top: clamp(1rem, 2.4vh, 1.5rem); padding: .25rem 1.2rem; border: 1px solid #244bff; border-radius: 999px; color: #1736db; font: 500 clamp(1rem, 1.8vw, 1.4rem)/1.2 'Inter', sans-serif; text-decoration: none; transition: background-color 220ms ease, color 220ms ease, transform 220ms ease; }
	.news-cta:hover { background: #244bff; color: #fff; transform: translateY(-2px); }
	.cta-arrow { display: grid; width: 36px; height: 36px; border: 1px solid currentColor; border-radius: 50%; place-items: center; font-size: 1.3rem; transition: transform 220ms ease; }
	.news-cta:hover .cta-arrow { transform: translateX(3px); }
	.news-state, .news-empty { width: min(100% - 2rem, 780px); box-sizing: border-box; align-self: center; margin: auto 0; padding: 1.25rem; border-top: 1px solid var(--line); font: 400 .9rem/1.65 'Inter', sans-serif; text-align: center; }
	.news-state button { margin-left: .7rem; }
	.news-wall { position: relative; width: 100%; height: min(539.14px, 55vh); height: min(539.14px, 55dvh); min-height: 300px; flex: 0 0 auto; overflow: hidden; margin-top: auto; touch-action: pan-y; cursor: grab; }
	.news-wall::before, .news-wall::after { position: absolute; z-index: 50; top: 0; bottom: 0; width: clamp(3.5rem, 10vw, 10rem); pointer-events: none; content: ''; }
	.news-wall::before { left: 0; background: linear-gradient(90deg, #fff 0%, rgb(255 255 255 / 86%) 28%, rgb(255 255 255 / 0%) 100%); }
	.news-wall::after { right: 0; background: linear-gradient(270deg, #fff 0%, rgb(255 255 255 / 86%) 28%, rgb(255 255 255 / 0%) 100%); }
	.news-wall:active { cursor: grabbing; }
	.news-nav { position: absolute; z-index: 60; top: 50%; display: grid; width: 44px; height: 44px; transform: translateY(-50%); place-items: center; border: 1px solid rgb(0 10 29 / 12%); border-radius: 50%; background: rgb(255 255 255 / 92%); box-shadow: 0 4px 18px rgb(0 10 29 / 12%); color: #000a1d; font: 500 1.2rem/1 'Inter', sans-serif; cursor: pointer; transition: background-color 180ms ease, transform 180ms ease; }
	.news-nav:hover { transform: translateY(-50%) scale(1.06); background: #fff; }
	.news-nav:focus-visible { outline: 2px solid #244bff; outline-offset: 3px; }
	.news-nav--previous { left: clamp(8px, 3vw, 40px); }
	.news-nav--next { right: clamp(8px, 3vw, 40px); }
	.news-card { position: absolute; top: 50%; left: var(--card-x, 50%); display: block; box-sizing: border-box; width: var(--card-width, 395.48px); height: var(--card-height, 409.41px); max-width: calc(100vw - 48px); max-height: min(539.14px, calc(100dvh - 300px)); min-width: 0; flex-shrink: 0; overflow: hidden; container-type: inline-size; border-radius: 28px; background: #000a1d; color: #fff; opacity: var(--card-opacity, 1); text-decoration: none; transform: translate3d(-50%, -50%, 0); z-index: var(--card-depth, 0); transition: left 500ms cubic-bezier(.2,.75,.25,1), width 500ms cubic-bezier(.2,.75,.25,1), height 500ms cubic-bezier(.2,.75,.25,1), opacity 420ms ease, filter 180ms ease; }
	.news-wall--dragging .news-card { transition: none; }
	.news-wall--reduced .news-card { transition: none; }
	.news-card-content { position: relative; display: flex; box-sizing: border-box; width: 100%; height: 100%; min-width: 0; min-height: 0; flex-direction: column; overflow: hidden; border-radius: inherit; background: #000a1d; }
	.news-card:hover, .news-card:focus-visible { filter: brightness(1.12); }
	.news-card:focus-visible { outline: 3px solid #ff5a14; outline-offset: -5px; }
	.news-card-image, .news-card-image-fallback { display: block; box-sizing: border-box; width: 100%; min-width: 0; min-height: 0; flex: 0 0 64%; }
	.news-card-image { object-fit: cover; }
	.news-card-image-fallback { display: grid; place-items: center; background: #172334; color: #a7b1c2; font: 500 clamp(9px, 3.2cqw, 12px)/1.4 'Inter', sans-serif; }
	.news-card-copy { display: flex; box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; min-height: 0; flex: 1 1 auto; align-items: flex-start; flex-direction: column; justify-content: space-between; gap: clamp(5px, 2cqw, 9px); overflow: hidden; padding: clamp(12px, 4.8cqw, 24px); background: #000a1d; color: #fff; text-align: left; }
	.news-card-copy time { flex: 0 1 auto; margin-left: auto; color: #a7b1c2; font: 400 clamp(9px, 3cqw, 11px)/1.3 'Inter', sans-serif; text-align: right; }
	.news-card-copy strong { display: -webkit-box; width: 100%; min-width: 0; overflow: hidden; overflow-wrap: anywhere; font: 600 clamp(11px, 5.4cqw, 16px)/1.2 'Poppins', sans-serif; line-clamp: 3; text-align: left; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
	.news-card-footer { display: flex; width: 100%; min-width: 0; align-items: center; justify-content: flex-start; gap: clamp(4px, 2cqw, 9px); }
	.read-label { display: inline-flex; min-height: clamp(27px, 6cqw, 52px); box-sizing: border-box; align-items: center; justify-content: center; gap: .3rem; flex: 0 0 auto; align-self: flex-start; border-radius: 999px; padding: 0 clamp(9px, 3.5cqw, 20px); background: #fff; color: #000a1d; font: 500 clamp(9px, 3.2cqw, 17px)/1.2 'Inter', sans-serif; white-space: nowrap; }
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
		.news-section { min-height: max(620px, 100vh); min-height: max(620px, 100dvh); padding-top: max(6.5rem, calc(env(safe-area-inset-top, 0px) + 5rem)); padding-bottom: max(1.25rem, env(safe-area-inset-bottom, 0px)); }
		.news-heading { padding-inline: 20px; }
		.news-heading h2 { font-size: clamp(1.8rem, 7vw, 2.7rem); }
		.news-wall { height: 40vh; height: 40dvh; min-height: 280px; margin-top: auto; }
		.news-nav { width: 40px; height: 40px; }
		.news-card { border-radius: 12px; }
		.news-card-content { border-radius: inherit; }
		.news-card-copy { gap: 4px; padding: clamp(7px, 4.8cqw, 10px); }
		.news-card-copy strong { line-clamp: 2; -webkit-line-clamp: 2; }
		.news-card-copy time { margin-left: 0; text-align: left; }
		.read-label { min-height: 24px; }
		.news-cta { min-height: 44px; margin-top: 1rem; margin-bottom: clamp(4.5rem, 9vh, 5.5rem); font-size: 1rem; }
		.cta-arrow { width: 30px; height: 30px; }
	}
	@media (max-width: 390px) {
		.news-section { padding-top: 6.5rem; }
		.news-wall { height: 37vh; height: 37dvh; min-height: 260px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.project-image img, .news-cta, .cta-arrow, .news-nav { transition: none; }
		.news-card { transition: none; }
	}
</style>
