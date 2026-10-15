<script>
	import { onMount, tick } from 'svelte';
	import { mediaUrl, requestApi } from '../admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, description: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, category: string, studentName: string | null, projectYear: number | null }} Project */
	/** @typedef {{ id: string, title: string, slug: string, excerpt: string | null, thumbnailPath: string | null, thumbnailUrl: string | null, publishedAt: string }} NewsItem */

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
		const virtualIndex = newsBaseIndex + index - Math.floor(newsSlotCount / 2);
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
		const isMobile = window.matchMedia('(max-width: 700px)').matches;
		const nextSlotCount = getRequiredNewsSlotCount(isMobile, newsViewport.clientWidth, newsViewport.clientHeight);
		if (nextSlotCount !== newsSlotCount) {
			newsSlotCount = nextSlotCount;
			await tick();
		}
		updateNewsLayout();
	}

	/**
	 * Return the perspective geometry for one card at its live horizontal offset
	 * from the viewport center. This is the shared input for both sizing and spacing.
	 * @param {boolean} isMobile
	 * @param {number} viewportWidth
	 * @param {number} wallHeight
	 * @param {number} centerX
	 */
	function getNewsCardGeometry(isMobile, viewportWidth, wallHeight, centerX) {
		const halfWidth = Math.max(1, viewportWidth / 2);
		const perspective = isMobile ? 900 : 1250;
		const stops = isMobile
			? [[0, 0.32, 0.48], [0.76, 0.42, 0.68], [1, 0.44, 0.72]]
			: [[0, 0.1053, 0.422], [0.226, 0.1084, 0.478], [0.482, 0.1316, 0.636], [0.838, 0.1986, 1], [1, 0.205, 1.04]];
		/** @param {number} distance @param {number} column */
		const interpolate = (distance, column) => {
			for (let index = 1; index < stops.length; index += 1) {
				const previous = stops[index - 1];
				const next = stops[index];
				if (distance <= next[0]) {
					const progress = (distance - previous[0]) / Math.max(0.001, next[0] - previous[0]);
					return previous[column] + (next[column] - previous[column]) * progress;
				}
			}
			return stops.at(-1)?.[column] ?? 0;
		};
		const boundedDistance = Math.min(1, Math.abs(centerX) / halfWidth);
		const side = centerX < 0 ? -1 : centerX > 0 ? 1 : 0;
		const width = interpolate(boundedDistance, 1) * viewportWidth;
		const height = interpolate(boundedDistance, 2) * wallHeight;
		const tilt = -(boundedDistance * side) * (isMobile ? 6 : 9);
		const depth = boundedDistance * 12;
		const angle = (tilt * Math.PI) / 180;
		/** @param {number} localX */
		const projectX = (localX) => {
			const worldX = centerX + localX * Math.cos(angle);
			const worldZ = depth - localX * Math.sin(angle);
			return (worldX * perspective) / (perspective - worldZ);
		};
		const projectedEdges = [projectX(-width / 2), projectX(width / 2)];
		const left = Math.min(...projectedEdges);
		const right = Math.max(...projectedEdges);
		const projectedWidth = right - left;
		const taper = Math.round(Math.min(20, Math.max(0, (boundedDistance - 0.08) * 27)));
		const clip = boundedDistance < 0.08 || side === 0
			? 'inset(0)'
			: side < 0
				? `polygon(0 0, 100% ${taper}%, 100% ${100 - taper}%, 0 100%)`
				: `polygon(0 ${taper}%, 100% 0, 100% 100%, 0 ${100 - taper}%)`;
		return {
			centerX,
			width,
			height,
			left,
			right,
			projectedWidth,
			tilt: `${tilt.toFixed(2)}deg`,
			depth: `${depth.toFixed(1)}px`,
			clip,
			layer: `${Math.round(20 - boundedDistance * 10)}`
		};
	}

	/** @param {ReturnType<typeof getNewsCardGeometry>} previous @param {-1 | 1} direction @param {boolean} isMobile @param {number} viewportWidth @param {number} wallHeight */
	function getAdjacentNewsCard(previous, direction, isMobile, viewportWidth, wallHeight) {
		let centerX = previous.centerX + direction * (previous.projectedWidth + 12);
		let item = getNewsCardGeometry(isMobile, viewportWidth, wallHeight, centerX);
		for (let iteration = 0; iteration < 10; iteration += 1) {
			const targetEdge = direction > 0 ? previous.right + 12 : previous.left - 12;
			const currentEdge = direction > 0 ? item.left : item.right;
			centerX += targetEdge - currentEdge;
			item = getNewsCardGeometry(isMobile, viewportWidth, wallHeight, centerX);
		}
		return item;
	}

	/** @param {number} fraction @param {boolean} isMobile @param {number} viewportWidth @param {number} wallHeight */
	function getAnchorOffset(fraction, isMobile, viewportWidth, wallHeight) {
		const center = getNewsCardGeometry(isMobile, viewportWidth, wallHeight, 0);
		return getAdjacentNewsCard(center, -1, isMobile, viewportWidth, wallHeight).centerX * fraction;
	}

	/**
	 * Keep enough offscreen cards on both sides to cover the viewport throughout
	 * the anchor's full one-card travel. Extra slots are visual overscan only;
	 * each still uses the same modulo-backed news item and continuous geometry.
	 * @param {boolean} isMobile
	 * @param {number} viewportWidth
	 * @param {number} wallHeight
	 */
	function getRequiredNewsSlotCount(isMobile, viewportWidth, wallHeight) {
		const minimumCount = isMobile ? 7 : 13;
		const halfWidth = viewportWidth / 2;
		let requiredSteps = Math.floor(minimumCount / 2);

		for (let sample = 0; sample <= 8; sample += 1) {
			const fraction = sample / 8;
			const anchorX = getAnchorOffset(fraction, isMobile, viewportWidth, wallHeight);
			const center = getNewsCardGeometry(isMobile, viewportWidth, wallHeight, anchorX);

			for (const direction of /** @type {const} */ ([-1, 1])) {
				let previous = center;
				for (let step = 1; step <= 20; step += 1) {
					const card = getAdjacentNewsCard(previous, direction, isMobile, viewportWidth, wallHeight);
					const crossedViewportEdge = direction > 0 ? card.right >= halfWidth : card.left <= -halfWidth;
					if (crossedViewportEdge) {
						// Keep one complete spare card beyond the card crossing the edge.
						requiredSteps = Math.max(requiredSteps, step + 1);
						break;
					}
					previous = card;
				}
			}
		}

		return requiredSteps * 2 + 1;
	}

	function updateNewsLayout() {
		if (!newsViewport || news.length === 0) return;
		const isMobile = window.matchMedia('(max-width: 700px)').matches;
		const viewportWidth = newsViewport.clientWidth;
		const wallHeight = newsViewport.clientHeight;
		const middle = Math.floor(newsSlotCount / 2);
		const fraction = newsProgress - Math.floor(newsProgress);
		const center = getNewsCardGeometry(isMobile, viewportWidth, wallHeight, getAnchorOffset(fraction, isMobile, viewportWidth, wallHeight));
		/** @type {Array<ReturnType<typeof getNewsCardGeometry> | undefined>} */
		const cards = Array(newsSlotCount);
		cards[middle] = center;
		for (const direction of /** @type {const} */ ([-1, 1])) {
			let previous = center;
			for (let step = 1; step <= middle; step += 1) {
				const slotIndex = middle + direction * step;
				const item = getAdjacentNewsCard(previous, direction, isMobile, viewportWidth, wallHeight);
				cards[slotIndex] = item;
				previous = item;
			}
		}
		for (const card of /** @type {NodeListOf<HTMLAnchorElement>} */ (newsViewport.querySelectorAll('.news-card'))) {
			const slotIndex = Number(card.style.getPropertyValue('--face'));
			const item = cards[slotIndex];
			if (!item) continue;
			card.style.setProperty('--card-x', `${viewportWidth / 2 + item.centerX}px`);
			card.style.setProperty('--card-width', `${item.width}px`);
			card.style.setProperty('--card-height', `${item.height}px`);
			card.style.setProperty('--card-tilt', item.tilt);
			card.style.setProperty('--card-depth', item.depth);
			card.style.setProperty('--card-clip', item.clip);
			card.style.zIndex = item.layer;
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
		const isMobile = window.matchMedia('(max-width: 700px)').matches;
		const centerX = getAnchorOffset(newsProgress - Math.floor(newsProgress), isMobile, newsViewport.clientWidth, newsViewport.clientHeight);
		const center = getNewsCardGeometry(isMobile, newsViewport.clientWidth, newsViewport.clientHeight, centerX);
		return center.centerX - getAdjacentNewsCard(center, -1, isMobile, newsViewport.clientWidth, newsViewport.clientHeight).centerX;
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
					{#if slot.thumbnailPath}<img class="news-card-image" src={mediaUrl(slot.thumbnailPath)} alt="" loading={Math.abs(slotIndex - Math.floor(newsSlotCount / 2)) < 2 ? 'eager' : 'lazy'} />{/if}
					<span class="news-card-shade"></span>
					<span class="news-card-copy">
						{#if slot.publishedAt}<time datetime={slot.publishedAt}>{formatDate(slot.publishedAt)}</time>{/if}
						<strong>{slot.title}</strong>
						<span class="read-label">Baca berita <span aria-hidden="true">↗</span></span>
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
	.news-wall { position: relative; width: 100%; height: min(53svh, 545px); min-height: 350px; flex: 0 0 auto; overflow: hidden; margin-top: auto; perspective: 1250px; perspective-origin: 50% 50%; touch-action: pan-y; cursor: grab; }
	.news-wall:active { cursor: grabbing; }
	.news-card { position: absolute; top: 50%; left: var(--card-x, 50%); display: flex; box-sizing: border-box; width: var(--card-width, 14vw); height: var(--card-height, 60%); min-width: 0; flex-direction: column; justify-content: flex-end; overflow: hidden; container-type: inline-size; background: #002aff; color: #fff; text-decoration: none; clip-path: var(--card-clip, inset(0)); transform: translate(-50%, -50%) translateZ(var(--card-depth, 0px)) rotateY(var(--card-tilt, 0deg)); transform-origin: center center; transform-style: preserve-3d; backface-visibility: hidden; transition: filter 180ms ease; }
	.news-card:hover, .news-card:focus-visible { filter: brightness(1.12); }
	.news-card:focus-visible { outline: 3px solid #ff5a14; outline-offset: -5px; }
	.news-card-image, .news-card-shade { position: absolute; inset: 0; width: 100%; height: 100%; }
	.news-card-image { object-fit: cover; opacity: .4; }
	.news-card-shade { background: rgb(0 42 255 / 82%); }
	.news-card-copy { position: relative; z-index: 1; display: flex; box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; min-height: 0; flex-direction: column; justify-content: end; gap: clamp(4px, 2.2cqw, 9px); overflow: hidden; padding: clamp(6px, 4.8cqw, 14px); color: #fff; text-shadow: 0 1px 8px rgb(0 0 0 / 25%); }
	.news-card-copy time { font: 400 clamp(8px, 3cqw, 11px)/1.35 'Inter', sans-serif; opacity: .86; }
	.news-card-copy strong { display: -webkit-box; min-width: 0; overflow: hidden; overflow-wrap: break-word; font: 600 clamp(9px, 5.8cqw, 15px)/1.2 'Poppins', sans-serif; line-clamp: 4; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
	.read-label { display: inline-flex; max-width: 100%; align-items: center; flex-wrap: wrap; gap: .35rem; margin-top: .3rem; font: 500 clamp(8px, 3cqw, 11px)/1.3 'Inter', sans-serif; }
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
		.news-wall { height: 40svh; min-height: 280px; margin-top: auto; perspective: 900px; }
		.news-card { border-radius: 12px; }
		.news-card-copy { gap: clamp(4px, 2.2cqw, 7px); padding: clamp(6px, 4.8cqw, 10px); }
		.read-label { gap: .2rem; margin-top: .1rem; }
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
