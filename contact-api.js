// contact-api.js — branche le formulaire de contact sur /api/contact
// Si l'API est down, le handler Messenger/mailto de script.js reste actif.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    e.stopImmediatePropagation(); // court-circuite le handler Messenger par défaut

    const btn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.textContent = 'ENVOI EN COURS...'; }

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      subject: document.getElementById('vehicle').value.trim() || 'Demande VOXMO',
      message: document.getElementById('message').value.trim(),
    };

    let resp, json;
    try {
      resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      json = await resp.json();
    } catch (err) {
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      alert('Erreur reseau. Reessayez ou contactez-nous via Messenger.');
      return;
    }

    if (!resp.ok || !json.ok) {
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      alert(json.error || 'Erreur serveur. Reessayez.');
      return;
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> MESSAGE ENVOYE';
    }
    form.reset();
    setTimeout(() => { if (btn && originalText) btn.innerHTML = originalText; }, 4000);
  }, true); // capture phase pour passer avant les autres listeners
})();
