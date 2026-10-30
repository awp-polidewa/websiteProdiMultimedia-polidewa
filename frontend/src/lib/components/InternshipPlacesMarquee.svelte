<script>
	const internshipRows = [
		[
			{ name: 'Vale Indonesia', src: '/icons/logo-pt/vale-indonesia.svg' },
			{ name: 'Telkom Indonesia', src: '/icons/logo-pt/telkom-indonesia.svg' },
			{ name: 'PLN', src: '/icons/logo-pt/pln.svg' },
			{ name: 'TVRI', src: '/icons/logo-pt/tvri.svg' },
			{ name: 'Jasa Raharja', src: '/icons/logo-pt/jasa-raharja.png' },
			{ name: 'BNI', src: '/icons/logo-pt/bni.svg' }
		],
		[
			{ name: 'Bukaka Mandiri Sejahtera', src: '/icons/logo-pt/bukaka-mandiri-sejahtera-wordmark.png' },
			{ name: 'Mars Incorporated', src: '/icons/logo-pt/mars-incorporated.svg' },
			{ name: 'Taspen', src: '/icons/logo-pt/taspen.svg' },
			{ name: 'Mandiri Taspen', src: '/icons/logo-pt/mandiri-taspen.svg' },
			{ name: 'Klinik Computer', src: '/icons/logo-pt/klinik-computer.svg' }
		],
		[
			{ name: 'Diskominfo SP Luwu Timur', src: '/icons/logo-pt/diskominfo-sp-luwu-timur.png' },
			{ name: 'Diskominfo SP Palopo', src: '/icons/logo-pt/diskominfo-sp-palopo.png' },
			{ name: 'DSN Group', src: '/icons/logo-pt/dsn-group.png' },
			{ name: 'Fajar TV', src: '/icons/logo-pt/fajar-tv.png' },
			{ name: 'Davidi International', src: '/icons/logo-pt/davidi-international.png' }
		]
	];
</script>

<section class="internship-places section-rule" aria-labelledby="internship-places-title">
	<header class="internship-heading">
		<h2 id="internship-places-title">
			<span class="title-side">Daftar</span>
			<span class="highlight">Tempat Magang</span>
			<span class="title-side">Mahasiswa</span>
		</h2>
	</header>

	<div class="logo-rows" aria-label="Perusahaan dan instansi tempat magang mahasiswa">
		{#each internshipRows as row, rowIndex}
			<div class="logo-row" class:logo-row--reverse={rowIndex === 1}>
				<div class="logo-track" class:logo-track--reverse={rowIndex === 1}>
					<div class="logo-group">
						{#each row as logo (logo.src)}
							<div class="logo-slot"><img src={logo.src} alt={logo.name} loading="lazy" /></div>
						{/each}
					</div>
					<div class="logo-group logo-group--duplicate" aria-hidden="true" inert>
						{#each row as logo (logo.src)}
							<div class="logo-slot"><img src={logo.src} alt="" loading="lazy" /></div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.internship-places {
		--accent: #0586ff;
		box-sizing: border-box;
		display: grid;
		width: 100vw;
		height: 100vh;
		height: 100svh;
		grid-template-rows: auto minmax(0, 1fr);
		margin-inline: calc(50% - 50vw);
		overflow: hidden;
		padding: clamp(7rem, 13svh, 9rem) 0 clamp(1.5rem, 4svh, 3rem);
		background: #fff;
	}

	.internship-heading {
		box-sizing: border-box;
		width: min(100% - 40px, 1200px);
		justify-self: center;
		align-self: start;
		margin-bottom: clamp(1rem, 3svh, 2rem);
	}

	.internship-heading h2 {
		display: flex;
		width: fit-content;
		max-width: 100%;
		align-items: flex-end;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0 clamp(.35rem, 1.2vw, 1.1rem);
		margin: 0;
		padding-bottom: 8px;
		border-bottom: 4px solid var(--accent);
		color: #111;
		font-family: 'Plus Jakarta Sans', sans-serif;
		text-align: center;
		justify-self: center;
	}

	.internship-heading .title-side {
		font-size: 64px;
		font-weight: 400;
		line-height: 1;
		letter-spacing: -.04em;
	}

	.internship-heading .highlight {
		position: relative;
		top: -10px;
		color: var(--accent);
		font-size: 94px;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -.045em;
	}

	.logo-rows {
		display: grid;
		height: 86%;
		min-height: 0;
		align-self: center;
		grid-template-rows: repeat(3, minmax(0, 1fr));
	}

	.logo-row {
		position: relative;
		display: flex;
		min-width: 0;
		align-items: center;
		overflow: hidden;
		touch-action: pan-y;
	}

	.logo-track {
		display: flex;
		width: max-content;
		flex: 0 0 auto;
		will-change: transform;
		animation: internship-marquee-left 36s linear infinite;
	}

	.logo-track--reverse { animation-name: internship-marquee-right; }
	.logo-group {
		box-sizing: border-box;
		display: flex;
		width: calc(100vw + 144px);
		flex: 0 0 auto;
		align-items: center;
	}

	.logo-slot {
		box-sizing: border-box;
		display: grid;
		min-width: 0;
		flex: 1 1 0;
		place-items: center;
		padding-inline: clamp(8px, 1.8vw, 28px);
	}

	.logo-slot img {
		display: block;
		width: min(100%, clamp(58px, 11vw, 168px));
		height: min(12svh, 112px);
		object-fit: contain;
	}

	@keyframes internship-marquee-left {
		from { transform: translateX(0); }
		to { transform: translateX(-50%); }
	}

	@keyframes internship-marquee-right {
		from { transform: translateX(-50%); }
		to { transform: translateX(0); }
	}

	@media (max-width: 700px) {
		.internship-places {
			padding: max(6.25rem, calc(env(safe-area-inset-top, 0px) + 5rem)) 0 max(1rem, env(safe-area-inset-bottom, 0px));
		}

		.internship-heading { width: calc(100% - 40px); margin-bottom: 1rem; }
		.internship-heading h2 { padding-bottom: 5px; border-bottom-width: 3px; }
		.internship-heading h2 { column-gap: .45rem; row-gap: .05rem; }
		.internship-heading .title-side { font-size: clamp(1.85rem, 8vw, 2.65rem); }
		.internship-heading .highlight { top: -5px; font-size: clamp(2.2rem, 10vw, 3.25rem); }
		.logo-track { animation-duration: 28s; }
		.logo-group { width: calc(100vw + 80px); }
		.logo-slot img { width: min(100%, clamp(52px, 16vw, 92px)); height: min(10svh, 76px); }
	}

	@media (prefers-reduced-motion: reduce) {
		.logo-track { animation: none; transform: none; }
		.logo-group--duplicate { display: none; }
		.logo-group { width: 100%; justify-content: space-around; }
		.logo-row { overflow-x: auto; }
	}
</style>
