/* ============================================
   SOILGUARD — script.js
   Emails ALL form submissions to: johndayo1795@gmail.com
   via Formspree
   ============================================ */


/* ============================================
   SURVEY FORM — sends to johndayo1795@gmail.com
   ============================================ */

const surveyForm = document.getElementById('survey-form');

if (surveyForm) {
  surveyForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const consent = document.getElementById('s-consent');
    if (!consent.checked) {
      alert('Please agree to the data usage terms to submit the survey.');
      return;
    }

    // Change button to show loading
    const btn = surveyForm.querySelector('button[type="submit"]');
    btn.textContent = '⏳ Sending...';
    btn.disabled = true;

    const formData = new FormData(surveyForm);

    try {
      const response = await fetch(surveyForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Show success banner
        const banner = document.getElementById('survey-success');
        banner.style.display = 'block';
        banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Reset form
        surveyForm.reset();
        btn.textContent = 'Submit Survey';
        btn.disabled = false;

      } else {
        btn.textContent = 'Submit Survey';
        btn.disabled = false;
        alert('Submission failed. Please make sure the Formspree ID is correctly set in survey.html and try again.');
      }

    } catch (error) {
      btn.textContent = 'Submit Survey';
      btn.disabled = false;
      alert('Network error. Please check your internet connection and try again.');
    }
  });
}


/* ============================================
   RISK CALCULATOR
   Calculates risk, shows results on screen,
   AND emails all details to johndayo1795@gmail.com
   ============================================ */

async function calculateRisk() {

  // ── GET VALUES ──
  const location   = document.getElementById('location').value || 'Not provided';
  const stateLGA   = document.getElementById('state-lga').value || 'Not provided';
  const farmSize   = document.getElementById('farm-size').value || 'Not provided';
  const slope      = parseFloat(document.getElementById('slope').value) || 0;
  const soilTex    = document.getElementById('soil-texture').value;
  const landCover  = document.getElementById('land-cover').value;
  const rainfall   = document.getElementById('rainfall').value;
  const drainage   = document.getElementById('drainage').value;
  const heavyTill  = document.getElementById('p-heavy-tillage').checked;
  const burning    = document.getElementById('p-burning').checked;
  const residue    = document.getElementById('p-residue').checked;
  const mulching   = document.getElementById('p-mulching').checked;
  const minTill    = document.getElementById('p-min-tillage').checked;
  const coverCrops = document.getElementById('p-cover-crops').checked;

  // ── VALIDATE ──
  if (!soilTex || !landCover || !rainfall || !drainage) {
    alert('Please fill in all required fields: Soil Texture, Land Cover, Rainfall Intensity, and Drainage Condition.');
    return;
  }

  let score = 0;
  const factors = [];
  const recs    = [];

  // ── SLOPE ──
  if (slope > 25)      { score += 30; factors.push({ icon: '⛰️', text: 'Very steep slope (>25%) — extremely high runoff risk' }); }
  else if (slope > 15) { score += 22; factors.push({ icon: '⛰️', text: 'Steep slope (15–25%) — significant runoff and erosion risk' }); }
  else if (slope > 8)  { score += 15; factors.push({ icon: '⛰️', text: 'Moderate slope (8–15%) — moderate erosion potential' }); }
  else if (slope > 3)  { score += 7; }
  else                 { score += 2; }

  // ── SOIL TEXTURE ──
  const soilRisk = { sandy: 18, 'sandy-loam': 14, silty: 16, loamy: 8, clay: 10 };
  score += soilRisk[soilTex] || 0;
  if (soilTex === 'sandy' || soilTex === 'silty') {
    factors.push({ icon: '🌍', text: `${soilTex.charAt(0).toUpperCase() + soilTex.slice(1)} soil — highly erodible texture with low cohesion` });
  }

  // ── LAND COVER ──
  const coverRisk = { bare: 22, cropland: 14, grassland: 6, forest: 2, mixed: 8 };
  score += coverRisk[landCover] || 0;
  if (landCover === 'bare') {
    factors.push({ icon: '🏜️', text: 'Bare soil — no vegetative cover, maximum erosion exposure' });
    recs.push({ icon: '🌾', title: 'Establish Ground Cover', desc: 'Plant cover crops or mulch immediately to protect bare soil from rain impact.' });
  }
  if (landCover === 'cropland') {
    recs.push({ icon: '🌽', title: 'Crop Rotation', desc: 'Rotate crops and maintain residue cover between seasons to reduce soil exposure.' });
  }

  // ── RAINFALL ──
  const rainRisk = { low: 4, moderate: 10, high: 18, 'very-high': 25 };
  score += rainRisk[rainfall] || 0;
  if (rainfall === 'high' || rainfall === 'very-high') {
    factors.push({ icon: '🌧️', text: 'High/Very high rainfall intensity — strong erosive forces during storms' });
    recs.push({ icon: '💧', title: 'Install Drainage Channels', desc: 'Construct grassed waterways or contour drains to safely channel excess rainwater.' });
  }

  // ── DRAINAGE ──
  const drainRisk = { well: 2, moderate: 8, poorly: 16, waterlogged: 22 };
  score += drainRisk[drainage] || 0;
  if (drainage === 'poorly' || drainage === 'waterlogged') {
    factors.push({ icon: '🌊', text: 'Poor drainage — water accumulation accelerates sheet and rill erosion' });
    recs.push({ icon: '🔧', title: 'Improve Drainage', desc: 'Consider subsoil drainage or mounding to reduce waterlogging and runoff velocity.' });
  }

  // ── PRACTICES ──
  const practicesList = [];
  if (heavyTill)   { score += 8;  factors.push({ icon: '🚜', text: 'Heavy tillage — destroys soil structure' }); practicesList.push('Heavy tillage'); }
  if (burning)     { score += 10; factors.push({ icon: '🔥', text: 'Burning — removes protective cover' }); practicesList.push('Burning'); }
  if (residue)     { score += 6;  factors.push({ icon: '🌿', text: 'Residue removal — eliminates surface protection' }); practicesList.push('Residue removal'); }
  if (mulching)    { score -= 8;  recs.push({ icon: '🍂', title: 'Continue Mulching', desc: 'Maintain mulch layer year-round for maximum protection.' }); practicesList.push('Mulching'); }
  if (minTill)     { score -= 6;  recs.push({ icon: '✅', title: 'Maintain Minimum Tillage', desc: 'Preserve soil structure and reduce surface disturbance.' }); practicesList.push('Minimum tillage'); }
  if (coverCrops)  { score -= 10; recs.push({ icon: '🌱', title: 'Continue Cover Crops', desc: 'Ensure cover crops are established before the rainy season.' }); practicesList.push('Cover crops'); }
  if (practicesList.length === 0) practicesList.push('None selected');

  score = Math.max(0, Math.min(100, score));

  if (slope > 8)  recs.push({ icon: '🏔️', title: 'Contour Farming', desc: 'Farm along contour lines to reduce runoff velocity.' });
  if (score > 40) recs.push({ icon: '🌳', title: 'Agroforestry', desc: 'Integrate trees — their deep roots stabilize soil and reduce runoff.' });
  if (score > 60) recs.push({ icon: '🪨', title: 'Terracing', desc: 'Construct terraces on steep slopes to trap runoff.' });
  if (burning)    recs.push({ icon: '🚫', title: 'Stop Burning', desc: 'Replace burning with composting — burning destroys organic matter.' });
  if (recs.length === 0) recs.push({ icon: '👍', title: 'Maintain Good Practices', desc: 'Low risk — continue monitoring your soil health.' });

  // ── RISK LEVEL ──
  let level, badgeClass, fillClass, pct;
  if (score <= 33)      { level = '🟢 Low Risk';    badgeClass = 'risk-low';    fillClass = 'fill-low';    pct = Math.max(10, score); }
  else if (score <= 65) { level = '🟡 Medium Risk'; badgeClass = 'risk-medium'; fillClass = 'fill-medium'; pct = score; }
  else                  { level = '🔴 High Risk';   badgeClass = 'risk-high';   fillClass = 'fill-high';   pct = score; }

  // ── RENDER RESULTS ON SCREEN ──
  const badge = document.getElementById('risk-badge');
  badge.textContent = level;
  badge.className   = 'risk-badge ' + badgeClass;

  const fill = document.getElementById('risk-fill');
  fill.className = 'risk-score-fill ' + fillClass;
  fill.style.width = '0%';
  setTimeout(() => { fill.style.width = pct + '%'; }, 100);

  const summaries = {
    'risk-low':    'Your site has relatively low erosion risk. Some preventive measures are still recommended.',
    'risk-medium': 'Moderate erosion risk detected. Take action now to prevent escalation.',
    'risk-high':   'High erosion risk! Immediate conservation action is strongly recommended.'
  };
  document.getElementById('risk-summary').textContent =
    summaries[badgeClass] + ` (Risk Score: ${Math.round(score)}/100)`;

  document.getElementById('recommendations').innerHTML = recs.map(r =>
    `<div class="recommendation-item">
       <span class="rec-icon">${r.icon}</span>
       <p><strong>${r.title}</strong>${r.desc}</p>
     </div>`
  ).join('');

  const factEl = document.getElementById('risk-factors');
  factEl.innerHTML = factors.length === 0
    ? '<p style="color:var(--text-soft);font-size:0.9rem;padding:12px 0;">No critical risk factors identified.</p>'
    : factors.map(f =>
        `<div class="recommendation-item risk-factor-item">
           <span class="rec-icon">${f.icon}</span>
           <p>${f.text}</p>
         </div>`
      ).join('');

  const resultsSection = document.getElementById('results-section');
  resultsSection.style.display = 'block';
  setTimeout(() => { resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);

  // ── SEND EMAIL via Formspree (hidden form) ──
  const hiddenForm = document.getElementById('risk-data-form');
  if (hiddenForm) {
    // Fill hidden fields with all the user's data
    document.getElementById('hid-location').value   = location;
    document.getElementById('hid-state').value      = stateLGA;
    document.getElementById('hid-farm-size').value  = farmSize + ' ha';
    document.getElementById('hid-slope').value      = slope + '%';
    document.getElementById('hid-soil').value       = soilTex;
    document.getElementById('hid-cover').value      = landCover;
    document.getElementById('hid-rainfall').value   = rainfall;
    document.getElementById('hid-drainage').value   = drainage;
    document.getElementById('hid-practices').value  = practicesList.join(', ');
    document.getElementById('hid-risk-level').value = level;
    document.getElementById('hid-risk-score').value = Math.round(score) + '/100';
    document.getElementById('hid-recs').value       = recs.map(r => r.title).join(', ');

    // Submit silently in the background
    try {
      const formData = new FormData(hiddenForm);
      await fetch(hiddenForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      // Silent fail — don't interrupt the user's experience
      console.log('Email notification failed silently:', err);
    }
  }

  // ── GOOGLE ANALYTICS EVENT ──
  if (typeof gtag !== 'undefined') {
    gtag('event', 'risk_calculated', {
      'event_category': 'Risk Tool',
      'event_label': level,
      'value': Math.round(score)
    });
  }
}
