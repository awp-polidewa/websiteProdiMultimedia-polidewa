<footer class="site-footer">
	<div class="footer-brand">
		<a class="wordmark" href="/">TRM<span> / POLITEKNIK DEWANTARA</span></a>
		<p>Pusat informasi, publikasi, dan karya Program Studi Teknologi Rekayasa Multimedia.</p>
	</div>
	<nav class="footer-links" aria-label="Jelajahi">
		<p class="eyebrow">Jelajahi</p>
		<ul><li><a href="/profil">Profil</a></li><li><a href="/struktur">Struktur dosen</a></li><li><a href="/konsentrasi">Konsentrasi multimedia</a></li><li><a href="/berita">Berita</a></li></ul>
	</nav>
	<nav class="footer-links" aria-label="Publikasi">
		<p class="eyebrow">Publikasi</p>
		<ul><li><a href="/karya">Karya mahasiswa</a></li><li><a href="/akreditasi">Akreditasi</a></li></ul>
	</nav>
</footer>
<div class="footer-bottom"><span>© Politeknik Dewantara</span><span>Program Studi Teknologi Rekayasa Multimedia</span></div>

<style>
	.wordmark { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .7rem; font: 600 1rem/1 'Inter', sans-serif; letter-spacing: .06em; text-decoration: none; white-space: nowrap; }
	.wordmark span { font: 500 .82rem/1.2 'Inter', sans-serif; letter-spacing: .06em; }
	.site-footer { display: grid; grid-template-columns: minmax(240px, 2fr) 1fr 1fr; gap: 3rem; padding: 3.5rem 0; border-top: 1px solid var(--line); }
	.footer-brand p { max-width: 350px; margin: 1.1rem 0 0; font: 400 .88rem/1.7 'Inter', sans-serif; opacity: .78; }
	.footer-links { display: flex; flex-direction: column; align-items: start; gap: .4rem; }
	.footer-links .eyebrow { margin: 0; opacity: .62; }
	.footer-links ul { align-items: start; flex-direction: column; gap: 0; }
	.footer-links a { display: inline-flex; align-items: center; min-height: 44px; font: 400 .86rem/1.45 'Inter', sans-serif; text-decoration: none; text-underline-offset: .4em; opacity: .82; transition: opacity var(--motion-fast) var(--ease-out); }
	.footer-links a:hover, .footer-links a:focus-visible { text-decoration: underline; text-underline-offset: .3em; }
	.footer-bottom { display: flex; justify-content: space-between; gap: 1rem; padding: 1.1rem 0 1.5rem; border-top: 1px solid var(--line); font: 400 .72rem/1.5 'Inter', sans-serif; opacity: .7; }
	@media (max-width: 780px) {
		.site-footer { grid-template-columns: 1fr 1fr; gap: 2rem 1rem; padding: 2.5rem 0; }
		.footer-brand { grid-column: 1 / -1; }
	}
	@media (max-width: 420px) { .footer-bottom { flex-direction: column; gap: .25rem; } }
</style>
