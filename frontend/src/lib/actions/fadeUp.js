/**
 * Reveal an element once it enters the viewport.
 *
 * Usage: <section use:fadeUp>...</section>
 * Optional values can tune the reveal without changing the shared CSS:
 * use:fadeUp={{ distance: '24px', duration: 700, rootMargin: '0px 0px -4% 0px' }}
 *
 * @param {HTMLElement} node
 * @param {{ distance?: string, duration?: number, rootMargin?: string, threshold?: number }} [options]
 * @returns {{ update?: (nextOptions: { distance?: string, duration?: number, rootMargin?: string, threshold?: number }) => void, destroy: () => void }}
 */
export function fadeUp(node, options = {}) {
	/** @type {IntersectionObserver | undefined} */
	let observer;
	/** @type {MediaQueryList | undefined} */
	let motionQuery;
	/** @type {number | undefined} */
	let revealFrame;
	/** @type {number | undefined} */
	let revealFrameNext;
	let destroyed = false;
	let currentOptions = normalizeOptions(options);

	const clearState = () => {
		node.removeAttribute('data-fade-up');
		node.style.removeProperty('--fade-up-distance');
		node.style.removeProperty('--fade-up-duration');
	};

	const reveal = () => {
		revealFrameNext = undefined;
		if (!destroyed) node.dataset.fadeUp = 'visible';
	};

	const stopObserving = () => {
		observer?.disconnect();
		observer = undefined;
	};

	const queueReveal = () => {
		if (typeof window === 'undefined') return reveal();
		// Give the pending opacity/position state a paint before revealing it,
		// especially for elements already in the viewport during page startup.
		revealFrame = window.requestAnimationFrame(() => {
			revealFrame = undefined;
			if (destroyed) return;
			revealFrameNext = window.requestAnimationFrame(reveal);
		});
	};

	const cancelQueuedReveal = () => {
		if (typeof window === 'undefined') return;
		if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
		if (revealFrameNext !== undefined) window.cancelAnimationFrame(revealFrameNext);
		revealFrame = undefined;
		revealFrameNext = undefined;
	};

	/** @param {MediaQueryListEvent} event */
	const onMotionPreferenceChange = (event) => {
		if (event.matches) {
			stopObserving();
			cancelQueuedReveal();
			reveal();
		}
	};

	const start = () => {
		stopObserving();
		clearState();

		if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

		motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (motionQuery.matches) return;

		node.style.setProperty('--fade-up-distance', currentOptions.distance);
		node.style.setProperty('--fade-up-duration', `${currentOptions.duration}ms`);
		node.dataset.fadeUp = 'pending';

		try {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						stopObserving();
						queueReveal();
					}
				},
				{
					rootMargin: currentOptions.rootMargin,
					threshold: currentOptions.threshold
				}
			);
			observer.observe(node);
		} catch {
			// Fail open so content remains visible if observation cannot be initialized.
			stopObserving();
			clearState();
		}
	};

	if (typeof window !== 'undefined') {
		motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		motionQuery.addEventListener?.('change', onMotionPreferenceChange);
	}

	start();

	return {
		update(nextOptions = {}) {
			currentOptions = normalizeOptions(nextOptions);
			if (node.dataset.fadeUp !== 'visible') start();
		},
		destroy() {
			destroyed = true;
			stopObserving();
			cancelQueuedReveal();
			motionQuery?.removeEventListener?.('change', onMotionPreferenceChange);
			clearState();
		}
	};
}

/** @param {{ distance?: string, duration?: number, rootMargin?: string, threshold?: number }} options */
function normalizeOptions(options) {
	const distance = typeof options.distance === 'string' ? options.distance : '24px';
	const duration = typeof options.duration === 'number' && Number.isFinite(options.duration)
		? Math.max(0, options.duration)
		: 700;
	const threshold = typeof options.threshold === 'number' && Number.isFinite(options.threshold)
		? Math.min(1, Math.max(0, options.threshold))
		: 0.12;

	return {
		distance,
		duration,
		rootMargin: typeof options.rootMargin === 'string' ? options.rootMargin : '0px 0px -4% 0px',
		threshold
	};
}
