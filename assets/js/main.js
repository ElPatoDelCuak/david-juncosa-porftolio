let THEMES = {};

document.addEventListener('DOMContentLoaded', () => {
    const themeSection = document.querySelector('.theme-section');
    const themeTabs = document.querySelector('.theme-tabs');
    const openBtn = document.querySelector('.change-color');
    const closeBtn = document.querySelector('.close-themepicker');
    const easterBtn = document.getElementById('easter-button');

    openBtn.addEventListener('click', () => themeTabs.classList.toggle('open'));
    closeBtn.addEventListener('click', () => themeTabs.classList.remove('open'));

    // Highlight active nav link on click
    const navLinks = document.querySelectorAll('.nav-tabs a');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Set the first nav link as active by default
    if (navLinks.length) navLinks[0].classList.add('active');

    //Load themes from JSON file
    fetch('./assets/js/themes.json')
        .then(response => response.json())
        .then(data => {
            THEMES = data.themes;

            // For each theme, create a button in the theme picker
            Object.entries(THEMES).forEach(([themeKey, theme]) => {
                const button = document.createElement('button');
                button.className = 'theme-option';
                button.dataset.theme = themeKey;

                const pickerOpts = theme['theme-picker-options'];
                button.style.backgroundColor = pickerOpts['theme-picker-bg'];
                button.style.color = pickerOpts['theme-picker-text'];

                const nameSpan = document.createElement('span');
                nameSpan.className = 'theme-name';
                nameSpan.textContent = theme.title;

                const paletteSpan = document.createElement('span');
                paletteSpan.className = 'theme_palette';

                // Show the principal colors as small balls in the button
                Object.values(theme.colors['principal-colors']).forEach(colorValue => {
                    const colorSpan = document.createElement('span');
                    colorSpan.className = 'color';
                    colorSpan.style.backgroundColor = colorValue;
                    paletteSpan.appendChild(colorSpan);
                });

                // When the button is clicked, apply the theme colors in colors.css
                button.addEventListener('click', () => {
                    const root = document.documentElement;
                    Object.values(theme.colors).forEach(colorGroup => {
                        Object.entries(colorGroup).forEach(([key, value]) => {
                            root.style.setProperty(`--color-${key}`, value);
                        });
                    });

                    // Apply theme fonts
                    if (theme.fonts && theme.fonts['title-font']) {
                        root.style.setProperty('--font-title', `'${theme.fonts['title-font']}'`);
                    } else {
                        root.style.removeProperty('--font-title');
                    }

                    // Apply theme cursor
                    if (theme.cursor && theme.cursor['personalized-cursor']) {
                        root.style.setProperty('--cursor-body', theme.cursor['personalized-cursor']);
                        root.style.setProperty(
                            '--cursor-interactive',
                            theme.cursor['interactive-cursor'] || theme.cursor['personalized-cursor']
                        );
                    } else {
                        root.style.removeProperty('--cursor-body');
                        root.style.removeProperty('--cursor-interactive');
                    }

                    // Highlight the active theme
                    document.querySelectorAll('.theme-option').forEach(btn => {
                        btn.style.border = 'none';
                        btn.classList.remove('active');
                    });
                    button.style.border = `2px solid ${pickerOpts['theme-picker-active-border']}`;
                    button.classList.add('active');
                });
                
                button.appendChild(nameSpan);
                button.appendChild(paletteSpan);
                themeSection.appendChild(button);
            });

            document.querySelector('[data-theme="classic-theme"]').click();
        })
        .catch(error => console.error('Error loading themes:', error));
});