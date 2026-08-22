/**
 * Screen 12: User Profile & Settings View
 * Editable profile, avatar picker, theme toggle, currency selector, wishlist manager, and data backup/reset.
 */

const ProfileView = {
  selectedAvatarUrl: null,

  render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    const user = AppStore.user;
    const settings = AppStore.settings;
    const wishlistDests = CONFIG.DESTINATIONS.filter(d => AppStore.wishlist.includes(d.id));
    this.selectedAvatarUrl = user.avatar || CONFIG.AVATAR_PRESETS[0];

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 860px; margin: 0 auto;">
        <!-- Header -->
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
          <div>
            <div class="badge badge-primary" style="margin-bottom: 0.5rem;">Account & Preferences</div>
            <h1>User <span class="text-gradient">Profile & Settings</span></h1>
            <p>Manage your traveler identity, default currency, visual theme, and saved wishlist.</p>
          </div>
          <button class="btn btn-secondary" onclick="AppRouter.navigate('dashboard')">
            &larr; Dashboard
          </button>
        </div>

        <div class="glass-card" style="margin-bottom: 1.75rem;">
          <h3 style="margin-bottom: 1.25rem;">Personal Information</h3>

          <form id="form-profile" onsubmit="ProfileView.handleProfileSubmit(event)">
            <!-- Avatar Selector -->
            <div class="profile-avatar-selector">
              <img src="${this.selectedAvatarUrl}" id="avatar-preview-img" class="avatar-preview-lg" alt="Avatar" />
              <div>
                <div class="font-semibold" style="font-size: 0.9rem; margin-bottom: 0.5rem;">Choose Traveler Avatar</div>
                <div class="avatar-options-grid">
                  ${CONFIG.AVATAR_PRESETS.map(url => `
                    <img src="${url}" class="avatar-option-thumb ${url === this.selectedAvatarUrl ? 'selected' : ''}"
                      onclick="ProfileView.selectAvatar('${url}', this)" alt="Avatar Option" />
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="profile-name">Full Name <span class="required">*</span></label>
                <input type="text" id="profile-name" class="form-control" value="${Utils.escapeHtml(user.name)}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="profile-email">Email Address <span class="required">*</span></label>
                <input type="email" id="profile-email" class="form-control" value="${Utils.escapeHtml(user.email)}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="profile-bio">Bio & Travel Philosophy</label>
              <textarea id="profile-bio" class="form-control">${Utils.escapeHtml(user.bio || '')}</textarea>
            </div>

            <button type="submit" class="btn btn-primary">
              Save Profile Changes
            </button>
          </form>
        </div>

        <!-- Preferences & Theme Settings -->
        <div class="glass-card" style="margin-bottom: 1.75rem;">
          <h3 style="margin-bottom: 1.25rem;">App Preferences</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Home / Preferred Currency</label>
              <select id="pref-currency" class="form-control" onchange="ProfileView.updateCurrency(this.value)">
                ${CONFIG.CURRENCIES.map(c => `
                  <option value="${c.code}" ${c.code === (user.homeCurrency || 'USD') ? 'selected' : ''}>
                    ${c.name} (${c.symbol})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Visual Interface Theme</label>
              <select id="pref-theme" class="form-control" onchange="ProfileView.updateTheme(this.value)">
                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>🌙 Midnight Dark Glassmorphism</option>
                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>☀️ Crystal Light Glassmorphism</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Saved Wishlist Destinations -->
        <div class="glass-card" style="margin-bottom: 1.75rem;">
          <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
            <h3>Saved Wishlist (${wishlistDests.length})</h3>
            <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('search')">
              <span>🔍</span> Discover More
            </button>
          </div>

          ${wishlistDests.length === 0 ? `
            <p style="color: var(--text-subtle); font-style: italic;">No destinations bookmarked in your wishlist yet.</p>
          ` : `
            <div class="flex flex-col gap-2">
              ${wishlistDests.map(dest => `
                <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.75rem 1rem;">
                  <div class="flex items-center gap-3">
                    <img src="${dest.image}" style="width: 48px; height: 48px; border-radius: var(--radius-xs); object-fit: cover;" />
                    <div>
                      <div class="font-bold" style="font-size: 0.95rem;">${dest.name}, ${dest.country}</div>
                      <div style="font-size: 0.78rem; color: var(--accent-cyan);">${dest.region} &bull; ★ ${dest.rating}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="btn btn-primary btn-sm" onclick="DashboardView.planTripToDestination('${dest.id}')">
                      Plan Trip &rarr;
                    </button>
                    <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" onclick="ProfileView.removeFromWishlist('${dest.id}')">
                      Remove
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Data Management & Danger Zone -->
        <div class="glass-card" style="border-left: 4px solid var(--accent-rose);">
          <h3 style="margin-bottom: 0.5rem; color: var(--accent-rose);">Data Management & Reset</h3>
          <p style="font-size: 0.85rem; margin-bottom: 1.25rem;">Export your travel plans as a JSON backup, or reset your environment to the initial demo state.</p>

          <div class="flex items-center gap-3" style="flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="ProfileView.exportDataBackup()">
              <span>📥</span> Export JSON Backup
            </button>
            <button class="btn btn-secondary" onclick="ProfileView.promptResetDemo()">
              <span>🔄</span> Reset to Initial Demo Data
            </button>
            <button class="btn btn-danger" onclick="ProfileView.handleSignOut()">
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      </div>
    `;
  },

  selectAvatar(url, el) {
    this.selectedAvatarUrl = url;
    document.getElementById('avatar-preview-img').src = url;
    document.querySelectorAll('.avatar-option-thumb').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
  },

  handleProfileSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();

    AppStore.user.name = name;
    AppStore.user.email = email;
    AppStore.user.bio = bio;
    AppStore.user.avatar = this.selectedAvatarUrl;
    AppStore.saveUser(AppStore.user);

    Utils.showToast('Profile settings successfully saved!', 'success');
    this.render();
  },

  updateCurrency(currCode) {
    AppStore.user.homeCurrency = currCode;
    AppStore.saveUser(AppStore.user);
    Utils.showToast(`Default currency set to ${currCode}!`, 'success');
  },

  updateTheme(theme) {
    AppStore.settings.theme = theme;
    AppStore.saveSettings(AppStore.settings);
    document.documentElement.setAttribute('data-theme', theme);
    Utils.showToast(`Switched to ${theme} theme mode!`, 'info');
  },

  removeFromWishlist(destId) {
    AppStore.wishlist = AppStore.wishlist.filter(id => id !== destId);
    AppStore.saveWishlist(AppStore.wishlist);
    Utils.showToast('Removed from wishlist.', 'info');
    this.render();
  },

  exportDataBackup() {
    const data = {
      user: AppStore.user,
      trips: AppStore.trips,
      settings: AppStore.settings,
      wishlist: AppStore.wishlist,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globetrotter_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('JSON backup file downloaded!', 'success');
  },

  promptResetDemo() {
    if (confirm('Reset all trips and preferences to initial seed data?')) {
      AppStore.resetToDemo();
      Utils.showToast('All data reset to default demo seed data!', 'success');
      AppRouter.navigate('dashboard');
    }
  },

  handleSignOut() {
    AppStore.user.isLoggedIn = false;
    AppStore.saveUser(AppStore.user);
    Utils.showToast('You have been signed out.', 'info');
    AppRouter.navigate('auth');
  }
};
