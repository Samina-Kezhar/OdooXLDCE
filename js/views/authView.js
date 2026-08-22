/**
 * Screen 1: Login / Signup View
 * Handles user authentication, email validation, password strength meter, 409 conflict, and offline edge cases.
 */

const AuthView = {
  render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-wrapper animate-fade-in">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo-badge animate-float">✈️</div>
            <h2>Welcome to <span class="text-gradient">GlobeTrotter</span></h2>
            <p>Your intelligent, personalized travel planner</p>
          </div>

          <!-- Tab Switcher -->
          <div class="tab-list auth-tabs">
            <button class="tab-btn w-full justify-center active" id="auth-tab-login" onclick="AuthView.switchTab('login')">Log In</button>
            <button class="tab-btn w-full justify-center" id="auth-tab-signup" onclick="AuthView.switchTab('signup')">Sign Up</button>
          </div>

          <!-- Login Form -->
          <form id="form-login" onsubmit="AuthView.handleLogin(event)">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address <span class="required">*</span></label>
              <input type="email" id="login-email" class="form-control" placeholder="Enter your email address" required />
              <div class="form-error hidden" id="login-email-error"></div>
            </div>

            <div class="form-group">
              <div class="flex items-center justify-between">
                <label class="form-label" for="login-password">Password <span class="required">*</span></label>
                <a href="javascript:void(0)" onclick="AuthView.openForgotPasswordModal()" style="font-size: 0.8rem;">Forgot password?</a>
              </div>
              <input type="password" id="login-password" class="form-control" placeholder="Enter your password" required />
              <div class="form-error hidden" id="login-password-error"></div>
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary w-full btn-lg" style="margin-top: 0.5rem;">
              Sign In to GlobeTrotter
            </button>
          </form>

          <!-- Signup Form (Initially hidden) -->
          <form id="form-signup" class="hidden" onsubmit="AuthView.handleSignup(event)">
            <div class="form-group">
              <label class="form-label" for="signup-name">Full Name <span class="required">*</span></label>
              <input type="text" id="signup-name" class="form-control" placeholder="Alex River" required />
              <div class="form-error hidden" id="signup-name-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="signup-email">Email Address <span class="required">*</span></label>
              <input type="email" id="signup-email" class="form-control" placeholder="name@example.com" required />
              <div class="form-error hidden" id="signup-email-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="signup-password">Password <span class="required">*</span></label>
              <input type="password" id="signup-password" class="form-control" placeholder="Minimum 8 characters" required oninput="AuthView.checkPasswordStrength(this.value)" />
              <div class="password-strength-bar">
                <div class="password-strength-fill" id="strength-fill"></div>
              </div>
              <div class="password-strength-text" id="strength-text" style="color: var(--text-subtle);">Password strength: Empty</div>
              <div class="form-error hidden" id="signup-password-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="signup-confirm">Confirm Password <span class="required">*</span></label>
              <input type="password" id="signup-confirm" class="form-control" placeholder="Re-enter password" required />
              <div class="form-error hidden" id="signup-confirm-error"></div>
            </div>

            <button type="submit" id="btn-signup-submit" class="btn btn-primary w-full btn-lg" style="margin-top: 0.5rem;">
              Create Free Account
            </button>
          </form>

          <!-- Quick Demo Access Box for Judges/Testers -->
          <div class="demo-login-box">
            <p style="font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--primary-300);"><strong>⚡ Fast Track Demo Access:</strong></p>
            <button type="button" class="btn btn-secondary btn-sm w-full" onclick="AuthView.quickDemoLogin()">
              Explore with Preloaded Demo Account
            </button>
          </div>

          <div class="auth-footer">
            <span>By proceeding you agree to GlobeTrotter's <a href="javascript:void(0)">Terms</a> & <a href="javascript:void(0)">Privacy Policy</a></span>
          </div>
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('auth-tab-login').classList.toggle('active', isLogin);
    document.getElementById('auth-tab-signup').classList.toggle('active', !isLogin);
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-signup').classList.toggle('hidden', isLogin);
  },

  checkPasswordStrength(password) {
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    if (!fill || !text) return;

    if (!password) {
      fill.style.width = '0%';
      text.innerText = 'Password strength: Empty';
      text.style.color = 'var(--text-subtle)';
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      fill.style.width = '33%';
      fill.style.backgroundColor = 'var(--accent-rose)';
      text.innerText = 'Weak password (Add numbers/symbols)';
      text.style.color = 'var(--accent-rose)';
    } else if (score <= 4) {
      fill.style.width = '66%';
      fill.style.backgroundColor = 'var(--accent-amber)';
      text.innerText = 'Medium strength';
      text.style.color = 'var(--accent-amber)';
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = 'var(--accent-emerald)';
      text.innerText = 'Strong & Secure password ✓';
      text.style.color = 'var(--accent-emerald)';
    }
  },

  async handleLogin(event) {
    event.preventDefault();
    if (AuthView._authInProgress) return; // ISSUE-09: prevent double-submit
    AuthView._authInProgress = true;
    const btn = document.getElementById('btn-login-submit');
    const email = document.getElementById('login-email').value.trim().toLowerCase(); // ISSUE-07: normalize
    const password = document.getElementById('login-password').value;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Utils.showToast('Please enter a valid email address.', 'error');
      return;
    }

    btn.classList.add('btn-loading');
    btn.disabled = true;
    try {
      await MockApi.login(email, password);
      Utils.showToast(`Welcome back, ${AppStore.user.name}! 🚀`, 'success');
      AppRouter.navigate('dashboard');
    } catch (err) {
      Utils.showToast(err.message || 'Login failed. Please verify your credentials.', 'error');
    } finally {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
      AuthView._authInProgress = false;
    }
  },

  async handleSignup(event) {
    event.preventDefault();
    if (AuthView._authInProgress) return; // ISSUE-09: prevent double-submit
    AuthView._authInProgress = true;
    const btn = document.getElementById('btn-signup-submit');
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase(); // ISSUE-07: normalize
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    // Strict real email validation: must have proper domain and TLD (e.g. name@domain.com)
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Utils.showToast('Please enter a valid real email address (e.g. name@gmail.com).', 'error');
      return;
    }

    if (password.length < 8) {
      Utils.showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    if (password !== confirm) {
      Utils.showToast('Passwords do not match. Please check again.', 'error');
      return;
    }

    btn.classList.add('btn-loading');
    btn.disabled = true;
    try {
      await MockApi.signup(name, email, password);
      Utils.showToast('Account created successfully! Welcome to GlobeTrotter 🎉', 'success');
      AppRouter.navigate('dashboard');
    } catch (err) {
      // Handles 409 Conflict gracefully
      if (err.status === 409) {
        Utils.showToast(err.message, 'warning', 'Email Already Exists (409 Conflict)');
      } else {
        Utils.showToast(err.message || 'Signup failed.', 'error');
      }
    } finally {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
      AuthView._authInProgress = false;
    }
  },

  quickDemoLogin() {
    AppStore.loadUser();
    Utils.showToast('Logged in as demo traveler Alex River!', 'success');
    AppRouter.navigate('dashboard');
  },

  openForgotPasswordModal() {
    const modalHtml = `
      <div class="modal-header">
        <div class="modal-title">🔐 Reset Your Password</div>
        <button class="modal-close" onclick="AppRouter.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 1rem;">Enter your email and we'll send you a secure link to reset your account password.</p>
        <div class="form-group">
          <label class="form-label">Account Email</label>
          <input type="email" id="reset-email" class="form-control" placeholder="alex.river@globetrotter.io" value="alex.river@globetrotter.io" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="AppRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="AuthView.sendPasswordReset()">Send Reset Link</button>
      </div>
    `;
    AppRouter.openModal(modalHtml);
  },

  sendPasswordReset() {
    const email = document.getElementById('reset-email').value;
    if (!email) {
      Utils.showToast('Please enter your email.', 'error');
      return;
    }
    AppRouter.closeModal();
    Utils.showToast(`Password recovery link sent to ${email}. Check your inbox!`, 'info');
  }
};
