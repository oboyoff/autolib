// fleet-api.js — rend la grille dynamiquement depuis /api/vehicles
// Les specs, rating et tag viennent de la DB (source unique de vérité).
(function () {
  const grid = document.querySelector('.fleet-grid');
  if (!grid) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function render(vehicles) {
    if (!vehicles.length) {
      grid.innerHTML = '<p class="a-empty" style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-dim)">Aucun véhicule disponible.</p>';
      return;
    }
    grid.innerHTML = vehicles.map(v => {
      const isUnsplash = v.img && !v.img.startsWith('/');
      const imgSrc = isUnsplash
        ? `https://images.unsplash.com/${esc(v.img)}?w=1200&q=80`
        : esc(v.img);
      const specs = (v.specs || '').split(',').map(s => s.trim()).filter(Boolean);
      const specsHtml = specs.length
        ? '<ul class="v-specs">' + specs.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>'
        : '';
      const tagHtml = v.tag
        ? `<div class="v-tag${v.tag.startsWith('◆') ? ' tag-premium' : ''}">${esc(v.tag)}</div>`
        : '';
      const ratingHtml = v.rating
        ? `<div class="v-rating">★ ${esc(String(v.rating))}</div>`
        : '';

      return `
        <article class="v-card" data-category="${esc(v.category)}">
          ${tagHtml}
          <div class="v-img" style="background-image:url('${imgSrc}')"></div>
          <div class="v-body">
            <div class="v-head">
              <h3 class="v-name">${esc(v.name)}</h3>
              ${ratingHtml}
            </div>
            ${specsHtml}
            <div class="v-foot">
              <div class="v-price">
                <span class="v-price-num">${v.price}</span>
                <span class="v-price-cur">€</span>
                <span class="v-price-per">/JOUR</span>
              </div>
              <a class="v-cta" href="reserve.html?car=${encodeURIComponent(v.slug)}&price=${v.price}">RESERVER <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </article>`;
    }).join('');

    // Stagger animation
    document.querySelectorAll('.v-card').forEach((c, i) => c.style.transitionDelay = `${i * 60}ms`);

    // Déclencher le filtrage actif
    if (typeof window.filterFleet === 'function') window.filterFleet();
  }

  // État de chargement
  grid.innerHTML = '<p class="a-empty" style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-dim)"><i class="fa-solid fa-spinner fa-spin"></i> Chargement de la flotte…</p>';

  fetch('/api/vehicles')
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (!j || !j.ok || !Array.isArray(j.vehicles)) {
        grid.innerHTML = '<p class="a-empty" style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-dim)">Erreur de chargement. Réessayez.</p>';
        return;
      }
      render(j.vehicles);
    })
    .catch(() => {
      grid.innerHTML = '<p class="a-empty" style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-dim)">Service indisponible. Réessayez plus tard.</p>';
    });
})();
