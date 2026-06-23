// sales-api.js — peuple la section ACHAT avec prix de vente + bouton WhatsApp
// Prix de vente estimés (marché européen, AutoScout24 / mobile.de 2025).
// Acompte 50% obligatoire à la commande.
(function () {
  const WHATSAPP_NUMBER = '33774269599';

  // slug -> { sale: prix de vente EUR }
  const SALES = {
    'audi-rs6-avant':         { sale: 145000 },
    'bmw-m5-berline':         { sale: 135000 },
    'mercedes-amg-gt-r':      { sale: 280000 },
    'porsche-panamera':       { sale: 140000 },
    'tesla-model-3-mountain': { sale: 45000 },
    'tesla-model-3':          { sale: 42000 },
    'bmw-m4-competition':     { sale: 95000 },
    'ferrari-laferrari':      { sale: 2900000 },
    'ferrari-f8-tributo':     { sale: 380000 },
    'bmw-m3-competition':     { sale: 88000 },
    'bmw-m3-pure':            { sale: 78000 },
    'mercedes-amg-gt-s':      { sale: 220000 },
    'porsche-911-gt3':        { sale: 195000 },
    'bmw-m4-coupe':           { sale: 85000 },
    'mercedes-amg-gt-r-coupe':{ sale: 275000 },
    'bmw-m5-berline-sport':   { sale: 135000 },
    'audi-rs6-avant-family':  { sale: 155000 },
    'mercedes-amg-gt-r-pro':  { sale: 310000 },
    'tesla-model-3-lr':       { sale: 48000 },
    'bmw-m3-cs-red':          { sale: 110000 },
    'tesla-model-3-winter':   { sale: 52000 },
    'mercedes-amg-gt-coupe':  { sale: 185000 },
  };

  // Mapping slug -> nom affichable (évitite un fetch, cohérent avec fleet.html)
  const NAMES = {
    'audi-rs6-avant':         'AUDI RS6 AVANT',
    'bmw-m5-berline':         'BMW M5 BERLINE',
    'mercedes-amg-gt-r':      'MERCEDES-AMG GT R',
    'porsche-panamera':       'PORSCHE PANAMERA',
    'tesla-model-3-mountain': 'TESLA MODEL 3 MOUNTAIN',
    'tesla-model-3':          'TESLA MODEL 3',
    'bmw-m4-competition':     'BMW M4 COMPETITION',
    'ferrari-laferrari':      'FERRARI LAFERRARI',
    'ferrari-f8-tributo':     'FERRARI F8 TRIBUTO',
    'bmw-m3-competition':     'BMW M3 COMPETITION',
    'bmw-m3-pure':            'BMW M3 PURE',
    'mercedes-amg-gt-s':      'MERCEDES-AMG GT S',
    'porsche-911-gt3':        'PORSCHE 911 GT3',
    'bmw-m4-coupe':           'BMW M4 COUPE',
    'mercedes-amg-gt-r-coupe':'MERCEDES-AMG GT R COUPE',
    'bmw-m5-berline-sport':   'BMW M5 BERLINE SPORT',
    'audi-rs6-avant-family':  'AUDI RS6 AVANT FAMILY',
    'mercedes-amg-gt-r-pro':  'MERCEDES-AMG GT R PRO',
    'tesla-model-3-lr':       'TESLA MODEL 3 LONG RANGE',
    'bmw-m3-cs-red':          'BMW M3 CS RED',
    'tesla-model-3-winter':   'TESLA MODEL 3 WINTER',
    'mercedes-amg-gt-coupe':  'MERCEDES-AMG GT COUPE',
  };

  const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' €';

  function waLink(name, price, deposit) {
    const msg = `[VOXMO — DEMANDE D'ACHAT]\n\n` +
      `Véhicule : ${name}\n` +
      `Prix de vente : ${fmt(price)}\n` +
      `Acompte 50% à la commande : ${fmt(deposit)}\n\n` +
      `Bonjour VOXMO, je suis intéressé(e) par l'achat de ce véhicule. Pouvez-vous me donner les modalités ?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  const body = document.getElementById('salesBody');
  if (!body) return;

  const rows = Object.keys(SALES).map(slug => {
    const name = NAMES[slug] || slug;
    const price = SALES[slug].sale;
    const deposit = Math.round(price / 2);
    return `
      <tr>
        <td class="st-name">${name}</td>
        <td class="st-price">${fmt(price)}</td>
        <td class="st-deposit">${fmt(deposit)}</td>
        <td class="st-cta">
          <a class="btn-whatsapp-sm" href="${waLink(name, price, deposit)}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i> ACHETER
          </a>
        </td>
      </tr>`;
  }).join('');

  body.innerHTML = rows;
})();
