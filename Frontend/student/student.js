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

const STUDENT_API_URL = '../../backend/student/student.php';

/* Current logged-in student - will be populated from backend */
let CURRENT_USER = {
  id:         null,
  name:       'Loading...',
  role:       'student',
  roomNumber: 'Loading...',
};

/* Requests loaded from the backend for this student */
let myRequests = []; 

/* Fetch current user info from backend */
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${STUDENT_API_URL}?action=user`);
    const data = await res.json();

    if (data && data.success && data.user) {
      const user = data.user;
      CURRENT_USER = {
        id:         user.id,
        name:       user.name || 'Student',
        role:       'student',
        roomNumber: user.room_number || 'N/A',
      };
    } else {
      showToast('Error', 'Unable to load user information');
    }
  } catch (err) {
    showToast('Error', 'Network error while loading user info');
  }
}

/* ID counter for new requests */
let nextId = 100;

function mapApiRequest(record) {
  return {
    id:                record.id,
    title:             record.title,
    description:       record.description,
    status:            record.status,
    problemType:       record.problem_type,
    roomNumber:        record.room_number,
    studentId:         CURRENT_USER.id,
    studentName:       CURRENT_USER.name,
    createdAt:         record.created_at,
    assignedWorkerId:  null,
    assignedWorkerName: record.assigned_worker_name || null,
  };
}

/* =====================================================
   State
   ===================================================== */
let showForm = false;

async function loadRequests() {
  try {
    const res = await fetch(STUDENT_API_URL);
    const data = await res.json();

    if (!data || !data.success) {
      myRequests = [];
      const message = (data && data.message) || 'Unable to load requests.';
      showToast('Error', message);
    } else {
      myRequests = Array.isArray(data.requests)
        ? data.requests.map(mapApiRequest)
        : [];
    }
  } catch (err) {
    myRequests = [];
    showToast('Error', 'Network error while loading requests.');
  }

  renderRequests();
}

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
async function handleSubmit(e) {
  e.preventDefault();

  const problemType = document.getElementById('problemTypeSelect').value;
  const title       = document.getElementById('titleInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();

  if (!problemType || !title || !description) return;

  const body = new URLSearchParams({
    room_number:  CURRENT_USER.roomNumber,
    problem_type: problemType,
    title,
    description,
  });

  try {
    const res  = await fetch(STUDENT_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body,
    });
    const data = await res.json();

    if (!data || !data.success) {
      const message = (data && data.message) || 'Failed to create request.';
      showToast('Error', message);
      return;
    }

    await loadRequests();

  /* Reset form fields */
  document.getElementById('problemTypeSelect').value = '';
  document.getElementById('titleInput').value        = '';
  document.getElementById('descriptionInput').value  = '';

  toggleForm(true);
  showToast('Request Submitted', 'Your maintenance request has been sent.');
  } catch (err) {
    showToast('Error', 'Network error while creating request.');
  }
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
document.addEventListener('DOMContentLoaded', async () => {

  /* Fetch user info from backend first */
  await fetchCurrentUser();

  /* Set room subtitle */
  document.getElementById('roomSubtitle').textContent =
    `Room ${CURRENT_USER.roomNumber} — Track your maintenance requests`;

  /* Update user chip in sidebar */
  const userNameEl = document.querySelector('.user-name');
  if (userNameEl) userNameEl.textContent = CURRENT_USER.name;

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

  /* Initial load from backend */
  loadRequests();
});