<script>
	import { goto } from '$app/navigation';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';
	import politeknikDewantaraLogo from '../../../lib/assets/politeknik-dewantara.png';

	let identifier = $state('');
	let password = $state('');
	let submitting = $state(false);
	let errorMessage = $state('');
	let validationMessage = $state('');

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		errorMessage = '';
		validationMessage = '';
		if (!identifier.trim() || !password) {
			validationMessage = 'Masukkan username atau NIDN dan password.';
			return;
		}

		submitting = true;
		try {
			await requestApi('login', {
				method: 'POST',
				body: JSON.stringify({ identifier: identifier.trim(), password })
			}, true);
			password = '';
			await goto('/admin');
		} catch (error) {
			if (error instanceof ApiError && error.status === 400) {
				validationMessage = 'Periksa kembali username/NIDN dan password.';
			} else if (error instanceof ApiError && error.status === 401) {
				errorMessage = 'Identitas atau password tidak valid.';
			} else {
				errorMessage = 'Login belum dapat diproses. Periksa koneksi lalu coba lagi.';
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Login Admin — Teknologi Rekayasa Multimedia</title>
	<meta name="description" content="Masuk ke area pengelolaan Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<main class="login-page">
	<section class="login-shell" aria-label="Login administrator Teknologi Rekayasa Multimedia">
		<div class="login-form-pane">
			<a class="back-link" href="/">← Kembali ke website publik</a>
			<div class="login-content">
				<img class="login-logo" src={politeknikDewantaraLogo} alt="Logo Politeknik Dewantara" />
				<p class="eyebrow">Area pengelola TRM</p>
				<h1 id="login-title">Selamat datang</h1>
				<p class="login-intro">Masuk untuk mengelola informasi Program Studi Teknologi Rekayasa Multimedia.</p>
				<form onsubmit={submit} aria-describedby="login-help">
					<div class="field">
						<input
							id="identifier"
							name="identifier"
							type="text"
							autocomplete="username"
							bind:value={identifier}
							maxlength="150"
							required
							disabled={submitting}
							placeholder=" "
						/>
						<label for="identifier">Username atau NIDN</label>
					</div>
					<div class="field">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							bind:value={password}
							maxlength="72"
							required
							disabled={submitting}
							placeholder=" "
						/>
						<label for="password">Password</label>
					</div>
					<p id="login-help" class="form-help">Sesi admin dikelola secara aman oleh server.</p>
					{#if validationMessage}<p class="form-message" role="alert">{validationMessage}</p>{/if}
					{#if errorMessage}<p class="form-message" role="alert">{errorMessage}</p>{/if}
					<button class="submit-button" type="submit" disabled={submitting}>
						{submitting ? 'Sedang masuk…' : 'Masuk ke Admin'}
					</button>
				</form>
			</div>
			<p class="login-footer">Teknologi Rekayasa Multimedia · Politeknik Dewantara</p>
		</div>
		<div class="login-visual" aria-hidden="true">
			<div class="visual-orb visual-orb-one"></div>
			<div class="visual-orb visual-orb-two"></div>
			<div class="visual-wave"></div>
			<div class="visual-caption"><span>TRM</span><span>Politeknik Dewantara</span></div>
		</div>
	</section>
</main>

<style>
	.login-page { box-sizing: border-box; width: 100%; height: 100vh; height: 100svh; display: grid; place-items: center; overflow: hidden; padding: clamp(1rem, 5vw, 4rem); background: #2036b9; }
	.login-shell { box-sizing: border-box; width: min(100%, 1440px); height: 100%; min-height: 0; display: grid; grid-template-columns: 1.04fr .96fr; grid-template-rows: minmax(0, 1fr); overflow: hidden; padding: 14px; border-radius: clamp(30px, 6vw, 76px); background: #fff; box-shadow: 0 24px 80px rgb(5 15 73 / 18%); }
	.login-form-pane { position: relative; display: flex; min-width: 0; flex-direction: column; justify-content: space-between; padding: clamp(1.25rem, 3.5vw, 3.5rem); }
	.back-link { width: fit-content; color: #575d70; font-size: .82rem; text-decoration: none; opacity: .82; }
	.back-link:hover, .back-link:focus-visible { opacity: 1; text-decoration: underline; text-underline-offset: .25em; }
	.login-content { width: min(100%, 420px); align-self: center; margin: auto; padding: 2rem 0; }
	.login-logo { display: block; width: 54px; height: 54px; object-fit: contain; margin: 0 auto 1rem; }
	.eyebrow { margin: 0 0 .65rem; color: #3147bb; font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-align: center; text-transform: uppercase; }
	h1 { margin: 0; color: #151722; font: 600 clamp(1.8rem, 3vw, 2.55rem)/1.15 'Plus Jakarta Sans', sans-serif; letter-spacing: -.045em; text-align: center; }
	.login-intro { max-width: 340px; margin: .65rem auto 2rem; color: #747887; font-size: .88rem; line-height: 1.6; text-align: center; }
	form { display: grid; gap: 1rem; }
	.field { position: relative; display: grid; }
	label { position: absolute; top: 50%; left: 1rem; z-index: 1; padding: 0 .18rem; background: #fff; color: #8b8f9d; font-size: .88rem; font-weight: 400; line-height: 1; pointer-events: none; transform: translateY(-50%); transform-origin: left center; transition: top 160ms ease, color 160ms ease, font-size 160ms ease; }
	input { width: 100%; min-height: 50px; box-sizing: border-box; padding: .75rem 1rem; border: 1px solid #dfe2eb; border-radius: 999px; background: #fff; color: #151722; font: 400 .88rem/1.4 'Inter', sans-serif; transition: border-color 180ms ease, box-shadow 180ms ease; }
	input:focus-visible { border-color: #2036b9; outline: none; box-shadow: 0 0 0 3px rgb(32 54 185 / 13%); }
	input:focus + label, input:not(:placeholder-shown) + label { top: 0; color: #2036b9; font-size: .7rem; }
	input:disabled { opacity: .7; }
	.form-help { margin: -.2rem 0 0; color: #858997; font-size: .72rem; line-height: 1.5; }
	.form-message { margin: 0; padding: .7rem .85rem; border: 1px solid #f2caca; border-radius: 12px; background: #fff5f5; color: #9a2525; font-size: .82rem; line-height: 1.5; }
	.submit-button { min-height: 50px; margin-top: .3rem; padding: .75rem 1rem; border: 0; border-radius: 999px; background: #2036b9; color: #fff; font: 600 .9rem/1.2 'Inter', sans-serif; cursor: pointer; transition: background-color 180ms ease, transform 180ms ease; }
	.submit-button:hover { background: #172b9a; transform: translateY(-1px); }
	.submit-button:focus-visible { outline: 3px solid #6377e8; outline-offset: 3px; }
	.submit-button:disabled { cursor: wait; opacity: .68; }
	.login-footer { margin: 1rem 0 0; color: #858997; font-size: .67rem; text-align: center; }
	.login-visual { position: relative; align-self: stretch; width: 100%; height: 100%; min-width: 0; min-height: 0; max-height: 100%; overflow: hidden; isolation: isolate; border-radius: clamp(24px, 5vw, 58px); background: radial-gradient(ellipse at 78% 82%, #4568ff 0%, transparent 36%), radial-gradient(ellipse at 12% 12%, #111d83 0%, transparent 52%), linear-gradient(145deg, #07134e 0%, #172db0 48%, #080d34 100%); }
	.visual-orb { position: absolute; z-index: -1; width: 74%; aspect-ratio: 1; border-radius: 50%; filter: blur(1px); }
	.visual-orb-one { top: -19%; left: -21%; background: linear-gradient(145deg, #0b1558 18%, #2853dc 62%, #9b83ff 100%); box-shadow: 25px 30px 80px rgb(127 121 255 / 38%); }
	.visual-orb-two { right: -20%; bottom: -24%; width: 93%; background: linear-gradient(145deg, #07133e 10%, #304ee0 63%, #8c7cff 100%); box-shadow: -25px -20px 90px rgb(111 128 255 / 34%); }
	.visual-wave { position: absolute; top: 44%; left: -15%; width: 135%; height: 52%; border-radius: 48% 52% 0 0 / 25% 32% 0 0; background: linear-gradient(165deg, #040a2c 18%, #101a70 54%, #263eca 100%); transform: rotate(-10deg); box-shadow: 0 -20px 70px rgb(171 150 255 / 22%); }
	.visual-caption { position: absolute; right: clamp(1.5rem, 4vw, 3rem); bottom: clamp(1.5rem, 4vw, 3rem); left: clamp(1.5rem, 4vw, 3rem); display: flex; align-items: end; justify-content: space-between; gap: 1rem; color: rgb(255 255 255 / 78%); font: 500 .7rem/1.4 'Inter', sans-serif; letter-spacing: .08em; text-transform: uppercase; }
	.visual-caption span:first-child { color: #fff; font: 700 1.6rem/1 'Plus Jakarta Sans', sans-serif; letter-spacing: -.04em; }
	@media (max-width: 760px) {
		.login-page { padding: .8rem; }
		.login-shell { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) minmax(90px, 22%); padding: 8px; border-radius: 28px; }
		.login-form-pane { min-height: 0; padding: 1rem 1.25rem; }
		.login-content { padding: .75rem 0; }
		.login-logo { width: 44px; height: 44px; margin-bottom: .65rem; }
		.login-intro { margin-bottom: 1.2rem; }
		form { gap: .8rem; }
		input, .submit-button { min-height: 46px; }
		.login-visual { min-height: 0; border-radius: 22px; }
		.visual-orb { width: 55%; }
		.visual-orb-two { width: 60%; }
		.visual-wave { top: 37%; height: 75%; }
	}
	@media (max-width: 420px) {
		.login-page { padding: .5rem; }
		.login-shell { grid-template-rows: minmax(0, 1fr) minmax(72px, 18%); padding: 6px; border-radius: 24px; }
		.login-form-pane { padding: .75rem 1rem; }
		.login-content { padding: .35rem 0; }
		.login-logo { width: 38px; height: 38px; margin-bottom: .45rem; }
		.login-intro { margin-top: .45rem; margin-bottom: .85rem; }
		form { gap: .65rem; }
		input, .submit-button { min-height: 42px; }
	}
	@media (prefers-reduced-motion: reduce) { input, .submit-button { transition: none; } }
</style>
