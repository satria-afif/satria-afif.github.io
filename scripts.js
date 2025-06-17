// Replace with your GitHub username here
const GITHUB_USERNAME = 'satria-afif';

// DOM Elements
const projectsContainer = document.getElementById('projects');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const mainElement = document.querySelector('main');
const yearSpan = document.getElementById('year');
const githubProfileLink = document.getElementById('github-profile-link');
const darkModeToggleBtn = document.getElementById('darkModeToggle');

// Utility: Create element with optional classes, text, html, attributes
function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([attr, val]) => el.setAttribute(attr, val));
  }
  return el;
}

// Format numbers with K/M suffix for star counts
function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

// Fetch all repos from GitHub, paginated
async function fetchRepos(username) {
  const perPage = 100;
  let page = 1;
  let results = [];
  let done = false;

  while (!done) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`
    );
    if (!res.ok) {
      const errorInfo = await res.json().catch(() => ({}));
      throw new Error(errorInfo.message || 'Failed to fetch repos');
    }
    const data = await res.json();
    results = results.concat(data);
    if (data.length < perPage) done = true;
    else page++;
  }
  return results;
}

// Create a project card DOM node from a repository
function renderProjectCard(repo) {
  const card = createElement('article', { className: 'project-card' });
  card.tabIndex = 0; // make focusable

  // Link preference: homepage or fallback to repo url
  const projectLink = repo.homepage && repo.homepage.trim() !== '' ? repo.homepage : repo.html_url;

  const titleLink = createElement('a', {
    className: 'project-title-link',
    text: repo.name,
    attrs: {
      href: projectLink,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `Open project ${repo.name} in new tab`,
    },
  });

  // External link icon
  const icon = createElement('span', { className: 'material-icons', text: 'open_in_new' });
  titleLink.appendChild(icon);

  const desc = createElement('p', {
    className: 'project-description',
    text: repo.description || 'No description provided.',
  });

  const meta = createElement('div', { className: 'project-meta' });

  // Stars
  const stars = createElement('div', { className: 'meta-item' });
  stars.innerHTML = '<span class="material-icons" aria-hidden="true">star</span> ';
  stars.appendChild(document.createTextNode(formatNumber(repo.stargazers_count)));

  // Language
  const lang = createElement('div', { className: 'meta-item', text: repo.language || 'Unknown' });
  const langIcon = createElement('span', { className: 'material-icons', text: 'code' });
  lang.prepend(langIcon);

  meta.appendChild(stars);
  meta.appendChild(lang);

  card.appendChild(titleLink);
  card.appendChild(desc);
  card.appendChild(meta);

  return card;
}

// Show loading state
function showLoading() {
  loadingDiv.style.display = 'block';
  errorDiv.hidden = true;
  retryBtn.style.display = 'none';
  projectsContainer.innerHTML = '';
  mainElement.setAttribute('aria-busy', 'true');
}

// Show error with optional retry button
function showError(msg) {
  loadingDiv.style.display = 'none';
  errorDiv.textContent = msg;
  errorDiv.hidden = false;
  retryBtn.style.display = 'inline-block';
  mainElement.setAttribute('aria-busy', 'false');
}

// Show projects container (hide loading/error)
function showProjects() {
  loadingDiv.style.display = 'none';
  errorDiv.hidden = true;
  retryBtn.style.display = 'none';
  mainElement.setAttribute('aria-busy', 'false');
}

// Initialize and load repositories
async function init() {
  showLoading();
  try {
    const repos = await fetchRepos(GITHUB_USERNAME);
    if (!repos.length) {
      loadingDiv.textContent = 'No repositories found.';
      return;
    }
    // Sort by last updated descending
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    showProjects();
    repos.forEach((repo) => {
      const card = renderProjectCard(repo);
      projectsContainer.appendChild(card);
    });
  } catch (err) {
    showError(`Error fetching repositories: ${err.message}`);
  }
}

// Retry handler
retryBtn.addEventListener('click', () => {
  init();
});

// Update footer year and profile link dynamically
yearSpan.textContent = new Date().getFullYear();
githubProfileLink.href = `https://github.com/${GITHUB_USERNAME}`;

// Dark mode toggle feature
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggleBtn.setAttribute('aria-pressed', 'true');
    darkModeToggleBtn.title = 'Switch to light mode';
    darkModeToggleBtn.querySelector('.material-icons').textContent = 'light_mode';
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggleBtn.setAttribute('aria-pressed', 'false');
    darkModeToggleBtn.title = 'Switch to dark mode';
    darkModeToggleBtn.querySelector('.material-icons').textContent = 'dark_mode';
  }
}

// Initialize dark mode based on localStorage or prefers-color-scheme
function initDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'enabled') {
    setDarkMode(true);
  } else if (saved === 'disabled') {
    setDarkMode(false);
  } else {
    // Respect system preference as default
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }
}

// Toggle dark mode button event listener
darkModeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-mode');
  setDarkMode(!isDark);
});

// Initialize page on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  init();
});