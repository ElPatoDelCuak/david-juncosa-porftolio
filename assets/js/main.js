const THEMES = {
    "classic-theme": {
        "primary": "#FFFFFF",
        "secondary": "#000000",
        "accent": "#E03436",
        "contrast": "#333333",
        "tertiary": "#648381"
    },
    "democratic-galaxy": {
        "primary": "#ffb400",
        "secondary": "#ba6d00",
        "background": "#222323",
        "tertiary": "#686868",
        "contrast": "#0092a6"
    },
    "cyberpunk-theme": {
        "primary": "#000000",
        "secondary": "#c5003c",
        "accent": "#880425",
        "contrast": "#f3e600",
        "tertiary": "#55ead4"
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const themeSection = document.querySelector('.theme-section');
    const themeTabs = document.querySelector('.theme-tabs');
    const openBtn = document.querySelector('.change-color');
    const closeBtn = document.querySelector('.close-themepicker');

    openBtn.addEventListener('click', () => themeTabs.classList.toggle('open'));
    closeBtn.addEventListener('click', () => themeTabs.classList.remove('open'));

    Object.entries(THEMES).forEach(([themeKey, colors]) => {
        const button = document.createElement('button');
        button.className = 'theme-option';
        button.dataset.theme = themeKey;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'theme-name';
        nameSpan.textContent = themeKey
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        const paletteSpan = document.createElement('span');
        paletteSpan.className = 'theme_palette';

        Object.values(colors).forEach(colorValue => {
            const colorSpan = document.createElement('span');
            colorSpan.className = 'color';
            colorSpan.style.backgroundColor = colorValue;
            paletteSpan.appendChild(colorSpan);
        });

        button.appendChild(nameSpan);
        button.appendChild(paletteSpan);
        themeSection.appendChild(button);
    });
});