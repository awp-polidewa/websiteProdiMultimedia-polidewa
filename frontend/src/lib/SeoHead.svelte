<script>
	import { page } from '$app/state';
	import institutionLogo from './assets/politeknik-dewantara.png';

	let { title, description, canonicalPath = page.url.pathname, noindex = false } = $props();
	let canonicalUrl = $derived(new URL(canonicalPath, page.url.origin).href);
	let socialImageUrl = $derived(new URL(institutionLogo, page.url.origin).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:site_name" content="TRM Politeknik Dewantara" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={socialImageUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={socialImageUrl} />
</svelte:head>
