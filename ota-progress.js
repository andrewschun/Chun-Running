const otaStorageKey = 'chun-running-ota-drills-v2';
const otaPrograms = { beginner: [], advanced: [] };
const otaWeeks = { beginner: 1, advanced: 1 };
let otaProgress = { beginner: {}, advanced: {} };
let otaLoadError = false;
let otaStorageError = '';
try {
  const saved = JSON.parse(localStorage.getItem(otaStorageKey) || 'null');
  if (saved && typeof saved === 'object') {
    for (const program of ['beginner', 'advanced']) {
      if (saved[program] && typeof saved[program] === 'object') otaProgress[program] = saved[program];
    }
  }
} catch { otaStorageError = 'Saved progress could not be loaded. Please check browser storage.'; }

function otaChecks(program, athlete = selected) {
  return otaProgress[program][athlete] || {};
}
function completedBeginnerCount(athlete) {
  return otaPrograms.beginner.filter(session => OtaModel.sessionComplete(session, otaChecks('beginner', athlete))).length;
}
function isBeginnerComplete(athlete) {
  return OtaModel.programComplete(otaPrograms.beginner, otaChecks('beginner', athlete));
}

const otaPanels = {
  beginner: document.querySelector('#ota-beginner-panel'),
  advanced: document.querySelector('#ota-advanced-panel')
};
for (const panel of Object.values(otaPanels)) {
  panel.querySelector('.ota-library')?.remove();
  const content = document.createElement('div');
  content.className = 'ota-program-content';
  panel.append(content);
}

function renderOtaProgress() {
  const unlocked = isBeginnerComplete(selected);
  document.querySelector('#ota-advanced-tab').textContent = 'OTA Speed Agility Advanced' + (unlocked ? '' : ' · Locked');
  for (const program of ['beginner', 'advanced']) renderOtaProgram(program, unlocked);
  if (typeof renderCoachDesk === 'function') renderCoachDesk();
}
function renderOtaProgram(program, unlocked) {
  const panel = otaPanels[program];
  const content = panel.querySelector('.ota-program-content');
  const openDays = [...content.querySelectorAll('details[open]')].map(el => el.dataset.session);
  const sessions = otaPrograms[program];
  const checks = otaChecks(program);
  const doneSessions = sessions.filter(session => OtaModel.sessionComplete(session, checks)).length;
  const drills = sessions.flatMap(session => session.drills);
  const doneDrills = drills.filter(drill => checks[drill.id] === true).length;
  panel.querySelector('.ota-athlete').textContent = `${selected}’s ${program} program · ${doneDrills} / ${drills.length} drills · ${doneSessions} / 48 sessions completed.`;
  if (otaLoadError || !sessions.length) {
    content.innerHTML = `<p role="${otaLoadError ? 'alert' : 'status'}">${otaLoadError ? 'The OTA programs could not load. Refresh to try again. Advanced remains locked until Beginner completion can be verified.' : 'Loading drills and PDF demo links…'}</p>`;
    return;
  }
  if (program === 'advanced' && !unlocked) {
    content.innerHTML = `<div class="ota-library"><p class="eyebrow">BEGINNER REQUIRED</p><h3>Complete every Beginner drill to unlock Advanced.</h3><p class="muted">${esc(selected)} has finished ${completedBeginnerCount(selected)} of 48 Beginner sessions. Complete all drills across the 12-week program first.</p><progress max="48" value="${completedBeginnerCount(selected)}" aria-label="Beginner prerequisite progress"></progress><p><button class="primary" data-go-beginner>Go to Beginner →</button></p></div>`;
    return;
  }
  const weekly = sessions.filter(session => session.week === otaWeeks[program]);
  content.innerHTML = `
    <div class="prerequisite-status"><b>${program === 'beginner' ? (unlocked ? 'Advanced unlocked ✓' : 'Complete all Beginner drills to unlock Advanced') : 'Advanced · Beginner completed ✓'}</b><progress max="${drills.length}" value="${doneDrills}" aria-label="${program} drill completion"></progress></div>
    <p class="plan-message">Check each drill after completing its prescribed work. Session completion is automatic when every drill is checked. Progress saves separately for each athlete in this browser.</p>
    <div class="week-pills" aria-label="${program} training weeks">${Array.from({length:12}, (_, i) => `<button data-ota-program="${program}" data-ota-week="${i+1}" class="${otaWeeks[program] === i+1 ? 'active' : ''}" aria-pressed="${otaWeeks[program] === i+1}">Week ${i+1}</button>`).join('')}</div>
    ${weekly.map((session, i) => {
      const done = session.drills.filter(drill => checks[drill.id] === true).length;
      let lastSection = '';
      return `<details class="beginner-session ota-day" data-session="${session.id}" ${openDays.includes(session.id) || (!openDays.length && i === 0) ? 'open' : ''}>
        <summary><strong>Day ${session.day} — ${esc(session.title)}</strong><span>${done}/${session.drills.length} drills ${done === session.drills.length ? '✓' : ''}</span></summary>
        <p class="plan-message">Phase ${session.phase} · ${esc(session.stage)} · Source PDF page ${session.page}</p>
        ${session.drills.map(drill => {
          const heading = drill.section !== lastSection ? `<p class="eyebrow ota-section">${esc(drill.section)}</p>` : '';
          lastSection = drill.section;
          return `${heading}<div class="exercise ${checks[drill.id] === true ? 'done' : ''}">
            <input type="checkbox" id="${program}-${drill.id}" data-ota-check="${drill.id}" data-ota-program="${program}" ${checks[drill.id] === true ? 'checked' : ''}>
            <div><label for="${program}-${drill.id}">${esc(drill.text)}</label>
            <div class="ota-demo-links">${drill.links.length ? drill.links.map((link, index) => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${link.kind === 'equipment' ? 'Equipment' : 'Demo'}: ${esc(link.label || drill.text)}">${link.kind === 'equipment' ? 'Equipment link' : '▶ Watch demo' + (drill.links.filter(l => l.kind !== 'equipment').length > 1 ? ': ' + esc(link.label) : '')} ↗</a>`).join(' ') : '<span class="missing">No demo hyperlink in source PDF</span>'}</div>${weightEditor(drill.text, `ota:${program}:${drill.id}`)}</div></div>`;
        }).join('')}
      </details>`;
    }).join('')}
    <p class="ota-save-error" role="alert">${esc(otaStorageError)}</p>
    <p class="plan-message">Source: ${program === 'beginner' ? 'OTA Game Speed Agility Beginner.pdf' : 'Game Speed Agility Advanced Training Phases 1–3 PDFs'}. Exercise prescriptions and links come directly from the PDFs. Demo pages may require OTA access. Unchecking any Beginner drill locks Advanced again.</p>`;
}
for (const [program, panel] of Object.entries(otaPanels)) {
  panel.addEventListener('click', event => {
    if (event.target.closest('[data-go-beginner]')) selectSection('ota-beginner');
    const week = event.target.closest('[data-ota-week]');
    if (week) { otaWeeks[program] = Number(week.dataset.otaWeek); renderOtaProgress(); }
  });
  panel.addEventListener('change', event => {
    const input = event.target.closest('[data-ota-check]');
    if (!input) return;
    const id = input.dataset.otaCheck;
    if (program === 'advanced' && !isBeginnerComplete(selected)) { renderOtaProgress(); return; }
    if (!otaPrograms[program].some(session => session.drills.some(drill => drill.id === id))) return;
    const next = { ...otaProgress, [program]: { ...otaProgress[program], [selected]: { ...otaChecks(program), [id]: input.checked } } };
    try {
      localStorage.setItem(otaStorageKey, JSON.stringify(next));
      otaProgress = next;
      otaStorageError = '';
      renderOtaProgress();
      document.getElementById(`${program}-${id}`)?.focus();
    } catch {
      input.checked = !input.checked;
      otaStorageError = 'Unable to save. Please allow browser storage and try again.';
      panel.querySelector('.ota-save-error').textContent = otaStorageError;
    }
  });
}
Promise.all(['beginner', 'advanced'].map(async program => {
  const response = await fetch(`ota-${program}-data.json`);
  if (!response.ok) throw new Error('Program load failed');
  const sessions = await response.json();
  if (sessions.length !== 48 || sessions.some(s => !s.drills?.length)) throw new Error('Incomplete program');
  return [program, sessions];
})).then(results => {
  for (const [program, sessions] of results) otaPrograms[program] = sessions;
  // Only migrate athletes without v2 records. Never re-check a drill the athlete has unchecked.
  try {
    const legacy = JSON.parse(localStorage.getItem('chun-running-ota-beginner-v1') || '{}');
    let changed = false;
    for (const athlete of names) {
      if (!Object.prototype.hasOwnProperty.call(otaProgress.beginner, athlete)) {
        otaProgress.beginner[athlete] = OtaModel.migrateSessions(otaPrograms.beginner, legacy[athlete]);
        changed = true;
      }
    }
    if (changed) localStorage.setItem(otaStorageKey, JSON.stringify(otaProgress));
  } catch { otaStorageError = 'Progress migration could not be saved. Check browser storage before continuing.'; }
  renderOtaProgress();
}).catch(() => { otaLoadError = true; renderOtaProgress(); });

document.querySelector('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(), workouts:logs, drivelineChecks:planChecks, otaDrillProgress:otaProgress, workoutWeights:weightData}, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chun-running-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
