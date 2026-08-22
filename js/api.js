/**
 * GlobeTrotter Mock Spring Boot REST API Client
 * Simulates real REST endpoints, network latency, 409 Conflict, 404, 500 errors, and offline modes.
 */

class MockApiClient {
  constructor() {
    this.delay = CONFIG.API_DELAY_MS;
    this.forceFailNext = false;
  }

  // Simulated Async Latency helper
  async _simulateNetwork() {
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    if (this.forceFailNext) {
      this.forceFailNext = false;
      throw new Error('500 Internal Server Error: Failed to communicate with travel service.');
    }
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // Auth Endpoints
  async login(email, password) {
    await this._simulateNetwork();
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required.' };
    }
    // Demo accounts match or any valid password >= 6 chars
    const user = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      avatar: CONFIG.AVATAR_PRESETS[0],
      bio: 'Ready for new adventures across the globe! 🚀',
      homeCurrency: 'USD',
      preferredLanguage: 'English (US)',
      isLoggedIn: true,
      token: 'jwt_mock_token_' + Math.random().toString(36).substring(2)
    };
    AppStore.saveUser(user);
    return { status: 200, data: user };
  }

  async signup(name, email, password) {
    await this._simulateNetwork();
    // Simulate 409 Conflict if email is 'existing@example.com' or 'taken@globetrotter.io'
    if (email.toLowerCase().includes('taken') || email.toLowerCase() === 'existing@example.com') {
      throw { status: 409, message: `The email address '${email}' is already registered. Please login instead.` };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: CONFIG.AVATAR_PRESETS[Math.floor(Math.random() * CONFIG.AVATAR_PRESETS.length)],
      bio: 'New explorer eager to chart custom routes! 🌍',
      homeCurrency: 'USD',
      preferredLanguage: 'English (US)',
      isLoggedIn: true,
      registeredAt: new Date().toISOString().split('T')[0],
      token: 'jwt_mock_token_' + Math.random().toString(36).substring(2)
    };
    AppStore.saveUser(newUser);
    return { status: 201, data: newUser };
  }

  // Trip Endpoints
  async getTrips() {
    await this._simulateNetwork();
    return { status: 200, data: [...AppStore.trips] };
  }

  async getTripById(tripId) {
    await this._simulateNetwork();
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) {
      throw { status: 404, message: `Trip with ID '${tripId}' not found.` };
    }
    return { status: 200, data: JSON.parse(JSON.stringify(trip)) };
  }

  async createTrip(tripData) {
    await this._simulateNetwork();
    // Generate day list based on start & end dates
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

    const updatedTrips = [newTrip, ...AppStore.trips];
    AppStore.saveTrips(updatedTrips);
    AppStore.setCurrentTripId(newTrip.id);
    return { status: 201, data: newTrip };
  }

  async updateTrip(tripId, updateData) {
    await this._simulateNetwork();
    const index = AppStore.trips.findIndex(t => t.id === tripId);
    if (index === -1) {
      throw { status: 404, message: `Trip '${tripId}' not found.` };
    }

    const currentTrip = AppStore.trips[index];
    // Check if dates changed
    if (updateData.startDate && updateData.endDate && 
       (updateData.startDate !== currentTrip.startDate || updateData.endDate !== currentTrip.endDate)) {
      // Re-align days if date range changed
      currentTrip.days = this._adjustDaysForDateRange(currentTrip.days, updateData.startDate, updateData.endDate, updateData.destination || currentTrip.destination);
    }

    const updatedTrip = { ...currentTrip, ...updateData };
    AppStore.trips[index] = updatedTrip;
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, data: updatedTrip };
  }

  async deleteTrip(tripId) {
    await this._simulateNetwork();
    const filtered = AppStore.trips.filter(t => t.id !== tripId);
    if (filtered.length === AppStore.trips.length) {
      throw { status: 404, message: 'Trip not found.' };
    }
    AppStore.saveTrips(filtered);
    if (AppStore.currentTripId === tripId) {
      AppStore.currentTripId = filtered[0]?.id || null;
    }
    return { status: 200, message: 'Trip successfully deleted.' };
  }

  async cloneTrip(tripId) {
    await this._simulateNetwork();
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

  // Activity Operations
  async addActivity(tripId, dayNumber, activityData) {
    await this._simulateNetwork();
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
    await this._simulateNetwork();
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
    await this._simulateNetwork();
    const trip = AppStore.trips.find(t => t.id === tripId);
    if (!trip) throw { status: 404, message: 'Trip not found.' };

    const day = trip.days.find(d => d.dayNumber === dayNumber);
    if (!day) throw { status: 404, message: 'Day not found.' };

    day.activities = day.activities.filter(a => a.id !== activityId);
    AppStore.saveTrips(AppStore.trips);
    return { status: 200, message: 'Activity removed.' };
  }

  // Internal Helpers
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
    // Carry over activities for day indices that match
    newDays.forEach((newDay, idx) => {
      if (existingDays[idx]) {
        newDay.activities = existingDays[idx].activities;
        if (existingDays[idx].city) newDay.city = existingDays[idx].city;
      }
    });
    return newDays;
  }
}

window.MockApi = new MockApiClient();
