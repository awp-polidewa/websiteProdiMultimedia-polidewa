<script>
	import { onMount } from 'svelte';
	import { ApiError, requestApi } from '../../../lib/admin/api.js';
	import MediaUploadField from '../../../lib/admin/MediaUploadField.svelte';

	/** @typedef {{ id: string, name: string, title: string, concentration: string | null, photoPath: string | null, bio: string | null, email: string | null, displayOrder: number, createdAt: string, updatedAt: string }} Lecturer */
	/** @typedef {{ name: string, title: string, concentration: string, photo_path: string, bio: string, email: string, display_order: string }} LecturerForm */
	/** @returns {LecturerForm} */
	const emptyForm = () => ({ name: '', title: '', concentration: '', photo_path: '', bio: '', email: '', display_order: '0' });
	const concentrations = ['Web Design', 'Desain Grafis', 'Videografi'];

	/** @type {Lecturer[]} */
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
	let heading = $derived(editingId ? 'Edit dosen' : 'Tambah dosen');

	onMount(() => { void loadLecturers(); });
	$effect(() => {
		if (formOpen && dialogElement && !dialogElement.open) dialogElement.showModal();
	});

	/** @param {number} requestedPage */
	async function loadLecturers(requestedPage = page) {
		const version = ++requestVersion;
		loading = true;
		listError = '';
		try {
			const result = await requestApi(`lecturers?page=${requestedPage}`, {}, true);
			if (version !== requestVersion) return;
			items = Array.isArray(result?.data) ? result.data : [];
			page = Number(result?.meta?.page) || requestedPage;
			totalPages = Number(result?.meta?.totalPages) || 0;
			totalItems = Number(result?.meta?.totalItems) || 0;
		} catch (error) {
			if (version !== requestVersion) return;
			listError = error instanceof Error ? error.message : 'Daftar dosen gagal dimuat.';
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

	/** @param {Lecturer} lecturer */
	async function openEditForm(lecturer) {
		fieldErrors = {};
		formError = '';
		try {
			const result = await requestApi(`lecturers/${encodeURIComponent(lecturer.id)}`, {}, true);
			const data = result?.data;
			if (!data) throw new Error('Detail dosen tidak tersedia.');
			editingId = String(data.id);
			form = {
				name: data.name ?? '',
				title: data.title ?? '',
				concentration: data.concentration ?? '',
				photo_path: data.photoPath ?? '',
				bio: data.bio ?? '',
				email: data.email ?? '',
				display_order: String(data.displayOrder ?? 0)
			};
			formOpen = true;
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Detail dosen gagal dimuat.';
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
		const name = form.name.trim();
		const title = form.title.trim();
		const concentration = form.concentration;
		const photoPath = form.photo_path.trim();
		const email = form.email.trim();
		const displayOrderInput = form.display_order.trim();

		if (!name) fieldErrors.name = 'Nama wajib diisi.';
		else if (name.length > 150) fieldErrors.name = 'Maksimal 150 karakter.';
		if (!title) fieldErrors.title = 'Jabatan wajib diisi.';
		else if (title.length > 150) fieldErrors.title = 'Maksimal 150 karakter.';
		if (concentration && !concentrations.includes(concentration)) fieldErrors.concentration = 'Pilih konsentrasi yang tersedia.';
		if (photoPath && !isValidRelativePath(photoPath)) fieldErrors.photo_path = 'Gunakan path relatif yang valid, maksimal 255 karakter.';
		if (new TextEncoder().encode(form.bio.trim()).length > 65_535) fieldErrors.bio = 'Bio terlalu panjang.';
		if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) fieldErrors.email = 'Masukkan email valid, maksimal 150 karakter.';
		const displayOrder = Number(displayOrderInput);
		if (!displayOrderInput || !Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 4_294_967_295) {
			fieldErrors.display_order = 'Masukkan bilangan bulat 0 sampai 4294967295.';
		}
		if (Object.keys(fieldErrors).length) return;

		saving = true;
		const body = {
			name,
			title,
			concentration: concentration || null,
			photo_path: photoPath || null,
			bio: form.bio.trim() || null,
			email: email || null,
			display_order: displayOrder
		};
		try {
			await requestApi(editingId ? `lecturers/${encodeURIComponent(editingId)}` : 'lecturers', {
				method: editingId ? 'PUT' : 'POST',
				body: JSON.stringify(body)
			}, true);
			formOpen = false;
			if (!editingId) {
				page = 1;
				await loadLecturers(1);
			} else {
				await loadLecturers(page);
			}
		} catch (error) {
			if (error instanceof ApiError) {
				fieldErrors = error.errors;
				formError = error.message;
			} else {
				formError = error instanceof Error ? error.message : 'Data dosen gagal disimpan.';
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

	/** @param {Lecturer} lecturer */
	async function deleteLecturer(lecturer) {
		if (!window.confirm(`Hapus data dosen “${lecturer.name}”? Tindakan ini tidak dapat dibatalkan.`)) return;
		deletingId = lecturer.id;
		listError = '';
		try {
			await requestApi(`lecturers/${encodeURIComponent(lecturer.id)}`, { method: 'DELETE' }, true);
			const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
			page = nextPage;
			await loadLecturers(nextPage);
		} catch (error) {
			listError = error instanceof Error ? error.message : 'Data dosen gagal dihapus.';
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
	<title>Dosen — Admin TRM</title>
	<meta name="description" content="Kelola data dosen Program Studi Teknologi Rekayasa Multimedia." />
</svelte:head>

<div class="lecturers-page">
	<header class="page-heading">
		<div><p class="eyebrow">Pengelolaan konten</p><h1>Dosen</h1><p class="intro">Kelola informasi dosen dan urutannya pada halaman struktur.</p></div>
		<button class="button primary" type="button" onclick={openCreateForm}>Tambah dosen</button>
	</header>

	{#if listError}<div class="notice error" role="alert"><span>{listError}</span><button class="text-button" type="button" onclick={() => loadLecturers(page)}>Coba lagi</button></div>{/if}
	{#if loading}
		<p class="state" role="status" aria-live="polite">Memuat data dosen…</p>
	{:else if !listError && items.length === 0}
		<section class="empty-state" aria-labelledby="empty-title"><p class="eyebrow">Belum ada konten</p><h2 id="empty-title">Daftar dosen masih kosong</h2><p>Data dosen yang ditambahkan akan tampil di halaman struktur sesuai urutan yang ditetapkan.</p><button class="button" type="button" onclick={openCreateForm}>Tambah dosen pertama</button></section>
	{:else if !listError}
		<div class="list-meta"><p>{totalItems} dosen</p><p>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</p></div>
		<div class="desktop-list"><table><caption class="visually-hidden">Daftar dosen yang dapat dikelola admin</caption><thead><tr><th scope="col">Dosen</th><th scope="col">Konsentrasi</th><th scope="col">Email</th><th scope="col">Urutan</th><th scope="col">Diperbarui</th><th scope="col"><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>
			{#each items as lecturer (lecturer.id)}
				<tr><td><strong>{lecturer.name}</strong><span class="title">{lecturer.title}</span></td><td>{lecturer.concentration ?? '—'}</td><td>{lecturer.email ?? '—'}</td><td>{lecturer.displayOrder}</td><td>{formatDate(lecturer.updatedAt)}</td><td class="actions"><button class="text-button" type="button" onclick={() => openEditForm(lecturer)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === lecturer.id} onclick={() => deleteLecturer(lecturer)}>{deletingId === lecturer.id ? 'Menghapus…' : 'Hapus'}</button></td></tr>
			{/each}
		</tbody></table></div>
		<div class="mobile-list" aria-label="Daftar dosen">
			{#each items as lecturer (lecturer.id)}
				<article class="lecturer-card"><div class="card-top"><span>{lecturer.concentration ?? 'Tanpa konsentrasi'}</span><span>Urutan {lecturer.displayOrder}</span></div><h2>{lecturer.name}</h2><p class="title">{lecturer.title}</p>{#if lecturer.email}<a class="email" href={`mailto:${lecturer.email}`}>{lecturer.email}</a>{:else}<p class="email">Email belum diisi</p>{/if}<p class="updated">Diperbarui {formatDate(lecturer.updatedAt)}</p><div class="card-actions"><button class="text-button" type="button" onclick={() => openEditForm(lecturer)}>Edit</button><button class="text-button danger" type="button" disabled={deletingId === lecturer.id} onclick={() => deleteLecturer(lecturer)}>{deletingId === lecturer.id ? 'Menghapus…' : 'Hapus'}</button></div></article>
			{/each}
		</div>
		<nav class="pagination" aria-label="Pagination dosen"><button class="button" type="button" disabled={page <= 1 || loading} onclick={() => loadLecturers(page - 1)}>Sebelumnya</button><span>Halaman {page}{totalPages ? ` dari ${totalPages}` : ''}</span><button class="button" type="button" disabled={!totalPages || page >= totalPages || loading} onclick={() => loadLecturers(page + 1)}>Berikutnya</button></nav>
	{/if}
</div>

{#if formOpen}
	<dialog bind:this={dialogElement} class="form-dialog" aria-modal="true" aria-labelledby="form-heading" onclick={(event) => { if (event.target === event.currentTarget) closeForm(); }} onclose={() => (formOpen = false)}>
		<header class="form-heading"><div><p class="eyebrow">Data dosen</p><h2 id="form-heading">{heading}</h2></div><button class="close-button" type="button" aria-label="Tutup formulir" onclick={closeForm} disabled={saving}>Tutup</button></header>
		{#if formError}<p class="notice error" role="alert">{formError}</p>{/if}
		<form onsubmit={submitForm} novalidate>
			<label>Nama lengkap <span aria-hidden="true">*</span><input bind:value={form.name} maxlength="150" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : undefined} />{#if fieldErrors.name}<small id="name-error" class="field-error">{fieldErrors.name}</small>{/if}</label>
			<label>Jabatan/gelar <span aria-hidden="true">*</span><input bind:value={form.title} maxlength="150" required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'title-error' : undefined} />{#if fieldErrors.title}<small id="title-error" class="field-error">{fieldErrors.title}</small>{/if}</label>
			<label>Konsentrasi<select bind:value={form.concentration} aria-invalid={Boolean(fieldErrors.concentration)} aria-describedby={fieldErrors.concentration ? 'concentration-error' : 'concentration-hint'}><option value="">Tidak ada / Kaprodi</option>{#each concentrations as concentration (concentration)}<option value={concentration}>{concentration}</option>{/each}</select><small id="concentration-hint" class="hint">Opsional. Nilai mengikuti daftar konsentrasi resmi.</small>{#if fieldErrors.concentration}<small id="concentration-error" class="field-error">{fieldErrors.concentration}</small>{/if}</label>
			<label>Email<input bind:value={form.email} type="email" maxlength="150" autocomplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : 'email-hint'} /><small id="email-hint" class="hint">Opsional.</small>{#if fieldErrors.email}<small id="email-error" class="field-error">{fieldErrors.email}</small>{/if}</label>
			<label>Urutan tampil <span aria-hidden="true">*</span><input bind:value={form.display_order} type="number" min="0" max="4294967295" step="1" inputmode="numeric" required aria-invalid={Boolean(fieldErrors.display_order)} aria-describedby={fieldErrors.display_order ? 'order-error' : 'order-hint'} /><small id="order-hint" class="hint">Bilangan bulat 0–4294967295. Angka lebih kecil tampil lebih dahulu.</small>{#if fieldErrors.display_order}<small id="order-error" class="field-error">{fieldErrors.display_order}</small>{/if}</label>
			<MediaUploadField type="lecturers" label="Foto dosen" bind:path={form.photo_path} bind:busy={mediaUploading} />
			{#if fieldErrors.photo_path}<small id="photo-error" class="field-error">{fieldErrors.photo_path}</small>{/if}
			<label>Bio<textarea bind:value={form.bio} rows="5" aria-invalid={Boolean(fieldErrors.bio)} aria-describedby={fieldErrors.bio ? 'bio-error' : 'bio-hint'}></textarea><small id="bio-hint" class="hint">Opsional.</small>{#if fieldErrors.bio}<small id="bio-error" class="field-error">{fieldErrors.bio}</small>{/if}</label>
			<div class="form-actions"><button class="button" type="button" onclick={closeForm} disabled={saving || mediaUploading}>Batal</button><button class="button primary" type="submit" disabled={saving || mediaUploading}>{mediaUploading ? 'Mengunggah…' : saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan dosen'}</button></div>
		</form>
	</dialog>
{/if}

<style>
	.lecturers-page { width: min(100%, 1120px); margin: 0 auto; }
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
	td:first-child { min-width: 180px; }
	td strong { display: block; max-width: 320px; font-weight: 500; }
	.title { display: block; margin-top: .25rem; font-size: .76rem; opacity: .68; }
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
	@media (max-width: 760px) {
		.page-heading { align-items: start; flex-direction: column; gap: 1rem; }
		.page-heading > .button { width: 100%; }
		.desktop-list { display: none; }
		.mobile-list { display: grid; gap: .7rem; }
		.lecturer-card { min-width: 0; padding: .9rem; border: 1px solid var(--line); }
		.lecturer-card h2 { margin: .7rem 0 0; font: 500 .94rem/1.45 'Poppins', sans-serif; overflow-wrap: anywhere; }
		.card-top { display: flex; align-items: center; justify-content: space-between; gap: .6rem; font-size: .73rem; }
		.email { display: inline-block; margin-top: .35rem; font-size: .78rem; overflow-wrap: anywhere; }
		.updated { margin: .55rem 0 0; font-size: .7rem; opacity: .65; }
		.card-actions { display: flex; gap: .65rem; margin-top: .55rem; padding-top: .4rem; border-top: 1px solid var(--line); }
		.pagination { gap: .5rem; }
		.pagination .button { padding-inline: .55rem; font-size: .74rem; }
		.pagination span { min-width: 78px; font-size: .72rem; }
		.form-dialog { top: auto; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 94vh; transform: none; border-right: 0; border-bottom: 0; border-left: 0; }
	}
	@media (prefers-reduced-motion: reduce) { .form-dialog { scroll-behavior: auto; } }
</style>
