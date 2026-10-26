const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../weight-model.js');
test('load inputs cover lifts, balls, sleds and resistance but exclude unweighted work', () => {
  for (const name of ['Bench Press','DB Bench Press','BB Hip Thrust','Palloff Press','Y - Raises','Calf Raise']) assert.equal(model.kind(name),'weight',name);
  assert.equal(model.kind('Hop Back to MB Scoop Toss'),'ball');
  assert.equal(model.kind('Sled Sprint'),'sled');
  assert.equal(model.kind('Band Pull Aparts'),'resistance');
  for (const name of ['Pogo Jumps','Dynamic Warm Up','Nordic Hamstring Curl','SL Swiss Ball Hamstring Curl','Overcoming Iso Bench Press','Plank']) assert.equal(model.kind(name),null,name);
});
test('last load is remembered across weeks and equivalent DB naming, separately by athlete', () => {
  const empty = {entries:{},last:{}};
  const saved = model.save(empty,'Marcus','ota:beginner:w1-d1-r1','1.A. DB Bench Press - 3 x 10',{weight:'25',unit:'lb'},'2026-10-26T10:00:00Z');
  const next = model.initial(saved,'Marcus','ota:beginner:w2-d1-r1','Dumbbell Bench Press - 3 x 8');
  assert.equal(next.value.weight,25); assert.equal(next.current,undefined);
  assert.equal(model.initial(saved,'Dominic','next','DB Bench Press').value,null);
  assert.equal(model.initial(saved,'Marcus','next','DB Incline Press').value,null);
  assert.deepEqual(empty,{entries:{},last:{}});
});
test('session record keeps its own value when a later session has a different load', () => {
  let saved = model.save({entries:{},last:{}},'Ambrose','first','Bench Press',{weight:'20',unit:'kg'},'2026-10-26T10:00:00Z');
  saved = model.save(saved,'Ambrose','second','Bench Press',{weight:'25',unit:'kg'},'2026-10-27T10:00:00Z');
  assert.equal(model.initial(saved,'Ambrose','first','Bench Press').value.weight,20);
  assert.equal(model.initial(saved,'Ambrose','third','Bench Press').value.weight,25);
});
test('band notes and zero loads are valid; invalid values cannot replace saved data', () => {
  const empty={entries:{},last:{}};
  const band=model.save(empty,'Dominic','band','Band Pull Aparts',{weight:'',unit:'lb',resistance:'Green band'},'2026-10-26');
  assert.equal(band.entries.Dominic.band.weight,null);
  assert.equal(band.entries.Dominic.band.resistance,'Green band');
  assert.equal(model.save(empty,'Dominic','zero','Sled Sprint',{weight:'0',unit:'kg'},'2026-10-26').entries.Dominic.zero.weight,0);
  for(const value of ['-1','NaN','Infinity',''])assert.throws(()=>model.save(empty,'Marcus','x','Bench Press',{weight:value,unit:'lb'},'2026-10-26'));
});
