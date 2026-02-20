/* ============================================
   SOILGUARD — script.js
   Handles: Risk Calculator + Survey Submission
   ============================================ */


/* ============================================
   RISK CALCULATOR (risk-tool.html)
   ============================================ */

function calculateRisk() {

  // Get values
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

  // Validate required fields
  if (!soilTex || !landCover || !rainfall || !drainage) {
    alert('Please fill in all required fields: Soil Texture, Land Cover, Rainfall Intensity, and Drainage Condition.');
    return;
  }

  let score = 0;
  const factors = [];
  const recs    = [];

  // ── SLOPE SCORING ──
  if (slope > 25) {
    score += 30;
    factors.push({ icon: '⛰️', text: 'Very steep slope (>25%) — extremely high runoff risk' });
  } else if (slope > 15) {
    score += 22;
    factors.push({ icon: '⛰️', text: 'Steep slope (15–25%) — significant runoff and erosion risk' });
  } else if (slope > 8) {
    score += 15;
    factors.push({ icon: '⛰️', text: 'Moderate slope (8–15%) — moderate erosion potential' });
  } else if (slope > 3) {
    score += 7;
  } else {
    score += 2;
  }

  // ── SOIL TEXTURE SCORING ──
  const soilRisk = { sandy: 18, 'sandy-loam': 14, silty: 16, loamy: 8, clay: 10 };
  score += soilRisk[soilTex] || 0;
  if (soilTex === 'sandy' || soilTex === 'silty') {
    factors.push({ icon: '🌍', text: `${soilTex.charAt(0).toUpperCase() + soilTex.slice(1)} soil — highly erodible texture with low cohesion` });
  }

  // ── LAND COVER SCORING ──
  const coverRisk = { bare: 22, cropland: 14, grassland: 6, forest: 2, mixed: 8 };
  score += coverRisk[landCover] || 0;
  if (landCover === 'bare') {
    factors.push({ icon: '🏜️', text: 'Bare soil — no vegetative cover, maximum erosion exposure' });
    recs.push({ icon: '🌾', title: 'Establish Ground Cover', desc: 'Plant cover crops or mulch immediately to protect bare soil from rain impact.' });
  }
  if (landCover === 'cropland') {
    recs.push({ icon: '🌽', title: 'Crop Rotation', desc: 'Rotate crops and maintain residue cover between seasons to reduce soil exposure.' });
  }

  // ── RAINFALL SCORING ──
  const rainRisk = { low: 4, moderate: 10, high: 18, 'very-high': 25 };
  score += rainRisk[rainfall] || 0;
  if (rainfall === 'high' || rainfall === 'very-high') {
    factors.push({ icon: '🌧️', text: 'High/Very high rainfall intensity — strong erosive forces during storms' });
    recs.push({ icon: '💧', title: 'Install Drainage Channels', desc: 'Construct grassed waterways or contour drains to safely channel excess rainwater.' });
  }

  // ── DRAINAGE SCORING ──
  const drainRisk = { well: 2, moderate: 8, poorly: 16, waterlogged: 22 };
  score += drainRisk[drainage] || 0;
  if (drainage === 'poorly' || drainage === 'waterlogged') {
    factors.push({ icon: '🌊', text: 'Poor drainage — water accumulation accelerates sheet and rill erosion' });
    recs.push({ icon: '🔧', title: 'Improve Drainage', desc: 'Consider subsoil drainage or mounding to reduce waterlogging and runoff velocity.' });
  }

  // ── PRACTICES (positive reduce score, negative increase) ──
  if (heavyTill) {
    score += 8;
    factors.push({ icon: '🚜', text: 'Heavy tillage — destroys soil structure and increases erodibility' });
  }
  if (burning) {
    score += 10;
    factors.push({ icon: '🔥', text: 'Burning — removes protective cover and kills soil organic matter' });
  }
  if (residue) {
    score += 6;
    factors.push({ icon: '🌿', text: 'Residue removal — eliminates natural surface protection' });
  }
  if (mulching) {
    score -= 8;
    recs.push({ icon: '🍂', title: 'Continue Mulching', desc: 'Excellent practice — maintain mulch layer year-round for maximum protection.' });
  }
  if (minTill) {
    score -= 6;
    recs.push({ icon: '✅', title: 'Maintain Minimum Tillage', desc: 'Keep up minimum tillage to preserve soil structure and reduce surface disturbance.' });
  }
  if (coverCrops) {
    score -= 10;
    recs.push({ icon: '🌱', title: 'Continue Cover Crops', desc: 'Great choice — ensure cover crops are established before the rainy season starts.' });
  }

  // Clamp score between 0–100
  score = Math.max(0, Math.min(100, score));

  // ── GENERAL RECOMMENDATIONS based on score ──
  if (slope > 8) {
    recs.push({ icon: '🏔️', title: 'Contour Farming', desc: 'Farm along contour lines rather than up and down slopes to reduce runoff velocity.' });
  }
  if (score > 40) {
    recs.push({ icon: '🌳', title: 'Agroforestry', desc: 'Integrate trees into your farm system — their deep roots stabilize soil and reduce runoff.' });
  }
  if (score > 60) {
    recs.push({ icon: '🪨', title: 'Terracing', desc: 'Construct terraces on steep slopes to create level platforms and trap runoff.' });
  }
  if (burning) {
    recs.push({ icon: '🚫', title: 'Stop Burning', desc: 'Replace burning with composting residues — burning destroys protective organic matter and increases runoff.' });
  }
  if (recs.length === 0) {
    recs.push({ icon: '👍', title: 'Maintain Good Practices', desc: 'Your current practices are relatively low-risk. Continue monitoring and maintaining your soil health.' });
  }

  // ── DETERMINE RISK LEVEL ──
  let level, badgeClass, fillClass, pct;
  if (score <= 33) {
    level = '🟢 Low Risk';
    badgeClass = 'risk-low';
    fillClass  = 'fill-low';
    pct = Math.max(10, score);
  } else if (score <= 65) {
    level = '🟡 Medium Risk';
    badgeClass = 'risk-medium';
    fillClass  = 'fill-medium';
    pct = score;
  } else {
    level = '🔴 High Risk';
    badgeClass = 'risk-high';
    fillClass  = 'fill-high';
    pct = score;
  }

  // ── RENDER BADGE ──
  const badge = document.getElementById('risk-badge');
  badge.textContent = level;
  badge.className   = 'risk-badge ' + badgeClass;

  // ── RENDER SCORE BAR ──
  const fill = document.getElementById('risk-fill');
  fill.className = 'risk-score-fill ' + fillClass;
  fill.style.width = '0%';
  setTimeout(() => { fill.style.width = pct + '%'; }, 100);

  // ── RENDER SUMMARY ──
  const summaries = {
    'risk-low':    'Your site has relatively low erosion risk. Some preventive measures are still recommended.',
    'risk-medium': 'Moderate erosion risk detected. Take action now to prevent escalation.',
    'risk-high':   'High erosion risk! Immediate conservation action is strongly recommended to protect your farmland.'
  };
  document.getElementById('risk-summary').textContent =
    summaries[badgeClass] + ` (Risk Score: ${Math.round(score)}/100)`;

  // ── RENDER RECOMMENDATIONS ──
  document.getElementById('recommendations').innerHTML = recs.map(r =>
    `<div class="recommendation-item">
       <span class="rec-icon">${r.icon}</span>
       <p><strong>${r.title}</strong>${r.desc}</p>
     </div>`
  ).join('');

  // ── RENDER RISK FACTORS ──
  const factEl = document.getElementById('risk-factors');
  if (factors.length === 0) {
    factEl.innerHTML = '<p style="color:var(--text-soft);font-size:0.9rem;padding:12px 0;">No critical risk factors identified for your inputs.</p>';
  } else {
    factEl.innerHTML = factors.map(f =>
      `<div class="recommendation-item risk-factor-item">
         <span class="rec-icon">${f.icon}</span>
         <p>${f.text}</p>
       </div>`
    ).join('');
  }

  // ── SHOW RESULTS & SCROLL ──
  const resultsSection = document.getElementById('results-section');
  resultsSection.style.display = 'block';
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}


/* ============================================
   SURVEY SUBMISSION (survey.html)
   ============================================ */

function submitSurvey() {

  // Get required fields
  const name    = document.getElementById('s-name').value.trim();
  const occ     = document.getElementById('s-occupation').value;
  const state   = document.getElementById('s-state').value.trim();
  const purpose = document.getElementById('s-purpose').value;
  const exp     = document.getElementById('s-experience').value;
  const consent = document.getElementById('s-consent').checked;

  // Validate
  if (!name || !occ || !state || !purpose || !exp) {
    alert('Please fill in all required fields (marked with *).');
    return;
  }
  if (!consent) {
    alert('Please agree to the data usage terms to submit the survey.');
    return;
  }

  // Show success message
  const banner = document.getElementById('survey-success');
  banner.style.display = 'block';
  banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Reset all form fields
  ['s-name', 's-email', 's-phone', 's-org', 's-state'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['s-occupation', 's-purpose', 's-experience'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('s-consent').checked = false;
  document.querySelectorAll('input[name="updates"]').forEach(r => r.checked = false);
  document.querySelectorAll('.topics-grid input[type="checkbox"]').forEach(c => c.checked = false);
}
