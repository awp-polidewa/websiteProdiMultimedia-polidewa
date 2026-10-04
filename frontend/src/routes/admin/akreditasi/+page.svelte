<script>
	import { onMount } from 'svelte';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';
	import MediaUploadField from '../../../lib/admin/MediaUploadField.svelte';

	/** @typedef {{ id: string, title: string, description: string | null, filePath: string, sourceUrl: string | null, status: 'draft' | 'published', publishedAt: string | null, createdAt: string, updatedAt: string }} AccreditationDocument */
	/** @typedef {{ title: string, description: string, file_path: string, source_url: string, status: 'draft' | 'published', published_at: string }} DocumentForm */
	/** @returns {DocumentForm} */
	const emptyForm = () => ({ title: '', description: '', file_path: '', source_url: '', status: 'draft', published_at: '' });

	/** @type {AccreditationDocument[]} */
	let items = $state([]);
	let page = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);
	let loading = $state(true);
	let listError = $state('');
	let formOpen = $state(false);
	let editingId = $state(/** @type {string | null} */ (null));
	let form = $state(emptyForm());
	let fieldErrors = $state(/** @type {Record<string, string>} */ ({}));
	let formError = $state('');
	let saving = $state(false);
	let mediaUploading = $state(false);
	let deletingId = $state(/** @type {string | null} */ (null));
	let dialogElement = $state(/** @type {HTMLDialogElement | undefined} */ (undefined));
	let requestVersion = 0;
	let heading = $derived(editingId ? 'Edit dokumen akreditasi' : 'Tambah dokumen akreditasi');

	onMount(() => { void loadDocuments(); });
	$effect(() => {
		if (formOpen && dialogElement && !dialogElement.open) dialogElement.showModal();
	});

	/** @param {number} requestedPage */
	async function loadDocuments(requestedPage = page) {
		const version = ++requestVersion;
		loading = true;
		listError = '';
		try {
			const result = await requestApi(`accreditation-documents?page=${requestedPage}`, {}, true);
			if (version !== requestVersion) return;
			items = Array.isArray(result?.data) ? result.data : [];
			page = Number(result?.meta?.page) || requestedPage;
			totalPages = Number(result?.meta?.totalPages) || 0;
			totalItems = Number(result?.meta?.totalItems) || 0;
		} catch (error) {
			if (version !== requestVersion) return;
			listError = error instanceof Error ? error.message : 'Daftar dokumen gagal dimuat.';
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	function openCreateForm() {
		editingId = null;
		form = emptyForm();
		fieldErrors = {};
		formError = '';
		formOpen = true;
	}

	/** @param {AccreditationDocument} document */
	async function openEditForm(document) {
		fieldErrors = {};
		formError = '';
		try {
			const result = await requestApi(`accreditation-documents/${encodeURIComponent(document.id)}`, {}, true);
			const data = result?.data;
			if (!data) throw new Error('Detail dokumen tidak tersedia.');
			editingId = String(data.id);
			form = {
				title: data.title ?? '',
				description: data.description ?? '',
				file_path: data.filePath ?? '',
				source_url: data.sourceUrl ?? '',
				status: data.status === 'published' ? 'published' : 'draft',
				published_at: data.publishedAt ?? ''
			};
			formOpen = true;
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Detail dokumen gagal dimuat.';
		}
	}

	function closeForm() {
		if (saving) return;
		if (dialogElement?.open) dialogElement.close();
		else formOpen = false;
	}

	/** @param {SubmitEvent} event */
	async function submitForm(event) {
		event.preventDefault();
		if (mediaUploading) { formError = 'Tunggu sampai upload selesai sebelum menyimpan.'; return; }
		fieldErrors = {};
		formError = '';
		const title = form.title.trim();
		const filePath = form.file_path.trim();
		const sourceUrl = form.source_url.trim();
		const publishedAt = form.published_at.trim();

		if (!title) fieldErrors.title = 'Judul wajib diisi.';
		else if (title.length > 200) fieldErrors.title = 'Maksimal 200 karakter.';
		if (!filePath) fieldErrors.file_path = 'Path file wajib diisi.';
		else if (!isValidRelativePath(filePath)) fieldErrors.file_path = 'Gunakan path relatif yang valid, maksimal 255 karakter.';
		if (new TextEncoder().encode(form.description.trim()).length > 65_535) fieldErrors.description = 'Deskripsi terlalu panjang.';
		if (sourceUrl) {
			if (sourceUrl.length > 500) fieldErrors.source_url = 'Maksimal 500 karakter.';
			else {
				try {
					const url = new URL(sourceUrl);
					if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) fieldErrors.source_url = 'Gunakan URL HTTP atau HTTPS yang valid.';
				} catch {
					fieldErrors.source_url = 'Gunakan URL HTTP atau HTTPS yang valid.';
				}
			}
		}
		if (publishedAt && !isValidDate(publishedAt)) fieldErrors.published_at = 'Masukkan tanggal kalender yang valid.';
		if (!['draft', 'published'].includes(form.status)) fieldErrors.status = 'Pilih draft atau published.';
		if (Object.keys(fieldErrors).length) return;

		saving = true;
		const body = {
			title,
			description: form.description.trim() || null,
			file_path: filePath,
			source_url: sourceUrl || null,
			status: form.status,
			published_at: publishedAt || null
		};
		try {
			await requestApi(editingId ? `accreditation-documents/${encodeURIComponent(editingId)}` : 'accreditation-documents', {
				method: editingId ? 'PUT' : 'POST',
				body: JSON.stringify(body)
			}, true);
			formOpen = false;
			if (!editingId) {
				page = 1;
				await loadDocuments(1);
			} else {
				await loadDocuments(page);
			}
		} catch (error) {
			if (error instanceof ApiError) {
				fieldErrors = error.errors;
				formError = error.message;
			} else {
				formError = error instanceof Error ? error.message : 'Dokumen gagal disimpan.';
			}
		} finally {
			saving = false;
		}
	}

	/** @param {string} path */
	function isValidRelativePath(path) {
		return path.length <= 255 && !path.startsWith('/') && !path.includes('\\') &&
			!path.split(/[\\/]+/).includes('..') && !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path);
	}

	/** @param {string} value */
	function isValidDate(value) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
		const [year, month, day] = value.split('-').map(Number);
		const date = new Date(Date.UTC(year, month - 1, day));
		return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
	}

	/** @param {AccreditationDocument} document */
	async function deleteDocument(document) {
		if (!window.confirm(`Hapus dokumen “${document.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
		deletingId = document.id;
		listError = '';
		try {
			await requestApi(`accreditation-documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }, true);
			const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
			page = nextPage;
			await loadDocuments(nextPage);
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Dokumen gagal dihapus.';
		} finally {
			deletingId = null;
		}
	}

	/** @param {string | null | undefined} value */
	function formatDate(value) {
		if (!value) return '—';
		const date = new Date(`${value}T00:00:00+08:00`);
		if (Number.isNaN(date.getTime())) return '—';
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}
</script>

<svelte:head>
	<title>Akreditasi — Admin TRM</title>
	<meta name="description" content="Kelola metadata dokumen akreditasi Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="documents-page">
	<header class="page-heading">
		<div><p class="eyebrow">Pengelolaan konten</p><h1>Dokumen akreditasi</h1><p class="intro">Kelola metadata dan status publikasi dokumen akreditasi.</p></div>
		<button class="button primary" type="button" onclick={openCreateForm}>Tambah dokumen</button>
	</header>

	{#if listError}<div class="notice error" role="alert"><span>{listError}</span><button class="text-button" type="button" onclick={() => loadDocuments(page)}>Coba lagi</button></div>{/if}
	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat dokumen…</p>
	{:else if !listError && items.length === 0}
		<section class="empty-state" aria-labelledby="empty-title"><p class="eyebrow">Belum ada konten</p><h2 id="empty-title">Daftar dokumen masih kosong</h2><p>Metadata dokumen yang ditambahkan akan tampil di sini. Hanya dokumen berstatus published yang tersedia melalui API publik.</p><button class="button" type="button" onclick={openCreateForm}>Tambah dokumen pertama</button></section>
	{:else if !listError}
		<div class="list-meta"><p>{totalItems} dokumen</p><p>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</p></div>
		<div class="desktop-list"><table><caption class="visually-hidden">Daftar dokumen akreditasi yang dapat dikelola admin</caption><thead><tr><th scope="col">Dokumen</th><th scope="col">Tanggal</th><th scope="col">Status</th><th scope="col">Diperbarui</th><th scope="col"><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>
			{#each items as document (document.id)}
				<tr><td><strong>{document.title}</strong><span class="file-path">{document.filePath}</span>{#if document.sourceUrl}<a class="source-url" href={document.sourceUrl} target="_blank" rel="noreferrer">Sumber ↗</a>{/if}</td><td>{formatDate(document.publishedAt)}</td><td><span class="status" class:published={document.status === 'published'}>{document.status === 'published' ? 'Published' : 'Draft'}</span></td><td>{formatDate(document.updatedAt?.slice(0, 10))}</td><td class="actions"><button class="text-button" type="button" onclick={() => openEditForm(document)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === document.id} onclick={() => deleteDocument(document)}>{deletingId === document.id ? 'Menghapus…' : 'Hapus'}</button></td></tr>
			{/each}
		</tbody></table></div>
		<div class="mobile-list" aria-label="Daftar dokumen akreditasi">
			{#each items as document (document.id)}
				<article class="document-card"><div class="card-top"><span class="status" class:published={document.status === 'published'}>{document.status === 'published' ? 'Published' : 'Draft'}</span><span>{formatDate(document.publishedAt)}</span></div><h2>{document.title}</h2><p class="file-path">{document.filePath}</p>{#if document.sourceUrl}<a class="source-url" href={document.sourceUrl} target="_blank" rel="noreferrer">Buka sumber ↗</a>{/if}<p class="updated">Diperbarui {formatDate(document.updatedAt?.slice(0, 10))}</p><div class="card-actions"><button class="text-button" type="button" onclick={() => openEditForm(document)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === document.id} onclick={() => deleteDocument(document)}>{deletingId === document.id ? 'Menghapus…' : 'Hapus'}</button></div></article>
			{/each}
		</div>
		<nav class="pagination" aria-label="Pagination dokumen akreditasi"><button class="button" type="button" disabled={page <= 1 || loading} onclick={() => loadDocuments(page - 1)}>Sebelumnya</button><span>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</span><button class="button" type="button" disabled={!totalPages || page >= totalPages || loading} onclick={() => loadDocuments(page + 1)}>Berikutnya</button></nav>
	{/if}
</div>

{#if formOpen}
	<dialog bind:this={dialogElement} class="form-dialog" aria-modal="true" aria-labelledby="form-heading" onclick={(event) => { if (event.target === event.currentTarget) closeForm(); }} onclose={() => (formOpen = false)}>
		<header class="form-heading"><div><p class="eyebrow">Metadata dokumen</p><h2 id="form-heading">{heading}</h2></div><button class="close-button" type="button" aria-label="Tutup formulir" onclick={closeForm} disabled={saving}>Tutup</button></header>
		{#if formError}<p class="notice error" role="alert">{formError}</p>{/if}
		<form onsubmit={submitForm} novalidate>
			<label>Judul/nama dokumen <span aria-hidden="true">*</span><input bind:value={form.title} maxlength="200" required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'title-error' : undefined} />{#if fieldErrors.title}<small id="title-error" class="field-error">{fieldErrors.title}</small>{/if}</label>
			<label>Deskripsi<textarea bind:value={form.description} rows="4" aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? 'description-error' : 'description-hint'}></textarea><small id="description-hint" class="hint">Opsional.</small>{#if fieldErrors.description}<small id="description-error" class="field-error">{fieldErrors.description}</small>{/if}</label>
			<MediaUploadField type="accreditation" label="Dokumen akreditasi (PDF)" required bind:path={form.file_path} bind:busy={mediaUploading} />
			{#if fieldErrors.file_path}<small id="path-error" class="field-error">{fieldErrors.file_path}</small>{/if}
			<label>URL sumber<input bind:value={form.source_url} type="url" maxlength="500" placeholder="https://contoh.id/dokumen" aria-invalid={Boolean(fieldErrors.source_url)} aria-describedby={fieldErrors.source_url ? 'source-error' : 'source-hint'} /><small id="source-hint" class="hint">Opsional. Hanya URL HTTP atau HTTPS.</small>{#if fieldErrors.source_url}<small id="source-error" class="field-error">{fieldErrors.source_url}</small>{/if}</label>
			<label>Tanggal terbit<input bind:value={form.published_at} type="date" aria-invalid={Boolean(fieldErrors.published_at)} aria-describedby={fieldErrors.published_at ? 'date-error' : 'date-hint'} /><small id="date-hint" class="hint">Opsional.</small>{#if fieldErrors.published_at}<small id="date-error" class="field-error">{fieldErrors.published_at}</small>{/if}</label>
			<label>Status<select bind:value={form.status} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? 'status-error' : undefined}><option value="draft">Draft</option><option value="published">Published</option></select>{#if fieldErrors.status}<small id="status-error" class="field-error">{fieldErrors.status}</small>{/if}</label>
			<div class="form-actions"><button class="button" type="button" onclick={closeForm} disabled={saving || mediaUploading}>Batal</button><button class="button primary" type="submit" disabled={saving || mediaUploading}>{mediaUploading ? 'Mengunggah…' : saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan dokumen'}</button></div>
		</form>
	</dialog>
{/if}

<style>
	.documents-page { width: min(100%, 1120px); margin: 0 auto; }
	.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.8rem; }
	.eyebrow { margin: 0 0 .5rem; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
	h1 { margin: 0; font: 500 clamp(1.6rem, 3vw, 1.9rem)/1.2 'Poppins', sans-serif; letter-spacing: -.035em; }
	.intro { margin: .55rem 0 0; font-size: .88rem; line-height: 1.6; opacity: .76; }
	.button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; padding: .6rem .85rem; border: 1px solid var(--line); border-radius: 3px; background: Canvas; color: CanvasText; font: 500 .82rem/1.2 'Inter', sans-serif; text-decoration: none; cursor: pointer; }
	.button:hover:not(:disabled), .text-button:hover:not(:disabled) { text-decoration: underline; text-underline-offset: .25em; }
	.button:focus-visible, .text-button:focus-visible, .close-button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
	.button.primary { border-color: CanvasText; background: CanvasText; color: Canvas; }
	.button:disabled, .text-button:disabled { cursor: wait; opacity: .58; }
	.state { margin: 2rem 0; padding: 1rem 0; border-block: 1px solid var(--line); font-size: .88rem; }
	.notice { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 1rem; padding: .8rem .9rem; border: 1px solid var(--line); font-size: .84rem; line-height: 1.5; }
	.notice.error { border-left: 3px solid CanvasText; }
	.text-button { min-height: 40px; padding: .45rem .4rem; border: 0; background: transparent; color: inherit; font: 500 .82rem/1.3 'Inter', sans-serif; text-decoration: underline; text-decoration-color: transparent; text-underline-offset: .25em; cursor: pointer; }
	.text-button.danger { text-decoration-color: currentColor; }
	.empty-state { padding: clamp(1.5rem, 5vw, 3rem); border: 1px solid var(--line); }
	.empty-state h2 { margin: .3rem 0 .55rem; font: 500 1.2rem/1.35 'Poppins', sans-serif; }
	.empty-state > p:not(.eyebrow) { max-width: 560px; margin: 0 0 1.2rem; font-size: .86rem; line-height: 1.65; opacity: .76; }
	.list-meta { display: flex; justify-content: space-between; gap: 1rem; margin: 0 0 .7rem; font-size: .78rem; opacity: .7; }
	.list-meta p { margin: 0; }
	.desktop-list { overflow-x: auto; border-top: 1px solid var(--line); }
	table { width: 100%; border-collapse: collapse; text-align: left; font-size: .83rem; }
	th { padding: .75rem .8rem; border-bottom: 1px solid var(--line); font-size: .71rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; opacity: .68; }
	td { padding: .9rem .8rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
	td:first-child { min-width: 250px; }
	td strong { display: block; max-width: 420px; font-weight: 500; }
	.file-path { display: block; overflow-wrap: anywhere; margin-top: .28rem; font-size: .74rem; opacity: .65; }
	.source-url { display: inline-block; margin-top: .35rem; font-size: .75rem; text-underline-offset: .2em; overflow-wrap: anywhere; }
	.status { display: inline-flex; min-height: 25px; align-items: center; padding: .2rem .45rem; border: 1px solid var(--line); border-radius: 2px; font-size: .7rem; font-weight: 600; }
	.status.published { text-decoration: underline; text-underline-offset: .2em; }
	.actions { white-space: nowrap; text-align: right; }
	.mobile-list { display: none; }
	.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.35rem; }
	.pagination span { min-width: 110px; font-size: .78rem; text-align: center; }
	.form-dialog { position: fixed; top: 50%; left: 50%; width: min(calc(100% - 2rem), 680px); max-height: min(92vh, 900px); overflow-y: auto; margin: 0; padding: clamp(1rem, 3vw, 1.6rem); transform: translate(-50%, -50%); border: 1px solid var(--line); background: Canvas; color: CanvasText; box-shadow: 0 16px 48px rgb(0 0 0 / .18); }
	.form-dialog::backdrop { background: rgb(0 0 0 / .48); }
	.form-heading { display: flex; align-items: start; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
	.form-heading h2 { margin: 0; font: 500 1.25rem/1.3 'Poppins', sans-serif; }
	.close-button { min-height: 40px; padding: .45rem .7rem; border: 1px solid var(--line); background: transparent; color: inherit; font: 500 .8rem/1 'Inter', sans-serif; cursor: pointer; }
	form { display: grid; gap: 1rem; }
	form label { display: grid; gap: .42rem; font-size: .8rem; font-weight: 500; }
	input, textarea, select { width: 100%; min-height: 43px; padding: .65rem .7rem; border: 1px solid var(--line); border-radius: 2px; background: Canvas; color: CanvasText; font: 400 .86rem/1.5 'Inter', sans-serif; }
	textarea { resize: vertical; }
	input[aria-invalid='true'], textarea[aria-invalid='true'], select[aria-invalid='true'] { border-color: CanvasText; }
	.hint, .field-error { font-size: .72rem; line-height: 1.45; font-weight: 400; }
	.hint { opacity: .68; }
	.field-error { font-weight: 600; }
	.form-actions { display: flex; justify-content: end; gap: .6rem; padding-top: .35rem; border-top: 1px solid var(--line); }
	@media (max-width: 680px) {
		.page-heading { align-items: start; flex-direction: column; gap: 1rem; }
		.page-heading > .button { width: 100%; }
		.desktop-list { display: none; }
		.mobile-list { display: grid; gap: .7rem; }
		.document-card { min-width: 0; padding: .9rem; border: 1px solid var(--line); }
		.document-card h2 { margin: .7rem 0 0; font: 500 .94rem/1.45 'Poppins', sans-serif; overflow-wrap: anywhere; }
		.card-top { display: flex; align-items: center; justify-content: space-between; gap: .6rem; font-size: .73rem; }
		.updated { margin: .55rem 0 0; font-size: .7rem; opacity: .65; }
		.card-actions { display: flex; gap: .65rem; margin-top: .55rem; padding-top: .4rem; border-top: 1px solid var(--line); }
		.pagination { gap: .5rem; }
		.pagination .button { padding-inline: .55rem; font-size: .74rem; }
		.pagination span { min-width: 78px; font-size: .72rem; }
		.form-dialog { top: auto; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 94vh; transform: none; border-right: 0; border-bottom: 0; border-left: 0; }
	}
	@media (prefers-reduced-motion: reduce) { .form-dialog { scroll-behavior: auto; } }
</style>
