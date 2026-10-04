<script>
	import { mediaUrl, uploadMedia } from './api.js';

	/** @typedef {'lecturers' | 'news' | 'projects' | 'accreditation'} MediaType */
	/** @type {{ type: MediaType, label: string, path: string, required?: boolean, busy?: boolean }} */
	let { type, label, path = $bindable(''), required = false, busy = $bindable(false) } = $props();
	let errorMessage = $state('');
	let infoMessage = $state('');
	let currentFile = $state('');
	const inputId = $derived(`upload-${type}`);
	const accept = $derived(type === 'accreditation' ? '.pdf,application/pdf' : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp');
	const sizeHelp = $derived(type === 'accreditation' ? 'PDF, maksimal 15 MB.' : 'JPG, PNG, atau WebP, maksimal 5 MB.');

	/** @param {Event} event */
	async function handleFileChange(event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		const file = input.files?.[0];
		if (!file) return;
		errorMessage = '';
		infoMessage = '';
		currentFile = file.name;
		busy = true;
		try {
			const result = await uploadMedia(type, file);
			if (typeof result?.data?.path !== 'string') throw new Error('Server tidak mengembalikan path media.');
			path = result.data.path;
			infoMessage = 'File berhasil diunggah. Simpan formulir untuk menerapkan path ke data.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'File gagal diunggah.';
		} finally {
			busy = false;
			input.value = '';
		}
	}
</script>

<div class="upload-field">
	<label for={inputId}>{label}{#if required}<span aria-hidden="true"> *</span>{/if}</label>
	<input id={inputId} type="file" accept={accept} onchange={handleFileChange} disabled={busy} aria-describedby={`${inputId}-hint`} />
	<small id={`${inputId}-hint`} class="hint">{sizeHelp} Memilih file akan mengunggahnya ke penyimpanan media.</small>
	{#if busy}<small class="hint" role="status" aria-live="polite">Mengunggah…</small>{/if}
	{#if errorMessage}<small class="error" role="alert">{errorMessage}</small>{/if}
	{#if infoMessage}<small class="hint" role="status">{infoMessage}</small>{/if}
	{#if path}
		<div class="current-media">
			{#if type === 'accreditation'}<a href={mediaUrl(path)} target="_blank" rel="noreferrer">Buka PDF yang dipilih</a>
			{:else if mediaUrl(path)}<img src={mediaUrl(path)} alt="Pratinjau media saat ini" />{/if}
			<small>Path tersimpan: <code>{path}</code></small>
		</div>
	{:else if required}
		<small class="hint">File wajib diunggah sebelum formulir disimpan.</small>
	{/if}
	{#if currentFile}<small class="hint">File dipilih: {currentFile}</small>{/if}
</div>

<style>
	.upload-field { display: grid; gap: .4rem; }
	.upload-field label { font-size: .82rem; font-weight: 500; }
	.upload-field input { min-height: 42px; max-width: 100%; padding: .45rem; border: 1px solid var(--line); background: Canvas; color: CanvasText; font: 400 .82rem/1.4 'Inter', sans-serif; }
	.upload-field input:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.hint, .error, .current-media small { display: block; font-size: .76rem; line-height: 1.5; opacity: .75; }
	.error { color: #a32626; opacity: 1; }
	.current-media { display: grid; justify-items: start; gap: .35rem; min-width: 0; }
	.current-media img { max-width: min(100%, 15rem); max-height: 9rem; object-fit: contain; border: 1px solid var(--line); }
	.current-media code { overflow-wrap: anywhere; }
	.current-media a { font-size: .8rem; }
</style>
