/**
 * GlobeTrotter Main SPA Router & Application Bootloader
 * Manages hash routing, navigation state, modals, network lifecycle, and keyboard events.
 */

const AppRouter = {
  routes: {
    'auth': AuthView,
    'dashboard': DashboardView,
    'create-trip': CreateTripView,
    'my-trips': TripListView,
    'itinerary-builder': ItineraryBuilderView,
    'itinerary-view': ItineraryView,
    'search': SearchView,
    'budget': BudgetView,
    'calendar': CalendarView,
    'shared-trip': SharedTripView,
    'profile': ProfileView,
    'admin': AdminView
  },

  currentRoute: 'dashboard',
  routeParams: null,

  init() {
    // Apply saved theme
    const theme = AppStore.settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Setup network listeners for offline edge-case
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
    if (!navigator.onLine) this.handleOnlineStatus(false);

    // Setup hash change listener
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Subscribe to state updates
    AppStore.subscribe('user:updated', user => this.updateUserNavbar(user));
    AppStore.subscribe('trips:updated', () => this.updateNavCounts());
    AppStore.subscribe('settings:updated', s => document.documentElement.setAttribute('data-theme', s.theme));

    // Global Modal Escape listener
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });

    // Close modal on backdrop click
    const backdrop = document.getElementById('modal-container');
    if (backdrop) {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) this.closeModal();
      });
    }

    // Initial load
    this.updateUserNavbar(AppStore.user);
    this.updateNavCounts();
    if (typeof MotionEngine !== 'undefined') MotionEngine.init();
    this.handleHashChange();
  },

  navigate(route, params = null) {
    this.routeParams = params;
    let hash = `#${route}`;
    if (params && typeof params === 'string') {
      hash += `?id=${params}`;
    }
    window.location.hash = hash;
  },

  handleHashChange() {
    let hash = window.location.hash.replace(/^#/, '') || 'dashboard';
    let [route, queryString] = hash.split('?');
    
    // Parse query params if any
    let params = this.routeParams;
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      const id = urlParams.get('id');
      if (id) params = id;
    }

    // Route guard: If not logged in and not on auth, allow guest or route
    if (!AppStore.user?.isLoggedIn && route !== 'auth' && route !== 'shared-trip') {
      route = 'auth';
    }

    this.currentRoute = route;
    const view = this.routes[route] || DashboardView;

    // Update active nav items
    this.updateActiveNavLinks(route);

    // Update Breadcrumbs
    this.updateBreadcrumbs(route);

    // Render View
    try {
      view.render(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(`Failed to render view: ${route}`, e);
    }
  },

  updateActiveNavLinks(route) {
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
      const target = el.getAttribute('data-route');
      el.classList.toggle('active', target === route);
    });
  },

  updateBreadcrumbs(route) {
    const el = document.getElementById('page-breadcrumb-current');
    if (!el) return;

    const names = {
      'auth': 'Authentication',
      'dashboard': 'Dashboard',
      'create-trip': 'Plan New Trip',
      'my-trips': 'My Trips',
      'itinerary-builder': 'Itinerary Builder',
      'itinerary-view': 'Reader View',
      'search': 'Destination & Activity Search',
      'budget': 'Financial & Cost Breakdown',
      'calendar': 'Calendar & Timeline Flow',
      'shared-trip': 'Public Shareable View',
      'profile': 'Profile & Settings',
      'admin': 'Admin Metrics'
    };
    el.innerText = names[route] || 'Overview';
  },

  updateUserNavbar(user) {
    const isLoggedIn = !!user?.isLoggedIn;
    
    // Toggle visibility of authenticated-only UI elements
    const authElements = [
      '.sidebar-nav',
      '.sidebar-footer',
      '#mobile-nav',
      '#btn-topbar-plan-trip',
      '.search-quick-bar',
      '.sidebar-toggle-btn'
    ];
    
    authElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
      });
    });

    // Update user profile info in sidebar
    const nameEl = document.getElementById('user-sidebar-name');
    const emailEl = document.getElementById('user-sidebar-email');
    const avatarEl = document.getElementById('user-sidebar-avatar');

    if (nameEl) nameEl.innerText = user?.name || '';
    if (emailEl) emailEl.innerText = user?.email || '';
    if (avatarEl && user?.avatar) avatarEl.src = user.avatar;
  },

  updateNavCounts() {
    const badge = document.getElementById('my-trips-count-badge');
    if (badge) {
      badge.innerText = AppStore.trips.length;
    }
  },

  // Modal Dialog System
  openModal(innerHtml) {
    const container = document.getElementById('modal-container');
    const box = document.getElementById('modal-box-content');
    if (!container || !box) return;

    box.innerHTML = innerHtml;
    container.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.classList.remove('active');
    document.body.style.overflow = '';
  },

  // Network Offline / Online Handler
  handleOnlineStatus(isOnline) {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = isOnline ? 'none' : 'flex';
    }

    if (!isOnline) {
      Utils.showToast('You are currently offline. Local changes will be saved to device storage.', 'warning', 'No Internet Connection');
    } else {
      Utils.showToast('Network restored! You are back online.', 'success', 'Connection Restored');
    }
  },

  // Mobile Sidebar Drawer Toggle
  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  },

  // Quick Topbar Search Handler
  handleQuickSearch(event) {
    if (event.key === 'Enter') {
      const q = event.target.value.trim();
      if (q) {
        SearchView.searchQuery = q;
        this.navigate('search');
        event.target.value = '';
      }
    }
  }
};

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});
