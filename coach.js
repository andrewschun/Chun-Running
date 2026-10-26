function coachProgramCount(program, athlete) {
  const sessions = otaPrograms[program];
  const drills = sessions.flatMap(session => session.drills);
  const checks = otaChecks(program, athlete);
  return { total: drills.length, done: drills.filter(drill => checks[drill.id] === true).length };
}
function coachDrivelineCount(athlete) {
  let total = 0, done = 0;
  for (let week = 1; week <= 6; week++) {
    planData.forEach((day, di) => day.rows.forEach((row, ri) => {
      total++;
      if (planChecks[`${athlete}:${week}:${di}:${ri}`] === true) done++;
    }));
  }
  return { total, done };
}
function coachProgressCell(count) {
  return count.total ? `<span>${count.done} / ${count.total} drills</span><progress max="${count.total}" value="${count.done}" aria-label="${count.done} of ${count.total} drills complete"></progress>` : '<span class="muted">Loading…</span>';
}
function renderCoachDesk() {
  const overview = document.querySelector('#coach-overview');
  if (!overview) return;
  renderCoachWeights();
  const distance = logs.reduce((sum, entry) => sum + miles(entry), 0);
  const minutes = logs.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);
  overview.innerHTML = [[logs.length, 'Recorded workouts'], [distance.toFixed(1), 'Team miles'], [minutes.toFixed(0), 'Minutes moving']].map(([value, label]) => `<div class="coach-metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
  document.querySelector('#coach-progress').innerHTML = `<table class="coach-table"><thead><tr><th scope="col">Athlete</th><th scope="col">Workouts</th><th scope="col">Driveline</th><th scope="col">OTA Beginner</th><th scope="col">OTA Advanced</th></tr></thead><tbody>${names.map(athlete => {
    const entries = logs.filter(entry => entry.athlete === athlete);
    const latest = entries.map(entry => entry.date).sort().at(-1);
    const unlocked = isBeginnerComplete(athlete);
    return `<tr><th scope="row"><button class="textbtn coach-athlete" data-person="${athlete}">${athlete} ↗</button><small>${latest ? 'Last recorded: ' + esc(latest) : 'No recorded workouts'}</small></th><td><b>${entries.length}</b><small>${entries.reduce((sum, entry) => sum + miles(entry), 0).toFixed(1)} mi · ${entries.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0).toFixed(0)} min</small></td><td>${coachProgressCell(coachDrivelineCount(athlete))}</td><td>${coachProgressCell(coachProgramCount('beginner', athlete))}</td><td>${coachProgressCell(coachProgramCount('advanced', athlete))}<small>${unlocked ? 'Unlocked' : 'Locked · Complete Beginner'}</small></td></tr>`;
  }).join('')}</tbody></table>`;
}
