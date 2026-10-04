<script>
	import { tick } from 'svelte';
	import { requestApi } from './admin/api.js';

	/** @typedef {{ documentId?: string, chunkId?: string, pageNumber?: number | null, similarity?: number, documentTitle?: string, originalFilename?: string }} ChatSource */
	/** @typedef {{ id: number, role: 'user' | 'assistant', text: string, hasEvidence?: boolean, sources?: ChatSource[] }} ChatMessage */
	/** @typedef {'idle' | 'loading' | 'success' | 'error' | 'empty'} ChatState */
	/** @typedef {{ answer?: unknown, hasEvidence?: unknown, sources?: unknown }} ChatAnswer */

	let open = $state(false);
	let question = $state('');
	/** @type {ChatState} */
	let chatState = $state('idle');
	let errorMessage = $state('');
	/** @type {ChatMessage[]} */
	let messages = $state([]);
	let nextMessageId = 0;
	/** @type {HTMLInputElement | undefined} */
	let questionInput = $state();
	/** @type {HTMLDivElement | undefined} */
	let messageList = $state();
	/** @type {HTMLButtonElement | undefined} */
	let launcherButton = $state();

	async function toggleChat() {
		open = !open;
		await tick();
		if (open) questionInput?.focus();
		else launcherButton?.focus();
	}

	/** @param {KeyboardEvent} event */
	function handlePanelKeydown(event) {
		if (event.key === 'Escape' && open) {
			open = false;
			launcherButton?.focus();
		}
	}

	/** @param {'user' | 'assistant'} role @param {string} text @param {boolean} [hasEvidence] @param {ChatSource[]} [sources] */
	function addMessage(role, text, hasEvidence, sources = []) {
		messages = [...messages, {
			id: ++nextMessageId,
			role,
			text,
			...(typeof hasEvidence === 'boolean' ? { hasEvidence } : {}),
			sources
		}];
		void tick().then(() => messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'auto' }));
	}

	/** @param {SubmitEvent} event */
	async function submitQuestion(event) {
		event.preventDefault();
		const submittedQuestion = question.trim();
		if (!submittedQuestion) {
			chatState = 'empty';
			errorMessage = '';
			questionInput?.focus();
			return;
		}
		if (chatState === 'loading') return;

		chatState = 'loading';
		errorMessage = '';
		addMessage('user', submittedQuestion);
		question = '';
		try {
			const payload = /** @type {ChatAnswer} */ (await requestApi('chatbot/ask', {
				method: 'POST',
				body: JSON.stringify({ question: submittedQuestion })
			}));
			if (typeof payload?.answer !== 'string' || typeof payload.hasEvidence !== 'boolean' || !Array.isArray(payload.sources)) {
				throw new Error('Invalid chatbot response');
			}
			const sources = payload.sources.filter((source) => source && typeof source === 'object');
			addMessage('assistant', payload.answer, payload.hasEvidence, sources);
			chatState = 'success';
		} catch {
			chatState = 'error';
			errorMessage = 'Jawaban belum dapat dimuat. Periksa koneksi lalu coba lagi.';
		}
	}

	function handleInput() {
		if (chatState === 'empty' && question.trim()) chatState = 'idle';
		if (chatState === 'error') {
			chatState = 'idle';
			errorMessage = '';
		}
	}
</script>

<svelte:window onkeydown={handlePanelKeydown} />

<div class="chatbot" class:chat-open={open}>
	{#if open}
		<section id="chatbot-panel" class="chat-panel" aria-labelledby="chat-title" aria-describedby="chat-description">
			<header class="chat-header">
				<div>
					<p class="eyebrow">Informasi prodi</p>
					<h2 id="chat-title">Tanya TRM</h2>
					<p id="chat-description">Jawaban bersumber dari dokumen yang tersedia.</p>
				</div>
				<button class="close-button" type="button" aria-label="Tutup Tanya TRM" onclick={toggleChat}>×</button>
			</header>

			<div class="chat-content">
				{#if messages.length === 0}
					<p class="chat-empty">Ajukan pertanyaan tentang Program Studi Teknologi Rekayasa Multimedia.</p>
				{/if}
				<div class="message-list" bind:this={messageList} aria-live="polite" aria-relevant="additions text" aria-label="Percakapan dengan Tanya TRM">
					{#each messages as message (message.id)}
						<article class="message" class:user-message={message.role === 'user'} class:assistant-message={message.role === 'assistant'}>
							<p>{message.text}</p>
							{#if message.role === 'assistant' && message.sources?.length}
								<ul class="source-list" aria-label="Sumber jawaban">
									{#each message.sources as source}
										<li>
											<span>{source.documentTitle || source.originalFilename || 'Dokumen sumber'}</span>
											{#if source.pageNumber}<span> · halaman {source.pageNumber}</span>{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</article>
					{/each}
				</div>
				{#if chatState === 'loading'}
					<p class="loading-note" role="status"><span class="loading-mark" aria-hidden="true"></span> Mencari jawaban dari dokumen…</p>
				{/if}
				{#if chatState === 'empty'}
					<p class="form-message" role="status">Tulis pertanyaan sebelum mengirim.</p>
				{:else if chatState === 'error'}
					<p class="form-message" role="alert">{errorMessage}</p>
				{/if}
			</div>

			<form class="chat-form" onsubmit={submitQuestion}>
				<label for="chat-question">Pertanyaan</label>
				<div class="input-row">
					<input
						id="chat-question"
						bind:this={questionInput}
						bind:value={question}
						oninput={handleInput}
						maxlength="2000"
						aria-invalid={chatState === 'empty'}
						aria-describedby={chatState === 'empty' ? 'chat-input-error' : undefined}
						placeholder="Tulis pertanyaan…"
						autocomplete="off"
						disabled={chatState === 'loading'}
					/>
					<button class="send-button" type="submit" disabled={chatState === 'loading'}>
						{chatState === 'loading' ? 'Mengirim…' : 'Kirim'}
					</button>
				</div>
				{#if chatState === 'empty'}<span id="chat-input-error" class="visually-hidden">Tulis pertanyaan sebelum mengirim.</span>{/if}
			</form>
		</section>
	{/if}

	<button
		class="chat-launcher"
		bind:this={launcherButton}
		type="button"
		aria-expanded={open}
		aria-controls={open ? 'chatbot-panel' : undefined}
		aria-label={open ? 'Tutup Tanya TRM' : 'Buka Tanya TRM'}
		onclick={toggleChat}
	>
		<span aria-hidden="true">{open ? '×' : 'Tanya TRM'}</span>
	</button>
</div>

<style>
	.chatbot { position: fixed; z-index: 30; right: max(var(--page-gutter), env(safe-area-inset-right)); bottom: max(1.25rem, env(safe-area-inset-bottom)); font-family: 'Inter', sans-serif; }
	.chat-launcher, .close-button, .send-button { color: Canvas; background: CanvasText; border: 1px solid CanvasText; cursor: pointer; font: 500 .84rem/1.2 'Inter', sans-serif; }
	.chat-launcher { min-height: 48px; padding: .75rem 1.1rem; border-radius: 999px; box-shadow: 0 3px 16px color-mix(in srgb, CanvasText 16%, transparent); }
	.chat-launcher:focus-visible, .close-button:focus-visible, .send-button:focus-visible, input:focus-visible { outline: 3px solid Highlight; outline-offset: 3px; }
	.chat-panel { position: absolute; right: 0; bottom: calc(100% + .75rem); display: flex; flex-direction: column; width: min(390px, calc(100vw - 2 * var(--page-gutter))); height: min(560px, calc(100dvh - 7rem)); min-height: 320px; overflow: hidden; background: Canvas; color: CanvasText; border: 1px solid var(--line); box-shadow: 0 14px 48px color-mix(in srgb, CanvasText 18%, transparent); }
	.chat-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.15rem .95rem; border-bottom: 1px solid var(--line); }
	.chat-header .eyebrow { margin: 0 0 .35rem; opacity: .62; }
	.chat-header h2 { margin: 0; font: 500 1.15rem/1.3 'Poppins', sans-serif; letter-spacing: -.025em; }
	.chat-header #chat-description { margin: .3rem 0 0; font-size: .76rem; line-height: 1.5; opacity: .72; }
	.close-button { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 auto; font-size: 1.4rem; border-radius: 50%; }
	.chat-content { display: flex; flex: 1; flex-direction: column; min-height: 0; padding: 1rem; }
	.chat-empty { margin: auto 0; padding: 0 1rem; text-align: center; font-size: .88rem; line-height: 1.65; opacity: .68; }
	.message-list { display: flex; flex: 1; flex-direction: column; align-items: stretch; gap: .85rem; overflow: auto; overscroll-behavior: contain; }
	.message { max-width: 92%; padding: .8rem .9rem; border: 1px solid var(--line); }
	.message p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .86rem; line-height: 1.65; }
	.user-message { align-self: flex-end; background: color-mix(in srgb, CanvasText 7%, Canvas); }
	.assistant-message { align-self: flex-start; }
	.source-list { margin: .7rem 0 0; padding: .55rem 0 0; border-top: 1px solid var(--line); list-style: none; font-size: .7rem; line-height: 1.5; opacity: .72; }
	.loading-note { display: flex; align-items: center; gap: .55rem; margin: .75rem 0 0; font-size: .75rem; opacity: .75; }
	.loading-mark { width: .65rem; height: .65rem; border: 1px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: loading-spin .75s linear infinite; }
	.form-message { margin: .5rem 0 0; color: CanvasText; font-size: .75rem; line-height: 1.45; font-weight: 500; }
	.chat-form { padding: .85rem 1rem 1rem; border-top: 1px solid var(--line); }
	.chat-form label { display: block; margin-bottom: .4rem; font-size: .74rem; font-weight: 500; }
	.input-row { display: flex; align-items: stretch; gap: .5rem; }
	.input-row input { width: 100%; min-width: 0; min-height: 46px; padding: .7rem .75rem; color: CanvasText; background: Canvas; border: 1px solid color-mix(in srgb, CanvasText 36%, transparent); border-radius: 0; font: 400 .85rem/1.4 'Inter', sans-serif; }
	.input-row input::placeholder { color: color-mix(in srgb, CanvasText 55%, transparent); }
	.input-row input[aria-invalid='true'] { border: 2px solid CanvasText; }
	.send-button { min-width: 74px; padding: .65rem .8rem; }
	.send-button:disabled { cursor: progress; opacity: .58; }
	@keyframes loading-spin { to { transform: rotate(360deg); } }
	@media (max-width: 600px) {
		.chatbot { right: max(.75rem, env(safe-area-inset-right)); bottom: max(.75rem, env(safe-area-inset-bottom)); }
		.chat-panel { position: fixed; right: 0; bottom: 0; left: 0; width: auto; height: min(560px, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))); min-height: min(300px, calc(100dvh - 2rem)); border-right: 0; border-bottom: 0; box-shadow: 0 0 24px color-mix(in srgb, CanvasText 13%, transparent); }
		.chat-header { padding-top: max(1rem, env(safe-area-inset-top)); }
		.chat-content { padding: .85rem; }
		.chat-form { padding-bottom: max(.85rem, env(safe-area-inset-bottom)); }
	}
	@media (prefers-reduced-motion: reduce) { .loading-mark { animation: none; } }
</style>
