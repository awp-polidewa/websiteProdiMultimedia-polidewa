<script>
	import { goto } from '$app/navigation';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';

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
	<a class="back-link" href="/">← Kembali ke website publik</a>
	<section class="login-panel" aria-labelledby="login-title">
		<p class="eyebrow">Area pengelola</p>
		<h1 id="login-title">Masuk ke admin</h1>
		<p class="login-intro">Gunakan username atau NIDN yang terdaftar.</p>
		<form onsubmit={submit} aria-describedby="login-help">
			<div class="field">
				<label for="identifier">Username atau NIDN</label>
				<input
					id="identifier"
					name="identifier"
					type="text"
					autocomplete="username"
					bind:value={identifier}
					maxlength="150"
					required
					disabled={submitting}
				/>
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					maxlength="72"
					required
					disabled={submitting}
				/>
			</div>
			<p id="login-help" class="form-help">Session dikelola secara aman oleh server.</p>
			{#if validationMessage}<p class="form-message" role="alert">{validationMessage}</p>{/if}
			{#if errorMessage}<p class="form-message" role="alert">{errorMessage}</p>{/if}
			<button class="submit-button" type="submit" disabled={submitting}>
				{submitting ? 'Sedang masuk…' : 'Login'}
			</button>
		</form>
	</section>
	<p class="login-footer">Teknologi Rekayasa Multimedia · Politeknik Dewantara</p>
</main>

<style>
	.login-page { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; width: min(calc(100% - 2rem), 440px); margin: 0 auto; padding: 2rem 0; }
	.back-link { width: fit-content; margin-bottom: 2.5rem; font-size: .82rem; text-decoration: none; opacity: .76; }
	.back-link:hover, .back-link:focus-visible { opacity: 1; text-decoration: underline; text-underline-offset: .25em; }
	.login-panel { padding: clamp(1.25rem, 5vw, 2rem); border: 1px solid var(--line); }
	.eyebrow { margin: 0 0 .8rem; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	h1 { margin: 0; font: 500 clamp(1.7rem, 6vw, 2rem)/1.2 'Poppins', sans-serif; letter-spacing: -.035em; }
	.login-intro { margin: .7rem 0 1.8rem; font-size: .9rem; line-height: 1.6; opacity: .78; }
	form { display: grid; gap: 1.15rem; }
	.field { display: grid; gap: .45rem; }
	label { font-size: .82rem; font-weight: 500; }
	input { width: 100%; min-height: 46px; box-sizing: border-box; padding: .65rem .75rem; border: 1px solid var(--line); border-radius: 3px; background: Canvas; color: CanvasText; font: 400 .92rem/1.4 'Inter', sans-serif; }
	input:focus-visible { outline: 2px solid CanvasText; outline-offset: 2px; }
	input:disabled { opacity: .7; }
	.form-help { margin: -.25rem 0 0; font-size: .76rem; line-height: 1.5; opacity: .65; }
	.form-message { margin: 0; padding: .65rem .75rem; border-left: 2px solid CanvasText; font-size: .82rem; line-height: 1.5; }
	.submit-button { min-height: 46px; margin-top: .25rem; padding: .7rem 1rem; border: 1px solid CanvasText; border-radius: 3px; background: CanvasText; color: Canvas; font: 500 .9rem/1.2 'Inter', sans-serif; cursor: pointer; }
	.submit-button:hover, .submit-button:focus-visible { text-decoration: underline; text-underline-offset: .25em; }
	.submit-button:disabled { cursor: wait; opacity: .68; }
	.login-footer { margin: 1rem 0 0; font-size: .7rem; text-align: center; opacity: .62; }
	@media (max-width: 420px) { .back-link { margin-bottom: 1.5rem; } .login-page { justify-content: flex-start; padding-top: 3rem; } }
</style>
