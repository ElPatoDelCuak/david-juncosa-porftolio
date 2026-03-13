document.addEventListener('DOMContentLoaded', () => {
	const themeTabs = document.querySelector('.theme-tabs');
	const openBtn = document.querySelector('.change-color');
	const closeBtn = document.querySelector('.close-themepicker');
	const themeSection = document.querySelector('.theme-section');
	const easterWrap = document.querySelector('.easter-button');

	if (!themeTabs || !openBtn || !closeBtn || !themeSection || !easterWrap) {
		return;
	}

	let easterDismissed = false;
	let easterHideTimeout;

	const showEasterEgg = () => {
		if (easterDismissed) return;

		clearTimeout(easterHideTimeout);
		easterWrap.classList.remove('is-hidden', 'is-visible');
		easterWrap.classList.add('is-ready');

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				easterWrap.classList.add('is-visible');
			});
		});
	};

	const dismissEasterEggIfNotClicked = () => {
		if (easterDismissed) return;

		easterDismissed = true;
		clearTimeout(easterHideTimeout);
		easterWrap.classList.remove('is-visible');
		easterWrap.classList.add('is-ready');

		easterHideTimeout = setTimeout(() => {
			easterWrap.classList.remove('is-ready');
			easterWrap.classList.add('is-hidden');
		}, 450);
	};

	easterWrap.classList.add('is-hidden');

	openBtn.addEventListener('click', () => {
		if (themeTabs.classList.contains('open')) {
			showEasterEgg();
			return;
		}

		dismissEasterEggIfNotClicked();
	});

	closeBtn.addEventListener('click', () => {
		dismissEasterEggIfNotClicked();
	});

	themeSection.addEventListener('click', event => {
		const themeOption = event.target.closest('.theme-option');

		if (!themeOption || !themeTabs.classList.contains('open')) {
			return;
		}

		dismissEasterEggIfNotClicked();
	});
});
