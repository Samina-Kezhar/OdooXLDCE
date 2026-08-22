/**
 * GlobeTrotter VisitTheUSA-Inspired Motion & Animation Controller
 * Manages 3D card tilt, Ken Burns hero carousel, rotating headlines, story timer bars, and scroll reveals.
 */

const MotionEngine = {
  activeStoryIndex: 0,
  storyTimer: null,
  storyIntervalMs: 5000,
  headlineInterval: null,

  STORIES: [
    {
      id: 'story-paris',
      tag: 'Iconic Romance',
      title: 'Sunset over the Seine & Eiffel Lights',
      subtitle: 'Cruise along illuminated monuments with gourmet French wine and live jazz.',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Explore Paris Stops',
      route: 'search',
      params: { query: 'Paris' }
    },
    {
      id: 'story-tokyo',
      tag: 'Cyberpunk & Serenity',
      title: 'Neon Shinjuku Alleys & Ancient Shrines',
      subtitle: 'From Michelin-star ramen in lantern-lit lanes to tranquil bamboo gardens in Kyoto.',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Explore Tokyo Odyssey',
      route: 'search',
      params: { query: 'Tokyo' }
    },
    {
      id: 'story-swiss',
      tag: 'Alpine Majesty',
      title: 'Top of Europe: Jungfraujoch Glaciers',
      subtitle: 'Cogwheel trains ascending 3,454m through panoramic mountain wonderland.',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Discover Switzerland',
      route: 'search',
      params: { query: 'Zurich' }
    },
    {
      id: 'story-amalfi',
      tag: 'Coastal Bliss',
      title: 'Cliffside Terraces of Positano',
      subtitle: 'Crystal blue Mediterranean waters, lemon groves, and vintage convertible drives.',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      actionText: 'Plan Coastal Trip',
      route: 'create-trip',
      params: { destination: 'Amalfi Coast, Italy' }
    }
  ],

  init() {
    this.initScrollReveal();
    this.initCardTilt();
    this.initButtonRipples();
    this.initRotatingHeadline();
  },

  /**
   * 1. 3D Card Tilt with Glare Highlight
   */
  initCardTilt() {
    document.addEventListener('mousemove', e => {
      const cards = document.querySelectorAll('.glass-card-interactive, .destination-card, .tilt-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isHovered = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );

        if (isHovered) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
          const rotateY = ((x - centerX) / centerX) * 6;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          card.style.setProperty('--mouse-x', `${((x / rect.width) * 100).toFixed(1)}%`);
          card.style.setProperty('--mouse-y', `${((y / rect.height) * 100).toFixed(1)}%`);
        } else {
          card.style.transform = '';
        }
      });
    });
  },

  /**
   * 2. Rotating Animated Headline Words
   */
  initRotatingHeadline() {
    const words = document.querySelectorAll('.rotating-word');
    if (words.length === 0) return;

    let currentIndex = 0;
    if (this.headlineInterval) clearInterval(this.headlineInterval);

    this.headlineInterval = setInterval(() => {
      const current = words[currentIndex];
      currentIndex = (currentIndex + 1) % words.length;
      const next = words[currentIndex];

      if (current) {
        current.classList.remove('active');
        current.classList.add('exit');
        setTimeout(() => current.classList.remove('exit'), 600);
      }

      if (next) {
        next.classList.add('active');
      }
    }, 3200);
  },

  /**
   * 3. Story Carousel Component (VisitTheUSA Hero Stories)
   */
  renderStoryHero(containerId = 'story-hero-container') {
    const el = document.getElementById(containerId);
    if (!el) return;

    const story = this.STORIES[this.activeStoryIndex];

    el.innerHTML = `
      <div class="cinematic-hero tilt-card">
        <!-- Ambient Glow Orbs -->
        <div class="ambient-glow-orb orb-primary"></div>
        <div class="ambient-glow-orb orb-cyan"></div>

        <!-- Ken Burns Background Image -->
        <img src="${story.image}" alt="${story.title}" class="cinematic-hero-bg ken-burns" id="hero-bg-img" />
        <div class="cinematic-hero-overlay"></div>
        <div class="tilt-glare"></div>

        <!-- Content -->
        <div class="cinematic-hero-content animate-slide-up">
          <!-- Story Progress Indicators (VisitTheUSA Style) -->
          <div class="story-progress-indicators">
            ${this.STORIES.map((s, idx) => `
              <div class="story-progress-bar ${idx === this.activeStoryIndex ? 'active' : ''}" 
                onclick="MotionEngine.goToStory(${idx})" title="${s.title}">
                <div class="story-progress-fill" id="story-progress-${idx}" 
                  style="width: ${idx < this.activeStoryIndex ? '100%' : '0%'};"></div>
              </div>
            `).join('')}
          </div>

          <div class="flex items-center gap-2" style="margin-bottom: 0.75rem;">
            <span class="badge badge-cyan pulse-badge">
              <span class="pulse-dot"></span> Featured Experience
            </span>
            <span class="badge badge-primary">${story.tag}</span>
          </div>

          <h1 style="color: #fff; font-size: 2.3rem; margin-bottom: 0.5rem; text-shadow: 0 4px 20px rgba(0,0,0,0.6);">
            ${story.title}
          </h1>

          <p style="color: #e2e8f0; font-size: 1.05rem; margin-bottom: 1.5rem; line-height: 1.4; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            ${story.subtitle}
          </p>

          <div class="flex items-center gap-3" style="flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg ripple-effect" onclick="AppRouter.navigate('${story.route}', ${JSON.stringify(story.params || {}).replace(/"/g, '&quot;')})">
              <span>✨</span> ${story.actionText}
            </button>
            <button class="btn btn-secondary btn-lg ripple-effect" onclick="MotionEngine.nextStory()">
              Next Story &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    this.startStoryTimer();
  },

  startStoryTimer() {
    if (this.storyTimer) clearInterval(this.storyTimer);

    const activeBar = document.getElementById(`story-progress-${this.activeStoryIndex}`);
    if (!activeBar) return;

    let startTime = Date.now();
    const duration = this.storyIntervalMs;

    this.storyTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      if (activeBar) activeBar.style.width = `${pct}%`;

      if (elapsed >= duration) {
        clearInterval(this.storyTimer);
        this.nextStory();
      }
    }, 50);
  },

  goToStory(index) {
    if (this.storyTimer) clearInterval(this.storyTimer);
    this.activeStoryIndex = index;
    this.renderStoryHero();
  },

  nextStory() {
    this.activeStoryIndex = (this.activeStoryIndex + 1) % this.STORIES.length;
    this.renderStoryHero();
  },

  /**
   * 4. Scroll-Driven Stagger Reveal
   */
  initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  },

  /**
   * 5. Fluid Ripple Waves on Click
   */
  initButtonRipples() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple-wave');

      const existingRipple = btn.querySelector('.ripple-wave');
      if (existingRipple) existingRipple.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  }
};

window.MotionEngine = MotionEngine;
