(() => {
  // ------- Helpers -------
  const $ = (sel) => document.querySelector(sel);

  async function loadData(url = new URL('data.json', document.baseURI)) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to load data.json from:', url.toString(), err);
      throw err;
    }
  }

  function showLoadError(err) {
    const bioEl = $('#bio');
    if (bioEl) {
      bioEl.innerHTML = `<p class="muted">Unable to load profile data. Please try again later.</p>`;
    }
    console.error(err);
  }

  // --- Education grouped rendering with counts ---
  function renderEduGroupWithCount(rootId, countId, items = []) {
    const root = document.getElementById(rootId);
    const countEl = document.getElementById(countId);
    if (!root || !countEl) return;

    root.innerHTML = '';
  // Hide badges site-wide (no badge images will be rendered)
  const showBadge = false;
    (items || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'edu';
      // Mark entries where no badge is shown so CSS can make them span full width
      if (!showBadge) div.classList.add('no-badge');
      div.innerHTML = `
        ${showBadge && item.badge ? `<img src="${item.badge}" alt="${item.title} badge" />` : ``}
        <div>
          <h4>${item.title}</h4>
          <p>${item.date || ''}</p>
          ${item.issuer ? `<p class="muted">${item.issuer}</p>` : ''}
        </div>
      `;
      root.appendChild(div);
    });

    // Update count
    countEl.textContent = String(items.length);

    // Optionally hide the whole group if empty:
    const wrapper = root.closest('.edugroup');
    if (wrapper) wrapper.style.display = items.length ? '' : 'none';
  }

  function groupEducation(list = []) {
    const norm = (k) => (k || 'certification').toLowerCase();
    const groups = { education: [], certification: [], training: [] };
    list.forEach(item => {
      const kind = norm(item.kind);
      if (groups[kind]) groups[kind].push(item);
      else groups.certification.push(item); // fallback
    });
    return groups;
  }

  function renderProjects(projects = []) {
    const root = document.getElementById('projects-list');
    if (!root) return;
    root.innerHTML = '';

    projects.forEach(p => {
      const details = document.createElement('details');
      details.className = 'edugroup'; // reuse same look & feel
      // closed by default, so no `open` attribute

      details.innerHTML = `
        <summary>
          <span class="chev" aria-hidden="true">▸</span>
          <span class="label">${p.name || 'Untitled Project'}</span>
        </summary>
        <div class="proj-body">
          ${p.description ? `<p>${p.description}</p>` : ''}
          ${p.image ? `<div class="proj-img"><img src="${p.image}" alt="${p.name} preview" /></div>` : ''}
          ${p.url ? `
            <p style="margin-top:10px;">
              <a class="proj-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Open project: ${p.name}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/>
                </svg>
                Visit project
              </a>
            </p>` : ''}
        </div>
      `;

      root.appendChild(details);
    });
  }

  // ------- Hydration -------
  function hydrate(DATA) {
    const nameNorm = document.getElementById('name-normal');
    const nameAure = document.getElementById('name-aurebesh');
    if (nameNorm)  nameNorm.textContent  = DATA.name || 'Your Name';
    if (nameAure)  nameAure.textContent  = DATA.name || 'Your Name';
    const initialsEl = $('#initials');
    const taglineEl = $('#tagline');
    const bioEl = $('#bio');
    const contactIcons = $('#contact-icons');
    const yearEl = $('#year');

    const photoWrap = document.getElementById('profile-photo-wrap');
    const photoEl   = document.getElementById('profile-photo');

    if (photoEl && DATA.photo) {
      photoEl.src = DATA.photo;
      photoEl.alt = `Portrait of ${DATA.name || 'me'}`;
      if (photoWrap) photoWrap.hidden = false;
    } else if (photoWrap) {
      photoWrap.hidden = true;
    }

    // if (nameEl) nameEl.textContent = DATA.name || 'Your Name';
    if (initialsEl) {
      initialsEl.textContent = (DATA.initials || (DATA.name || 'YN')
        .split(' ').map(w => w[0]).join(''))
        .slice(0, 3).toUpperCase();
    }
    if (taglineEl) taglineEl.textContent = DATA.tagline || '';
    if (bioEl) {
      bioEl.innerHTML = (DATA.bio || '')
        .split(/\n\n+/)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Home hero content ---
    const homeTitle = document.getElementById('home-title');
    const homeSubtitle = document.getElementById('home-subtitle');
    if (homeTitle)  homeTitle.textContent = `Howdy, I am ${DATA.name || 'Sarah Burke'}.`;
    if (homeSubtitle) {
      homeSubtitle.textContent = "Registered Nurse | Critical Care Nurse | Patient Advocate | AACN Member | Lifelong Learner";
    }

    // --- Home icons (reuse same markup as contact icons) ---
    const homeIcons = document.getElementById('home-icons');
    if (homeIcons) {
      homeIcons.innerHTML = `
        <a href="mailto:${DATA.emails?.tech || ''}" aria-label="Tech Email" title="Contact Me">
          <i class="fa-solid fa-envelope" aria-hidden="true"></i>
        </a>
        <a href="license-verification.pdf" download aria-label="Nursing License Verification" title="Nursing License Verification">
          <i class="fa-solid fa-user-nurse" aria-hidden="true"></i>
        </a>
        <a href="${DATA.social?.github || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
          <i class="fa-brands fa-github" aria-hidden="true"></i>
        </a>
        <a href="${DATA.social?.instagram || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
          <i class="fa-brands fa-instagram" aria-hidden="true"></i>
        </a>
      `;
    }


    // Contact icons with hover tooltips
    if (contactIcons) {
      contactIcons.innerHTML = `
        <a href="mailto:${DATA.emails?.tech || ''}" aria-label="Tech Email" title="Contact Me">
          <i class="fa-solid fa-envelope" aria-hidden="true"></i>
        </a>
        <a href="${DATA.social?.github || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
          <i class="fa-brands fa-github" aria-hidden="true"></i>
        </a>
        <a href="license-verification.pdf" download aria-label="Nursing License Verification" title="Nursing License Verification">
          <i class="fa-solid fa-user-nurse" aria-hidden="true"></i>
        </a>
        <a href="${DATA.social?.instagram || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
          <i class="fa-brands fa-instagram" aria-hidden="true"></i>
        </a>
      `;
    }

    // Education groups
    const groups = groupEducation(DATA.education || []);
    renderEduGroupWithCount('edu-education', 'count-education', groups.education);
    renderEduGroupWithCount('edu-certification', 'count-certification', groups.certification);
    renderEduGroupWithCount('edu-training', 'count-training', groups.training);

    // Work timeline
    const workRoot = $('#work-list');
    if (workRoot) {
      workRoot.innerHTML = '';
      (DATA.work || []).forEach(job => {
        const wrap = document.createElement('article');
        wrap.className = 'job';
        const bullets = (job.bullets || []).map(b => `<li>${b}</li>`).join('');
        wrap.innerHTML = `
          <h4>${job.role} · ${job.org}</h4>
          <div class="meta">${job.period}${job.location ? ' • ' + job.location : ''}</div>
          ${bullets ? `<ul>${bullets}</ul>` : ''}
        `;
        workRoot.appendChild(wrap);
      });
    }

    // Projects
    renderProjects(DATA.projects || []);
  }



  // ------- Tabs -------
  function setActive(targetId) {
    document.querySelectorAll('section.card').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav .tab').forEach(btn => {
      btn.setAttribute('aria-current', btn.dataset.target === targetId ? 'page' : 'false');
    });
    const h = target && target.querySelector('h2');
    if (h && typeof h.focus === 'function') h.focus();
  }

  function wireTabs() {
    document.querySelectorAll('.nav .tab').forEach(btn => {
      btn.addEventListener('click', () => setActive(btn.dataset.target));
    });
  }

  // ------- Boot -------
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await loadData(); // change to absolute URL later if you host off-site
      hydrate(data);
    } catch (e) {
      showLoadError(e);
    } finally {
      wireTabs();
      setActive('home');
    }
  });
})();
