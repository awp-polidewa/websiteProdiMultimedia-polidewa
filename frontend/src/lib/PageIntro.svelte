<script>
	/** @type {{ section: string, title: string, description: string }} */
	let { section, title, description } = $props();
</script>

<header class="page-intro">
	<p class="eyebrow">{section}</p>
	<h1>{title}</h1>
	<p class="description">{description}</p>
</header>

<style>
	.page-intro { padding: clamp(5rem, 11vw, 9.5rem) 0 clamp(3rem, 7vw, 6rem); }
	.eyebrow { margin: 0 0 1.5rem; font: 500 .75rem/1.4 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; opacity: .75; }
	h1 { max-width: 1100px; margin: 0; font: 500 clamp(3rem, 8vw, 7rem)/.98 'Poppins', sans-serif; letter-spacing: -.065em; text-wrap: balance; }
	.description { max-width: 600px; margin: 1.5rem 0 0; font: 400 clamp(1rem, 1.4vw, 1.125rem)/1.7 'Inter', sans-serif; opacity: .85; }
	@media (max-width: 700px) { .page-intro { padding: 4.5rem 0 3rem; } h1 { font-size: clamp(2.8rem, 13vw, 5rem); } }
</style>
