document.addEventListener('DOMContentLoaded', () => {
	// Main elements used by the theme picker and easter button behavior.
	const themeTabs = document.querySelector('.theme-tabs');
	const openBtn = document.querySelector('.change-color');
	const closeBtn = document.querySelector('.close-themepicker');
	const themeSection = document.querySelector('.theme-section');
	const easterWrap = document.querySelector('.easter-button');
	const easterBtn = document.querySelector('#easter-button');

	// Stop early if any required element is missing to avoid runtime errors.
	if (!themeTabs || !openBtn || !closeBtn || !themeSection || !easterWrap || !easterBtn) {
		return;
	}

	// Tracks whether the easter button has already been dismissed permanently.
	let easterDismissed = false;
	// Stores the timeout id used to finish the hide animation.
	let easterHideTimeout;
	// Prevents multiple blackout overlays from being created.
	let blackoutStarted = false;

	const startBlackout = () => {
		if (blackoutStarted) return;

		blackoutStarted = true;
		const blackoutLayer = document.createElement('div');
		blackoutLayer.className = 'blackout-layer';
		blackoutLayer.setAttribute('aria-hidden', 'true');
		document.body.appendChild(blackoutLayer);
		document.body.classList.add('blackout-active');

		requestAnimationFrame(() => {
			blackoutLayer.classList.add('is-active');
		});
	};

	// Shows the easter button only when it has not been dismissed yet.
	const showEasterEgg = () => {
		// Once dismissed, it should never appear again in this page session.
		if (easterDismissed) return;

		// Cancel any pending hide to prevent animation/state conflicts.
		clearTimeout(easterHideTimeout);
		// Reset state classes before playing the reveal animation.
		easterWrap.classList.remove('is-hidden', 'is-visible');
		easterWrap.classList.add('is-ready');

		// Double RAF ensures class changes land in separate frames,
		// so CSS transitions trigger consistently.
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				easterWrap.classList.add('is-visible');
			});
		});
	};

	// Hides the easter button if the user interacts with the theme picker.
	const dismissEasterEggIfNotClicked = () => {
		// Do nothing if it was already dismissed before.
		if (easterDismissed) return;

		// Mark as dismissed so it cannot be shown again.
		easterDismissed = true;
		// Remove any pending timeout from previous hide attempts.
		clearTimeout(easterHideTimeout);
		// Start hide transition by removing visibility class.
		easterWrap.classList.remove('is-visible');
		easterWrap.classList.add('is-ready');

		// After transition time, move to fully hidden state.
		easterHideTimeout = setTimeout(() => {
			easterWrap.classList.remove('is-ready');
			easterWrap.classList.add('is-hidden');
		}, 450);
	};

	// Initial state: the easter button starts completely hidden.
	easterWrap.classList.add('is-hidden');

	// Clicking the easter button triggers a 3-second screen blackout.
	easterBtn.addEventListener('click', event => {
		event.preventDefault();
		dismissEasterEggIfNotClicked();
		startBlackout();
	});

	// Open button behavior:
	// - If picker is already open, reveal easter button.
	// - If picker is closed, treat interaction as dismissal path.
	openBtn.addEventListener('click', () => {
		if (themeTabs.classList.contains('open')) {
			showEasterEgg();
			return;
		}

		dismissEasterEggIfNotClicked();
	});

	// Closing the picker dismisses the easter button.
	closeBtn.addEventListener('click', () => {
		dismissEasterEggIfNotClicked();
	});

	// Selecting any theme option while picker is open also dismisses it.
	themeSection.addEventListener('click', event => {
		const themeOption = event.target.closest('.theme-option');

		// Ignore clicks outside theme options or when picker is closed.
		if (!themeOption || !themeTabs.classList.contains('open')) {
			return;
		}

		dismissEasterEggIfNotClicked();
	});
});
