/**
 * GlobeTrotter Spring Boot REST API Client
 */

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: { ...this.defaultHeaders, ...options.headers },
      // Crucial for Spring Security Session cookies
      credentials: 'true' === 'true' ? 'include' : 'same-origin'
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle Unauthorized
      if (response.status === 401 || response.status === 403) {
        if (AppStore && AppStore.user) {
           AppStore.saveUser({...AppStore.user, isLoggedIn: false});
           AppRouter.navigate('auth');
           this._showToast('Session expired. Please log in again.', 'error');
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
      if (!navigator.onLine) {
        throw { status: 0, message: 'No internet connection. Please check your network and try again.' };
      }
      throw error;
    }
  }

  _showToast(message, type) {
     const container = document.getElementById('toast-container');
     if (!container) return;
     const toast = document.createElement('div');
     toast.className = `toast toast-${type}`;
     toast.textContent = message;
     container.appendChild(toast);
     setTimeout(() => toast.remove(), 3000);
  }

  // Auth Endpoints
  async login(email, password) {
    const res = await this._fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    // Create a mock user object since backend doesn't return full profile on login
    const user = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: CONFIG.AVATAR_PRESETS[0],
      isLoggedIn: true
    };
    AppStore.saveUser(user);
    return { status: 200, data: user };
  }

  async signup(name, email, password) {
    const res = await this._fetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    const newUser = {
      id: 'usr-' + Date.now(),
      name: name,
      email: email,
      avatar: CONFIG.AVATAR_PRESETS[0],
      isLoggedIn: true
    };
    AppStore.saveUser(newUser);
    return { status: 201, data: newUser };
  }

  // Trip Endpoints
  async getTrips() {
    const res = await this._fetch('/trips');
    // Transform backend Trips to frontend model (with days)
    const frontendTrips = await Promise.all(res.data.map(async trip => this._transformBackendTrip(trip)));
    return { status: 200, data: frontendTrips };
  }

  async getTripById(tripId) {
    const res = await this._fetch(`/trips/${tripId}`);
    return { status: 200, data: await this._transformBackendTrip(res.data) };
  }

  async createTrip(tripData) {
    // 1. Create the trip
    const res = await this._fetch('/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: tripData.title || 'My New Journey',
        description: JSON.stringify({
            desc: tripData.description,
            dest: tripData.destination,
            budget: tripData.budget,
            currency: tripData.currency
        }), // Storing extra fields in description as JSON for now
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        coverPhoto: tripData.coverImage
      })
    });
    const backendTrip = res.data;

    // 2. Generate days and create stops for each day
    const days = this._generateDaysBetween(backendTrip.startDate, backendTrip.endDate, tripData.destination);
    
    for (let day of days) {
        await this._fetch(`/trips/${backendTrip.id}/stops`, {
            method: 'POST',
            body: JSON.stringify({
                cityName: day.city,
                country: 'Unknown',
                arrivalDate: day.date,
                departureDate: day.date,
                orderIndex: day.dayNumber
            })
        });
    }

    // Return the newly formatted trip
    const newTrip = await this.getTripById(backendTrip.id);
    const updatedTrips = [newTrip.data, ...AppStore.trips];
    AppStore.saveTrips(updatedTrips);
    AppStore.setCurrentTripId(newTrip.data.id);
    return { status: 201, data: newTrip.data };
  }

  async updateTrip(tripId, updateData) {
     // Backend doesn't have an update endpoint yet, mock it or implement it. 
     // For now, we will just update local store for smooth UX.
     console.warn("Backend update trip not implemented. Updating local store only.");
     const index = AppStore.trips.findIndex(t => t.id === tripId);
     const updatedTrip = { ...AppStore.trips[index], ...updateData };
     AppStore.trips[index] = updatedTrip;
     AppStore.saveTrips(AppStore.trips);
     return { status: 200, data: updatedTrip };
  }

  async deleteTrip(tripId) {
    await this._fetch(`/trips/${tripId}`, { method: 'DELETE' });
    const filtered = AppStore.trips.filter(t => t.id !== tripId);
    AppStore.saveTrips(filtered);
    if (AppStore.currentTripId === tripId) {
      AppStore.currentTripId = filtered[0]?.id || null;
    }
    return { status: 200, message: 'Trip successfully deleted.' };
  }

  async cloneTrip(tripId) {
    console.warn("Clone trip not supported by backend yet.");
    throw {status: 400, message: "Not supported"};
  }

  // Activity Operations
  async addActivity(tripId, dayNumber, activityData) {
    // 1. Find the stop ID corresponding to this dayNumber
    const stopsRes = await this._fetch(`/trips/${tripId}/stops`);
    const stop = stopsRes.data.find(s => s.orderIndex === dayNumber);
    
    if (!stop) throw { status: 404, message: 'Stop not found for this day.' };

    // 2. Add activity to that stop
    const res = await this._fetch(`/stops/${stop.id}/activities`, {
        method: 'POST',
        body: JSON.stringify({
            name: activityData.name,
            description: activityData.notes || activityData.location,
            type: activityData.category,
            estimatedCost: activityData.cost,
            startTime: `2026-01-01T${activityData.startTime}:00`, // dummy date, time is what matters
            endTime: `2026-01-01T${activityData.endTime}:00`
        })
    });

    const newActivity = {
      id: res.data.id,
      name: res.data.name,
      category: res.data.type,
      startTime: res.data.startTime ? res.data.startTime.split('T')[1].substring(0, 5) : '10:00',
      endTime: res.data.endTime ? res.data.endTime.split('T')[1].substring(0, 5) : '12:00',
      cost: res.data.estimatedCost || 0,
      notes: res.data.description,
      location: res.data.description
    };

    // Update local store to reflect
    const trip = AppStore.trips.find(t => t.id === tripId);
    const day = trip.days.find(d => d.dayNumber === dayNumber);
    day.activities.push(newActivity);
    AppStore.saveTrips(AppStore.trips);
    return { status: 201, data: newActivity };
  }

  async updateActivity(tripId, dayNumber, activityId, activityData) {
    console.warn("Backend update activity not implemented. Updating local store only.");
    const trip = AppStore.trips.find(t => t.id === tripId);
    const day = trip.days.find(d => d.dayNumber === dayNumber);
    const actIndex = day.activities.findIndex(a => a.id === activityId);
    day.activities[actIndex] = { ...day.activities[actIndex], ...activityData };
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, data: day.activities[actIndex] };
  }

  async deleteActivity(tripId, dayNumber, activityId) {
    const stopsRes = await this._fetch(`/trips/${tripId}/stops`);
    const stop = stopsRes.data.find(s => s.orderIndex === dayNumber);
    if (!stop) throw { status: 404, message: 'Stop not found.' };

    await this._fetch(`/stops/${stop.id}/activities/${activityId}`, { method: 'DELETE' });
    
    // Update local store
    const trip = AppStore.trips.find(t => t.id === tripId);
    const day = trip.days.find(d => d.dayNumber === dayNumber);
    day.activities = day.activities.filter(a => a.id !== activityId);
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, message: 'Activity removed.' };
  }

  // Internal Helpers
  async _transformBackendTrip(backendTrip) {
      let descObj = { desc: '', dest: 'Global', budget: 0, currency: 'USD' };
      try {
          if (backendTrip.description) descObj = JSON.parse(backendTrip.description);
      } catch(e) {}

      // Fetch stops and activities
      const stopsRes = await this._fetch(`/trips/${backendTrip.id}/stops`).catch(()=>({data:[]}));
      const days = [];

      for (let stop of stopsRes.data) {
          const actsRes = await this._fetch(`/stops/${stop.id}/activities`).catch(()=>({data:[]}));
          days.push({
              dayNumber: stop.orderIndex,
              date: stop.arrivalDate,
              city: stop.cityName,
              activities: actsRes.data.map(a => ({
                  id: a.id,
                  name: a.name,
                  category: a.type || 'sightseeing',
                  startTime: a.startTime ? a.startTime.split('T')[1].substring(0, 5) : '10:00',
                  endTime: a.endTime ? a.endTime.split('T')[1].substring(0, 5) : '12:00',
                  cost: a.estimatedCost || 0,
                  notes: a.description,
                  location: a.description
              }))
          });
      }

      // Sort days
      days.sort((a,b) => a.dayNumber - b.dayNumber);

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
}

window.MockApi = new ApiClient(); // Kept variable name MockApi so UI code doesn't break
