let THEMES = {};
const THEME_STORAGE_KEY = 'selectedTheme';

document.addEventListener('DOMContentLoaded', () => {
    const themeSection = document.querySelector('.theme-section');
    const themeTabs = document.querySelector('.theme-tabs');
    const openBtn = document.querySelector('.change-color');
    const closeBtn = document.querySelector('.close-themepicker');

    openBtn.addEventListener('click', () => themeTabs.classList.toggle('open'));

    closeBtn.addEventListener('click', () => themeTabs.classList.remove('open'));

    const navLinks = document.querySelectorAll('.nav-tabs a');

    // Normalize the page name from the URL path to match the href in nav links
    const normalizePage = path => {
        const cleanedPath = path.replace(/\/+$/, '');
        const parts = cleanedPath.split('/').filter(Boolean);
        return parts.length ? parts[parts.length - 1] : 'index.html';
    };

    const normalizeHash = hash => (hash === '#' ? '' : hash || '');

    const updateActiveNavLink = () => {
        if (!navLinks.length) {
            return;
        }

        const currentPage = normalizePage(window.location.pathname);
        const currentHash = normalizeHash(window.location.hash);
        let hasActiveLink = false;

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const targetUrl = new URL(href, window.location.href);
            const targetPage = normalizePage(targetUrl.pathname);
            const targetHash = normalizeHash(targetUrl.hash);

            const samePage = targetPage === currentPage;
            const isActive = samePage && (targetHash ? targetHash === currentHash : currentHash === '');

            link.classList.toggle('active', isActive);
            hasActiveLink = hasActiveLink || isActive;
        });

        if (!hasActiveLink) {
            navLinks[0].classList.add('active');
        }
    };

    updateActiveNavLink();
    window.addEventListener('hashchange', updateActiveNavLink);
    window.addEventListener('popstate', updateActiveNavLink);

    const ageTarget = document.querySelector('#current-age');
    if (ageTarget) {
        const birthdateRaw = ageTarget.getAttribute('data-birthdate');
        const birthdate = birthdateRaw ? new Date(`${birthdateRaw}T00:00:00`) : null;

        if (birthdate && !Number.isNaN(birthdate.getTime())) {
            const today = new Date();
            let age = today.getFullYear() - birthdate.getFullYear();
            const hasHadBirthdayThisYear =
                today.getMonth() > birthdate.getMonth()
                || (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());

            if (!hasHadBirthdayThisYear) {
                age -= 1;
            }

            ageTarget.textContent = String(age);
        }
    }

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

                    // Persist selected theme across pages/reloads
                    try {
                        localStorage.setItem(THEME_STORAGE_KEY, themeKey);
                    } catch (error) {
                        console.warn('Could not persist selected theme:', error);
                    }

                });
                
                button.appendChild(nameSpan);
                button.appendChild(paletteSpan);
                themeSection.appendChild(button);
            });

            // Restore saved theme, fallback to classic theme
            let initialTheme = 'classic-theme';

            try {
                const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && THEMES[savedTheme]) {
                    initialTheme = savedTheme;
                }
            } catch (error) {
                console.warn('Could not read persisted theme:', error);
            }

            const initialThemeButton = document.querySelector(`[data-theme="${initialTheme}"]`)
                || document.querySelector('[data-theme="classic-theme"]');

            if (initialThemeButton) {
                initialThemeButton.click();
            }
        })
        .catch(error => console.error('Error loading themes:', error));
});