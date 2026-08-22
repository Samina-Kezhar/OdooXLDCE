/**
 * GlobeTrotter Spring Boot REST API Client with Seamless Offline/Local Fallback
 * Connects to live Spring Boot REST API endpoints and falls back gracefully to local storage when backend is offline.
 */

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.isBackendAvailable = null; // null = untested, true, false
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: { ...this.defaultHeaders, ...options.headers },
      credentials: 'same-origin'
    };

    try {
      const response = await fetch(url, fetchOptions);
      this.isBackendAvailable = true;

      // Handle Unauthorized
      if (response.status === 401 || response.status === 403) {
        if (typeof AppStore !== 'undefined' && AppStore.user) {
          AppStore.saveUser({ ...AppStore.user, isLoggedIn: false });
          if (typeof AppRouter !== 'undefined') AppRouter.navigate('auth');
          Utils.showToast('Session expired. Please log in again.', 'warning');
        }
        throw { status: response.status, message: 'Unauthorized. Please login.' };
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw { status: response.status, message: data?.message || `HTTP Error ${response.status}` };
      }

      return { status: response.status, data };
    } catch (error) {
      // If error is network failure (server not reachable)
      if (error.name === 'TypeError' || error.message?.includes('fetch') || !navigator.onLine) {
        this.isBackendAvailable = false;
        throw { status: 0, isNetworkError: true, message: 'Backend service offline or unreachable. Using local storage.' };
      }
      throw error;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    try {
      const res = await this._fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const user = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        avatar: CONFIG.AVATAR_PRESETS[0],
        bio: 'Explorer ready for new adventures! 🌍',
        homeCurrency: 'USD',
        preferredLanguage: 'English (US)',
        isLoggedIn: true
      };
      AppStore.saveUser(user);
      return { status: 200, data: user };
    } catch (err) {
      if (err.isNetworkError) {
        // Fallback to local login
        const user = {
          id: 'usr-' + Date.now(),
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          avatar: CONFIG.AVATAR_PRESETS[0],
          bio: 'Explorer ready for new adventures! 🌍',
          homeCurrency: 'USD',
          preferredLanguage: 'English (US)',
          isLoggedIn: true
        };
        AppStore.saveUser(user);
        return { status: 200, data: user };
      }
      throw err;
    }
  }

  async signup(name, email, password) {
    // 409 Conflict Simulation check
    if (email.toLowerCase().includes('taken') || email.toLowerCase() === 'existing@example.com') {
      throw { status: 409, message: `The email address '${email}' is already registered. Please login instead.` };
    }

    try {
      await this._fetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
    } catch (err) {
      if (!err.isNetworkError && err.status === 409) throw err;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: CONFIG.AVATAR_PRESETS[0],
      bio: 'New explorer eager to chart custom routes! 🌍',
      homeCurrency: 'USD',
      preferredLanguage: 'English (US)',
      isLoggedIn: true,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    AppStore.saveUser(newUser);
    return { status: 201, data: newUser };
  }

  // Trip Endpoints
  async getTrips() {
    try {
      const res = await this._fetch('/trips');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const frontendTrips = await Promise.all(res.data.map(async trip => this._transformBackendTrip(trip)));
        AppStore.trips = frontendTrips;
        return { status: 200, data: frontendTrips };
      }
    } catch (err) {
      // Fallback to local store
    }
    return { status: 200, data: [...AppStore.trips] };
  }

  async getTripById(tripId) {
    try {
      const res = await this._fetch(`/trips/${tripId}`);
      if (res.data) {
        return { status: 200, data: await this._transformBackendTrip(res.data) };
      }
    } catch (err) {
      // Fallback
    }
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) throw { status: 404, message: `Trip '${tripId}' not found.` };
    return { status: 200, data: JSON.parse(JSON.stringify(trip)) };
  }

  async createTrip(tripData) {
    const days = this._generateDaysBetween(tripData.startDate, tripData.endDate, tripData.destination);
    const newTrip = {
      id: 'trip-' + Date.now(),
      title: tripData.title || 'My New Journey',
      description: tripData.description || '',
      destination: tripData.destination || 'Global',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: Number(tripData.budget) || 0,
      currency: tripData.currency || 'USD',
      coverImage: tripData.coverImage || CONFIG.COVER_PRESETS[0].url,
      tags: tripData.tags || ['Adventure'],
      stops: tripData.stops || [
        {
          id: 'stop-' + Date.now(),
          cityName: tripData.destination || 'Main Destination',
          country: 'World',
          arrivalDate: tripData.startDate,
          departureDate: tripData.endDate,
          timeZone: 'UTC'
        }
      ],
      days: days
    };

    try {
      const res = await this._fetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          name: newTrip.title,
          description: JSON.stringify({
            desc: newTrip.description,
            dest: newTrip.destination,
            budget: newTrip.budget,
            currency: newTrip.currency
          }),
          startDate: newTrip.startDate,
          endDate: newTrip.endDate,
          coverPhoto: newTrip.coverImage
        })
      });
      if (res.data?.id) newTrip.id = res.data.id;
    } catch (err) {
      // Fallback to local persistence
    }

    const updated = [newTrip, ...AppStore.trips];
    AppStore.saveTrips(updated);
    AppStore.setCurrentTripId(newTrip.id);
    return { status: 201, data: newTrip };
  }

  async updateTrip(tripId, updateData) {
    const index = AppStore.trips.findIndex(t => t.id === tripId);
    if (index === -1) throw { status: 404, message: 'Trip not found.' };

    const currentTrip = AppStore.trips[index];
    if (updateData.startDate && updateData.endDate && 
       (updateData.startDate !== currentTrip.startDate || updateData.endDate !== currentTrip.endDate)) {
      currentTrip.days = this._adjustDaysForDateRange(currentTrip.days, updateData.startDate, updateData.endDate, updateData.destination || currentTrip.destination);
    }

    const updatedTrip = { ...currentTrip, ...updateData };
    AppStore.trips[index] = updatedTrip;
    AppStore.saveTrips(AppStore.trips);

    try {
      await this._fetch(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updatedTrip.title,
          description: JSON.stringify({
            desc: updatedTrip.description,
            dest: updatedTrip.destination,
            budget: updatedTrip.budget,
            currency: updatedTrip.currency
          }),
          startDate: updatedTrip.startDate,
          endDate: updatedTrip.endDate,
          coverPhoto: updatedTrip.coverImage
        })
      });
    } catch (e) {}

    return { status: 200, data: updatedTrip };
  }

  async deleteTrip(tripId) {
    try {
      await this._fetch(`/trips/${tripId}`, { method: 'DELETE' });
    } catch (e) {}

    const filtered = AppStore.trips.filter(t => t.id !== tripId);
    AppStore.saveTrips(filtered);
    if (AppStore.currentTripId === tripId) {
      AppStore.currentTripId = filtered[0]?.id || null;
    }
    return { status: 200, message: 'Trip deleted.' };
  }

  async cloneTrip(tripId) {
    const original = AppStore.trips.find(t => t.id === tripId);
    if (!original) throw { status: 404, message: 'Trip not found to clone.' };

    const cloned = JSON.parse(JSON.stringify(original));
    cloned.id = 'trip-copy-' + Date.now();
    cloned.title = `${original.title} (Copy)`;

    const updated = [cloned, ...AppStore.trips];
    AppStore.saveTrips(updated);
    AppStore.setCurrentTripId(cloned.id);
    return { status: 201, data: cloned };
  }

  // Activity Endpoints
  async addActivity(tripId, dayNumber, activityData) {
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) throw { status: 404, message: 'Trip not found.' };

    let day = trip.days.find(d => d.dayNumber === dayNumber);
    if (!day) {
      day = { dayNumber, date: trip.startDate, city: trip.destination, activities: [] };
      trip.days.push(day);
      trip.days.sort((a, b) => a.dayNumber - b.dayNumber);
    }

    const newActivity = {
      id: 'act-' + Date.now(),
      name: activityData.name || 'New Activity',
      category: activityData.category || 'sightseeing',
      startTime: activityData.startTime || '10:00',
      endTime: activityData.endTime || '12:00',
      cost: Number(activityData.cost) || 0,
      notes: activityData.notes || '',
      location: activityData.location || ''
    };

    day.activities.push(newActivity);
    AppStore.saveTrips(AppStore.trips);
    return { status: 201, data: newActivity };
  }

  async updateActivity(tripId, dayNumber, activityId, activityData) {
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) throw { status: 404, message: 'Trip not found.' };

    const day = trip.days.find(d => d.dayNumber === dayNumber);
    if (!day) throw { status: 404, message: 'Day not found.' };

    const actIndex = day.activities.findIndex(a => a.id === activityId);
    if (actIndex === -1) throw { status: 404, message: 'Activity not found.' };

    day.activities[actIndex] = { ...day.activities[actIndex], ...activityData };
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, data: day.activities[actIndex] };
  }

  async deleteActivity(tripId, dayNumber, activityId) {
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) throw { status: 404, message: 'Trip not found.' };

    const day = trip.days.find(d => d.dayNumber === dayNumber);
    if (!day) throw { status: 404, message: 'Day not found.' };

    day.activities = day.activities.filter(a => a.id !== activityId);
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, message: 'Activity removed.' };
  }

  // Internal Helpers
  async _transformBackendTrip(backendTrip) {
    let descObj = { desc: '', dest: 'Global', budget: 0, currency: 'USD' };
    try {
      if (backendTrip.description) descObj = JSON.parse(backendTrip.description);
    } catch (e) {}

    const days = this._generateDaysBetween(backendTrip.startDate, backendTrip.endDate, descObj.dest);

    return {
      id: backendTrip.id,
      title: backendTrip.name,
      description: descObj.desc,
      destination: descObj.dest,
      startDate: backendTrip.startDate,
      endDate: backendTrip.endDate,
      budget: Number(descObj.budget) || 0,
      currency: descObj.currency || 'USD',
      coverImage: backendTrip.coverPhoto || CONFIG.COVER_PRESETS[0].url,
      tags: ['Adventure'],
      days: days
    };
  }

  _generateDaysBetween(startDateStr, endDateStr, cityName) {
    const days = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.max(0, end - start);
    const numDays = Math.min(60, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      days.push({
        dayNumber: i + 1,
        date: currentDate.toISOString().split('T')[0],
        city: cityName || 'Destination',
        activities: []
      });
    }
    return days;
  }

  _adjustDaysForDateRange(existingDays, newStartStr, newEndStr, cityName) {
    const newDays = this._generateDaysBetween(newStartStr, newEndStr, cityName);
    newDays.forEach((newDay, idx) => {
      if (existingDays[idx]) {
        newDay.activities = existingDays[idx].activities;
        if (existingDays[idx].city) newDay.city = existingDays[idx].city;
      }
    });
    return newDays;
  }
}

window.MockApi = new ApiClient();
