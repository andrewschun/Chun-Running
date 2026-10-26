const WeightModel = {
  exerciseName(text) {
    return text.replace(/^\d+\.(?:\s*[A-C]\.)?\s*/, '').split(/\s+-\s+(?=\d|Max)/)[0].trim();
  },
  exerciseKey(text) {
    return this.exerciseName(text).toLowerCase().replace(/\bdb\b/g,'dumbbell').replace(/\bbb\b/g,'barbell').replace(/[^a-z0-9]+/g,' ').trim();
  },
  kind(text) {
    const name = this.exerciseName(text).toLowerCase();
    if (/overcoming\s+iso/.test(name)) return null;
    if (/band|resisted|monster walk|scarecrow|glute bridge with abduction/.test(name)) return 'resistance';
    if (/\bmb\b|medball|medicine ball|shot\s*(?:put|toss)|scoop toss|reactive side toss|side slam|soccer toss/.test(name)) return 'ball';
    if (/sled|prowler/.test(name)) return 'sled';
    if (/nordic|swiss ball|buddy hamstring/.test(name)) return null;
    if (/\bdb\b|dumbbell|\bbb\b|barbell|trap bar|bench press|floor press|band press|front squat|back squat|box squat|\brdl\b|romanian deadlift|overhead press|pallof|palloff|cable|facepull|hammer curl|preacher curl|concentration curl|reverse curl|tricep|skull crusher|pulldown|pull down|incline row|pendlay row|\bz press\b|landmine|\bkb\b|kettlebell|farmer carry|suitcase carry|plate raise|lateral raise|rear delt|dump the buckets|goodmorning|hip thrust|weighted|hex hold|hamstring curls?$|calf raise|y\s*-?\s*raises|incline ity/.test(name)) return 'weight';
    return null;
  },
  initial(store, athlete, context, exercise) {
    const current = store.entries?.[athlete]?.[context];
    const previous = store.last?.[athlete]?.[this.exerciseKey(exercise)];
    return { current, previous, value: current || previous || null };
  },
  save(store, athlete, context, exercise, input, timestamp) {
    const raw = String(input.weight ?? '').trim();
    const weight = raw === '' ? null : Number(raw);
    const resistance = String(input.resistance || '').trim();
    if ((weight === null && !resistance) || (weight !== null && (!Number.isFinite(weight) || weight < 0)) || !['lb','kg'].includes(input.unit)) throw new Error('Enter a valid weight of 0 or more, or a resistance note.');
    const record = { exercise: this.exerciseName(exercise), context, weight, unit: input.unit, resistance, savedAt: timestamp };
    return { entries: { ...store.entries, [athlete]: { ...store.entries?.[athlete], [context]: record } }, last: { ...store.last, [athlete]: { ...store.last?.[athlete], [this.exerciseKey(exercise)]: record } } };
  }
};
if (typeof module !== 'undefined') module.exports = WeightModel;
