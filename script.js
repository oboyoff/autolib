/* VOXMO — Bold Neo-Brutalism JS */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 1500);
});

const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);
    backToTop.classList.toggle('visible', y > 500);
    sections.forEach(s => {
        const t = s.offsetTop - 120, h = s.offsetHeight, id = s.id;
        if (y >= t && y < t + h)
            document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    });
});

if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
});

// Counter Animation
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(c => {
        const target = +c.dataset.target, dur = 1800, step = target / (dur / 16);
        const padLen = String(target).length;
        let cur = 0;
        const tick = () => {
            cur += step;
            if (cur < target) {
                c.textContent = String(Math.floor(cur)).padStart(padLen, '0');
                requestAnimationFrame(tick);
            } else {
                c.textContent = String(target).padStart(padLen, '0');
            }
        };
        tick();
    });
}

// Intersection Observer
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('animated');
            if (e.target.classList.contains('hero-stats')) animateCounters();
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.v-card, .r-card, .section-head, .hero-stats, .contact-form, .contact-l, .filter-row, .why-card, .how-step, .pay-inner, .faq-list').forEach(el => {
    el.classList.add('animate-on-scroll');
    obs.observe(el);
});

// FAQ Accordion
document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
});

// Safety fallback: if observer hasn't fired within 3s, reveal everything
setTimeout(() => {
    document.querySelectorAll('.animate-on-scroll:not(.animated)').forEach(el => el.classList.add('animated'));
    if (document.querySelector('.hero-stats.animate-on-scroll:not(.animated)') === null && !window._countersFired) {
        window._countersFired = true;
    }
}, 1500);
document.addEventListener('scroll', () => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('animated');
    });
}, { passive: true });

// Filter Tabs
document.querySelectorAll('.filter').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const f = tab.dataset.filter;
        document.querySelectorAll('.v-card').forEach(c => {
            const cat = c.dataset.category || '';
            const match = f === 'all' || cat === f;
            c.style.display = match ? 'block' : 'none';
            if (match) {
                c.style.opacity = '0';
                c.style.transform = 'translateY(16px)';
                requestAnimationFrame(() => {
                    c.style.transition = 'all .4s cubic-bezier(.22,1,.36,1)';
                    c.style.opacity = '1';
                    c.style.transform = 'translateY(0)';
                });
            }
        });
    });
});

// CTA cartes flotte : navigation native vers reserve.html (les <a href="reserve.html?...">)
// Plus de redirection Messenger : le client utilise le vrai tunnel de réservation.

// WhatsApp widget (remplace Messenger)
const _mf = document.getElementById('messengerFab');
const _mp = document.getElementById('messengerPopup');
const _mc = document.getElementById('messengerClose');
if (_mf && _mp) _mf.addEventListener('click', () => _mp.classList.toggle('active'));
if (_mc && _mp) _mc.addEventListener('click', () => _mp.classList.remove('active'));

// Contact Form -> WhatsApp
const _cf = document.getElementById('contactForm');
if (_cf) _cf.addEventListener('submit', e => {
    e.preventDefault();
    const d = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        vehicle: document.getElementById('vehicle').value,
        message: document.getElementById('message').value
    };
    const text = `Bonjour VOXMO !\n\nNom : ${d.name}\nEmail : ${d.email}\nTel : ${d.phone}\nVehicule : ${d.vehicle}\n\n${d.message}\n\n(Vous pouvez aussi nous écrire à contact@voxmo.eu)`;
    const subject = `Demande VOXMO — ${d.vehicle || 'Réservation'}`;
    const body = `Bonjour VOXMO,\n\nNom : ${d.name}\nEmail : ${d.email}\nTel : ${d.phone}\nVehicule : ${d.vehicle}\n\n${d.message}\n\n---\nEnvoyé depuis voxmo.eu`;
    window.open(`https://wa.me/33774269599?text=${encodeURIComponent(text)}`, '_blank');
    setTimeout(() => {
        window.location.href = `mailto:contact@voxmo.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);

    const btn = e.target.querySelector('.btn-submit');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>ENVOYE ✓</span>';
    btn.style.background = 'var(--green)';
    btn.style.boxShadow = '8px 8px 0 var(--green)';
    setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.style.boxShadow = '';
        e.target.reset();
    }, 2500);
});

// Stagger
document.querySelectorAll('.v-card').forEach((c, i) => c.style.transitionDelay = `${i * 60}ms`);
document.querySelectorAll('.r-card').forEach((c, i) => c.style.transitionDelay = `${i * 80}ms`);
document.querySelectorAll('.why-card').forEach((c, i) => c.style.transitionDelay = `${i * 70}ms`);
document.querySelectorAll('.how-step').forEach((c, i) => c.style.transitionDelay = `${i * 90}ms`);

if (document.getElementById('reserveForm')) {

    const VEHICLES = {
        'audi-rs6-avant':         { name: 'AUDI RS6 AVANT',         img: 'photo-1606664515524-ed2f786a0bd6', price: 440 },
        'bmw-m5-berline':         { name: 'BMW M5 BERLINE',         img: 'photo-1555215695-3004980ad54e', price: 360 },
        'mercedes-amg-gt-r':      { name: 'MERCEDES-AMG GT R',      img: 'photo-1617814076367-b759c7d7e738', price: 680 },
        'porsche-panamera':       { name: 'PORSCHE PANAMERA',       img: 'photo-1503376780353-7e6692767b70', price: 460 },
        'tesla-model-3-mountain': { name: 'TESLA MODEL 3 MOUNTAIN', img: 'photo-1606016159991-dfe4f2746ad5', price: 65 },
        'tesla-model-3':          { name: 'TESLA MODEL 3',          img: 'photo-1560958089-b8a1929cea89', price: 55 },
        'bmw-m4-competition':     { name: 'BMW M4 COMPETITION',     img: 'photo-1549399542-7e3f8b79c341', price: 400 },
        'ferrari-laferrari':      { name: 'FERRARI LAFERRARI',      img: 'photo-1583121274602-3e2820c69888', price: 20000 },
        'ferrari-f8-tributo':     { name: 'FERRARI F8 TRIBUTO',     img: 'photo-1614200179396-2bdb77ebf81b', price: 1040 },
        'bmw-m3-competition':     { name: 'BMW M3 COMPETITION',     img: 'photo-1617531653332-bd46c24f2068', price: 380 },
        'bmw-m3-pure':            { name: 'BMW M3 PURE',            img: 'photo-1605515298946-d062f2e9da53', price: 360 },
        'mercedes-amg-gt-s':      { name: 'MERCEDES-AMG GT S',      img: 'photo-1605559424843-9e4c228bf1c2', price: 880 },
        'porsche-911-gt3':        { name: 'PORSCHE 911 GT3',        img: 'photo-1611821064430-0d40291d0f0b', price: 600 },
        'bmw-m4-coupe':           { name: 'BMW M4 COUPE',           img: 'photo-1580273916550-e323be2ae537', price: 400 },
        'mercedes-amg-gt-r-coupe':{ name: 'MERCEDES-AMG GT R',      img: 'photo-1617814076367-b759c7d7e738', price: 680 },
        'bmw-m5-berline-sport':   { name: 'BMW M5 BERLINE',         img: 'photo-1555215695-3004980ad54e', price: 360 },
        'audi-rs6-avant-family':  { name: 'AUDI RS6 AVANT',         img: 'photo-1606664515524-ed2f786a0bd6', price: 440 },
        'mercedes-amg-gt-r-pro':  { name: 'MERCEDES-AMG GT R PRO',  img: 'photo-1617814076367-b759c7d7e738', price: 720 },
        'tesla-model-3-lr':       { name: 'TESLA MODEL 3 LONG RANGE', img: 'photo-1560958089-b8a1929cea89', price: 55 },
        'bmw-m3-cs-red':          { name: 'BMW M3 CS RED',          img: 'photo-1617531653332-bd46c24f2068', price: 400 },
        'tesla-model-3-winter':   { name: 'TESLA MODEL 3 WINTER',   img: 'photo-1606016159991-dfe4f2746ad5', price: 75 },
        'mercedes-amg-gt-coupe':  { name: 'MERCEDES-AMG GT COUPE',  img: 'photo-1618843479313-40f8afb4b4d8', price: 600 }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const carSlug = urlParams.get('car') || '';
    const carPrice = parseInt(urlParams.get('price') || '0', 10);
    let vehicle = VEHICLES[carSlug] || null;

    async function loadVehicleData() {
        if (carSlug) {
            try {
                const res = await fetch(`/api/vehicles/${encodeURIComponent(carSlug)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.ok && data.vehicle) {
                        vehicle = data.vehicle;
                    }
                }
            } catch (err) {
                console.warn("API vehicle fetch failed, falling back to static list", err);
            }
        }

        if (!vehicle) {
            window.location.replace('fleet.html');
            return;
        }

        const recapImg = document.getElementById('recap-img');
        const recapName = document.getElementById('recap-name');
        const recapSlug = document.getElementById('recap-slug');
        const recapPrice = document.getElementById('recap-price');

        if (recapImg) recapImg.style.backgroundImage = `url(https://images.unsplash.com/${vehicle.img}?w=600&q=80)`;
        if (recapName) recapName.textContent = vehicle.name;
        if (recapSlug) recapSlug.textContent = `Ref: ${carSlug}`;
        if (recapPrice) recapPrice.textContent = vehicle.price;

        calcTotal();
    }

    // Date min = today
    const today = new Date().toISOString().split('T')[0];
    const startEl = document.getElementById('startDate');
    const endEl = document.getElementById('endDate');
    startEl.min = today;
    endEl.min = today;
    // Default: start tomorrow, end +3 days
    const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
    const after3 = new Date(); after3.setDate(after3.getDate() + 4);
    startEl.value = tmrw.toISOString().split('T')[0];
    endEl.value = after3.toISOString().split('T')[0];

    // Update end min when start changes
    startEl.addEventListener('change', () => {
        const next = new Date(startEl.value); next.setDate(next.getDate() + 1);
        endEl.min = next.toISOString().split('T')[0];
        if (endEl.value && endEl.value <= startEl.value) endEl.value = endEl.min;
        calcTotal();
    });
    endEl.addEventListener('change', calcTotal);
    document.getElementById('pickup').addEventListener('change', calcTotal);
    document.getElementById('dropoff').addEventListener('change', calcTotal);

    let activePromo = null;

    function calcTotal() {
        if (!vehicle) return;
        if (!startEl.value || !endEl.value || new Date(endEl.value) <= new Date(startEl.value)) {
            document.getElementById('reserve-total').textContent = '0€';
            document.getElementById('payAmount').textContent = '0€';
            return;
        }
        const days = Math.ceil((new Date(endEl.value) - new Date(startEl.value)) / 86400000);
        const crossCountry = document.getElementById('pickup').value !== document.getElementById('dropoff').value ? 35 : 0;
        
        let optionsFee = 0;
        if (document.getElementById('opt-gps').checked) optionsFee += 10;
        if (document.getElementById('opt-siege').checked) optionsFee += 15;
        if (document.getElementById('opt-assurance').checked) optionsFee += 15 * days;
        if (document.getElementById('opt-conducteur').checked) optionsFee += 25;

        const subtotal = days * vehicle.price + crossCountry + optionsFee;
        let discount = 0;
        if (activePromo) {
            if (activePromo.type === 'percent') {
                discount = Math.floor((subtotal * activePromo.value) / 100);
            } else if (activePromo.type === 'flat') {
                discount = activePromo.value;
            }
        }
        const total = Math.max(0, subtotal - discount);

        document.getElementById('reserve-total').textContent = total + '€';
        document.getElementById('payAmount').textContent = total + '€';

        const fee = document.getElementById('crossFee');
        let detailText = `Durée: ${days} jour${days > 1 ? 's' : ''} x ${vehicle.price}€ = ${days * vehicle.price}€`;
        if (crossCountry > 0) detailText += ` + frais transfrontalier: 35€`;
        if (optionsFee > 0) detailText += ` + options: ${optionsFee}€`;
        if (discount > 0) detailText += ` - remise: ${discount}€`;
        detailText += `. Total: ${total}€.`;

        fee.textContent = detailText;
        if (crossCountry > 0) {
            fee.className = 'cross-fee warn';
        } else {
            fee.className = 'cross-fee';
        }
    }

    // Options click behaviors & styles
    ['opt-gps', 'opt-siege', 'opt-assurance', 'opt-conducteur'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            const card = document.getElementById(id).closest('.option-card');
            if (document.getElementById(id).checked) {
                card.style.background = 'var(--primary)';
                card.style.transform = 'translate(-2px, -2px)';
                card.style.boxShadow = '6px 6px 0 var(--dark)';
            } else {
                card.style.background = 'var(--bg)';
                card.style.transform = 'none';
                card.style.boxShadow = '4px 4px 0 var(--dark)';
            }
            calcTotal();
        });
    });

    // Promo code event listener
    const promoInput = document.getElementById('promoInput');
    const promoStatus = document.getElementById('promoStatus');
    document.getElementById('applyPromoBtn').addEventListener('click', async () => {
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            activePromo = null;
            promoStatus.style.display = 'none';
            calcTotal();
            return;
        }
        try {
            const r = await fetch('/api/reservations/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const j = await r.json();
            if (r.ok && j.ok) {
                activePromo = { code, type: j.type, value: j.value };
                promoStatus.style.display = 'block';
                promoStatus.style.background = '#c3e88d'; // Vert
                promoStatus.textContent = `✓ CODE APPLIQUÉ : -${j.type === 'percent' ? j.value + '%' : j.value + '€'} de remise !`;
            } else {
                activePromo = null;
                promoStatus.style.display = 'block';
                promoStatus.style.background = '#ff5370'; // Rouge
                promoStatus.textContent = `✗ ${j.error || 'Code promo invalide'}`;
            }
        } catch (e) {
            activePromo = null;
            promoStatus.style.display = 'block';
            promoStatus.style.background = '#ff5370';
            promoStatus.textContent = '✗ Erreur de connexion avec le serveur';
        }
        calcTotal();
    });

    loadVehicleData();

    // ===== STEPPER NAVIGATION =====
    let currentStep = 1;
    function goToStep(n) {
        currentStep = n;
        document.querySelectorAll('.reserve-step-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.reserve-step').forEach(s => s.classList.remove('active', 'done'));
        const panel = document.getElementById('panel-' + n);
        if (panel) panel.classList.add('active');
        for (let i = 1; i < n; i++) {
            const s = document.getElementById('step-' + i);
            if (s) s.classList.add('done');
        }
        const sN = document.getElementById('step-' + n);
        if (sN) sN.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Step 1 -> 2
    document.getElementById('goStep2').addEventListener('click', () => {
        if (!startEl.value || !endEl.value) {
            alert('Veuillez selectionner les dates de location.');
            return;
        }
        if (new Date(endEl.value) <= new Date(startEl.value)) {
            alert('La date de fin doit etre apres la date de debut.');
            return;
        }
        goToStep(2);
    });
    document.getElementById('backStep1').addEventListener('click', () => goToStep(1));

    // Step 2 -> 3 (with validations)
    document.getElementById('goStep3').addEventListener('click', () => {
        const fields = ['rName', 'rEmail', 'rPhone', 'rBirth', 'rLicense', 'rLicenseDate', 'rAddress'];
        let ok = true;
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (!el.value.trim()) { el.classList.add('error'); ok = false; }
            else el.classList.remove('error');
        });
        // Email format
        const email = document.getElementById('rEmail');
        if (email.value && !/^[^@]+@[^@]+\.[^@]+$/.test(email.value)) {
            email.classList.add('error'); ok = false;
        }
        // Age >= 21
        const birth = new Date(document.getElementById('rBirth').value);
        const age = birth ? Math.floor((Date.now() - birth) / (365.25 * 86400000)) : 0;
        const ageCheck = document.getElementById('ageCheck');
        if (age < 21) {
            document.getElementById('rBirth').classList.add('error');
            ageCheck.textContent = `Le conducteur doit avoir au moins 21 ans (vous avez ${age} ans).`;
            ageCheck.className = 'cross-fee error';
            ok = false;
        } else {
            // License >= 1 year
            const lic = new Date(document.getElementById('rLicenseDate').value);
            const licYears = lic ? (Date.now() - lic) / (365.25 * 86400000) : 0;
            if (licYears < 1) {
                document.getElementById('rLicenseDate').classList.add('error');
                ageCheck.textContent = `Le permis doit dater d'au moins 1 an.`;
                ageCheck.className = 'cross-fee error';
                ok = false;
            } else {
                ageCheck.textContent = `Conducteur valide (${age} ans, permis delivre il y a ${Math.floor(licYears)} an${licYears >= 2 ? 's' : ''}).`;
                ageCheck.className = 'cross-fee';
            }
        }
        if (!ok) return;
        goToStep(3);
    });
    document.getElementById('backStep2').addEventListener('click', () => goToStep(2));

    // ===== CONSTRUCTION DU MESSAGE WHATSAPP =====
    const WHATSAPP_NUMBER = '33774269599';

    function buildReservationData() {
        const selectedOptions = [];
        const optLabels = [];
        if (document.getElementById('opt-gps').checked)         { selectedOptions.push('gps');         optLabels.push('GPS haut de gamme (+10€)'); }
        if (document.getElementById('opt-siege').checked)       { selectedOptions.push('siege');       optLabels.push('Siège bébé (+15€)'); }
        if (document.getElementById('opt-assurance').checked)   { selectedOptions.push('assurance');   optLabels.push('Assurance premium'); }
        if (document.getElementById('opt-conducteur').checked)  { selectedOptions.push('conducteur');  optLabels.push('2ème conducteur (+25€)'); }

        const totalText = document.getElementById('reserve-total').textContent;
        const totalNum = parseInt(String(totalText).replace(/[^\d]/g, ''), 10) || 0;
        const deposit = Math.floor(totalNum / 2);
        const days = Math.ceil((new Date(endEl.value) - new Date(startEl.value)) / 86400000);

        return {
            vehicleSlug: carSlug,
            startDate: startEl.value,
            endDate: endEl.value,
            days,
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            driverName: document.getElementById('rName').value,
            driverEmail: document.getElementById('rEmail').value,
            driverPhone: document.getElementById('rPhone').value,
            driverLicense: document.getElementById('rLicense').value,
            driverCountry: document.getElementById('rCountry').value,
            total: totalNum,
            totalText,
            deposit,
            options: selectedOptions,
            optLabels,
            promoCode: activePromo ? activePromo.code : null,
        };
    }

    function buildWhatsappMessage(d) {
        const lines = [];
        lines.push('[VOXMO — DEMANDE DE RÉSERVATION]');
        lines.push('');
        lines.push(`Véhicule : ${vehicle.name}`);
        lines.push(`Dates : ${d.startDate} → ${d.endDate} (${d.days} jour${d.days > 1 ? 's' : ''})`);
        lines.push(`Lieu : ${d.pickup} → ${d.dropoff}`);
        lines.push('');
        lines.push(`Options : ${d.optLabels.length ? d.optLabels.join(', ') : 'aucune'}`);
        lines.push(`Code promo : ${d.promoCode || 'aucun'}`);
        lines.push('');
        lines.push(`Total estimé : ${d.totalText}`);
        lines.push(`Acompte 50% : ${d.deposit}€`);
        lines.push('');
        lines.push(`Conducteur : ${d.driverName}`);
        lines.push(`Email : ${d.driverEmail}`);
        lines.push(`Tél : ${d.driverPhone}`);
        lines.push(`Permis : ${d.driverLicense} (${d.driverCountry})`);
        lines.push('');
        lines.push('Souhaitez-vous payer par PayPal ou virement instantané ?');
        lines.push('Un acompte de 50% est requis pour confirmer.');
        return lines.join('\n');
    }

    function waUrl(message) {
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    function renderOrderRecap() {
        const d = buildReservationData();
        const optHtml = d.optLabels.length
            ? d.optLabels.map(o => `<li>${o}</li>`).join('')
            : '<li>Aucune option</li>';
        document.getElementById('orderRecap').innerHTML = `
            <div class="recap-row"><span>Véhicule</span><strong>${vehicle.name}</strong></div>
            <div class="recap-row"><span>Dates</span><strong>${d.startDate} → ${d.endDate} (${d.days} jour${d.days > 1 ? 's' : ''})</strong></div>
            <div class="recap-row"><span>Trajet</span><strong>${d.pickup} → ${d.dropoff}</strong></div>
            <div class="recap-row"><span>Options</span><ul class="recap-opts">${optHtml}</ul></div>
            ${d.promoCode ? `<div class="recap-row"><span>Code promo</span><strong>${d.promoCode}</strong></div>` : ''}
            <div class="recap-row recap-total"><span>Total</span><strong>${d.totalText}</strong></div>
            <div class="recap-row recap-deposit"><span>Acompte 50%</span><strong>${d.deposit}€</strong></div>
        `;
    }

    // ===== BOUTONS STEP 3 =====
    // "Réserver via WhatsApp"
    document.getElementById('reserveWhatsapp').addEventListener('click', () => {
        const d = buildReservationData();
        const msg = buildWhatsappMessage(d);
        const url = waUrl(msg);
        // Ouvre WhatsApp puis affiche l'écran de confirmation
        window.open(url, '_blank');
        document.getElementById('successRecap').innerHTML =
            `<strong>${vehicle.name}</strong><br>` +
            `Du <strong>${d.startDate}</strong> au <strong>${d.endDate}</strong><br>` +
            `Lieu : <strong>${d.pickup}</strong> → <strong>${d.dropoff}</strong><br>` +
            `Total : <strong>${d.totalText}</strong> · Acompte : <strong>${d.deposit}€</strong>`;
        document.getElementById('retryWhatsapp').href = url;
        goToStep('success');
    });

    // "Payer directement" → ouvre le panel de paiement
    document.getElementById('showPayment').addEventListener('click', () => {
        const d = buildReservationData();
        // Met à jour les montants d'acompte affichés
        document.getElementById('payAmtPaypal').textContent = `Acompte 50% : ${d.deposit}€`;
        document.getElementById('payAmtWire').textContent = `Acompte 50% : ${d.deposit}€`;
        // Lien PayPal générique (à remplacer par le vrai compte) + note dans le message
        const payMsg = `[VOXMO — PAIEMENT PAYPAL]\n\nVéhicule : ${vehicle.name}\nDates : ${d.startDate} → ${d.endDate}\nAcompte 50% : ${d.deposit}€\n\nBonjour, je règle l'acompte de ma réservation.`;
        document.getElementById('paypalLink').href = waUrl(payMsg);
        goToStep('payment');
    });

    document.getElementById('backToRecap').addEventListener('click', () => goToStep(3));

    // "Demander l'IBAN" via WhatsApp
    document.getElementById('wireWhatsapp').addEventListener('click', () => {
        const d = buildReservationData();
        const ibanMsg = `[VOXMO — DEMANDE IBAN]\n\nVéhicule : ${vehicle.name}\nDates : ${d.startDate} → ${d.endDate}\nAcompte 50% : ${d.deposit}€\n\nBonjour, je souhaite recevoir l'IBAN pour régler l'acompte par virement instantané.`;
        window.open(waUrl(ibanMsg), '_blank');
    });

    // Quand on entre dans le step 3, on peuple le récap
    const origGoToStep = goToStep;
    goToStep = function(n) {
        origGoToStep(n);
        if (n === 3 || n === '3') renderOrderRecap();
    };
}

// Allow .v-cta <a> to be styled like the original button
document.querySelectorAll('a.v-cta').forEach(a => {
    a.addEventListener('click', e => {
        // Let the browser handle the navigation
    });
});
