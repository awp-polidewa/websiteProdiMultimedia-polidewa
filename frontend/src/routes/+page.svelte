<script>
	import { onMount, tick } from 'svelte';
	import SeoHead from '../lib/SeoHead.svelte';
	import StackedCardsStory from '../lib/components/StackedCardsStory.svelte';
	import HomepageShowcase from '../lib/components/HomepageShowcase.svelte';
	import disciplineImage from '../lib/assets/gambar1.png';

	const heroLineOne = Array.from('Teknologi Rekayasa');
	const heroLineTwo = Array.from('Multimedia');
	const toolItems = [
		{ name: 'Blender', icon: '/icons/tools/icon-blender.svg', description: 'Pemodelan, animasi, dan produksi visual 3D.' },
		{ name: 'Canva', icon: '/icons/tools/icon-canva.svg', description: 'Pembuatan desain grafis dan materi visual.' },
		{ name: 'CSS', icon: '/icons/tools/icon-css.svg', description: 'Mengatur tampilan dan tata letak halaman web.' },
		{ name: 'draw.io', icon: '/icons/tools/icon-drawio.svg', description: 'Menyusun diagram alur dan rancangan sistem.' },
		{ name: 'Figma', icon: '/icons/tools/icon-figma.svg', description: 'Merancang antarmuka dan prototipe interaktif.' },
		{ name: 'Google Classroom', icon: '/icons/tools/icon-google-classroom.svg', description: 'Mengelola materi, tugas, dan aktivitas pembelajaran.' },
		{ name: 'Google Drive', icon: '/icons/tools/icon-google-drive.svg', description: 'Menyimpan dan berbagi berkas proyek.' },
		{ name: 'HTML', icon: '/icons/tools/icon-html.svg', description: 'Menyusun struktur konten halaman web.' },
		{ name: 'JavaScript', icon: '/icons/tools/icon-javascript.svg', description: 'Menambahkan perilaku interaktif pada aplikasi web.' },
		{ name: 'PHP', icon: '/icons/tools/icon-php.svg', description: 'Membangun logika aplikasi web di sisi server.' },
		{ name: 'XAMPP', icon: '/icons/tools/icon-xampp.svg', description: 'Menjalankan lingkungan pengembangan web lokal.' }
	];
	/** @type {HTMLElement | undefined} */
	let videoStoryTrack;
	/** @type {HTMLElement | undefined} */
	let videoStory;
	/** @type {HTMLElement | undefined} */
	let videoStoryStage;
	/** @type {HTMLElement | undefined} */
	let videoFrame;
	/** @type {HTMLElement | undefined} */
	let toolsOrbit;
	/** @type {HTMLElement | undefined} */
	let toolsTooltip;
	/** @type {HTMLButtonElement[]} */
	let toolIconElements = $state([]);
	let prefersReducedMotion = $state(false);
	let videoStoryReady = $state(false);
	let toolsTooltipVisible = $state(false);
	let activeToolIndex = $state(10);
	let orbitPhase = 10;
	let toolsTooltipFrame = 0;
	let toolsTooltipX = 0;
	let toolsTooltipY = 0;
	let toolsTooltipTargetX = 0;
	let toolsTooltipTargetY = 0;
	/** @type {number | null} */
	let orbitTarget = null;

	/** @param {PointerEvent} event */
	function setToolsTooltipTarget(event) {
		if (!toolsTooltip) return;

		const gap = 14;
		const width = toolsTooltip.offsetWidth;
		const height = toolsTooltip.offsetHeight;
		let x = event.clientX + gap;
		let y = event.clientY + gap;

		if (x + width > window.innerWidth - 8) x = event.clientX - width - gap;
		if (y + height > window.innerHeight - 8) y = event.clientY - height - gap;

		toolsTooltipTargetX = Math.max(8, Math.min(x, window.innerWidth - width - 8));
		toolsTooltipTargetY = Math.max(8, Math.min(y, window.innerHeight - height - 8));
	}

	function animateToolsTooltip() {
		toolsTooltipFrame = 0;
		if (!toolsTooltip || !toolsTooltipVisible) return;

		toolsTooltipX += (toolsTooltipTargetX - toolsTooltipX) * 0.5;
		toolsTooltipY += (toolsTooltipTargetY - toolsTooltipY) * 0.5;
		toolsTooltip.style.setProperty('--cursor-x', `${toolsTooltipX}px`);
		toolsTooltip.style.setProperty('--cursor-y', `${toolsTooltipY}px`);

		if (Math.abs(toolsTooltipTargetX - toolsTooltipX) > 0.4 || Math.abs(toolsTooltipTargetY - toolsTooltipY) > 0.4) {
			toolsTooltipFrame = requestAnimationFrame(animateToolsTooltip);
		}
	}

	/** @param {PointerEvent} event */
	function handleToolsPointerEnter(event) {
		if (event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

		setToolsTooltipTarget(event);
		toolsTooltipX = toolsTooltipTargetX;
		toolsTooltipY = toolsTooltipTargetY;
		toolsTooltip?.style.setProperty('--cursor-x', `${toolsTooltipX}px`);
		toolsTooltip?.style.setProperty('--cursor-y', `${toolsTooltipY}px`);
		toolsTooltipVisible = true;
	}

	/** @param {PointerEvent} event */
	function handleToolsPointerMove(event) {
		if (!toolsTooltipVisible || event.pointerType === 'touch') return;

		setToolsTooltipTarget(event);
		if (!toolsTooltipFrame) toolsTooltipFrame = requestAnimationFrame(animateToolsTooltip);
	}

	function handleToolsPointerLeave() {
		toolsTooltipVisible = false;
		if (toolsTooltipFrame) cancelAnimationFrame(toolsTooltipFrame);
		toolsTooltipFrame = 0;
	}

	/** @param {number} index */
	function selectTool(index) {
		if (prefersReducedMotion) {
			activeToolIndex = index;
			orbitPhase = index;
			return;
		}

		const count = toolItems.length;
		const currentIndex = ((Math.round(orbitPhase) % count) + count) % count;
		const forwardDelta = (index - currentIndex + count) % count;
		const shortestDelta = forwardDelta > count / 2 ? forwardDelta - count : forwardDelta;
		orbitTarget = orbitPhase + shortestDelta;
	}

	onMount(() => {
		let animationFrame = 0;
		let orbitAnimationFrame = 0;
		let trackStart = 0;
		let transitionStart = 0;
		let transitionDistance = 1;
		let viewportHeight = window.innerHeight;
		let stageHeight = 0;
		let startTop = 0;
		let endTop = 0;
		let startWidth = 0;
		let endWidth = 0;
		let previousOrbitTime = 0;
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		/** @param {number} value @param {number} divisor */
		const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

		function updateOrbit() {
			if (!toolsOrbit) return;

			const width = toolsOrbit.clientWidth;
			const count = toolItems.length;
			const spacing = width < 700 ? Math.max(72, width * 0.29) : Math.min(265, width * 0.184);
			const curveDepth = width < 700 ? 18 : 23.5;
			const nextActiveIndex = positiveModulo(Math.round(orbitPhase), count);

			if (activeToolIndex !== nextActiveIndex) activeToolIndex = nextActiveIndex;

			toolItems.forEach((tool, index) => {
				const element = toolIconElements[index];
				if (!element) return;

				let offset = positiveModulo(index - orbitPhase + count / 2, count) - count / 2;
				if (offset < -count / 2) offset += count;
				const distance = Math.abs(offset);
				const y = 8 + curveDepth * offset ** 2;
				const scale = Math.max(0.44, 1 - distance * 0.115);
				const opacity = Math.max(0.3, 1 - distance * 0.14);
				const rotation = Math.max(-24, Math.min(24, Math.atan2(2 * curveDepth * offset, spacing) * (180 / Math.PI)));

				element.style.left = `${width / 2 + offset * spacing}px`;
				element.style.top = `${y}px`;
				element.style.transform = `translateX(-50%) scale(${scale}) rotate(${rotation}deg)`;
				element.style.opacity = String(opacity);
				element.style.zIndex = String(100 - Math.round(distance * 10));
			});
		}

		/** @param {number} timestamp */
		function renderOrbit(timestamp) {
			orbitAnimationFrame = 0;
			if (prefersReducedMotion) return;

			const delta = previousOrbitTime ? Math.min(timestamp - previousOrbitTime, 48) : 0;
			previousOrbitTime = timestamp;

			if (orbitTarget !== null) {
				const remaining = orbitTarget - orbitPhase;
				orbitPhase += remaining * (1 - Math.exp(-delta / 260));
				if (Math.abs(remaining) < 0.006) {
					orbitPhase = orbitTarget;
					orbitTarget = null;
				}
			} else {
				orbitPhase += delta * 0.00016;
			}

			updateOrbit();
			orbitAnimationFrame = requestAnimationFrame(renderOrbit);
		}

		function scheduleOrbit() {
			if (!prefersReducedMotion && !orbitAnimationFrame) {
				orbitAnimationFrame = requestAnimationFrame(renderOrbit);
			}
		}

		function measureStory() {
			if (!videoStoryTrack || !videoStory || !videoStoryStage || !videoFrame) return;

			viewportHeight = window.innerHeight;
			stageHeight = videoStoryStage.clientHeight;
			const isMobile = videoStory.clientWidth <= 700;
			endWidth = videoStory.clientWidth * (isMobile ? 0.9 : 0.985);
			const endHeight = isMobile
				? endWidth * (834 / 1352)
				: Math.min(viewportHeight, stageHeight) * 0.94;
			endTop = Math.max(0, (stageHeight - endHeight) / 2);
			startWidth = Math.min(endWidth * 0.528, 713);
			startTop = isMobile ? viewportHeight * 0.96 : stageHeight * 0.96;
			trackStart = window.scrollY + videoStoryTrack.getBoundingClientRect().top;
			transitionStart = trackStart;
			transitionDistance = Math.max(1, viewportHeight * 0.75);
			videoFrame.style.width = `${endWidth}px`;
			videoFrame.style.height = `${endHeight}px`;
			videoFrame.style.top = `${endTop}px`;
		}

		function renderStory() {
			animationFrame = 0;
			if (!videoFrame || prefersReducedMotion) return;

			const linearProgress = Math.min(1, Math.max(0, (window.scrollY - transitionStart) / transitionDistance));
			const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
			const scale = (startWidth + (endWidth - startWidth) * progress) / endWidth;
			const yOffset = (startTop - endTop) * (1 - progress);
			const radius = 35 / scale + (35 - 35 / scale) * progress;
			const startColor = [31, 27, 27];
			const endColor = [34, 32, 32];
			const color = startColor.map((channel, index) => Math.round(channel + (endColor[index] - channel) * progress));

			videoFrame.style.transform = `translate3d(-50%, ${yOffset}px, 0) scale(${scale})`;
			videoFrame.style.borderRadius = `${radius}px`;
			videoFrame.style.backgroundColor = `rgb(${color.join(' ')})`;
		}

		function scheduleStoryUpdate() {
			if (!animationFrame) animationFrame = requestAnimationFrame(renderStory);
		}

		function handleResize() {
			measureStory();
			scheduleStoryUpdate();
			updateOrbit();
		}

		async function handleMotionPreferenceChange() {
			prefersReducedMotion = reducedMotionQuery.matches;
			await tick();
			measureStory();
			scheduleStoryUpdate();
			if (prefersReducedMotion) {
				if (orbitAnimationFrame) cancelAnimationFrame(orbitAnimationFrame);
				orbitAnimationFrame = 0;
				previousOrbitTime = 0;
				updateOrbit();
			} else {
				previousOrbitTime = 0;
				updateOrbit();
				scheduleOrbit();
			}
		}

		prefersReducedMotion = reducedMotionQuery.matches;
		measureStory();
		renderStory();
		videoStoryReady = true;
		updateOrbit();
		window.addEventListener('scroll', scheduleStoryUpdate, { passive: true });
		window.addEventListener('resize', handleResize);
		reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
		scheduleStoryUpdate();
		scheduleOrbit();

		return () => {
			window.removeEventListener('scroll', scheduleStoryUpdate);
			window.removeEventListener('resize', handleResize);
			reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange);
			if (animationFrame) cancelAnimationFrame(animationFrame);
			if (orbitAnimationFrame) cancelAnimationFrame(orbitAnimationFrame);
			if (toolsTooltipFrame) cancelAnimationFrame(toolsTooltipFrame);
		};
	});
</script>

<SeoHead
	title="TRM Polidewa — Teknologi Rekayasa Multimedia | Politeknik Dewantara"
	description="Kenali Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara atau Polidewa: profil, dosen, konsentrasi, karya mahasiswa, berita, dan akreditasi."
	canonicalPath="/"
/>

<div class="home-page">
<div class="home-content">
<section class="hero" aria-labelledby="home-title">
	<div class="hero-label"><p>Politeknik Dewantara</p><span>Program Studi</span></div>
	<h1 id="home-title">
		<span class="visually-hidden">Teknologi Rekayasa Multimedia</span>
		<span class="hero-line" aria-hidden="true">{#each heroLineOne as character, index}{#if character === ' '}{' '}{:else}<span class="hero-character" style={`--char-index:${index}`}>{character}</span>{/if}{/each}</span>
		<span class="hero-line" aria-hidden="true">{#each heroLineTwo as character, index}<span class="hero-character" style={`--char-index:${index}`}>{character}</span>{/each}</span>
	</h1>
	<div class="hero-bottom">
		<!-- <p class="intro">Pusat informasi program studi, aktivitas, dan karya mahasiswa TRM</p> -->
		<div class="hero-actions">
			<a class="primary-action" href="https://wa.me/62887436943503" target="_blank" rel="noreferrer">Daftar Polidewa</a>
			<a class="secondary-action" href="/profil">Tentang Program Studi</a>
		</div>
	</div>
</section>

<div class="video-story-track" class:video-story-track--reduced={prefersReducedMotion} bind:this={videoStoryTrack}>
	<section
		class="video-story"
		class:video-story--reduced={prefersReducedMotion}
		aria-label="Video pengantar program studi"
		bind:this={videoStory}
	>
		<div class="video-story-stage" bind:this={videoStoryStage}>
			<div class="video-story-frame" class:video-story-frame--ready={videoStoryReady} bind:this={videoFrame}>
				<div class="video-placeholder" role="img" aria-label="Area untuk video">VIDEO</div>
			</div>
		</div>
	</section>
</div>

<section
	class="tools section-rule"
	aria-labelledby="tools-title"
	onpointerenter={handleToolsPointerEnter}
	onpointermove={handleToolsPointerMove}
	onpointerleave={handleToolsPointerLeave}
>
	<div class="tools-content">
		<div class="tools-heading">
			<p class="eyebrow">Teknologi multimedia</p>
			<h2 id="tools-title" class="section-heading">Tools used in practice Warga Multimedia</h2>
			<p class="tools-intro">Perangkat yang mendukung proses belajar dan produksi karya multimedia.</p>
		</div>
		<div class="tools-showcase" class:tools-showcase--static={prefersReducedMotion}>
			<div class="tools-orbit" class:tools-orbit--static={prefersReducedMotion} aria-label="Pilih tools yang digunakan dalam pembelajaran dan produksi multimedia" bind:this={toolsOrbit}>
				{#each toolItems as tool, index (tool.name)}
					<button
						class="tool-orbit-icon"
						class:tool-orbit-icon--active={activeToolIndex === index}
						type="button"
						aria-label={`Pilih ${tool.name}`}
						aria-pressed={activeToolIndex === index}
						bind:this={toolIconElements[index]}
						onclick={() => selectTool(index)}
					>
						<span class="tool-icon-tile"><img src={tool.icon} alt="" /></span>
					</button>
				{/each}
			</div>
			<div class="tool-feature" aria-atomic="true">
				<h3 class="tool-name">{toolItems[activeToolIndex].name}</h3>
				<p>{toolItems[activeToolIndex].description}</p>
			</div>
		</div>
	</div>
	<div class="tool-cursor-tooltip" class:tool-cursor-tooltip--visible={toolsTooltipVisible} aria-hidden="true" bind:this={toolsTooltip}>klik icons</div>
</section>

<section class="disciplines section-rule" aria-labelledby="disciplines-title">
	<div class="section-content">
		<div class="section-top"><p class="eyebrow">Program studi</p></div>
		<div class="discipline-intro">
			<h2 id="disciplines-title" class="section-heading">Informasi program studi</h2>
			<p>Website ini menjadi pusat informasi profil, struktur dosen, berita, karya mahasiswa, serta informasi akreditasi Program Studi Teknologi Rekayasa Multimedia.</p>
		</div>
		<div class="discipline-feature">
			<div class="discipline-visual">
				<img src={disciplineImage} alt="Mahasiswa Program Studi Teknologi Rekayasa Multimedia" loading="lazy" />
			</div>
			<div class="discipline-details">
				<p class="discipline-kicker">Struktur program</p>
				<h3>Bidang konsentrasi</h3>
				<div class="discipline-list">
					<a href="/struktur"><span>01</span><strong>Web Design</strong><span aria-hidden="true">↗</span></a>
					<a href="/struktur"><span>02</span><strong>Desain Grafis</strong><span aria-hidden="true">↗</span></a>
					<a href="/struktur"><span>03</span><strong>Videografi</strong><span aria-hidden="true">↗</span></a>
					<a href="/struktur"><span>04</span><strong>Animasi</strong><span aria-hidden="true">↗</span></a>
				</div>
			</div>
		</div>
	</div>
</section>

<StackedCardsStory />

<HomepageShowcase />

<section class="accreditation-band">
	<div><p class="eyebrow">Informasi resmi</p><h2 class="section-heading">Akreditasi</h2></div>
	<p>Dokumen dan informasi akreditasi tersedia melalui halaman khusus.</p>
	<a class="text-link" href="/akreditasi">Lihat informasi <span aria-hidden="true">↗</span></a>
</section>
</div>
</div>

<style>
	.home-page { position: relative; min-height: 100vh; text-align: center; background: transparent; }
	.home-content { position: relative; z-index: 1; width: min(calc(100% - 2 * var(--page-gutter)), var(--page-max)); margin: 0 auto; }
	.section-content { box-sizing: border-box; width: min(calc(100% - 2 * var(--page-gutter)), var(--page-max)); margin-inline: auto; }
	.video-story-track { position: relative; box-sizing: border-box; width: 100vw; height: 187vh; height: 187svh; margin-top: -75vh; margin-top: -75svh; margin-inline: calc(50% - 50vw); }
	.video-story { position: sticky; top: 0; box-sizing: border-box; width: 100%; height: 100vh; height: 100svh; padding-inline: 30px; }
	.video-story-stage { position: relative; width: 100%; height: 100%; overflow: visible; }
	.video-story-frame { position: absolute; top: 0; left: 50%; overflow: hidden; aspect-ratio: 1352 / 834; border-radius: 35px; background: #1f1b1b; transform-origin: 50% 0; visibility: hidden; will-change: transform, border-radius, background-color; }
	.video-story-frame--ready { visibility: visible; }
	.video-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: #fff; font: 600 clamp(3rem, 19vw, 18rem)/1 'Inter', sans-serif; letter-spacing: .035em; }
	.video-story-track--reduced { height: auto; margin-top: 0; padding-block: var(--space-section); }
	.video-story--reduced { position: relative; top: auto; height: auto; padding-inline: 30px; }
	.video-story--reduced .video-story-stage { height: auto; }
	.video-story--reduced .video-story-frame { position: relative; top: auto !important; left: auto; width: min(90%, 1352px) !important; margin-inline: auto; border-radius: 35px !important; transform: none !important; }
	.tools { box-sizing: border-box; width: 100vw; min-height: 100svh; display: flex; flex-direction: column; margin-inline: calc(50% - 50vw); padding: clamp(1rem, 2vh, 1.5rem) clamp(1rem, 2.7vw, 2.5rem); background-color: #f2f4f5; background-image: linear-gradient(to right, rgb(255 255 255 / 13%) 2px, transparent 2px), linear-gradient(to bottom, rgb(255 255 255 / 13%) 2px, transparent 2px); background-size: 114px 102.5px; }
	.tools-content { box-sizing: border-box; width: min(100%, 1440px); flex: 1 0 auto; min-height: 0; display: flex; align-items: center; flex-direction: column; justify-content: center; margin-inline: auto; padding: clamp(3rem, 7.5vh, 3.5rem) clamp(1rem, 4vw, 3.5rem) 0; border-radius: 38px; background: #fff; text-align: center; }
	.tools-heading { width: 100%; }
	.tools-heading .eyebrow { margin: 0 0 1rem; opacity: .65; }
	.tools-heading .section-heading { max-width: 820px; margin: 0 auto; color: #676363; font-size: clamp(1.5rem, 3.3vw, 3rem); line-height: 1.16; }
	.tools-intro { margin: 1rem 0 0; color: #625f5f; font: 400 clamp(.9rem, 1.2vw, 1.05rem)/1.6 'Inter', sans-serif; }
	.tools-showcase { width: 100%; display: flex; align-items: center; flex-direction: column; }
	.tools-orbit { position: relative; width: 100%; height: clamp(16rem, 37vh, 21rem); flex: 0 0 auto; margin-top: clamp(1rem, 2vh, 1.5rem); overflow: hidden; }
	.tool-orbit-icon { position: absolute; top: 0; left: 50%; width: clamp(75px, 10.4vw, 142px); height: clamp(61px, 8.5vw, 116px); display: grid; place-items: center; padding: 0; border: 0; border-radius: 12px; background: transparent; cursor: pointer; transform-origin: center; transition: filter 180ms ease, outline-color 180ms ease; }
	.tool-icon-tile { width: 100%; height: 100%; display: grid; place-items: center; border-radius: 12px; background: #e5e5e5; }
	.tool-icon-tile img { display: block; width: 64%; height: 64%; object-fit: contain; }
	.tool-orbit-icon--active .tool-icon-tile { background: #e5e5e5; }
	.tool-orbit-icon:hover { filter: brightness(.96); }
	.tool-orbit-icon:focus-visible { z-index: 120 !important; outline: 3px solid #313131; outline-offset: 4px; }
	.tool-feature { box-sizing: border-box; width: min(100%, 560px); min-height: 90px; margin-top: .85rem; }
	.tool-name { margin: 0; color: #525151; font: 400 clamp(1.5rem, 2.8vw, 2.55rem)/1.12 'Poppins', sans-serif; letter-spacing: -.04em; }
	.tool-feature p { margin: .5rem 0 0; color: #525151; font: 400 clamp(.85rem, 1.5vw, 1.25rem)/1.5 'Inter', sans-serif; }
	.tool-cursor-tooltip { position: fixed; top: 0; left: 0; z-index: 110; padding: .4rem .65rem; border: 1px solid rgb(255 255 255 / 68%); border-radius: 999px; background: rgb(174 221 255 / 96%); color: #14354f; box-shadow: 0 4px 12px rgb(30 86 125 / 12%); font: 500 .75rem/1.2 'Inter', sans-serif; letter-spacing: .01em; white-space: nowrap; opacity: 0; pointer-events: none; transform: translate3d(var(--cursor-x, -1000px), var(--cursor-y, -1000px), 0); scale: .94; transform-origin: top left; transition: opacity 160ms ease, scale 160ms ease; will-change: transform, opacity, scale; }
	@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.tool-cursor-tooltip { background: rgb(139 205 250 / 78%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
	}
	.tool-cursor-tooltip--visible { opacity: 1; scale: 1; }
	@media (hover: none), (pointer: coarse) { .tool-cursor-tooltip { display: none; } }
	@media (prefers-reduced-motion: reduce) { .tool-cursor-tooltip { transition: none; } }
	.tools-orbit--static { height: auto; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .5rem; overflow: visible; margin-block: .75rem .5rem; }
	.tools-orbit--static .tool-orbit-icon { position: relative; top: auto !important; left: auto !important; width: min(75%, 142px); height: auto; justify-self: center; aspect-ratio: 1.23; opacity: 1 !important; transform: none !important; }
	.tools-orbit--static .tool-orbit-icon--active .tool-icon-tile { outline: 2px solid #636161; outline-offset: 3px; }
	.hero { position: relative; box-sizing: border-box; width: 100vw; height: 100vh; height: 100dvh; min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; flex-direction: column; justify-content: center; margin-inline: calc(50% - 50vw); padding: clamp(4rem, 8vw, 7rem) 30px; }
	.hero-label { display: flex; align-items: baseline; justify-content: center; gap: 1rem; }
	.hero-label p { margin: 0; font: 500 25px/1.35 'Inter', sans-serif; }
	.hero-label span { font: 400 18px/1.4 'Inter', sans-serif; opacity: .72; }
	h1 { width: 100%; max-width: none; margin: 1.5rem 0 1.2rem; font: 600 clamp(2rem, 7.2vw, 6.5rem)/.98 'Inter', sans-serif; letter-spacing: -.055em; text-wrap: balance; }
	h1 > .hero-line { display: block; width: 100%; white-space: normal; }
	.hero-character { display: inline-block; transform-origin: 50% 70%; }
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.hero-line:hover .hero-character { animation: hero-wobble 520ms var(--ease-out) both; animation-delay: calc(var(--char-index, 0) * 12ms); }
	}
	@keyframes hero-wobble {
		0%, 100% { transform: rotate(0); }
		35% { transform: rotate(calc(var(--hero-wobble) * -1)); }
		70% { transform: rotate(var(--hero-wobble)); }
	}
	.hero-bottom { display: flex; align-items: center; flex-direction: column; gap: 1.6rem; max-width: 790px; padding: 0 1rem; }
	.hero-actions { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: .85rem; }
	.primary-action, .secondary-action { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; padding: 12px 25px; border-radius: 34px; font: 500 16px/1.4 'Inter', sans-serif; text-decoration: none; transition: background-color var(--motion-fast) var(--ease-out), color var(--motion-fast) var(--ease-out), transform var(--motion-fast) var(--ease-out); }
	.primary-action { color: #fff; background: #3A41FB; }
	.primary-action:hover { background: #2d34df; transform: translateY(-1px); }
	.secondary-action { color: #000; background: transparent; border: 1px solid #000; }
	.secondary-action:hover { color: #fff; background: #000; }
	.primary-action:focus-visible, .secondary-action:focus-visible { outline: 2px solid #000; outline-offset: 3px; }
	.disciplines { box-sizing: border-box; display: flex; width: 100vw; min-height: 100vh; min-height: 100dvh; align-items: center; margin-inline: calc(50% - 50vw); padding: clamp(3.5rem, 7vh, 5rem) 0; }
	.disciplines .section-content { padding-inline: clamp(.5rem, 1.5vw, 1.4rem); }
	.section-top { display: flex; justify-content: flex-start; gap: 1rem; margin: 0 0 clamp(1.8rem, 3.5vw, 2.8rem); }
	.section-top .eyebrow { margin: 0; opacity: .65; }
	.discipline-intro { display: grid; grid-template-columns: 1fr; justify-items: start; gap: clamp(1.2rem, 2.4vw, 1.9rem); margin: 0 0 clamp(3rem, 6vw, 4.5rem); text-align: left; transform: translateY(30px); }
	.discipline-intro .section-heading { color: #555; font: 600 82.05px/1.02 'Plus Jakarta Sans', sans-serif; letter-spacing: -.055em; }
	.discipline-intro p { max-width: 920px; margin: 0; color: #555; font: 500 23.64px/1.55 'Poppins', sans-serif; }
	.discipline-feature { display: grid; grid-template-columns: minmax(0, .72fr) minmax(0, 1.28fr); align-items: center; gap: clamp(2.5rem, 4.5vw, 4.5rem); transform: translateY(-20px); }
	.discipline-visual { width: 480px; max-width: 100%; aspect-ratio: 535 / 351; }
	.discipline-visual img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: center; }
	.discipline-details { min-width: 0; text-align: left; }
	.discipline-kicker { margin: 0 0 .5rem; color: #696969; font: 500 clamp(.8rem, 1.05vw, .95rem)/1.4 'Inter', sans-serif; }
	.discipline-details h3 { margin: 0 0 clamp(1.3rem, 2.5vw, 2rem); color: #696969; font: 500 clamp(1.8rem, 2.85vw, 2.5rem)/1.12 'Poppins', sans-serif; letter-spacing: -.04em; }
	.discipline-list { display: grid; grid-template-columns: 1fr; border-top: 1px solid #222; }
	.discipline-list a { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr) auto; align-items: center; gap: 1rem; min-height: 2.65rem; padding: .4rem 0; border-bottom: 1px solid #333; color: #555; text-align: left; text-decoration: none; transition: color 180ms ease, padding 180ms ease; }
	.discipline-list a:hover, .discipline-list a:focus-visible { padding-inline: .4rem; color: #111; }
	.discipline-list a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.discipline-list span:first-child { font: 400 .8rem/1.4 'Inter', sans-serif; }
	.discipline-list strong { font: 500 clamp(.8rem, 1.05vw, .9rem)/1.4 'Poppins', sans-serif; }
	.discipline-list span:last-child { font: 400 .9rem/1 'Inter', sans-serif; }
	.accreditation-band { display: grid; grid-template-columns: 1fr; justify-items: center; gap: 1rem; padding: 2.25rem 0 var(--space-section); border-top: 1px solid var(--line); }
	.accreditation-band .eyebrow { margin: 0 0 .8rem; opacity: .65; }
	.accreditation-band p:not(.eyebrow) { max-width: 370px; margin: 0; font: 400 .9rem/1.7 'Inter', sans-serif; opacity: .82; }
	@media (max-width: 700px) {
		.hero { padding: 6rem 20px 5rem; }
		.video-story { padding-inline: 20px; }
		.hero-label p { font-size: clamp(1.15rem, 5vw, 1.5rem); }
		.hero-label span { font-size: .95rem; }
		h1 { font-size: clamp(1.9rem, 8.4vw, 3.4rem); line-height: 1.02; }
		.hero-bottom { align-items: center; }
		.video-story--reduced { padding-inline: 20px; }
		.section-top { margin-bottom: 1.6rem; }
		.tools { padding: 1rem .75rem; }
		.tools-content { padding: 2.5rem 1rem; border-radius: 1.25rem; }
		.tools-heading .section-heading { font-size: clamp(1.5rem, 6vw, 2rem); line-height: 1.15; }
		.tools-orbit { height: 15rem; margin-top: 1.5rem; }
		.tool-orbit-icon { width: clamp(58px, 18vw, 77px); height: clamp(51px, 15vw, 68px); border-radius: 10px; }
		.tool-icon-tile { border-radius: 10px; }
		.tools-showcase { position: relative; padding-bottom: 5rem; }
		.tool-feature { position: absolute; top: calc(100% - 9.5rem); left: 0; min-height: 0; margin: 0; }
		.tool-feature p { margin-top: .3rem; }
		.tools-showcase--static { padding-bottom: 0; }
		.tools-showcase--static .tool-feature { position: relative; top: auto; left: auto; margin-top: .4rem; }
		.tool-cursor-tooltip { display: none; }
		.tools-orbit--static { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem; margin-block: 2.5rem 1.5rem; }
		.disciplines { padding-block: 4.5rem; }
		.disciplines .section-content { padding-inline: .4rem; }
		.discipline-intro { gap: .9rem; margin-bottom: 2.25rem; transform: none; }
		.discipline-intro .section-heading { font-size: clamp(1.95rem, 8.25vw, 3rem); }
		.discipline-intro p { font-size: clamp(.8rem, 3.5vw, 1rem); line-height: 1.55; }
		.discipline-feature { grid-template-columns: 1fr; gap: 2rem; transform: none; }
		.discipline-visual { width: min(78vw, 340px); max-width: 100%; margin-inline: auto; }
		.discipline-details h3 { font-size: clamp(1.8rem, 6.75vw, 2.25rem); }
		.discipline-list a { grid-template-columns: 2rem minmax(0, 1fr) auto; gap: .8rem; min-height: 2.8rem; }
		.accreditation-band { box-sizing: border-box; width: 100vw; grid-template-columns: 1fr; justify-items: stretch; align-items: start; gap: 0; margin-inline: calc(50% - 50vw); padding: 2.5rem calc(var(--page-gutter) + 20px) var(--space-section); text-align: left; }
		.accreditation-band > div { text-align: left; }
		.accreditation-band .eyebrow { margin-bottom: 2rem; }
		.accreditation-band .section-heading { margin-bottom: .7rem; }
		.accreditation-band p:not(.eyebrow) { max-width: none; }
		.accreditation-band .text-link { justify-self: start; margin: 1.6rem 0 0; }
	}
	@media (max-width: 480px) {
		.tools-orbit--static { grid-template-columns: repeat(3, minmax(0, 1fr)); }
	}
	@media (max-width: 420px) {
		.hero-label { align-items: center; flex-direction: column; gap: .15rem; }
		.hero-label p { font-size: 1.2rem; }
		.hero-label span { font-size: .9rem; }
		.hero-actions { width: 100%; flex-direction: column; }
		.primary-action, .secondary-action { width: min(100%, 280px); box-sizing: border-box; }
	}
</style>
