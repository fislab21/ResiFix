/* ═══════════════════════════════════════════════════════
   Mock data  (mirrors mockData.ts / types.ts)
   ═══════════════════════════════════════════════════════ */

const PROBLEM_TYPE_LABELS = {
  plumbing:   'Plumbing',
  electrical: 'Electrical',
  hvac:       'HVAC',
  carpentry:  'Carpentry',
  cleaning:   'Cleaning',
  other:      'Other',
};

const STATUS_LABELS = {
  pending:     'Pending',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

/* Current logged-in worker (mirrors AuthContext user) */
const CURRENT_WORKER = {
  id:             'w2',
  name:           'Karim',
  role:           'worker',
  specialization: ['electrical'],
};

let REQUESTS = [
  {
    id: 'req2',
    title: 'Broken Power Outlet',
    description: 'One of the wall outlets near the desk stopped working after a power flicker.',
    status: 'assigned',
    problemType: 'electrical',
    roomNumber: '312',
    studentName: 'Sara Meddah',
    createdAt: '2024-03-09',
    assignedWorkerId: 'w2',
    assignedWorkerName: 'Karim Benali',
  },
  {
    id: 'req5',
    title: 'Hallway Light Flickering',
    description: 'The corridor light outside room 107 flickers every few minutes at night.',
    status: 'in_progress',
    problemType: 'electrical',
    roomNumber: '107',
    studentName: 'Karim Boualem',
    createdAt: '2024-03-11',
    assignedWorkerId: 'w2',
    assignedWorkerName: 'Karim Benali',
  },
  {
    id: 'req8',
    title: 'Faulty Ceiling Light in Room',
    description: 'Ceiling light stopped working completely. Bulb replacement did not fix it.',
    status: 'completed',
    problemType: 'electrical',
    roomNumber: '220',
    studentName: 'Amina Zahra',
    createdAt: '2024-03-06',
    assignedWorkerId: 'w2',
    assignedWorkerName: 'Karim Benali',
  },
];

/* Filter to only this worker's assigned requests */
let myRequests = REQUESTS.filter(r => r.assignedWorkerId === CURRENT_WORKER.id);

/* Status options a worker can set (mirrors statusOptions array) */
const STATUS_OPTIONS = ['assigned', 'in_progress', 'completed'];

/* ═══════════════════════════════════════════════════════
   Update request helper
   ═══════════════════════════════════════════════════════ */
function updateRequest(id, changes) {
  const idx = myRequests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  myRequests[idx] = { ...myRequests[idx], ...changes };
  return myRequests[idx];
}

/* ═══════════════════════════════════════════════════════
   Toast helper
   ═══════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(title, body) {
  const el = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent  = body;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

/* ═══════════════════════════════════════════════════════
   Badge HTML helper
   ═══════════════════════════════════════════════════════ */
function badgeHTML(status) {
  return `<span class="badge badge-${status}">
            <span class="badge-dot"></span>
            ${STATUS_LABELS[status] || status}
          </span>`;
}

/* ═══════════════════════════════════════════════════════
   Status change handler
   ═══════════════════════════════════════════════════════ */
function handleStatusChange(reqId, newStatus) {
  const updated = updateRequest(reqId, { status: newStatus });
  if (!updated) return;
  showToast('Status Updated', `Request marked as ${STATUS_LABELS[newStatus]}`);
  renderRequests();
}

/* ═══════════════════════════════════════════════════════
   Render
   ═══════════════════════════════════════════════════════ */
function renderRequests() {
  const container = document.getElementById('requestsList');

  if (myRequests.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 20h.01"/><path d="M7 20v-4"/>
          <path d="M12 20v-8"/><path d="M17 20V8"/>
          <path d="M22 4v16"/>
        </svg>
        <p class="empty-title">No tasks assigned</p>
        <p class="empty-sub">Check back later for new assignments</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="requests-grid">${
    myRequests.map((req, i) => {
      const date      = new Date(req.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
      const completed = req.status === 'completed';

      const checkIcon = completed
        ? `<span class="check-icon">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
               <polyline points="22 4 12 14.01 9 11.01"/>
             </svg>
           </span>`
        : '';

      const selectOptions = STATUS_OPTIONS.map(s =>
        `<option value="${s}" ${req.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`
      ).join('');

      return `
        <div class="card request-card ${completed ? 'is-completed' : ''}"
             style="animation-delay:${i * 40}ms">
          <div class="card-body">

            <!-- Left: info -->
            <div class="req-info">
              <div class="req-title-row">
                <span class="req-title">${req.title}</span>
                ${badgeHTML(req.status)}
                ${checkIcon}
              </div>
              <p class="req-description">${req.description}</p>
              <div class="req-meta">
                <span class="meta-tag">${PROBLEM_TYPE_LABELS[req.problemType]}</span>
                <span class="meta-plain">Room ${req.roomNumber}</span>
                <span class="meta-plain">By ${req.studentName}</span>
                <span class="meta-plain">${date}</span>
              </div>
            </div>

            <!-- Right: status update -->
            <div class="status-update">
              <span class="update-label">Update Status:</span>
              <div class="custom-select-wrapper">
                <select class="status-select" data-req-id="${req.id}">
                  ${selectOptions}
                </select>
                <svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

          </div>
        </div>`;
    }).join('')
  }</div>`;

  /* Bind select dropdowns */
  container.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', function () {
      handleStatusChange(this.dataset.reqId, this.value);
    });
  });
}

/* ═══════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Set specialization subtitle (mirrors user?.specialization?.map(...).join(', ')) */
  const specLabel = CURRENT_WORKER.specialization
    .map(s => PROBLEM_TYPE_LABELS[s] || s)
    .join(', ');
  document.getElementById('specializationLabel').textContent = `Specialization: ${specLabel}`;

  renderRequests();
});