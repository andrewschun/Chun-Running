const weightStorageKey = 'chun-running-weights-v1';
let weightData = { entries: {}, last: {} };
let weightStorageError = '';
try {
  const stored = JSON.parse(localStorage.getItem(weightStorageKey) || 'null');
  if (stored && stored.entries && stored.last && typeof stored.entries === 'object' && typeof stored.last === 'object') weightData = stored;
} catch { weightStorageError = 'Previous weights could not be loaded. Check browser storage.'; }
function weightText(record) {
  return [record.weight === null ? '' : `${record.weight} ${record.unit}${record.basis === 'plates-only' ? ' plates (bar excluded)' : WeightModel.platesOnly(record.exercise) ? ' — confirm plates only' : ''}`, record.resistance].filter(Boolean).join(' · ');
}
function weightEditor(exercise, context) {
  const kind = WeightModel.kind(exercise);
  if (!kind) return '';
  const state = WeightModel.initial(weightData, selected, context, exercise);
  const record = state.value;
  const platesOnly = WeightModel.platesOnly(exercise);
  const label = platesOnly ? 'Total plates (bar excluded)' : kind === 'ball' ? 'Ball weight' : kind === 'sled' ? 'Added sled weight' : /\bdb\b|dumbbell/i.test(exercise) ? 'Weight per dumbbell' : 'Weight used';
  return `<div class="weight-editor" data-weight-context="${esc(context)}" data-weight-exercise="${esc(exercise)}">
    <p class="weight-memory">${esc(weightStorageError || (state.current ? 'Saved for this session: ' + weightText(state.current) : state.previous ? 'Last entry: ' + weightText(state.previous) + ' · ' + new Date(state.previous.savedAt).toLocaleDateString() + ' · Prefilled; save after use.' : 'No previous weight recorded for this exercise.'))}</p>
    <p class="plan-message">${platesOnly ? 'Add the plates on both sides together. Exclude the barbell weight.' : ''}</p><div class="weight-fields"><label>${label}<input type="number" min="0" step="any" inputmode="decimal" data-weight-value value="${esc(record?.weight ?? '')}" placeholder="Enter weight"></label><label>Unit<select data-weight-unit><option value="lb" ${record?.unit !== 'kg' ? 'selected' : ''}>lb</option><option value="kg" ${record?.unit === 'kg' ? 'selected' : ''}>kg</option></select></label></div>
    <label>${kind === 'resistance' ? 'Band / resistance used' : 'Load notes (optional)'}<input type="text" maxlength="200" data-weight-resistance value="${esc(record?.resistance || '')}" placeholder="${kind === 'resistance' ? 'e.g. green band' : 'e.g. plate setup or machine setting'}"></label>
    <button type="button" class="outline" data-save-weight>Save weight</button><span class="weight-status" role="status"></span>
  </div>`;
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-save-weight]');
  if (!button) return;
  const editor = button.closest('[data-weight-context]');
  const status = editor.querySelector('.weight-status');
  if (editor.dataset.weightContext.startsWith('ota:advanced:') && !isBeginnerComplete(selected)) { status.textContent = 'Complete Beginner before recording Advanced workouts.'; return; }
  try {
    const next = WeightModel.save(weightData, selected, editor.dataset.weightContext, editor.dataset.weightExercise, { weight: editor.querySelector('[data-weight-value]').value, unit: editor.querySelector('[data-weight-unit]').value, resistance: editor.querySelector('[data-weight-resistance]').value }, new Date().toISOString());
    localStorage.setItem(weightStorageKey, JSON.stringify(next));
    weightData = next;
    weightStorageError = '';
    editor.querySelector('.weight-memory').textContent = 'Saved for this session: ' + weightText(next.entries[selected][editor.dataset.weightContext]);
    status.textContent = 'Saved for ' + selected + '. Remembered for next time.';
    if (typeof renderCoachDesk === 'function') renderCoachDesk();
  } catch (error) { status.textContent = error.message === 'Enter a valid weight of 0 or more, or a resistance note.' ? error.message : 'Unable to save weight. Please allow browser storage and try again.'; }
});
function renderCoachWeights() {
  const target = document.querySelector('#coach-weights');
  if (!target) return;
  const records = names.flatMap(athlete => Object.values(weightData.entries[athlete] || {}).map(record => ({ ...record, athlete }))).sort((a,b) => b.savedAt.localeCompare(a.savedAt)).slice(0,10);
  target.innerHTML = `<h3>Recent workout weights</h3>${records.length ? '<div class="coach-table-wrap"><table class="coach-table"><thead><tr><th>Athlete</th><th>Exercise</th><th>Load</th><th>Saved</th></tr></thead><tbody>' + records.map(record => `<tr><td>${esc(record.athlete)}</td><td>${esc(record.exercise)}</td><td>${esc(weightText(record))}</td><td>${esc(new Date(record.savedAt).toLocaleDateString())}</td></tr>`).join('') + '</tbody></table></div>' : '<p class="muted">Weights saved beside workout drills will appear here.</p>'}`;
}
