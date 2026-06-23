// === VOXMO — Tableau de bord administrateur ===
// Tout en français, toasts non bloquants, modales de confirmation, upload d'image.

const TOKEN_KEY = 'voxmo_admin_token';
const USER_KEY = 'voxmo_admin_user';
const WELCOME_KEY = 'voxmo_welcome_seen';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const loginBox = $('#adminLogin');
const dash = $('#adminDash');
const loginForm = $('#loginForm');
const loginErr = $('#loginError');
const loginHint = $('#loginHint');
const adminEmailSpan = $('#adminEmail');
const pwdInput = $('#loginPassword');
const pwdToggle = $('#pwdToggle');
const logoutBtn = $('#logoutBtn');
const refreshBtn = $('#refreshBtn');

const toastStack = $('#toastStack');
const vehModal = $('#vehModal');
const vehForm = $('#vehForm');
const vehErr = $('#vehError');
const vehBody = $('#vehBody');
const vehCountEl = $('#vehCount');
const vehSearch = $('#vehSearch');
const addVehBtn = $('#addVehBtn');
const closeVehModal = $('#closeVehModal');
const cancelVehBtn = $('#cancelVehBtn');
const vehImgPreview = $('#vehImgPreview');
const vehImgBadge = $('#vehImgBadge');
const vehImgClear = $('#vehImgClear');
const vImgHidden = $('#vImg');
const vImgUrl = $('#vImgUrl');
const vActive = $('#vActive');
const vName = $('#vName');
const vPrice = $('#vPrice');
const vCategory = $('#vCategory');
const vRating = $('#vRating');
const vTag = $('#vTag');
const vSpecs = $('#vSpecs');
const modalTitle = $('#modalTitle');
const fileInput = $('#fileInput');
const dropzone = $('#dropzone');
const uploadStatus = $('#uploadStatus');
const msgModal = $('#msgModal');
const msgBody = $('#msgBody');
const msgMeta = $('#msgMeta');
const msgReply = $('#msgReply');
const confirmModal = $('#confirmModal');
const confirmTitle = $('#confirmTitle');
const confirmText = $('#confirmText');
const confirmExtra = $('#confirmExtra');
const confirmInput = $('#confirmInput');
const confirmInputLabel = $('#confirmInputLabel');
const confirmOk = $('#confirmOk');
const confirmCancel = $('#confirmCancel');
const confirmIcon = $('#confirmIcon');

let editingSlug = null;
let allVehicles = [];

// ===== AUTH STORAGE =====
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ===== TOASTS =====
function toast(msg, type = 'success', duration = 3500) {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'check-circle'
              : type === 'error'   ? 'circle-exclamation'
              : type === 'info'    ? 'circle-info'
                                   : 'triangle-exclamation';
  t.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${esc(msg)}</span>`;
  toastStack.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ===== MODALE DE CONFIRMATION GÉNÉRIQUE =====
function askConfirm({ title, text, danger = true, requireText = null, okLabel = 'Confirmer', cancelLabel = 'Annuler' }) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmText.textContent = text;
    confirmOk.textContent = okLabel;
    confirmCancel.textContent = cancelLabel;
    confirmOk.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    confirmIcon.innerHTML = danger
      ? '<i class="fa-solid fa-triangle-exclamation"></i>'
      : '<i class="fa-solid fa-circle-question"></i>';

    if (requireText) {
      confirmExtra.hidden = false;
      confirmInputLabel.innerHTML = `Pour confirmer, tapez <code>${esc(requireText)}</code> :`;
      confirmInput.value = '';
      confirmOk.disabled = true;
      confirmInput.oninput = () => {
        confirmOk.disabled = confirmInput.value.trim() !== requireText;
      };
    } else {
      confirmExtra.hidden = true;
      confirmInput.oninput = null;
    }

    showModal(confirmModal);
    setTimeout(() => requireText ? confirmInput.focus() : confirmOk.focus(), 50);

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    function cleanup() {
      confirmOk.removeEventListener('click', onOk);
      confirmCancel.removeEventListener('click', onCancel);
      hideModal(confirmModal);
    }
    confirmOk.addEventListener('click', onOk);
    confirmCancel.addEventListener('click', onCancel);
  });
}

function showModal(m) { m.hidden = false; m.setAttribute('aria-hidden', 'false'); }
function hideModal(m) { m.hidden = true; m.setAttribute('aria-hidden', 'true'); }

// ===== API =====
async function api(url, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const tok = getToken();
  if (tok) headers['Authorization'] = 'Bearer ' + tok;
  const r = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  if (r.status === 401) {
    clearAuth();
    showLogin();
    throw new Error('Session expirée');
  }
  let j;
  try { j = await r.json(); } catch { throw new Error('Réponse serveur invalide'); }
  if (!r.ok || j.ok === false) {
    const err = new Error(j?.error || `Erreur ${r.status}`);
    err.payload = j;
    throw err;
  }
  return j;
}

// ===== NAV =====
function showLogin() {
  loginBox.hidden = false;
  dash.hidden = true;
  if (!localStorage.getItem(WELCOME_KEY) && !getToken()) {
    loginHint.hidden = false;
  }
}
function showDash() {
  loginBox.style.display = 'none';
  dash.hidden = false;
  const u = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  if (u) adminEmailSpan.textContent = u.email;
  loadStats();
  loadReservations();
  loadContacts();
}

// ===== LOGIN =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErr.textContent = '';
  const email = $('#loginEmail').value.trim();
  const password = pwdInput.value;
  if (!email || !password) {
    loginErr.textContent = 'Remplissez les deux champs.';
    return;
  }
  const btn = $('#loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connexion…';
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const j = await r.json();
    if (!r.ok || !j.ok) {
      loginErr.textContent = j.error === 'invalid_credentials'
        ? 'E-mail ou mot de passe incorrect.'
        : (j.error || 'Erreur de connexion.');
      return;
    }
    setToken(j.token);
    localStorage.setItem(USER_KEY, JSON.stringify(j.user));
    showDash();
  } catch (err) {
    loginErr.textContent = 'Connexion au serveur impossible.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Se connecter';
  }
});

pwdToggle?.addEventListener('click', () => {
  const isPwd = pwdInput.type === 'password';
  pwdInput.type = isPwd ? 'text' : 'password';
  pwdToggle.querySelector('i').className = isPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  pwdInput.focus();
});

logoutBtn?.addEventListener('click', async () => {
  const ok = await askConfirm({
    title: 'Se déconnecter ?',
    text: 'Vous devrez vous reconnecter pour accéder au tableau de bord.',
    danger: false,
    okLabel: 'Oui, me déconnecter'
  });
  if (!ok) return;
  clearAuth();
  showLogin();
  toast('À bientôt.', 'info', 2000);
});

refreshBtn?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualisation…';
  try {
    await Promise.all([loadStats(), loadReservations(), loadContacts()]);
    toast('Données à jour.', 'success', 1500);
  } catch {
    toast('Erreur de chargement.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
});


// ===== TABS =====
$$('.a-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.a-tab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    $$('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const id = 'tab-' + btn.dataset.tab;
    const panel = document.getElementById(id);
    if (panel) panel.classList.add('active');
  });
});

// ===== STATS =====
async function loadStats() {
  try {
    const j = await api('/api/admin/stats');
    if (!j.ok) return;
    $('#statRes').textContent = j.stats.confirmedReservations;
    $('#statRev').textContent = (j.stats.revenue || 0) + ' €';
    $('#statContact').textContent = j.stats.contacts;
    $('#statVeh').textContent = j.stats.activeVehicles;
    renderVehicles(j.vehicles || []);
    renderCharts(j.stats || {});
  } catch (err) {
    toast('Chargement impossible.', 'error');
  }
}

// ===== RÉSERVATIONS =====
async function loadReservations() {
  const body = $('#resBody');
  body.innerHTML = `<tr><td colspan="8" class="a-empty">Chargement…</td></tr>`;
  try {
    const j = await api('/api/admin/reservations');
    if (!j.reservations || j.reservations.length === 0) {
      body.innerHTML = `<tr><td colspan="8" class="a-empty">
        <i class="fa-regular fa-calendar-xmark"></i><br>Aucune réservation pour l'instant.
      </td></tr>`;
      return;
    }
    body.innerHTML = j.reservations.map(r => {
      const stateLabel = r.status === 'confirmed' ? 'Confirmée' : 'Annulée';
      return `
        <tr>
          <td><code>${esc(r.booking_id)}</code></td>
          <td><strong>${esc(r.vehicle_name || r.vehicle_slug)}</strong></td>
          <td>${esc(r.start_date)}<br><span class="dim">→</span> ${esc(r.end_date)}</td>
          <td>${esc(r.pickup)}<br><span class="dim">→</span> ${esc(r.dropoff)}</td>
          <td>${esc(r.driver_name)}<br><a href="mailto:${esc(r.driver_email)}" class="link">${esc(r.driver_email)}</a></td>
          <td><strong>${r.total} €</strong></td>
          <td><span class="a-status ${r.status === 'confirmed' ? 'confirmed' : 'cancelled'}">${stateLabel}</span></td>
          <td class="td-actions">
            ${r.status === 'confirmed' ? `<button class="btn btn-sm btn-danger-ghost" data-id="${esc(r.booking_id)}" data-name="${esc(r.vehicle_name || r.vehicle_slug)}">
              <i class="fa-solid fa-ban"></i> Annuler
            </button>` : '<span class="dim">—</span>'}
          </td>
        </tr>`;
    }).join('');

    $$('.btn-danger-ghost[data-id]', body).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const ok = await askConfirm({
          title: 'Annuler cette réservation ?',
          text: `La réservation ${id} (${btn.dataset.name}) passera à l'état annulé. Cette action est définitive.`,
          okLabel: 'Oui, annuler'
        });
        if (!ok) return;
        try {
          await api(`/api/admin/reservations/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
          toast('Réservation annulée.', 'success');
          loadStats(); loadReservations();
        } catch (err) {
          toast(err.message || 'Annulation échouée.', 'error');
        }
      });
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="8" class="a-empty a-empty-error">${esc(err.message)}</td></tr>`;
  }
}

// ===== MESSAGES =====
async function loadContacts() {
  const body = $('#contactBody');
  body.innerHTML = `<tr><td colspan="5" class="a-empty">Chargement…</td></tr>`;
  try {
    const j = await api('/api/admin/contacts?limit=200');
    if (!j.contacts || j.contacts.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="a-empty">
        <i class="fa-regular fa-envelope-open"></i><br>Aucun message reçu.
      </td></tr>`;
      return;
    }
    body.innerHTML = j.contacts.map((c, i) => {
      const date = c.created_at ? c.created_at.replace('T', ' ').slice(0, 16) : '';
      const preview = (c.message || '').slice(0, 80) + ((c.message || '').length > 80 ? '…' : '');
      return `
        <tr class="row-clickable" data-i="${i}">
          <td>${esc(date)}</td>
          <td><strong>${esc(c.name)}</strong></td>
          <td>${c.email ? `<a href="mailto:${esc(c.email)}" class="link" onclick="event.stopPropagation()">${esc(c.email)}</a>` : '—'}</td>
          <td>${c.subject ? esc(c.subject) : '<span class="dim">—</span>'}</td>
          <td class="msg-preview">${esc(preview)}</td>
        </tr>`;
    }).join('');
    const data = j.contacts;
    $$('.row-clickable', body).forEach(row => {
      row.addEventListener('click', () => openMessage(data[Number(row.dataset.i)]));
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="a-empty a-empty-error">${esc(err.message)}</td></tr>`;
  }
}

function openMessage(c) {
  const date = c.created_at ? c.created_at.replace('T', ' ').slice(0, 16) : '—';
  msgMeta.innerHTML = `
    <dt>Reçu le</dt><dd>${esc(date)}</dd>
    <dt>Nom</dt><dd>${esc(c.name)}</dd>
    <dt>E-mail</dt><dd>${c.email ? `<a href="mailto:${esc(c.email)}" class="link">${esc(c.email)}</a>` : '—'}</dd>
    <dt>Téléphone</dt><dd>${c.phone ? esc(c.phone) : '—'}</dd>
    <dt>Sujet</dt><dd>${c.subject ? esc(c.subject) : '—'}</dd>
  `;
  msgBody.textContent = c.message || '';
  if (c.email) {
    msgReply.href = `mailto:${c.email}?subject=${encodeURIComponent('Re: ' + (c.subject || 'Votre message'))}`;
    msgReply.style.display = '';
  } else {
    msgReply.style.display = 'none';
  }
  showModal(msgModal);
}

$('#closeMsgModal')?.addEventListener('click', () => hideModal(msgModal));
$('#msgClose')?.addEventListener('click', () => hideModal(msgModal));
msgModal?.addEventListener('click', e => { if (e.target === msgModal) hideModal(msgModal); });

// ===== VÉHICULES =====
function slugify(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function renderVehicles(vehicles) {
  if (!vehBody) return;
  allVehicles = vehicles;
  const q = (vehSearch?.value || '').trim().toLowerCase();
  const filtered = q
    ? vehicles.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.slug.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q))
    : vehicles;
  if (vehCountEl) {
    vehCountEl.textContent = q
      ? `${filtered.length} véhicule(s) sur ${vehicles.length}`
      : `${vehicles.length} véhicule(s) au total`;
  }
  if (filtered.length === 0) {
    vehBody.innerHTML = `<tr><td colspan="6" class="a-empty">
      ${q ? `<i class="fa-solid fa-magnifying-glass"></i><br>Aucun véhicule ne correspond à « ${esc(q)} ».` : `<i class="fa-solid fa-car"></i><br>Aucun véhicule dans la flotte.`}
    </td></tr>`;
    return;
  }
  vehBody.innerHTML = filtered.map(v => {
    const isUnsplash = v.img && !v.img.startsWith('/');
    const src = isUnsplash ? `https://images.unsplash.com/${v.img}?w=160&auto=format&fit=crop` : v.img;
    return `
      <tr>
        <td><div class="veh-thumb"><img src="${esc(src)}" alt="${esc(v.name)}" loading="lazy"></div></td>
        <td><strong>${esc(v.name)}</strong><br><code class="dim">${esc(v.slug)}</code></td>
        <td><strong>${v.price} €</strong></td>
        <td><span class="cat-pill cat-${esc(v.category)}">${esc(v.category)}</span></td>
        <td>${v.tag ? `<span class="dim">${esc(v.tag)}</span>` : '<span class="dim">—</span>'}<br><span class="dim">${v.rating || '—'}</span>★</td>
        <td>
          <span class="a-status ${v.active ? 'active' : 'inactive'}">
            ${v.active ? 'En location' : 'Retiré'}
          </span>
        </td>
        <td class="td-actions">
          <div class="row-actions">
            <button class="btn btn-sm btn-ghost" data-act="edit" data-slug="${esc(v.slug)}" title="Modifier">
              <i class="fa-solid fa-pen"></i> Modifier
            </button>
            <button class="btn btn-sm btn-ghost" data-act="toggle" data-slug="${esc(v.slug)}" title="${v.active ? 'Retirer de la location' : 'Remettre en location'}">
              <i class="fa-solid fa-${v.active ? 'eye-slash' : 'eye'}"></i> ${v.active ? 'Masquer' : 'Remettre'}
            </button>
            <button class="btn btn-sm btn-danger-ghost" data-act="delete" data-slug="${esc(v.slug)}" title="Supprimer définitivement">
              <i class="fa-solid fa-trash"></i> Supprimer
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  $$('button[data-act]', vehBody).forEach(btn => {
    btn.addEventListener('click', () => {
      const v = allVehicles.find(x => x.slug === btn.dataset.slug);
      if (!v) return;
      const act = btn.dataset.act;
      if (act === 'edit') openModal(v);
      else if (act === 'toggle') toggleVehicle(v);
      else if (act === 'delete') deleteVehicle(v);
    });
  });
}

// Délégation : marque les miniatures d'image cassées (remplace l'ancien onerror inline)
vehBody?.addEventListener('error', e => {
  if (e.target.tagName === 'IMG' && e.target.parentNode?.classList.contains('veh-thumb')) {
    e.target.parentNode.classList.add('no-img');
  }
}, true);

async function toggleVehicle(v) {
  const ok = await askConfirm({
    title: v.active ? 'Retirer ce véhicule ?' : 'Remettre ce véhicule ?',
    text: v.active
      ? `Le véhicule « ${v.name} » ne sera plus réservable. Vous pourrez le remettre à tout moment.`
      : `Le véhicule « ${v.name} » sera à nouveau réservable.`,
    danger: !v.active,
    okLabel: v.active ? 'Oui, masquer' : 'Oui, remettre'
  });
  if (!ok) return;
  try {
    await api(`/api/admin/vehicles/${encodeURIComponent(v.slug)}/toggle`, { method: 'PATCH' });
    toast(v.active ? `« ${v.name} » retiré de la location.` : `« ${v.name} » est à nouveau réservable.`, 'success');
    loadStats();
  } catch (err) {
    toast(err.message || 'Erreur.', 'error');
  }
}

async function deleteVehicle(v) {
  const ok = await askConfirm({
    title: 'Supprimer définitivement ?',
    text: `Le véhicule « ${v.name} » sera effacé de la base. Si des réservations y sont liées, désactivez-le plutôt.`,
    requireText: v.slug,
    okLabel: 'Supprimer'
  });
  if (!ok) return;
  try {
    await api(`/api/admin/vehicles/${encodeURIComponent(v.slug)}`, { method: 'DELETE' });
    toast(`Véhicule « ${v.name} » supprimé.`, 'success');
    loadStats();
  } catch (err) {
    toast(err.message || 'Suppression échouée.', 'error');
  }
}

// ===== UPLOAD IMAGE =====
async function uploadFile(file) {
  if (!file) return null;
  if (file.size > 8 * 1024 * 1024) {
    uploadStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Image trop lourde (8 Mo max).`;
    return null;
  }
  uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours…`;
  const fd = new FormData();
  fd.append('image', file);
  try {
    const tok = getToken();
    const r = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: tok ? { 'Authorization': 'Bearer ' + tok } : {},
      body: fd
    });
    const j = await r.json();
    if (!r.ok || !j.ok) throw new Error(j.error || 'Échec de l\'envoi');
    uploadStatus.innerHTML = `<i class="fa-solid fa-check"></i> Image envoyée.`;
    return j.url;
  } catch (err) {
    uploadStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${esc(err.message)}`;
    return null;
  }
}

function setPreview(url, label = 'Aperçu', isErr = false) {
  if (!url) {
    vehImgPreview.classList.remove('has-image');
    vehImgPreview.style.backgroundImage = '';
    vehImgBadge.textContent = 'Aperçu';
    vehImgBadge.classList.remove('err');
    return;
  }
  vehImgPreview.classList.add('has-image');
  vehImgPreview.style.backgroundImage = `url('${url}')`;
  vehImgBadge.textContent = label;
  vehImgBadge.classList.toggle('err', isErr);
}

async function previewFromFile(file) {
  if (!file) return;
  // Aperçu local immédiat
  const reader = new FileReader();
  reader.onload = e => setPreview(e.target.result, 'Prévisualisation');
  reader.readAsDataURL(file);
  const url = await uploadFile(file);
  if (url) {
    vImgHidden.value = url;
    setPreview(url, 'Envoyé', false);
  }
}

function previewFromUnsplash(idOrUrl) {
  const raw = (idOrUrl || '').trim();
  if (!raw) { vImgHidden.value = ''; setPreview(null); return; }
  let url;
  let kind = 'Unsplash';
  if (/^https?:\/\//.test(raw)) {
    url = raw;
    kind = 'Lien';
  } else if (/^photo-[a-z0-9-]+$/i.test(raw)) {
    url = `https://images.unsplash.com/${raw}?w=800&auto=format&fit=crop`;
    kind = 'Unsplash';
  } else {
    setPreview(null, 'Invalide', true);
    vImgHidden.value = '';
    return;
  }
  const probe = new Image();
  probe.onload = () => { vImgHidden.value = /^https?:\/\//.test(raw) ? raw : raw; setPreview(url, kind, false); };
  probe.onerror = () => { setPreview(null, 'Indisponible', true); vImgHidden.value = ''; };
  probe.src = url;
}

// ===== MODALE VÉHICULE =====
function openModal(veh = null) {
  vehErr.textContent = '';
  uploadStatus.textContent = '';
  if (veh) {
    editingSlug = veh.slug;
    modalTitle.textContent = 'Modifier le véhicule';
    vName.value = veh.name;
    vPrice.value = veh.price;
    vCategory.value = veh.category;
    vRating.value = veh.rating || '';
    vTag.value = veh.tag || '';
    vSpecs.value = veh.specs || '';
    vActive.checked = !!(veh.active === 1 || veh.active === true);
    vImgHidden.value = veh.img;
    vImgUrl.value = /^photo-/.test(veh.img) ? veh.img : (/^https?:\/\//.test(veh.img) ? veh.img : '');
    if (/^\/img\//.test(veh.img)) {
      setImgMode('upload');
      setPreview(veh.img, 'Envoyé', false);
    } else if (/^photo-/.test(veh.img)) {
      setImgMode('url');
      setPreview(`https://images.unsplash.com/${veh.img}?w=800&auto=format&fit=crop`, 'Unsplash', false);
    } else if (/^https?:\/\//.test(veh.img)) {
      setImgMode('url');
      setPreview(veh.img, 'Lien', false);
    } else {
      setPreview(null);
    }
  } else {
    editingSlug = null;
    modalTitle.textContent = 'Ajouter un véhicule';
    vName.value = '';
    vPrice.value = '';
    vCategory.value = 'berline';
    vRating.value = '';
    vTag.value = '';
    vSpecs.value = '';
    vActive.checked = true;
    vImgHidden.value = '';
    vImgUrl.value = '';
    setPreview(null);
    setImgMode('upload');
  }
  showModal(vehModal);
  setTimeout(() => vName.focus(), 50);
}

function closeModal() {
  hideModal(vehModal);
  vehForm.reset();
  vRating.value = '';
  vTag.value = '';
  vSpecs.value = '';
  vImgHidden.value = '';
  vImgUrl.value = '';
  setPreview(null);
  uploadStatus.textContent = '';
}

function setImgMode(mode) {
  $$('.img-tab').forEach(b => {
    const active = b.dataset.mode === mode;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  $$('.img-mode').forEach(m => m.hidden = m.dataset.mode !== mode);
}

addVehBtn?.addEventListener('click', () => openModal(null));
closeVehModal?.addEventListener('click', closeModal);
cancelVehBtn?.addEventListener('click', closeModal);
vehModal?.addEventListener('click', e => { if (e.target === vehModal) closeModal(); });

$$('.img-tab').forEach(b => b.addEventListener('click', () => setImgMode(b.dataset.mode)));

dropzone?.addEventListener('click', () => fileInput?.click());
dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone?.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  const f = e.dataTransfer.files?.[0];
  if (f) previewFromFile(f);
});
fileInput?.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) previewFromFile(f);
});
vImgUrl?.addEventListener('input', () => previewFromUnsplash(vImgUrl.value));
vehImgClear?.addEventListener('click', () => {
  vImgHidden.value = '';
  vImgUrl.value = '';
  if (fileInput) fileInput.value = '';
  setPreview(null);
  uploadStatus.textContent = '';
});
vehSearch?.addEventListener('input', () => renderVehicles(allVehicles));

vehForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  vehErr.textContent = '';
  const name = vName.value.trim();
  const price = Number(vPrice.value);
  if (!name) { vehErr.textContent = 'Le nom est obligatoire.'; return; }
  if (!price || price < 1) { vehErr.textContent = 'Le prix doit être supérieur à 0.'; return; }
  if (!vImgHidden.value) { vehErr.textContent = 'Ajoutez une photo (fichier ou lien).'; return; }

  const payload = {
    name,
    price,
    category: vCategory.value,
    img: vImgHidden.value,
    active: vActive.checked ? 1 : 0,
    rating: vRating.value ? Number(vRating.value) : null,
    tag: vTag.value.trim(),
    specs: vSpecs.value.trim()
  };
  if (!editingSlug) payload.slug = slugify(name);

  const btn = $('#saveVehBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enregistrement…';
  try {
    const method = editingSlug ? 'PUT' : 'POST';
    const url = editingSlug ? `/api/admin/vehicles/${encodeURIComponent(editingSlug)}` : '/api/admin/vehicles';
    await api(url, { method, body: JSON.stringify(payload) });
    toast(editingSlug ? 'Véhicule modifié.' : 'Véhicule ajouté à la flotte.', 'success');
    closeModal();
    loadStats();
  } catch (err) {
    vehErr.textContent = err.message || 'Enregistrement impossible.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Enregistrer';
  }
});

// ===== CHARTS =====
function renderCharts(stats) {
  const catChart = $('#catChart');
  const dailyChart = $('#dailyChart');
  if (!catChart || !dailyChart) return;

  const catData = stats.categoryRevenue || [];
  if (catData.length === 0) {
    catChart.innerHTML = '<div class="a-empty">Aucune donnée de revenus par catégorie pour l\'instant.</div>';
  } else {
    const maxRevenue = Math.max(...catData.map(c => c.revenue), 1);
    const colors = ['bar-accent', 'bar-yellow', 'bar-green', 'bar-pink', 'bar-blue'];
    catChart.innerHTML = catData.map((c, idx) => {
      const percent = Math.min(100, Math.max(5, Math.round((c.revenue / maxRevenue) * 85)));
      const colorClass = colors[idx % colors.length];
      return `
        <div class="chart-bar-v-wrapper">
          <span class="chart-bar-v-val">${c.revenue} €</span>
          <div class="chart-bar-v ${colorClass}" style="height: ${percent}%" title="${c.count} réservation(s)"></div>
          <span class="chart-bar-v-lbl">${esc(c.category)}</span>
        </div>`;
    }).join('');
  }

  const dailyData = stats.dailyBookings || [];
  if (dailyData.length === 0) {
    dailyChart.innerHTML = '<div class="a-empty">Aucune réservation enregistrée ces derniers jours.</div>';
  } else {
    const maxCount = Math.max(...dailyData.map(d => d.count), 1);
    dailyChart.innerHTML = dailyData.map(d => {
      const percent = Math.min(100, Math.max(5, Math.round((d.count / maxCount) * 100)));
      let displayDate = d.date;
      if (d.date && d.date.length === 10) {
        const parts = d.date.split('-');
        displayDate = `${parts[2]}/${parts[1]}`;
      }
      return `
        <div class="chart-bar-h-row">
          <span class="chart-bar-h-lbl">${esc(displayDate)}</span>
          <div class="chart-bar-h-track">
            <div class="chart-bar-h bar-accent" style="width: ${percent}%"></div>
          </div>
          <span class="chart-bar-h-val">${d.count} résa${d.count > 1 ? 's' : ''} (${d.revenue} €)</span>
        </div>`;
    }).join('');
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ===== ÉCHAP =====
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!vehModal.hidden) closeModal();
  if (!msgModal.hidden) hideModal(msgModal);
  if (!confirmModal.hidden) confirmCancel.click();
});

// ===== BOOT =====
(async function boot() {
  if (getToken()) {
    try {
      const r = await fetch('/api/admin/stats', { headers: { 'Authorization': 'Bearer ' + getToken() } });
      if (r.ok) showDash(); else { clearAuth(); showLogin(); }
    } catch { showLogin(); }
  } else {
    showLogin();
  }
})();
