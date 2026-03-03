/* ═══════════════════════════════════════════════════════════
   Mock data  (mirrors mockData.ts / types.ts from the React app)
   ═══════════════════════════════════════════════════════════ */

const PROBLEM_TYPE_LABELS = {
  plumbing:    'Plumbing',
  electrical:  'Electrical',
  hvac:        'HVAC',
  carpentry:   'Carpentry',
  cleaning:    'Cleaning',
  other:       'Other',
};

const STATUS_LABELS = {
  pending:     'Pending',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

const WORKERS = [
  { id: 'w1', name: 'Ali Hassan',      specialization: 'plumbing'   },
  { id: 'w2', name: 'Omar Farsi',      specialization: 'electrical' },
  { id: 'w3', name: 'Youssef Malik',   specialization: 'hvac'       },
  { id: 'w4', name: 'Bilal Nour',      specialization: 'carpentry'  },
  { id: 'w5', name: 'Samir Rais',      specialization: 'cleaning'   },
  { id: 'w6', name: 'Hassan Tazi',     specialization: 'other'      },
  { id: 'w7', name: 'Tarek Benali',    specialization: 'plumbing'   },
  { id: 'w8', name: 'Amine Cherif',    specialization: 'electrical' },
];

let REQUESTS = [
  {
    id: 'req1', title: 'Leaking Faucet in Bathroom',
    description: 'The bathroom faucet has been dripping constantly for two days, wasting water.',
    status: 'pending', problemType: 'plumbing',
    roomNumber: '204', studentName: 'Ahmed Karim',
    createdAt: '2024-03-10', assignedWorkerId: null, assignedWorkerName: null,
  },
  {
    id: 'req2', title: 'Broken Power Outlet',
    description: 'One of the wall outlets near the desk stopped working after a power flicker.',
    status: 'assigned', problemType: 'electrical',
    roomNumber: '312', studentName: 'Sara Meddah',
    createdAt: '2024-03-09', assignedWorkerId: 'w2', assignedWorkerName: 'Omar Farsi',
  },
  {
    id: 'req3', title: 'Air Conditioning Not Cooling',
    description: 'The AC unit runs but blows warm air. Temperature in the room is unbearable.',
    status: 'in_progress', problemType: 'hvac',
    roomNumber: '118', studentName: 'Mourad Bensalem',
    createdAt: '2024-03-08', assignedWorkerId: 'w3', assignedWorkerName: 'Youssef Malik',
  },
  {
    id: 'req4', title: 'Wardrobe Door Hinge Broken',
    description: 'The right door of the wardrobe has a broken hinge and keeps falling off.',
    status: 'completed', problemType: 'carpentry',
    roomNumber: '225', studentName: 'Nadia Boucherit',
    createdAt: '2024-03-07', assignedWorkerId: 'w4', assignedWorkerName: 'Bilal Nour',
  },
  {
    id: 'req5', title: 'Hallway Light Flickering',
    description: 'The corridor light outside room 107 flickers every few minutes at night.',
    status: 'pending', problemType: 'electrical',
    roomNumber: '107', studentName: 'Karim Boualem',
    createdAt: '2024-03-11', assignedWorkerId: null, assignedWorkerName: null,
  },
  {
    id: 'req6', title: 'Deep Cleaning Required',
    description: 'The shared kitchen area on floor 3 needs a thorough cleaning after a leak.',
    status: 'pending', problemType: 'cleaning',
    roomNumber: '301', studentName: 'Ines Hamidi',
    createdAt: '2024-03-11', assignedWorkerId: null, assignedWorkerName: null,
  },
];

/* helpers */
function getWorkersBySpecialization(type) {
  return WORKERS.filter(w => w.specialization === type);
}

function updateRequest(id, changes) {
  const idx = REQUESTS.findIndex(r => r.id === id);
  if (idx === -1) return null;
  REQUESTS[idx] = { ...REQUESTS[idx], ...changes };
  return REQUESTS[idx];
}

/* ═══════════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════════ */
let filterStatus = 'all';
let filterType   = 'all';

/* ═══════════════════════════════════════════════════════════
   Derived stats
   ═══════════════════════════════════════════════════════════ */
function getStats() {
  return {
    total:      REQUESTS.length,
    pending:    REQUESTS.filter(r => r.status === 'pending').length,
    inProgress: REQUESTS.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
    completed:  REQUESTS.filter(r => r.status === 'completed').length,
  };
}

/* ═══════════════════════════════════════════════════════════
   Toast helper
   ═══════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(title, body) {
  const el = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent  = body;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  el.offsetHeight;          // reflow
  el.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

/* ═══════════════════════════════════════════════════════════
   Badge HTML helper
   ═══════════════════════════════════════════════════════════ */
function badgeHTML(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="badge badge-${status}"><span class="badge-dot"></span>${label}</span>`;
}

/* ═══════════════════════════════════════════════════════════
   Render stat cards
   ═══════════════════════════════════════════════════════════ */
function renderStats() {
  const s = getStats();
  const cards = [
    {
      label: 'Total Requests', value: s.total, iconClass: 'icon-default',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
               <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    },
    {
      label: 'Pending', value: s.pending, iconClass: 'icon-warning',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2
               0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
               <line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    },
    {
      label: 'In Progress', value: s.inProgress, iconClass: 'icon-info',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="12" r="10"/>
               <polyline points="12 6 12 12 16 14"/></svg>`,
    },
    {
      label: 'Completed', value: s.completed, iconClass: 'icon-success',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
               <polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    },
  ];

  document.getElementById('statsGrid').innerHTML = cards.map(c => `
    <div class="card stat-card">
      <div class="card-body">
        <div class="stat-icon ${c.iconClass}">${c.icon}</div>
        <div>
          <p class="stat-value">${c.value}</p>
          <p class="stat-label">${c.label}</p>
        </div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════
   Populate filter dropdowns
   ═══════════════════════════════════════════════════════════ */
function populateFilters() {
  const statusSel = document.getElementById('filterStatus');
  const typeSel   = document.getElementById('filterType');

  Object.entries(STATUS_LABELS).forEach(([k, v]) => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = v;
    statusSel.appendChild(opt);
  });

  Object.entries(PROBLEM_TYPE_LABELS).forEach(([k, v]) => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = v;
    typeSel.appendChild(opt);
  });

  statusSel.addEventListener('change', e => { filterStatus = e.target.value; renderRequests(); });
  typeSel.addEventListener('change',   e => { filterType   = e.target.value; renderRequests(); });
}

/* ═══════════════════════════════════════════════════════════
   Render request cards
   ═══════════════════════════════════════════════════════════ */
function renderRequests() {
  const filtered = REQUESTS.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType   !== 'all' && r.problemType !== filterType)  return false;
    return true;
  });

  const container = document.getElementById('requestsList');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
        <p>No matching requests</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map((req, i) => {
    const availableWorkers = getWorkersBySpecialization(req.problemType);
    const date = new Date(req.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

    const assignSection = req.assignedWorkerName
      ? `<div class="req-assign">
           <p class="assigned-label">Assigned to</p>
           <p class="assigned-name">${req.assignedWorkerName}</p>
         </div>`
      : `<div class="req-assign">
           <div class="assign-row">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
             </svg>
             <div class="assign-wrapper">
               <select class="assign-select" data-req-id="${req.id}">
                 <option value="">Assign worker…</option>
                 ${availableWorkers.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
               </select>
               <svg class="assign-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                 <polyline points="6 9 12 15 18 9"/>
               </svg>
             </div>
           </div>
         </div>`;

    return `
      <div class="card request-card" style="animation-delay:${i * 40}ms">
        <div class="card-body">
          <div class="req-main">
            <div class="req-title-row">
              <span class="req-title">${req.title}</span>
              ${badgeHTML(req.status)}
            </div>
            <p class="req-description">${req.description}</p>
            <div class="req-meta">
              <span class="meta-tag">${PROBLEM_TYPE_LABELS[req.problemType]}</span>
              <span class="meta-plain">Room ${req.roomNumber}</span>
              <span class="meta-plain">By ${req.studentName}</span>
              <span class="meta-plain">${date}</span>
            </div>
          </div>
          ${assignSection}
        </div>
      </div>`;
  }).join('');

  /* Bind assign dropdowns */
  container.querySelectorAll('.assign-select').forEach(sel => {
    sel.addEventListener('change', function () {
      const reqId    = this.dataset.reqId;
      const workerId = this.value;
      if (!workerId) return;
      handleAssignWorker(reqId, workerId);
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   Assign worker
   ═══════════════════════════════════════════════════════════ */
function handleAssignWorker(reqId, workerId) {
  const req    = REQUESTS.find(r => r.id === reqId);
  if (!req) return;
  const workers = getWorkersBySpecialization(req.problemType);
  const worker  = workers.find(w => w.id === workerId);
  if (!worker) return;

  updateRequest(reqId, {
    assignedWorkerId:   worker.id,
    assignedWorkerName: worker.name,
    status:             'assigned',
  });

  renderStats();
  renderRequests();
  showToast('Worker Assigned', `${worker.name} assigned to the request.`);
}

/* ═══════════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  populateFilters();
  renderRequests();
});