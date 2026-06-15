// Highlights the nav link that matches the current page.
// Runs after navbar.html has been injected into #navbar-placeholder.
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

// Loads a shared HTML component (navbar/footer) into a placeholder element,
// then runs an optional callback once it's in the DOM.
function loadComponent(url, placeholderId, callback) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const placeholder = document.getElementById(placeholderId);
      if (placeholder) {
        placeholder.innerHTML = html;
        if (callback) callback();
      }
    })
    .catch(error => console.error(`Failed to load ${url}:`, error));
}

document.addEventListener('DOMContentLoaded', function () {
  loadComponent('components/navbar.html', 'navbar-placeholder', highlightActiveNavLink);
  loadComponent('components/footer.html', 'footer-placeholder');
});