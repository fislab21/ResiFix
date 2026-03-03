const USERS = [
  { email: 'ahmed@university.edu', password: 'student123', role: 'student' },
  { email: 'karim@university.edu', password: 'worker123',  role: 'worker'  },
  { email: 'admin@university.edu', password: 'admin123',   role: 'admin'   },
];

// ─── Simple login function (mirrors AuthContext.login) ───────────────────────
function login(email, password) {
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return 'Invalid email or password.';
  localStorage.setItem('current_user', JSON.stringify(user));
  return null; // no error
}

// ─── Navigation helper ───────────────────────────────────────────────────────
function navigateTo(role) {
  const routes = {
    student: '/student',
    worker:  '/worker',
    admin:   '/admin',
  };
  // In a real multi-page app this would be window.location.href = routes[role]
  // For the demo we just show an alert.
  alert(`✅ Logged in as ${role}!\nIn production you would be redirected to: ${routes[role] ?? '/'}`);
}

// ─── Show / hide error ────────────────────────────────────────────────────────
function showError(message) {
  const box  = document.getElementById('errorMsg');
  const text = document.getElementById('errorText');
  text.textContent = message;
  box.classList.remove('hidden');
  // retrigger shake animation
  box.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  box.offsetHeight; // reflow
  box.style.animation = '';
}

function clearError() {
  document.getElementById('errorMsg').classList.add('hidden');
}

// ─── Form submit handler ──────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  clearError();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const err = login(email, password);
  if (err) {
    showError(err);
    return;
  }

  const stored = localStorage.getItem('current_user');
  if (stored) {
    const user = JSON.parse(stored);
    navigateTo(user.role);
  }
});

// ─── Clear error on input change ──────────────────────────────────────────────
['email', 'password'].forEach(id => {
  document.getElementById(id).addEventListener('input', clearError);
});