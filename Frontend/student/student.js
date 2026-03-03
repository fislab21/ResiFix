/* =====================================================
   Mock data  (mirrors mockData.ts / types.ts)
   ===================================================== */

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

/* Current logged-in student (mirrors AuthContext user) */
const CURRENT_USER = {
  id:         'u1',
  name:       'Ahmed Karim',
  role:       'student',
  roomNumber: '204',
};

/* Seed requests belonging to this student */
let myRequests = [
  {
    id: 'req1',
    title: 'Leaking Faucet in Bathroom',
    description: 'The bathroom faucet has been dripping constantly for two days, wasting water.',
    status: 'pending',
    problemType: 'plumbing',
    roomNumber: '204',
    studentId: 'u1',
    studentName: 'Ahmed Karim',
    createdAt: '2024-03-10',
    assignedWorkerId: null,
    assignedWorkerName: null,
  },
  {
    id: 'req3',
    title: 'Window Latch Broken',
    description: 'The window in my room cannot be locked properly. It is a security concern.',
    status: 'assigned',
    problemType: 'carpentry',
    roomNumber: '204',
    studentId: 'u1',
    studentName: 'Ahmed Karim',
    createdAt: '2024-03-08',
    assignedWorkerId: 'w4',
    assignedWorkerName: 'Bilal Nour',
  },
];

/* ID counter for new requests */
let nextId = 100;

/* =====================================================
   addRequest  (mirrors addRequest from mockData.ts)
   ===================================================== */
function addRequest(data) {
  const newReq = {
    id: 'req' + (++nextId),
    ...data,
    createdAt: new Date().toISOString().split('T')[0],
    assignedWorkerId: null,
    assignedWorkerName: null,
  };
  myRequests = [newReq, ...myRequests];
  return newReq;
}

/* =====================================================
   State
   ===================================================== */
let showForm = false;

/* =====================================================
   Toast helper
   ===================================================== */
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

/* =====================================================
   Badge HTML helper
   ===================================================== */
function badgeHTML(status) {
  return `<span class="badge badge-${status}">
            <span class="badge-dot"></span>
            ${STATUS_LABELS[status] || status}
          </span>`;
}

/* =====================================================
   Toggle form  (mirrors setShowForm(!showForm))
   ===================================================== */
function toggleForm(forceHide) {
  showForm = forceHide === true ? false : !showForm;
  const formEl = document.getElementById('requestForm');

  if (showForm) {
    formEl.classList.remove('hidden');
    // retrigger slide-down animation
    formEl.style.animation = 'none';
    formEl.offsetHeight;
    formEl.style.animation = '';
  } else {
    formEl.classList.add('hidden');
  }
}

/* =====================================================
   Handle form submit
   ===================================================== */
function handleSubmit(e) {
  e.preventDefault();

  const problemType = document.getElementById('problemTypeSelect').value;
  const title       = document.getElementById('titleInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();

  if (!problemType || !title || !description) return;

  addRequest({
    studentId:   CURRENT_USER.id,
    studentName: CURRENT_USER.name,
    roomNumber:  CURRENT_USER.roomNumber,
    problemType,
    title,
    description,
    status: 'pending',
  });

  /* Reset form fields */
  document.getElementById('problemTypeSelect').value = '';
  document.getElementById('titleInput').value        = '';
  document.getElementById('descriptionInput').value  = '';

  toggleForm(true);
  renderRequests();
  showToast('Request Submitted', 'Your maintenance request has been sent.');
}

/* =====================================================
   Render requests list
   ===================================================== */
function renderRequests() {
  const container = document.getElementById('requestsList');

  if (myRequests.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
        <p class="empty-title">No requests yet</p>
        <p class="empty-sub">Submit your first maintenance request above</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="requests-grid">${
    myRequests.map((req, i) => {
      const date = new Date(req.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      const assignedSection = req.assignedWorkerName
        ? `<div class="req-assigned">
             <p class="assigned-label">Assigned to</p>
             <p class="assigned-name">${req.assignedWorkerName}</p>
           </div>`
        : '';

      return `
        <div class="card request-card" style="animation-delay:${i * 40}ms">
          <div class="req-card-body">
            <div class="req-info">
              <div class="req-title-row">
                <span class="req-title">${req.title}</span>
                ${badgeHTML(req.status)}
              </div>
              <p class="req-description">${req.description}</p>
              <div class="req-meta">
                <span class="meta-tag">${PROBLEM_TYPE_LABELS[req.problemType]}</span>
                <span class="meta-plain">Room ${req.roomNumber}</span>
                <span class="meta-plain">${date}</span>
              </div>
            </div>
            ${assignedSection}
          </div>
        </div>`;
    }).join('')
  }</div>`;
}

/* =====================================================
   Init
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* Set room subtitle */
  document.getElementById('roomSubtitle').textContent =
    `Room ${CURRENT_USER.roomNumber} — Track your maintenance requests`;

  /* Pre-fill disabled room number input */
  document.getElementById('roomNumberInput').value = CURRENT_USER.roomNumber;

  /* Populate problem type dropdown */
  const sel = document.getElementById('problemTypeSelect');
  Object.entries(PROBLEM_TYPE_LABELS).forEach(([key, label]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    sel.appendChild(opt);
  });

  /* Bind buttons */
  document.getElementById('toggleFormBtn').addEventListener('click', () => toggleForm());
  document.getElementById('cancelFormBtn').addEventListener('click', () => toggleForm(true));
  document.getElementById('newRequestForm').addEventListener('submit', handleSubmit);

  /* Initial render */
  renderRequests();
});