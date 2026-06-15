// ===========================================
// Attractions Page — load, render, and filter
// ===========================================

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let allAttractions = [];

document.addEventListener('DOMContentLoaded', function () {
  loadAttractions();
  setupFilterButtons();
});

// Fetch the dataset and render the full grid
async function loadAttractions() {
  const grid = document.getElementById('attractions-grid');
  const statusEl = document.getElementById('attractions-status');

  try {
    const response = await fetch('data/attractions.json');

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    allAttractions = await response.json();
    statusEl.classList.add('d-none');
    renderCards(allAttractions);

  } catch (error) {
    console.error('Failed to load attractions:', error);
    statusEl.textContent = 'Could not load attractions right now. Please refresh the page.';
    statusEl.classList.remove('d-none');
    grid.innerHTML = '';
  }
}

// Wire up the filter buttons
function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      // Update active button styling
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;
      const filtered = category === 'all'
        ? allAttractions
        : allAttractions.filter(a => a.category === category);

      renderCards(filtered);
    });
  });
}

// Build and inject card HTML for a given list of attractions
function renderCards(attractions) {
  const grid = document.getElementById('attractions-grid');
  const emptyState = document.getElementById('attractions-empty');

  if (!attractions.length) {
    grid.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');

  grid.innerHTML = attractions.map(buildCard).join('');
}

// Build a single Bootstrap card for one attraction
function buildCard(attraction) {
  const imageUrl = attraction.images && attraction.images[0]
    ? attraction.images[0]
    : `https://placehold.co/400x300?text=${encodeURIComponent(attraction.name)}`;

  const fallbackUrl = `https://placehold.co/400x300?text=${encodeURIComponent(attraction.name)}`;

  const feeLabel = attraction.entry_fee === 0
    ? 'Free'
    : `₹${attraction.entry_fee}`;

  const closedLabel = formatClosedDays(attraction.closed_on);

  return `
    <div class="col-sm-6 col-lg-4 mb-4">
      <div class="card attraction-card h-100">
        <div class="attraction-card__image-wrap">
          <img
            src="${imageUrl}"
            class="card-img-top"
            alt="${escapeHtml(attraction.name)}"
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackUrl}';">
          <span class="badge bg-${attraction.badge_color} attraction-card__badge text-capitalize">
            ${escapeHtml(attraction.category)}
          </span>
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(attraction.name)}</h5>
          <p class="text-muted small mb-2">
            <i class="bi bi-geo-alt"></i> ${escapeHtml(attraction.locality)}
          </p>
          <p class="card-text small">${escapeHtml(attraction.description)}</p>

          <ul class="list-unstyled small text-muted mb-3 attraction-card__meta">
            <li><i class="bi bi-clock"></i> Best time: ${escapeHtml(attraction.best_time)}</li>
            <li><i class="bi bi-ticket-perforated"></i> Entry: ${feeLabel}</li>
            <li><i class="bi bi-hourglass-split"></i> Duration: ~${formatDuration(attraction.avg_duration_min)}</li>
            ${closedLabel ? `<li><i class="bi bi-calendar-x"></i> Closed: ${closedLabel}</li>` : ''}
          </ul>

          <div class="mt-auto">
            <small class="text-muted" title="${escapeHtml(attraction.entry_fee_note)}">
              <i class="bi bi-info-circle"></i> Tap for fee details
            </small>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Convert [0, 3] -> "Sunday, Wednesday"
function formatClosedDays(closedOn) {
  if (!closedOn || closedOn.length === 0) return '';
  return closedOn.map(d => WEEKDAYS[d]).join(', ');
}

// Convert 90 -> "1h 30m", 45 -> "45m"
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

// Basic escaping so attraction data can't break the HTML structure
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}