<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ApiError, requestApi } from '../../lib/admin/api.js';

	let { children } = $props();
	let checking = $state(true);
	/** @type {{ id: string, name: string, nidn: string, username: string } | null} */
	let admin = $state(null);
	let sessionError = $state('');
	let menuOpen = $state(false);
	let loggingOut = $state(false);
	let logoutError = $state('');
	let requestNumber = 0;
	let isLoginRoute = $derived(page.url.pathname === '/admin/login');
	let currentPath = $derived(page.url.pathname);

	const navigation = [
		{ href: '/admin', label: 'Dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z' },
		{ href: '/admin/berita', label: 'Berita', icon: 'M5 3h10l4 4v14H5z M15 3v5h4 M8 12h8 M8 16h8' },
		{ href: '/admin/karya', label: 'Karya', icon: 'M4 7l8-4 8 4-8 4z M4 12l8 4 8-4 M4 17l8 4 8-4' },
		{ href: '/admin/dosen', label: 'Dosen', icon: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M21 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
		{ href: '/admin/akreditasi', label: 'Akreditasi', icon: 'M6 3h9l4 4v14H6z M15 3v5h4 M9 12h7 M9 16h7' },
		{ href: '/admin/rag', label: 'Dokumen RAG', icon: 'M6 3h9l4 4v14H6z M15 3v5h4 M9 12h7 M9 16h7' }
	];

	$effect(() => {
		const path = currentPath;
		void verifySession(path);
	});

	/** @param {string} path */
	async function verifySession(path) {
		const currentRequest = ++requestNumber;
		checking = true;
		sessionError = '';
		menuOpen = false;
		try {
			const result = await requestApi('session', {}, true);
			if (currentRequest !== requestNumber) return;
			admin = result?.data?.admin ?? null;
			checking = false;
			if (admin && path === '/admin/login') await goto('/admin', { replaceState: true });
		} catch (error) {
			if (currentRequest !== requestNumber) return;
			admin = null;
			checking = false;
			if (error instanceof ApiError && error.status === 401) {
				if (path !== '/admin/login') await goto('/admin/login', { replaceState: true });
			} else {
				sessionError = 'Sesi admin belum dapat diverifikasi. Periksa koneksi lalu coba lagi.';
			}
		}
	}

	async function logout() {
		if (loggingOut) return;
		loggingOut = true;
		logoutError = '';
		try {
			await requestApi('logout', { method: 'POST' }, true);
			admin = null;
			await goto('/admin/login', { replaceState: true });
		} catch {
			logoutError = 'Logout gagal. Periksa koneksi lalu coba lagi.';
		} finally {
			loggingOut = false;
		}
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if checking}
	<div class="session-check" role="status" aria-live="polite">Memeriksa sesi admin…</div>
{:else if isLoginRoute}
	{#if sessionError}<p class="session-notice" role="status">{sessionError}</p>{/if}
	{@render children()}
{:else if sessionError}
	<main class="session-failure" aria-labelledby="session-error-title">
		<h1 id="session-error-title">Dashboard belum dapat dibuka</h1>
		<p role="alert">{sessionError}</p>
		<button class="button button-primary" onclick={() => verifySession(currentPath)}>Coba lagi</button>
	</main>
{:else if admin}
	<div class="admin-app">
		<header class="admin-topbar">
			<a class="admin-brand" href="/admin" aria-label="TRM Admin, dashboard">TRM <span>ADMIN</span></a>
			<p class="admin-identity">{admin.name}</p>
			<button
				class="menu-toggle"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="admin-navigation"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{menuOpen ? 'Tutup menu' : 'Menu'}
			</button>
		</header>
		<div class="admin-frame">
			<aside id="admin-navigation" class:open={menuOpen} class="admin-sidebar" aria-label="Navigasi admin">
				<p class="sidebar-label">Ruang kerja</p>
				<nav aria-label="Menu admin">
					<ul>
						{#each navigation as item (item.href)}
							<li>
								<a
									href={item.href}
									aria-current={currentPath === item.href ? 'page' : undefined}
									onclick={() => (menuOpen = false)}
								><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d={item.icon} /></svg>{item.label}</a
								>
							</li>
						{/each}
					</ul>
				</nav>
				<div class="sidebar-bottom">
					{#if logoutError}<p class="inline-error" role="alert">{logoutError}</p>{/if}
					<button class="logout-button" type="button" onclick={logout} disabled={loggingOut}>
						<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5 M15 12H3 M21 3v18" /></svg>
						{loggingOut ? 'Sedang logout…' : 'Logout'}
					</button>
				</div>
			</aside>
			<main class="admin-main" id="admin-main" tabindex="-1">
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<style>
	.session-check, .session-failure { width: min(calc(100% - 2rem), 520px); margin: 12vh auto; }
	.session-check { font: 400 .9rem/1.6 'Inter', sans-serif; }
	.session-failure h1 { margin: 0 0 .8rem; font: 500 1.6rem/1.2 'Poppins', sans-serif; }
	.session-failure p { margin: 0 0 1.2rem; line-height: 1.6; }
	.session-notice { width: min(calc(100% - 2rem), 520px); margin: 2rem auto 0; font-size: .9rem; }
	.admin-app { min-height: 100vh; font: 400 .9rem/1.5 'Inter', sans-serif; }
	.admin-topbar { min-height: 68px; display: flex; align-items: center; gap: 1rem; padding: .7rem clamp(1rem, 3vw, 2rem); border-bottom: 1px solid var(--line); }
	.admin-brand { display: inline-flex; align-items: baseline; gap: .55rem; font: 600 1.05rem/1 'Poppins', sans-serif; letter-spacing: -.04em; text-decoration: none; }
	.admin-brand span { font: 600 .62rem/1 'Inter', sans-serif; letter-spacing: .1em; }
	.admin-identity { margin: 0 0 0 auto; font-size: .82rem; opacity: .75; }
	.admin-frame { min-height: calc(100vh - 69px); display: grid; grid-template-columns: 238px minmax(0, 1fr); }
	.admin-sidebar { display: flex; flex-direction: column; padding: 1.5rem 1rem; border-right: 1px solid var(--line); }
	.sidebar-label { margin: 0 0 .75rem .75rem; font-size: .68rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .62; }
	.admin-sidebar ul { display: grid; gap: .2rem; margin: 0; padding: 0; list-style: none; }
	.admin-sidebar nav a, .logout-button { width: 100%; min-height: 44px; display: flex; align-items: center; padding: .65rem .75rem; border: 0; border-radius: 3px; background: transparent; color: inherit; font: 500 .88rem/1.3 'Inter', sans-serif; text-align: left; text-decoration: none; cursor: pointer; }
	.admin-sidebar nav svg, .logout-button svg { width: 17px; height: 17px; flex: 0 0 17px; margin-right: .7rem; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
	.admin-sidebar nav a:hover, .admin-sidebar nav a:focus-visible, .admin-sidebar nav a[aria-current='page'] { background: color-mix(in srgb, CanvasText 7%, Canvas); text-decoration: none; }
	.sidebar-bottom { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--line); }
	.logout-button { border: 1px solid var(--line); }
	.logout-button:hover, .logout-button:focus-visible { text-decoration: underline; text-underline-offset: .25em; }
	.logout-button:disabled { cursor: wait; opacity: .65; }
	.admin-main { min-width: 0; padding: clamp(1.25rem, 3vw, 2.5rem); }
	.admin-main:focus { outline: none; }
	.menu-toggle { display: none; min-height: 42px; padding: .5rem .75rem; border: 1px solid var(--line); border-radius: 3px; background: transparent; color: inherit; font: 500 .85rem/1 'Inter', sans-serif; }
	.button { min-height: 44px; padding: .65rem 1rem; border: 1px solid currentColor; border-radius: 3px; font: 500 .88rem/1.2 'Inter', sans-serif; cursor: pointer; }
	.button-primary { background: CanvasText; color: Canvas; }
	.inline-error { margin: 0 0 .75rem; font-size: .8rem; }
	@media (max-width: 720px) {
		.admin-frame { display: block; min-height: calc(100vh - 65px); }
		.admin-topbar { min-height: 64px; }
		.admin-sidebar { display: none; padding: .5rem 1rem 1rem; border-right: 0; border-bottom: 1px solid var(--line); }
		.admin-sidebar.open { display: flex; }
		.admin-sidebar ul { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .25rem; }
		.admin-sidebar nav a { min-height: 46px; }
		.sidebar-bottom { margin-top: 1rem; padding-top: .75rem; }
		.admin-main { padding: 1.25rem 1rem 2rem; }
		.menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
	}
	@media (max-width: 420px) {
		.admin-identity { max-width: 38vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
		.admin-sidebar ul { grid-template-columns: 1fr 1fr; }
	}
</style>
