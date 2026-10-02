<script>
	/** @type {{ label: string, message: string }} */
	let { label, message } = $props();
</script>

<div class="empty-state" role="status">
	<p class="empty-label">{label}</p>
	<p>{message}</p>
</div>

<style>
	.empty-state { padding: 1.2rem 0 2rem; border-top: 1px solid var(--line); }
	.empty-label { margin: 0 0 .55rem; font: 500 1.05rem/1.4 'Poppins', sans-serif; }
	.empty-state p:last-child { max-width: 560px; margin: 0; font: 400 .94rem/1.7 'Inter', sans-serif; opacity: .82; }
</style>
