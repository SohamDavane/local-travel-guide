// ===========================================
// Itinerary Planner — create, edit, persist, export
// ===========================================

const STORAGE_KEY = 'travelPlan';
const MAX_DAYS = 14;

const CATEGORY_LABELS = {
  sightseeing: 'Sightseeing',
  food: 'Food',
  transport: 'Transport',
  hotel: 'Hotel',
  other: 'Other'
};

const CATEGORY_BADGE_COLORS = {
  sightseeing: 'primary',
  food: 'success',
  transport: 'warning',
  hotel: 'info',
  other: 'secondary'
};

let plan = {
  destination: '',
  days: []
};

// Tracks which day currently has its "add activity" form open (only one at a time)
let openFormDayIndex = null;

document.addEventListener('DOMContentLoaded', function () {
  loadPlan();

  document.getElementById('create-trip-btn').addEventListener('click', handleCreateTrip);
  document.getElementById('clear-plan-btn').addEventListener('click', handleClearPlan);
  document.getElementById('export-plan-btn').addEventListener('click', exportPlan);

  if (plan.days.length > 0) {
    document.getElementById('destination').value = plan.destination;
    document.getElementById('days').value = plan.days.length;
    renderDays();
    showPlannerView();
  }
});

// ===========================================
// Trip creation
// ===========================================

function handleCreateTrip() {
  const destinationInput = document.getElementById('destination');
  const daysInput = document.getElementById('days');
  const errorEl = document.getElementById('setup-error');

  const destination = destinationInput.value.trim();
  const numDays = parseInt(daysInput.value, 10);

  errorEl.classList.add('d-none');
  errorEl.textContent = '';

  if (!destination) {
    showSetupError('Please enter a destination name.');
    destinationInput.focus();
    return;
  }

  if (!numDays || numDays < 1) {
    showSetupError('Please enter a number of days (1 or more).');
    daysInput.focus();
    return;
  }

  if (numDays > MAX_DAYS) {
    showSetupError(`Trips longer than ${MAX_DAYS} days aren't supported here. Try splitting it into multiple trips.`);
    daysInput.focus();
    return;
  }

  plan.destination = destination;
  plan.days = Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    activities: []
  }));

  openFormDayIndex = null;
  savePlan();
  renderDays();
  showPlannerView();
}

function showSetupError(message) {
  const errorEl = document.getElementById('setup-error');
  errorEl.textContent = message;
  errorEl.classList.remove('d-none');
}

function showPlannerView() {
  document.getElementById('planner-section').classList.remove('d-none');
}

// ===========================================
// Rendering
// ===========================================

function renderDays() {
  const container = document.getElementById('planner-container');

  if (plan.days.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = plan.days.map((day, dayIndex) => buildDayCard(day, dayIndex)).join('');
  updateSummary();
}

function buildDayCard(day, dayIndex) {
  const activitiesHTML = day.activities.length
    ? day.activities
        .slice()
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        .map(activity => buildActivityRow(activity, dayIndex))
        .join('')
    : `<p class="text-muted small mb-0 mt-2" id="empty-day-${dayIndex}">No activities yet. Add the first one below.</p>`;

  const formHTML = openFormDayIndex === dayIndex ? buildActivityForm(dayIndex) : '';

  return `
    <div class="card mt-3 day-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Day ${day.day}</span>
        <span class="badge bg-light text-dark">${day.activities.length} activit${day.activities.length === 1 ? 'y' : 'ies'}</span>
      </div>
      <div class="card-body">
        ${activitiesHTML}
        ${formHTML}
        <button
          type="button"
          class="btn btn-sm btn-outline-primary mt-3"
          onclick="toggleActivityForm(${dayIndex})">
          ${openFormDayIndex === dayIndex ? 'Cancel' : '+ Add Activity'}
        </button>
      </div>
    </div>
  `;
}

function buildActivityRow(activity, dayIndex) {
  const badgeColor = CATEGORY_BADGE_COLORS[activity.category] || 'secondary';
  const categoryLabel = CATEGORY_LABELS[activity.category] || 'Other';

  return `
    <div class="d-flex justify-content-between align-items-start border rounded p-2 mt-2 activity-row">
      <div>
        <div>
          <strong>${escapeHtml(activity.time || '—')}</strong>
          &nbsp;${escapeHtml(activity.name)}
          <span class="badge bg-${badgeColor} ms-1">${categoryLabel}</span>
        </div>
        ${activity.notes ? `<div class="text-muted small mt-1">${escapeHtml(activity.notes)}</div>` : ''}
      </div>
      <button
        type="button"
        class="btn btn-outline-danger btn-sm"
        aria-label="Delete activity"
        onclick="deleteActivity(${dayIndex}, ${activity.id})">
        &times;
      </button>
    </div>
  `;
}

function buildActivityForm(dayIndex) {
  return `
    <div class="border rounded p-3 mt-3 bg-light activity-form" id="activity-form-${dayIndex}">
      <div class="row g-2">
        <div class="col-sm-3">
          <label class="form-label small mb-1" for="activity-time-${dayIndex}">Time</label>
          <input type="time" class="form-control form-control-sm" id="activity-time-${dayIndex}">
        </div>
        <div class="col-sm-5">
          <label class="form-label small mb-1" for="activity-name-${dayIndex}">Activity name</label>
          <input type="text" class="form-control form-control-sm" id="activity-name-${dayIndex}" placeholder="e.g. Visit Gateway of India">
        </div>
        <div class="col-sm-4">
          <label class="form-label small mb-1" for="activity-category-${dayIndex}">Category</label>
          <select class="form-select form-select-sm" id="activity-category-${dayIndex}">
            <option value="sightseeing">Sightseeing</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="hotel">Hotel</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label small mb-1" for="activity-notes-${dayIndex}">Notes (optional)</label>
          <input type="text" class="form-control form-control-sm" id="activity-notes-${dayIndex}" placeholder="Any extra details">
        </div>
      </div>
      <div id="activity-form-error-${dayIndex}" class="text-danger small mt-2 d-none"></div>
      <button type="button" class="btn btn-primary btn-sm mt-3" onclick="addActivity(${dayIndex})">
        Save Activity
      </button>
    </div>
  `;
}

// ===========================================
// Activity form open/close
// ===========================================

function toggleActivityForm(dayIndex) {
  openFormDayIndex = openFormDayIndex === dayIndex ? null : dayIndex;
  renderDays();

  if (openFormDayIndex === dayIndex) {
    const nameInput = document.getElementById(`activity-name-${dayIndex}`);
    if (nameInput) nameInput.focus();
  }
}

// ===========================================
// Add / delete activities
// ===========================================

function addActivity(dayIndex) {
  const nameInput = document.getElementById(`activity-name-${dayIndex}`);
  const timeInput = document.getElementById(`activity-time-${dayIndex}`);
  const categoryInput = document.getElementById(`activity-category-${dayIndex}`);
  const notesInput = document.getElementById(`activity-notes-${dayIndex}`);
  const errorEl = document.getElementById(`activity-form-error-${dayIndex}`);

  const name = nameInput.value.trim();

  if (!name) {
    errorEl.textContent = 'Please enter an activity name.';
    errorEl.classList.remove('d-none');
    nameInput.focus();
    return;
  }

  plan.days[dayIndex].activities.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: name,
    time: timeInput.value || '',
    category: categoryInput.value,
    notes: notesInput.value.trim()
  });

  openFormDayIndex = null;
  savePlan();
  renderDays();
}

function deleteActivity(dayIndex, activityId) {
  plan.days[dayIndex].activities = plan.days[dayIndex].activities.filter(
    activity => activity.id !== activityId
  );
  savePlan();
  renderDays();
}

// ===========================================
// Summary
// ===========================================

function updateSummary() {
  document.getElementById('total-days').textContent = plan.days.length;

  const total = plan.days.reduce((sum, day) => sum + day.activities.length, 0);
  document.getElementById('total-activities').textContent = total;
}

// ===========================================
// localStorage persistence
// ===========================================

function savePlan() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Could not save plan to localStorage:', error);
  }
}

function loadPlan() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.days)) {
        plan = parsed;
      }
    }
  } catch (error) {
    console.error('Could not load saved plan:', error);
  }
}

function handleClearPlan() {
  const confirmed = confirm('This will permanently delete your current trip plan. Continue?');
  if (!confirmed) return;

  plan = { destination: '', days: [] };
  openFormDayIndex = null;
  localStorage.removeItem(STORAGE_KEY);

  document.getElementById('destination').value = '';
  document.getElementById('days').value = '';
  document.getElementById('planner-container').innerHTML = '';
  document.getElementById('planner-section').classList.add('d-none');
  updateSummary();
}

// ===========================================
// Export as downloadable .txt file
// ===========================================

function exportPlan() {
  if (plan.days.length === 0) {
    alert('Create a trip first before exporting.');
    return;
  }

  let output = `Trip to ${plan.destination}\n`;
  output += '='.repeat(`Trip to ${plan.destination}`.length) + '\n\n';

  plan.days.forEach(day => {
    output += `DAY ${day.day}\n`;
    output += '-'.repeat(20) + '\n';

    if (day.activities.length === 0) {
      output += '  (no activities planned)\n';
    } else {
      day.activities
        .slice()
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        .forEach(activity => {
          const timeLabel = activity.time ? `${activity.time} - ` : '';
          const categoryLabel = CATEGORY_LABELS[activity.category] || 'Other';
          output += `  ${timeLabel}${activity.name} (${categoryLabel})\n`;
          if (activity.notes) {
            output += `      Notes: ${activity.notes}\n`;
          }
        });
    }
    output += '\n';
  });

  const blob = new Blob([output], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'my-trip-plan.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===========================================
// Utility
// ===========================================

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}