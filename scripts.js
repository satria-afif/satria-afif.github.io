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

// Modal elements
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const modalLanguage = document.getElementById('modalLanguage');
const modalStars = document.getElementById('modalStars');
const modalUpdated = document.getElementById('modalUpdated');
const modalCreated = document.getElementById('modalCreated');
const modalRepoLink = document.getElementById('modalRepoLink');
const modalCloseBtns = modal ? modal.querySelectorAll('[data-close-modal]') : [];

// Ensure modal elements exist
if (!modal) {
  console.error('Modal element not found');
}

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

// Format ISO date string to a readable date
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(dateStr).toLocaleDateString(undefined, options);
  } catch {
    return dateStr;
  }
}

// Generate placeholder screenshot URL with descriptive alt
function getScreenshotUrl(repoName) {
  const baseUrl = 'https://placehold.co/400x240/059669/ffffff/png';
  const text = encodeURIComponent(`${repoName} Screenshot`);
  return `${baseUrl}?text=${text}`;
}

// Open modal and fill details
function openProjectModal(repo) {
  lastFocusedElement = document.activeElement;

  modalTitle.textContent = repo.name;
  modalImage.src = getScreenshotUrl(repo.name);
  modalImage.alt = `Screenshot preview of the project ${repo.name}`;
  modalDescription.textContent = repo.description || 'No detailed description provided.';
  modalLanguage.textContent = repo.language || 'Unknown';
  modalStars.textContent = formatNumber(repo.stargazers_count);
  modalUpdated.textContent = formatDate(repo.updated_at);
  modalUpdated.setAttribute('datetime', repo.updated_at);
  modalCreated.textContent = formatDate(repo.created_at);
  modalCreated.setAttribute('datetime', repo.created_at);
  modalRepoLink.href = repo.html_url;

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  trapFocus(modal);
  document.body.style.overflow = 'hidden';
}

// Close modal and restore focus
function closeProjectModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Trap keyboard focus inside the modal
function trapFocus(element) {
  const focusableElementsSelector =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
    '[tabindex="0"], [contenteditable]';
  const focusableElements = element.querySelectorAll(focusableElementsSelector);
  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function (e) {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
    if (!isTabPressed) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  // Set initial focus
  firstFocusable.focus();
}

// Event listeners for modal close buttons and overlay
if (modalCloseBtns.length > 0) {
  modalCloseBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeProjectModal();
    });
  });
}

// Close modal on Escape key press
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    e.preventDefault();
    closeProjectModal();
  }
});

// Close modal if clicking outside content area (overlay)
if (modal) {
  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    closeProjectModal();
  });
}

// Override project card rendering to open modal instead of link
function renderProjectCard(repo) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.tabIndex = 0; // make focusable

  // Card content container (simulates link area)
  const cardContent = document.createElement('div');
  cardContent.className = 'card-content';
  cardContent.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.className = 'project-title-link';
  title.textContent = repo.name;

  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = 'open_in_new';
  title.appendChild(icon);

  const desc = document.createElement('p');
  desc.className = 'project-description';
  desc.textContent = repo.description || 'No description provided.';

  const meta = document.createElement('div');
  meta.className = 'project-meta';

  // Stars
  const stars = document.createElement('div');
  stars.className = 'meta-item';
  stars.innerHTML = '<span class="material-icons" aria-hidden="true">star</span> ';
  stars.appendChild(document.createTextNode(formatNumber(repo.stargazers_count)));

  // Language
  const lang = document.createElement('div');
  lang.className = 'meta-item';
  lang.textContent = repo.language || 'Unknown';
  const langIcon = document.createElement('span');
  langIcon.className = 'material-icons';
  langIcon.textContent = 'code';
  lang.prepend(langIcon);

  meta.appendChild(stars);
  meta.appendChild(lang);

  cardContent.appendChild(title);
  cardContent.appendChild(desc);
  cardContent.appendChild(meta);

  card.appendChild(cardContent);

  // Click event opens modal
  cardContent.addEventListener('click', () => openProjectModal(repo));
  // Also open modal on keyboard "Enter" or "Space" key on cardContent
  cardContent.tabIndex = 0;
  cardContent.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(repo);
    }
  });

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
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
} else {
  console.error('yearSpan element not found');
}

if (githubProfileLink) {
  githubProfileLink.href = `https://github.com/${GITHUB_USERNAME}`;
} else {
  console.error('githubProfileLink element not found');
}

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
if (darkModeToggleBtn) {
  darkModeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setDarkMode(!isDark);
  });
} else {
  console.error('darkModeToggleBtn element not found');
}

// Initialize page on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  init();
});
