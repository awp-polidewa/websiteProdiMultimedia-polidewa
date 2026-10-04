<script>
	import { onMount } from 'svelte';
	import { ApiError, requestApi, uploadRagDocument } from '../../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, originalFilename: string, status: 'pending' | 'processing' | 'ready' | 'failed' | string, errorMessage?: string | null, createdAt?: string | null }} RagDocument */

	/** @type {RagDocument[]} */
	let documents = $state([]);
	let loading = $state(true);
	let listError = $state('');
	let uploading = $state(false);
	let uploadError = $state('');
	let uploadNotice = $state('');
	let uploadOpen = $state(false);
	let deletingId = $state(/** @type {string | null} */ (null));
	let title = $state('');
	let selectedFile = $state(/** @type {File | null} */ (null));
	let dialogElement = $state(/** @type {HTMLDialogElement | undefined} */ (undefined));
	let fileInput = $state(/** @type {HTMLInputElement | undefined} */ (undefined));
	let requestVersion = 0;

	onMount(() => { void loadDocuments(); });
	$effect(() => {
		if (uploadOpen && dialogElement && !dialogElement.open) dialogElement.showModal();
	});

	async function loadDocuments() {
		const version = ++requestVersion;
		loading = true;
		listError = '';
		try {
			const result = await requestApi('rag/documents', {}, true);
			if (version !== requestVersion) return;
			documents = Array.isArray(result?.data) ? result.data : [];
		} catch (error) {
			if (version !== requestVersion) return;
			listError = error instanceof Error ? error.message : 'Daftar dokumen RAG gagal dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	function openUploadDialog() {
		title = '';
		selectedFile = null;
		uploadError = '';
		if (fileInput) fileInput.value = '';
		uploadOpen = true;
	}

	function closeUploadDialog() {
		if (uploading) return;
		if (dialogElement?.open) dialogElement.close();
		else uploadOpen = false;
	}

	/** @param {Event} event */
	function selectFile(event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		selectedFile = input.files?.[0] ?? null;
		uploadError = '';
		if (!title.trim() && selectedFile) title = selectedFile.name.replace(/\.pdf$/i, '').trim().slice(0, 200);
	}

	/** @param {SubmitEvent} event */
	async function submitUpload(event) {
		event.preventDefault();
		uploadError = '';
		uploadNotice = '';
		if (!selectedFile) {
			uploadError = 'Pilih file PDF terlebih dahulu.';
			return;
		}
		if (!title.trim()) {
			uploadError = 'Nama dokumen wajib diisi.';
			return;
		}

		uploading = true;
		try {
			const result = await uploadRagDocument(title.trim(), selectedFile);
			const data = result?.data;
			if (data?.status === 'failed') {
				uploadNotice = data.errorMessage || 'Dokumen diterima, tetapi pemrosesan gagal. Periksa status pada daftar.';
			} else {
				uploadNotice = 'Dokumen berhasil diunggah dan masuk ke proses RAG.';
			}
			uploadOpen = false;
			if (dialogElement?.open) dialogElement.close();
			selectedFile = null;
			if (fileInput) fileInput.value = '';
			await loadDocuments();
		} catch (error) {
			if (error instanceof ApiError) {
				const fileError = error.errors.file;
				uploadError = fileError ? `${error.message} ${fileError}` : error.message;
			} else {
				uploadError = error instanceof Error ? error.message : 'Dokumen RAG gagal diunggah.';
			}
		} finally {
			uploading = false;
		}
	}

	/** @param {RagDocument} document */
	async function deleteDocument(document) {
		if (!window.confirm(`Hapus dokumen “${document.originalFilename || document.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
		deletingId = document.id;
		listError = '';
		uploadNotice = '';
		try {
			await requestApi(`rag/documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }, true);
			await loadDocuments();
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Dokumen RAG gagal dihapus.';
		} finally {
			deletingId = null;
		}
	}

	/** @param {string | null | undefined} value */
	function formatDate(value) {
		if (!value) return '—';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '—';
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Dokumen RAG — Admin TRM</title>
	<meta name="description" content="Kelola dokumen PDF sumber pengetahuan chatbot Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="rag-page">
	<header class="page-heading">
		<div>
			<p class="eyebrow">Pengelolaan pengetahuan</p>
			<h1>Dokumen RAG</h1>
			<p class="intro">Kelola PDF yang disetujui sebagai sumber pengetahuan chatbot.</p>
		</div>
		<button class="button primary" type="button" onclick={openUploadDialog}>Upload Dokumen</button>
	</header>

	{#if uploadNotice}<p class="notice success" role="status">{uploadNotice}</p>{/if}
	{#if listError}<div class="notice error" role="alert"><span>{listError}</span><button class="text-button" type="button" onclick={loadDocuments}>Coba lagi</button></div>{/if}

	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat dokumen RAG…</p>
	{:else if !listError && documents.length === 0}
		<section class="empty-state" aria-labelledby="empty-title">
			<p class="eyebrow">Belum ada sumber</p>
			<h2 id="empty-title">Belum ada dokumen RAG</h2>
			<p>PDF yang dipilih dan disetujui untuk chatbot akan tercatat di sini. Hanya PDF yang diunggah secara eksplisit yang diproses.</p>
			<button class="button" type="button" onclick={openUploadDialog}>Upload dokumen pertama</button>
		</section>
	{:else if !listError}
		<p class="list-meta">{documents.length} dokumen</p>
		<div class="desktop-list">
			<table>
				<caption class="visually-hidden">Daftar dokumen RAG yang dikelola admin</caption>
				<thead><tr><th scope="col">Dokumen</th><th scope="col">Status proses</th><th scope="col">Tanggal upload</th><th scope="col"><span class="visually-hidden">Aksi</span></th></tr></thead>
				<tbody>
					{#each documents as document (document.id)}
						<tr>
							<td><strong>{document.originalFilename || document.title || 'PDF tanpa nama'}</strong>{#if document.title && document.title !== document.originalFilename}<span class="document-title">{document.title}</span>{/if}</td>
							<td><span class="status" class:pending={document.status === 'pending'} class:processing={document.status === 'processing'} class:ready={document.status === 'ready'} class:failed={document.status === 'failed'}>{document.status}</span>{#if document.errorMessage}<span class="processing-error">{document.errorMessage}</span>{/if}</td>
							<td>{formatDate(document.createdAt)}</td>
							<td class="actions"><button class="text-button danger" type="button" disabled={deletingId === document.id} onclick={() => deleteDocument(document)}>{deletingId === document.id ? 'Menghapus…' : 'Hapus'}</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mobile-list" aria-label="Daftar dokumen RAG">
			{#each documents as document (document.id)}
				<article class="document-card">
					<div class="card-top"><span class="status" class:pending={document.status === 'pending'} class:processing={document.status === 'processing'} class:ready={document.status === 'ready'} class:failed={document.status === 'failed'}>{document.status}</span><span class="upload-date">{formatDate(document.createdAt)}</span></div>
					<h2>{document.originalFilename || document.title || 'PDF tanpa nama'}</h2>
					{#if document.title && document.title !== document.originalFilename}<p class="document-title">{document.title}</p>{/if}
					{#if document.errorMessage}<p class="processing-error">{document.errorMessage}</p>{/if}
					<div class="card-actions"><button class="text-button danger" type="button" disabled={deletingId === document.id} onclick={() => deleteDocument(document)}>{deletingId === document.id ? 'Menghapus…' : 'Hapus dokumen'}</button></div>
				</article>
			{/each}
		</div>
	{/if}
</div>

{#if uploadOpen}
	<dialog bind:this={dialogElement} class="upload-dialog" aria-modal="true" aria-labelledby="upload-heading" onclose={() => (uploadOpen = false)}>
		<header class="dialog-heading">
			<div><p class="eyebrow">Sumber pengetahuan</p><h2 id="upload-heading">Upload Dokumen</h2></div>
			<button class="text-button" type="button" onclick={closeUploadDialog} disabled={uploading}>Tutup</button>
		</header>
		{#if uploadError}<p class="notice error" role="alert">{uploadError}</p>{/if}
		<form onsubmit={submitUpload}>
			<label for="rag-title">Nama dokumen</label>
			<input id="rag-title" bind:value={title} maxlength="200" required autocomplete="off" />
			<label for="rag-pdf">File PDF</label>
			<input id="rag-pdf" bind:this={fileInput} type="file" accept="application/pdf,.pdf" required onchange={selectFile} />
			<p class="hint">Hanya PDF. File dikirim ke backend untuk diproses.</p>
			<div class="form-actions">
				<button class="button" type="button" onclick={closeUploadDialog} disabled={uploading}>Batal</button>
				<button class="button primary" type="submit" disabled={uploading || !selectedFile}>{uploading ? 'Mengunggah dan memproses…' : 'Upload Dokumen'}</button>
			</div>
		</form>
	</dialog>
{/if}

<style>
	.rag-page { width: min(100%, 1120px); margin: 0 auto; }
	.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.8rem; }
	.eyebrow { margin: 0 0 .5rem; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	h1 { margin: 0; font: 500 clamp(1.6rem, 3vw, 1.9rem)/1.2 'Poppins', sans-serif; letter-spacing: -.035em; }
	.intro { margin: .55rem 0 0; font-size: .88rem; line-height: 1.6; opacity: .76; }
	.button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; padding: .6rem .85rem; border: 1px solid var(--line); border-radius: 3px; background: Canvas; color: CanvasText; font: 500 .82rem/1.2 'Inter', sans-serif; cursor: pointer; }
	.button.primary { border-color: CanvasText; background: CanvasText; color: Canvas; }
	.button:hover:not(:disabled), .text-button:hover:not(:disabled) { text-decoration: underline; text-underline-offset: .25em; }
	.button:focus-visible, .text-button:focus-visible, input:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.button:disabled, .text-button:disabled { cursor: wait; opacity: .58; }
	.text-button { min-height: 40px; padding: .45rem .4rem; border: 0; background: transparent; color: inherit; font: 500 .82rem/1.3 'Inter', sans-serif; text-decoration: underline; text-decoration-color: transparent; text-underline-offset: .25em; cursor: pointer; }
	.text-button.danger { text-decoration-color: currentColor; }
	.state { margin: 2rem 0; padding: 1rem 0; border-block: 1px solid var(--line); font-size: .88rem; }
	.notice { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 1rem; padding: .8rem .9rem; border: 1px solid var(--line); font-size: .84rem; line-height: 1.5; }
	.notice.error { border-left: 3px solid CanvasText; }
	.notice.success { border-left: 3px solid CanvasText; }
	.empty-state { padding: clamp(1.5rem, 5vw, 3rem); border: 1px solid var(--line); }
	.empty-state h2 { margin: .3rem 0 .55rem; font: 500 1.2rem/1.35 'Poppins', sans-serif; }
	.empty-state > p:not(.eyebrow) { max-width: 560px; margin: 0 0 1.2rem; font-size: .86rem; line-height: 1.65; opacity: .76; }
	.list-meta { margin: 0 0 .7rem; font-size: .78rem; opacity: .7; }
	.desktop-list { overflow-x: auto; border-top: 1px solid var(--line); }
	table { width: 100%; border-collapse: collapse; text-align: left; font-size: .83rem; }
	th { padding: .75rem .8rem; border-bottom: 1px solid var(--line); font-size: .71rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; opacity: .68; }
	td { padding: .9rem .8rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
	td:first-child { min-width: 280px; }
	td strong { display: block; max-width: 460px; font-weight: 500; overflow-wrap: anywhere; }
	.document-title, .processing-error { display: block; margin-top: .3rem; font-size: .75rem; line-height: 1.45; opacity: .72; overflow-wrap: anywhere; }
	.processing-error { opacity: 1; }
	.status { display: inline-flex; min-height: 25px; align-items: center; padding: .2rem .48rem; border: 1px solid var(--line); border-radius: 2px; font-size: .7rem; font-weight: 600; }
	.status.pending { border-style: dashed; }
	.status.processing { border-width: 2px; }
	.status.ready { text-decoration: underline; text-underline-offset: .2em; }
	.status.failed { border-left-width: 3px; }
	.actions { white-space: nowrap; text-align: right; }
	.mobile-list { display: none; }
	.upload-date { font-size: .73rem; }
	.upload-dialog { position: fixed; top: 50%; left: 50%; width: min(calc(100% - 2rem), 560px); max-height: min(92vh, 760px); overflow-y: auto; margin: 0; padding: clamp(1rem, 3vw, 1.5rem); transform: translate(-50%, -50%); border: 1px solid var(--line); background: Canvas; color: CanvasText; box-shadow: 0 16px 48px rgb(0 0 0 / .18); }
	.upload-dialog::backdrop { background: rgb(0 0 0 / .48); }
	.dialog-heading { display: flex; align-items: start; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
	.dialog-heading h2 { margin: 0; font: 500 1.25rem/1.3 'Poppins', sans-serif; }
	form { display: grid; gap: .65rem; }
	form label { margin-top: .3rem; font-size: .8rem; font-weight: 500; }
	input { width: 100%; min-height: 43px; padding: .65rem .7rem; border: 1px solid var(--line); border-radius: 2px; background: Canvas; color: CanvasText; font: 400 .86rem/1.5 'Inter', sans-serif; }
	input[type='file'] { padding: .48rem; }
	.hint { margin: -.25rem 0 .4rem; font-size: .72rem; line-height: 1.45; opacity: .68; }
	.form-actions { display: flex; justify-content: end; gap: .6rem; margin-top: .4rem; padding-top: .8rem; border-top: 1px solid var(--line); }
	@media (max-width: 680px) {
		.page-heading { align-items: start; flex-direction: column; gap: 1rem; }
		.page-heading > .button { width: 100%; }
		.desktop-list { display: none; }
		.mobile-list { display: grid; gap: .7rem; }
		.document-card { min-width: 0; padding: .9rem; border: 1px solid var(--line); }
		.card-top { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
		.document-card h2 { margin: .7rem 0 0; font: 500 .94rem/1.45 'Poppins', sans-serif; overflow-wrap: anywhere; }
		.card-actions { display: flex; gap: .65rem; margin-top: .55rem; padding-top: .4rem; border-top: 1px solid var(--line); }
		.upload-dialog { top: auto; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 94vh; transform: none; border-right: 0; border-bottom: 0; border-left: 0; }
	}
	@media (prefers-reduced-motion: reduce) { .upload-dialog { scroll-behavior: auto; } }
</style>
