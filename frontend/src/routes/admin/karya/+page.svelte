<script>
	import { onMount, tick } from 'svelte';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';
	import MediaUploadField from '../../../lib/admin/MediaUploadField.svelte';

	/** @typedef {{ id: string, title: string, slug: string, description: string | null, thumbnailPath: string, category: string, studentName: string | null, projectYear: number | null, externalUrl: string | null, createdAt: string, updatedAt: string }} Project */
	/** @typedef {{ title: string, slug: string, description: string, thumbnail_path: string, category: string, student_name: string, project_year: string | number, external_url: string }} ProjectForm */
	/** @returns {ProjectForm} */
	const emptyForm = () => ({ title: '', slug: '', description: '', thumbnail_path: '', category: '', student_name: '', project_year: '', external_url: '' });
	const categories = [
		{ value: 'desain', label: 'Desain' },
		{ value: 'coding', label: 'Coding' },
		{ value: '3d', label: '3D' },
		{ value: 'multimedia', label: 'Multimedia' },
		{ value: 'lainnya', label: 'Lainnya' }
	];

	/** @type {Project[]} */
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
	let heading = $derived(editingId ? 'Edit karya' : 'Tambah karya');

	onMount(() => { void loadProjects(); });
	$effect(() => {
		if (formOpen && dialogElement && !dialogElement.open) dialogElement.showModal();
	});

	/** @param {number} requestedPage */
	async function loadProjects(requestedPage = page) {
		const version = ++requestVersion;
		loading = true;
		listError = '';
		try {
			const result = await requestApi(`projects?page=${requestedPage}`, {}, true);
			if (version !== requestVersion) return;
			items = Array.isArray(result?.data) ? result.data : [];
			page = Number(result?.meta?.page) || requestedPage;
			totalPages = Number(result?.meta?.totalPages) || 0;
			totalItems = Number(result?.meta?.totalItems) || 0;
		} catch (error) {
			if (version !== requestVersion) return;
			listError = error instanceof Error ? error.message : 'Daftar karya gagal dimuat.';
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

	/** @param {Project} project */
	async function openEditForm(project) {
		fieldErrors = {};
		formError = '';
		try {
			const result = await requestApi(`projects/${encodeURIComponent(project.id)}`, {}, true);
			const data = result?.data;
			if (!data) throw new Error('Detail karya tidak tersedia.');
			editingId = String(data.id);
			form = {
				title: data.title ?? '',
				slug: data.slug ?? '',
				description: data.description ?? '',
				thumbnail_path: data.thumbnailPath ?? '',
				category: data.category ?? '',
				student_name: data.studentName ?? '',
				project_year: data.projectYear === null || data.projectYear === undefined ? '' : String(data.projectYear),
				external_url: data.externalUrl ?? ''
			};
			formOpen = true;
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Detail karya gagal dimuat.';
		}
	}

	function closeForm() {
		if (saving) return;
		if (dialogElement?.open) dialogElement.close();
		else formOpen = false;
	}

	async function revealFormError() {
		await tick();
		const errorElement = dialogElement?.querySelector('[aria-invalid="true"], .field-error, .notice.error');
		if (!(errorElement instanceof HTMLElement)) return;

		const fieldElement = errorElement.closest('label, .upload-field') || errorElement;
		fieldElement.scrollIntoView({
			block: 'center',
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
		});
		if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLSelectElement || errorElement instanceof HTMLTextAreaElement) {
			errorElement.focus({ preventScroll: true });
		}
	}

	/** @param {SubmitEvent} event */
	async function submitForm(event) {
		event.preventDefault();
		if (mediaUploading) {
			formError = 'Tunggu sampai upload thumbnail selesai sebelum menyimpan.';
			await revealFormError();
			return;
		}
		fieldErrors = {};
		formError = '';
		const title = form.title.trim();
		const slug = form.slug.trim();
		const thumbnailPath = form.thumbnail_path.trim();
		const studentName = form.student_name.trim();
		const externalUrl = form.external_url.trim();
		const yearValue = String(form.project_year ?? '').trim();

		if (!title) fieldErrors.title = 'Judul wajib diisi.';
		else if (title.length > 200) fieldErrors.title = 'Maksimal 200 karakter.';
		if (!slug) fieldErrors.slug = 'Slug wajib diisi.';
		else if (slug.length > 220 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fieldErrors.slug = 'Gunakan huruf kecil, angka, dan tanda hubung.';
		if (!thumbnailPath) fieldErrors.thumbnail_path = 'Path thumbnail wajib diisi.';
		else if (!isValidRelativePath(thumbnailPath)) fieldErrors.thumbnail_path = 'Gunakan path relatif yang valid, maksimal 255 karakter.';
		if (!categories.some((item) => item.value === form.category)) fieldErrors.category = 'Pilih kategori yang tersedia.';
		if (studentName.length > 150) fieldErrors.student_name = 'Maksimal 150 karakter.';
		let projectYear = null;
		if (yearValue) {
			projectYear = Number(yearValue);
			if (!Number.isInteger(projectYear) || projectYear < 0 || projectYear > 65535) fieldErrors.project_year = 'Masukkan bilangan bulat 0 sampai 65535.';
		}
		if (externalUrl) {
			if (externalUrl.length > 500) fieldErrors.external_url = 'Maksimal 500 karakter.';
			else {
				try {
					const url = new URL(externalUrl);
					if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) fieldErrors.external_url = 'Gunakan URL HTTP atau HTTPS yang valid.';
				} catch {
					fieldErrors.external_url = 'Gunakan URL HTTP atau HTTPS yang valid.';
				}
			}
		}
		if (Object.keys(fieldErrors).length) {
			await revealFormError();
			return;
		}

		saving = true;
		const body = {
			title,
			slug,
			description: form.description.trim() || null,
			thumbnail_path: thumbnailPath,
			category: form.category,
			student_name: studentName || null,
			project_year: projectYear,
			external_url: externalUrl || null
		};
		try {
			await requestApi(editingId ? `projects/${encodeURIComponent(editingId)}` : 'projects', {
				method: editingId ? 'PUT' : 'POST',
				body: JSON.stringify(body)
			}, true);
			formOpen = false;
			if (!editingId) {
				page = 1;
				await loadProjects(1);
			} else {
				await loadProjects(page);
			}
		} catch (error) {
			if (error instanceof ApiError && error.status === 409) {
				fieldErrors = { slug: 'Slug ini sudah digunakan oleh karya lain. Gunakan slug yang unik, misalnya dengan menambahkan nama mahasiswa.' };
				formError = '';
			} else if (error instanceof ApiError) {
				fieldErrors = error.errors;
				formError = error.message;
			} else {
				formError = error instanceof Error ? error.message : 'Karya gagal disimpan.';
			}
			await revealFormError();
		} finally {
			saving = false;
		}
	}

	/** @param {string} path */
	function isValidRelativePath(path) {
		return path.length <= 255 && !path.startsWith('/') && !path.includes('\\') &&
			!path.split('/').includes('..') && !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path);
	}

	/** @param {Project} project */
	async function deleteProject(project) {
		if (!window.confirm(`Hapus karya “${project.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
		deletingId = project.id;
		listError = '';
		try {
			await requestApi(`projects/${encodeURIComponent(project.id)}`, { method: 'DELETE' }, true);
			const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
			page = nextPage;
			await loadProjects(nextPage);
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Karya gagal dihapus.';
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

	/** @param {string} value */
	function categoryLabel(value) {
		return categories.find((category) => category.value === value)?.label ?? value;
	}
</script>

<svelte:head>
	<title>Karya mahasiswa — Admin TRM</title>
	<meta name="description" content="Kelola karya mahasiswa Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="projects-page">
	<header class="page-heading">
		<div><p class="eyebrow">Pengelolaan konten</p><h1>Karya mahasiswa</h1><p class="intro">Kelola karya, kategori, dan informasi pendukung showcase.</p></div>
		<button class="button primary" type="button" onclick={openCreateForm}>Tambah karya</button>
	</header>

	{#if listError}<div class="notice error" role="alert"><span>{listError}</span><button class="text-button" type="button" onclick={() => loadProjects(page)}>Coba lagi</button></div>{/if}
	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat karya…</p>
	{:else if !listError && items.length === 0}
		<section class="empty-state" aria-labelledby="empty-title"><p class="eyebrow">Belum ada konten</p><h2 id="empty-title">Daftar karya masih kosong</h2><p>Karya yang dibuat akan tampil di sini dan dapat dilihat pada halaman publik.</p><button class="button" type="button" onclick={openCreateForm}>Tambah karya pertama</button></section>
	{:else if !listError}
		<div class="list-meta"><p>{totalItems} karya</p><p>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</p></div>
		<div class="desktop-list"><table><caption class="visually-hidden">Daftar karya mahasiswa yang dapat dikelola admin</caption><thead><tr><th scope="col">Karya</th><th scope="col">Kategori</th><th scope="col">Tahun</th><th scope="col">Diperbarui</th><th scope="col"><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>
			{#each items as project (project.id)}
				<tr><td><strong>{project.title}</strong><span class="slug">/{project.slug}</span>{#if project.studentName}<span class="student">{project.studentName}</span>{/if}</td><td><span class="category">{categoryLabel(project.category)}</span></td><td>{project.projectYear ?? '—'}</td><td>{formatDate(project.updatedAt)}</td><td class="actions"><button class="text-button" type="button" onclick={() => openEditForm(project)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === project.id} onclick={() => deleteProject(project)}>{deletingId === project.id ? 'Menghapus…' : 'Hapus'}</button></td></tr>
			{/each}
		</tbody></table></div>
		<div class="mobile-list" aria-label="Daftar karya mahasiswa">
			{#each items as project (project.id)}
				<article class="project-card"><div class="card-top"><span class="category">{categoryLabel(project.category)}</span><span>{project.projectYear ?? 'Tahun belum diisi'}</span></div><h2>{project.title}</h2><p class="slug">/{project.slug}</p>{#if project.studentName}<p class="student">{project.studentName}</p>{/if}<p class="updated">Diperbarui {formatDate(project.updatedAt)}</p><div class="card-actions"><button class="text-button" type="button" onclick={() => openEditForm(project)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === project.id} onclick={() => deleteProject(project)}>{deletingId === project.id ? 'Menghapus…' : 'Hapus'}</button></div></article>
			{/each}
		</div>
		<nav class="pagination" aria-label="Pagination karya"><button class="button" type="button" disabled={page <= 1 || loading} onclick={() => loadProjects(page - 1)}>Sebelumnya</button><span>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</span><button class="button" type="button" disabled={!totalPages || page >= totalPages || loading} onclick={() => loadProjects(page + 1)}>Berikutnya</button></nav>
	{/if}
</div>

{#if formOpen}
	<dialog bind:this={dialogElement} class="form-dialog" aria-modal="true" aria-labelledby="form-heading" onclick={(event) => { if (event.target === event.currentTarget) closeForm(); }} onclose={() => (formOpen = false)}>
		<header class="form-heading"><div><p class="eyebrow">Karya mahasiswa</p><h2 id="form-heading">{heading}</h2></div><button class="close-button" type="button" aria-label="Tutup formulir" onclick={closeForm} disabled={saving}>Tutup</button></header>
		{#if formError}<p class="notice error" role="alert">{formError}</p>{/if}
		<form onsubmit={submitForm} novalidate>
			<label>Judul <span aria-hidden="true">*</span><input bind:value={form.title} maxlength="200" required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'title-error' : undefined} />{#if fieldErrors.title}<small id="title-error" class="field-error">{fieldErrors.title}</small>{/if}</label>
			<label>Slug URL <span aria-hidden="true">*</span><input bind:value={form.slug} maxlength="220" autocomplete="off" required aria-invalid={Boolean(fieldErrors.slug)} aria-describedby={fieldErrors.slug ? 'slug-error' : undefined} /><small class="hint">Huruf kecil, angka, dan tanda hubung.</small>{#if fieldErrors.slug}<small id="slug-error" class="field-error">{fieldErrors.slug}</small>{/if}</label>
			<label>Kategori <span aria-hidden="true">*</span><select bind:value={form.category} required aria-invalid={Boolean(fieldErrors.category)} aria-describedby={fieldErrors.category ? 'category-error' : undefined}><option value="">Pilih kategori</option>{#each categories as category (category.value)}<option value={category.value}>{category.label}</option>{/each}</select>{#if fieldErrors.category}<small id="category-error" class="field-error">{fieldErrors.category}</small>{/if}</label>
			<label>Deskripsi<textarea bind:value={form.description} rows="5" aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? 'description-error' : undefined}></textarea><small class="hint">Opsional.</small>{#if fieldErrors.description}<small id="description-error" class="field-error">{fieldErrors.description}</small>{/if}</label>
			<MediaUploadField type="projects" label="Thumbnail karya" required bind:path={form.thumbnail_path} bind:busy={mediaUploading} />
			{#if fieldErrors.thumbnail_path}<small id="thumbnail-error" class="field-error">{fieldErrors.thumbnail_path}</small>{/if}
			<label>Nama mahasiswa<input bind:value={form.student_name} maxlength="150" aria-invalid={Boolean(fieldErrors.student_name)} aria-describedby={fieldErrors.student_name ? 'student-error' : undefined} />{#if fieldErrors.student_name}<small id="student-error" class="field-error">{fieldErrors.student_name}</small>{/if}</label>
			<label>Tahun karya<input bind:value={form.project_year} type="number" min="0" max="65535" step="1" inputmode="numeric" aria-invalid={Boolean(fieldErrors.project_year)} aria-describedby={fieldErrors.project_year ? 'year-error' : 'year-hint'} /><small id="year-hint" class="hint">Opsional, bilangan bulat 0–65535.</small>{#if fieldErrors.project_year}<small id="year-error" class="field-error">{fieldErrors.project_year}</small>{/if}</label>
			<label>URL eksternal<input bind:value={form.external_url} type="url" maxlength="500" placeholder="https://contoh.id/karya" aria-invalid={Boolean(fieldErrors.external_url)} aria-describedby={fieldErrors.external_url ? 'url-error' : 'url-hint'} /><small id="url-hint" class="hint">Opsional. Hanya URL HTTP atau HTTPS.</small>{#if fieldErrors.external_url}<small id="url-error" class="field-error">{fieldErrors.external_url}</small>{/if}</label>
			<div class="form-actions"><button class="button" type="button" onclick={closeForm} disabled={saving || mediaUploading}>Batal</button><button class="button primary" type="submit" disabled={saving} aria-busy={saving || mediaUploading}>{mediaUploading ? 'Tunggu upload selesai' : saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan karya'}</button></div>
		</form>
	</dialog>
{/if}

<style>
	.projects-page { width: min(100%, 1120px); margin: 0 auto; }
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
	td strong { display: block; max-width: 420px; font-weight: 500; }
	.slug { display: block; overflow-wrap: anywhere; margin-top: .28rem; font-size: .74rem; opacity: .64; }
	.student { display: block; margin-top: .3rem; font-size: .76rem; opacity: .7; }
	.category { display: inline-flex; min-height: 25px; align-items: center; padding: .2rem .45rem; border: 1px solid var(--line); border-radius: 2px; font-size: .7rem; font-weight: 600; }
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
		.project-card { min-width: 0; padding: .9rem; border: 1px solid var(--line); }
		.project-card h2 { margin: .7rem 0 0; font: 500 .94rem/1.45 'Poppins', sans-serif; overflow-wrap: anywhere; }
		.card-top { display: flex; align-items: center; justify-content: space-between; gap: .6rem; font-size: .73rem; }
		.updated { margin: .65rem 0 0; font-size: .7rem; opacity: .65; }
		.card-actions { display: flex; gap: .65rem; margin-top: .55rem; padding-top: .4rem; border-top: 1px solid var(--line); }
		.pagination { gap: .5rem; }
		.pagination .button { padding-inline: .55rem; font-size: .74rem; }
		.pagination span { min-width: 78px; font-size: .72rem; }
		.form-dialog { top: auto; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 94vh; transform: none; border-right: 0; border-bottom: 0; border-left: 0; }
	}
	@media (prefers-reduced-motion: reduce) { .form-dialog { scroll-behavior: auto; } }
</style>
