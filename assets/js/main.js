// --- Theme Management ---
let THEMES = {};
const THEME_STORAGE_KEY = 'selectedTheme';

// Toggle theme picker visibility
function setupThemePicker() {
    const themeTabs = document.querySelector('.theme-tabs');
    const openBtn = document.querySelector('.change-color');
    const closeBtn = document.querySelector('.close-themepicker');
    openBtn.addEventListener('click', () => themeTabs.classList.toggle('open'));
    closeBtn.addEventListener('click', () => themeTabs.classList.remove('open'));
}

// Navigation highlighting
function setupNavHighlighting() {
    const navLinks = document.querySelectorAll('.nav-tabs a');
    function normalizePage(path) {
        const cleanedPath = path.replace(/\/+$|\/+(?=\?)/, '');
        const parts = cleanedPath.split('/').filter(Boolean);
        return parts.length ? parts[parts.length - 1] : 'index.html';
    }
    function normalizeHash(hash) { return (hash === '#' ? '' : hash || ''); }
    function updateActiveNavLink() {
        if (!navLinks.length) return;
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
        if (!hasActiveLink) navLinks[0].classList.add('active');
    }
    updateActiveNavLink();
    window.addEventListener('hashchange', updateActiveNavLink);
    window.addEventListener('popstate', updateActiveNavLink);
}

// Calculate and display age if #current-age exists
function updateAge() {
    const ageTarget = document.querySelector('#current-age');
    if (!ageTarget) return;
    const birthdateRaw = ageTarget.getAttribute('data-birthdate');
    const birthdate = birthdateRaw ? new Date(`${birthdateRaw}T00:00:00`) : null;
    if (birthdate && !Number.isNaN(birthdate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const hasHadBirthdayThisYear =
            today.getMonth() > birthdate.getMonth() ||
            (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());
        if (!hasHadBirthdayThisYear) age -= 1;
        ageTarget.textContent = String(age);
    }
}

// Create theme picker buttons and handle theme switching
function setupThemes(themeSection, themes) {
    Object.entries(themes).forEach(([themeKey, theme]) => {
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
        Object.values(theme.colors['principal-colors']).forEach(colorValue => {
            const colorSpan = document.createElement('span');
            colorSpan.className = 'color';
            colorSpan.style.backgroundColor = colorValue;
            paletteSpan.appendChild(colorSpan);
        });
        button.addEventListener('click', () => applyTheme(themeKey, theme, pickerOpts, button));
        button.appendChild(nameSpan);
        button.appendChild(paletteSpan);
        themeSection.appendChild(button);
    });
}

// Apply a theme's colors, fonts, and cursor
function applyTheme(themeKey, theme, pickerOpts, button) {
    const root = document.documentElement;
    Object.values(theme.colors).forEach(colorGroup => {
        Object.entries(colorGroup).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    });
    if (theme.fonts && theme.fonts['title-font']) {
        root.style.setProperty('--font-title', `'${theme.fonts['title-font']}'`);
    } else {
        root.style.removeProperty('--font-title');
    }
    if (theme.cursor && theme.cursor['personalized-cursor']) {
        root.style.setProperty('--cursor-body', theme.cursor['personalized-cursor']);
        root.style.setProperty('--cursor-interactive', theme.cursor['interactive-cursor'] || theme.cursor['personalized-cursor']);
    } else {
        root.style.removeProperty('--cursor-body');
        root.style.removeProperty('--cursor-interactive');
    }
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.style.border = 'none';
        btn.classList.remove('active');
    });
    button.style.border = `2px solid ${pickerOpts['theme-picker-active-border']}`;
    button.classList.add('active');
    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeKey);
    } catch (error) {
        console.warn('Could not persist selected theme:', error);
    }
}

// Load themes from JSON and initialize theme picker
function loadThemes() {
    const themeSection = document.querySelector('.theme-section');
    fetch('./assets/js/themes.json')
        .then(response => response.json())
        .then(data => {
            THEMES = data.themes;
            setupThemes(themeSection, THEMES);
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
            const initialThemeButton = document.querySelector(`[data-theme="${initialTheme}"]`) || document.querySelector('[data-theme="classic-theme"]');
            if (initialThemeButton) initialThemeButton.click();
        })
        .catch(error => console.error('Error loading themes:', error));
}

// Hamburger menu for mobile nav
function setupHamburger() {
    const header = document.querySelector('header');
    const navTabs = document.querySelector('.nav-tabs');

    if (!header || !navTabs) return;

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Abrir menú');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    // Insertar antes del botón de tema
    const changeColor = header.querySelector('.change-color');
    header.insertBefore(hamburger, changeColor);

    function toggleMenu() {
        const isOpen = navTabs.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Cerrar al hacer click en un enlace
    navTabs.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navTabs.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            navTabs.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// --- Main initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupThemePicker();
    setupNavHighlighting();
    updateAge();
    loadThemes();
    setupHamburger();
});