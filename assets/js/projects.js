
// --- Project Grid Management ---

// Main initialization: load and render projects
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    loadAndRenderProjects(grid);
});

// Fetch projects and render them in the grid
async function loadAndRenderProjects(grid) {
    try {
        const projects = await fetchProjects();
        const selectedProjects = getSelectedProjects(projects, grid);
        const viewMoreLink = grid.querySelector('.view-more');
        grid.innerHTML = '';
        selectedProjects.forEach(project => grid.appendChild(createProjectCard(project)));
        if (viewMoreLink) grid.appendChild(viewMoreLink);
    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p>Error loading projects.</p>';
    }
}

// Fetch projects.json and return the projects array
async function fetchProjects() {
    const response = await fetch('./assets/js/projects.json');
    if (!response.ok) throw new Error(`Failed to load projects.json: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.projects) ? data.projects : [];
}

// Decide which projects to show (random or all)
function getSelectedProjects(projects, grid) {
    const randomLimit = Number.parseInt(grid.dataset.randomLimit || '', 10);
    return Number.isInteger(randomLimit) && randomLimit > 0
        ? pickRandomProjects(projects, randomLimit)
        : projects;
}

// Create a project card element
function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'project-image';
    const image = document.createElement('img');
    image.src = project.image || '';
    image.alt = project.alt || project.name || 'Project image';
    image.loading = 'lazy';
    imageWrapper.appendChild(image);

    const content = document.createElement('div');
    content.className = 'project-content';
    const title = document.createElement('h3');
    title.className = 'project-name';
    title.textContent = project.name || 'Untitled project';
    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description || '';
    const actions = document.createElement('div');
    actions.className = 'project-buttons';

    if (project.repoUrl) {
        actions.appendChild(createActionButton({
            href: project.repoUrl,
            className: 'project-btn project-btn-repo',
            iconId: 'icon-github',
            label: 'Repository',
            ariaLabel: `View repository of ${project.name || ''}`.trim()
        }));
    }
    if (Array.isArray(project.repoLinks)) {
        project.repoLinks.filter(repo => repo && repo.url).forEach(repo => {
            actions.appendChild(createActionButton({
                href: repo.url,
                className: 'project-btn project-btn-repo',
                iconId: 'icon-github',
                label: repo.label || 'Repository',
                ariaLabel: `View ${repo.label || 'repository'} of ${project.name || ''}`.trim()
            }));
        });
    }
    if (project.projectUrl) {
        actions.appendChild(createActionButton({
            href: project.projectUrl,
            className: 'project-btn project-btn-project',
            iconId: 'icon-external-link',
            label: 'View project',
            ariaLabel: `View project ${project.name || ''}`.trim()
        }));
    }

    content.appendChild(title);
    content.appendChild(description);
    if (actions.childElementCount > 0) content.appendChild(actions);
    card.appendChild(imageWrapper);
    card.appendChild(content);
    return card;
}

// Shuffle and pick a limited number of projects
function pickRandomProjects(projects, limit) {
    const copy = [...projects];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(limit, copy.length));
}

// Create a button with icon for project actions
function createActionButton({ href, className, iconId, label, ariaLabel }) {
    const link = document.createElement('a');
    link.href = href;
    link.className = className;
    link.ariaLabel = ariaLabel;
    if (href.startsWith('http')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `./assets/svg/icons.svg#${iconId}`);
    icon.appendChild(use);
    link.appendChild(icon);
    link.append(document.createTextNode(label));
    return link;
}
