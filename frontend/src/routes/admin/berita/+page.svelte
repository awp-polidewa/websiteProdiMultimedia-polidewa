<script>
	import { onMount } from 'svelte';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';

	/** @typedef {{ id: string, title: string, slug: string, excerpt: string | null, content?: string, thumbnailPath: string | null, status: 'draft' | 'published', publishedAt: string | null, createdAt: string, updatedAt: string }} NewsItem */
	/** @typedef {{ title: string, slug: string, excerpt: string, content: string, thumbnail_path: string, status: 'draft' | 'published' }} NewsForm */
	/** @returns {NewsForm} */
	const emptyForm = () => ({ title: '', slug: '', excerpt: '', content: '', thumbnail_path: '', status: 'draft' });

	/** @type {NewsItem[]} */
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
	let deletingId = $state(/** @type {string | null} */ (null));
	let dialogElement = $state(/** @type {HTMLDialogElement | undefined} */ (undefined));
	let requestVersion = 0;
	let heading = $derived(editingId ? 'Edit berita' : 'Tambah berita');

	onMount(() => { void loadNews(); });
	$effect(() => {
		if (formOpen && dialogElement && !dialogElement.open) dialogElement.showModal();
	});

	/** @param {number} requestedPage */
	async function loadNews(requestedPage = page) {
		const version = ++requestVersion;
		loading = true;
		listError = '';
		try {
			const result = await requestApi(`news?page=${requestedPage}`, {}, true);
			if (version !== requestVersion) return;
			items = Array.isArray(result?.data) ? result.data : [];
			page = Number(result?.meta?.page) || requestedPage;
			totalPages = Number(result?.meta?.totalPages) || 0;
			totalItems = Number(result?.meta?.totalItems) || 0;
		} catch (error) {
			if (version !== requestVersion) return;
			listError = error instanceof Error ? error.message : 'Daftar berita gagal dimuat.';
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

	/** @param {NewsItem} item */
	async function openEditForm(item) {
		formError = '';
		fieldErrors = {};
		try {
			const result = await requestApi(`news/${encodeURIComponent(item.id)}`, {}, true);
			const data = result?.data;
			if (!data) throw new Error('Detail berita tidak tersedia.');
			editingId = String(data.id);
			form = {
				title: data.title ?? '',
				slug: data.slug ?? '',
				excerpt: data.excerpt ?? '',
				content: data.content ?? '',
				thumbnail_path: data.thumbnailPath ?? '',
				status: data.status === 'published' ? 'published' : 'draft'
			};
			formOpen = true;
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Detail berita gagal dimuat.';
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
		fieldErrors = {};
		formError = '';
		const title = form.title.trim();
		const slug = form.slug.trim();
		const content = form.content.trim();
		if (!title) fieldErrors.title = 'Judul wajib diisi.';
		else if (title.length > 200) fieldErrors.title = 'Maksimal 200 karakter.';
		if (!slug) fieldErrors.slug = 'Slug wajib diisi.';
		else if (slug.length > 220 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fieldErrors.slug = 'Gunakan huruf kecil, angka, dan tanda hubung.';
		if (!content) fieldErrors.content = 'Isi berita wajib diisi.';
		if (form.excerpt.length > 500) fieldErrors.excerpt = 'Maksimal 500 karakter.';
		const thumbnailPath = form.thumbnail_path.trim();
		if (thumbnailPath && (thumbnailPath.length > 255 || thumbnailPath.startsWith('/') || thumbnailPath.includes('\\') || thumbnailPath.split('/').includes('..'))) {
			fieldErrors.thumbnail_path = 'Gunakan path relatif yang valid, maksimal 255 karakter.';
		}
		if (!['draft', 'published'].includes(form.status)) fieldErrors.status = 'Pilih draft atau published.';
		if (Object.keys(fieldErrors).length) return;

		saving = true;
		const body = {
			title,
			slug,
			excerpt: form.excerpt.trim() || null,
			content: form.content,
			thumbnail_path: thumbnailPath || null,
			status: form.status
		};
		try {
			await requestApi(editingId ? `news/${encodeURIComponent(editingId)}` : 'news', {
				method: editingId ? 'PUT' : 'POST',
				body: JSON.stringify(body)
			}, true);
			formOpen = false;
			if (!editingId) {
				page = 1;
				await loadNews(1);
			} else {
				await loadNews(page);
			}
		} catch (error) {
			if (error instanceof ApiError) {
				fieldErrors = error.errors;
				formError = error.message;
			} else {
				formError = error instanceof Error ? error.message : 'Berita gagal disimpan.';
			}
		} finally {
			saving = false;
		}
	}

	/** @param {NewsItem} item */
	async function deleteNews(item) {
		if (!window.confirm(`Hapus berita “${item.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
		deletingId = item.id;
		listError = '';
		try {
			await requestApi(`news/${encodeURIComponent(item.id)}`, { method: 'DELETE' }, true);
			const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
			page = nextPage;
			await loadNews(nextPage);
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Berita gagal dihapus.';
		} finally {
			deletingId = null;
		}
	}

	/** @param {string | null | undefined} value */
	function formatDate(value) {
		if (!value) return '—';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '—';
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' }).format(date);
	}
</script>

<svelte:head>
	<title>Berita — Admin TRM</title>
	<meta name="description" content="Kelola berita Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="news-page">
	<header class="page-heading">
		<div>
			<p class="eyebrow">Pengelolaan konten</p>
			<h1>Berita</h1>
			<p class="intro">Kelola judul, isi, dan status publikasi berita.</p>
		</div>
		<button class="button primary" type="button" onclick={openCreateForm}>Tambah berita</button>
	</header>

	{#if listError}<div class="notice error" role="alert"><span>{listError}</span><button class="text-button" type="button" onclick={() => loadNews(page)}>Coba lagi</button></div>{/if}

	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat berita…</p>
	{:else if !listError && items.length === 0}
		<section class="empty-state" aria-labelledby="empty-title">
			<p class="eyebrow">Belum ada konten</p>
			<h2 id="empty-title">Daftar berita masih kosong</h2>
			<p>Berita yang dibuat akan tampil di sini. Konten draft tidak ditampilkan pada halaman publik.</p>
			<button class="button" type="button" onclick={openCreateForm}>Tambah berita pertama</button>
		</section>
	{:else if !listError}
		<div class="list-meta"><p>{totalItems} berita</p><p>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</p></div>
		<div class="desktop-list">
			<table>
				<caption class="visually-hidden">Daftar berita yang dapat dikelola admin</caption>
				<thead><tr><th scope="col">Berita</th><th scope="col">Status</th><th scope="col">Diperbarui</th><th scope="col"><span class="visually-hidden">Aksi</span></th></tr></thead>
				<tbody>
					{#each items as item (item.id)}
						<tr>
							<td><strong>{item.title}</strong><span class="slug">/{item.slug}</span></td>
							<td><span class="status" class:published={item.status === 'published'}>{item.status === 'published' ? 'Published' : 'Draft'}</span></td>
							<td>{formatDate(item.updatedAt)}</td>
							<td class="actions"><button class="text-button" type="button" onclick={() => openEditForm(item)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === item.id} onclick={() => deleteNews(item)}>{deletingId === item.id ? 'Menghapus…' : 'Hapus'}</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mobile-list" aria-label="Daftar berita">
			{#each items as item (item.id)}
				<article class="news-card">
					<div class="card-top"><span class="status" class:published={item.status === 'published'}>{item.status === 'published' ? 'Published' : 'Draft'}</span><time datetime={item.updatedAt}>Diperbarui {formatDate(item.updatedAt)}</time></div>
					<h2>{item.title}</h2><p class="slug">/{item.slug}</p>
					<div class="card-actions"><button class="text-button" type="button" onclick={() => openEditForm(item)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === item.id} onclick={() => deleteNews(item)}>{deletingId === item.id ? 'Menghapus…' : 'Hapus'}</button></div>
				</article>
			{/each}
		</div>
		<nav class="pagination" aria-label="Pagination berita">
			<button class="button" type="button" disabled={page <= 1 || loading} onclick={() => loadNews(page - 1)}>Sebelumnya</button>
			<span>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</span>
			<button class="button" type="button" disabled={!totalPages || page >= totalPages || loading} onclick={() => loadNews(page + 1)}>Berikutnya</button>
		</nav>
	{/if}
</div>

{#if formOpen}
		<dialog bind:this={dialogElement} class="form-dialog" aria-modal="true" aria-labelledby="form-heading" onclick={(event) => { if (event.target === event.currentTarget) closeForm(); }} onclose={() => (formOpen = false)}>
			<header class="form-heading"><div><p class="eyebrow">Berita</p><h2 id="form-heading">{heading}</h2></div><button class="close-button" type="button" aria-label="Tutup formulir" onclick={closeForm} disabled={saving}>Tutup</button></header>
			{#if formError}<p class="notice error" role="alert">{formError}</p>{/if}
			<form onsubmit={submitForm} novalidate>
				<label>Judul <span aria-hidden="true">*</span><input bind:value={form.title} maxlength="200" required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'title-error' : undefined} />{#if fieldErrors.title}<small id="title-error" class="field-error">{fieldErrors.title}</small>{/if}</label>
				<label>Slug URL <span aria-hidden="true">*</span><input bind:value={form.slug} maxlength="220" autocomplete="off" required aria-invalid={Boolean(fieldErrors.slug)} aria-describedby={fieldErrors.slug ? 'slug-error' : undefined} /><small class="hint">Huruf kecil, angka, dan tanda hubung. Contoh: kegiatan-kampus</small>{#if fieldErrors.slug}<small id="slug-error" class="field-error">{fieldErrors.slug}</small>{/if}</label>
				<label>Ringkasan<textarea bind:value={form.excerpt} maxlength="500" rows="3" aria-invalid={Boolean(fieldErrors.excerpt)} aria-describedby={fieldErrors.excerpt ? 'excerpt-error' : undefined}></textarea><small class="hint">Opsional, maksimal 500 karakter.</small>{#if fieldErrors.excerpt}<small id="excerpt-error" class="field-error">{fieldErrors.excerpt}</small>{/if}</label>
				<label>Isi berita <span aria-hidden="true">*</span><textarea bind:value={form.content} rows="9" required aria-invalid={Boolean(fieldErrors.content)} aria-describedby={fieldErrors.content ? 'content-error' : undefined}></textarea>{#if fieldErrors.content}<small id="content-error" class="field-error">{fieldErrors.content}</small>{/if}</label>
				<label>Path thumbnail<input bind:value={form.thumbnail_path} maxlength="255" placeholder="media/berita/nama-file.jpg" aria-invalid={Boolean(fieldErrors.thumbnail_path)} aria-describedby={fieldErrors.thumbnail_path ? 'thumbnail-error' : 'thumbnail-hint'} /><small id="thumbnail-hint" class="hint">Opsional. Isi path relatif yang sudah tersedia; unggah gambar belum didukung.</small>{#if fieldErrors.thumbnail_path}<small id="thumbnail-error" class="field-error">{fieldErrors.thumbnail_path}</small>{/if}</label>
				<label>Status<select bind:value={form.status} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? 'status-error' : undefined}><option value="draft">Draft</option><option value="published">Published</option></select>{#if fieldErrors.status}<small id="status-error" class="field-error">{fieldErrors.status}</small>{/if}</label>
				<div class="form-actions"><button class="button" type="button" onclick={closeForm} disabled={saving}>Batal</button><button class="button primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan berita'}</button></div>
			</form>
		</dialog>
{/if}

<style>
	.news-page { width: min(100%, 1120px); margin: 0 auto; }
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
	td:first-child { min-width: 230px; }
	td strong { display: block; max-width: 500px; font-weight: 500; }
	.slug { display: block; overflow-wrap: anywhere; margin-top: .28rem; font-size: .74rem; opacity: .64; }
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
		.news-card { min-width: 0; padding: .9rem; border: 1px solid var(--line); }
		.news-card h2 { margin: .7rem 0 0; font: 500 .94rem/1.45 'Poppins', sans-serif; overflow-wrap: anywhere; }
		.card-top { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
		.card-top time { font-size: .7rem; opacity: .65; text-align: right; }
		.card-actions { display: flex; gap: .65rem; margin-top: .55rem; padding-top: .4rem; border-top: 1px solid var(--line); }
		.pagination { gap: .5rem; }
		.pagination .button { padding-inline: .55rem; font-size: .74rem; }
		.pagination span { min-width: 78px; font-size: .72rem; }
		.form-dialog { top: auto; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 94vh; transform: none; border-right: 0; border-bottom: 0; border-left: 0; }
	}
	@media (prefers-reduced-motion: reduce) { .form-dialog { scroll-behavior: auto; } }
</style>
