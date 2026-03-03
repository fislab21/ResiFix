// ─── Login function - sends request to backend ──────────────────────────────
async function login(email, password) {
  try {
    const response = await fetch('../../../backend/Auth/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: email,
        password: password,
      }),
      credentials: 'same-origin', // Include session cookies
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Connection error. Please try again.' };
  }
}

// ─── Navigation helper ───────────────────────────────────────────────────────
function navigateTo(role) {
  const routes = {
    student: '../student/student.html',
    worker: '../worker/worker.html',
    admin: '../Admin/admin.html',
  };
  window.location.href = routes[role] || '../login/login.html';
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
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearError();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const result = await login(email, password);
  if (!result.success) {
    showError(result.message || 'Invalid email or password.');
    return;
  }

  // Store user info and redirect
  localStorage.setItem('current_user', JSON.stringify(result.user));
  navigateTo(result.user.role);
});

// ─── Clear error on input change ──────────────────────────────────────────────
['email', 'password'].forEach(id => {
  document.getElementById(id).addEventListener('input', clearError);
});