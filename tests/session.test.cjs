const { test } = require('node:test');
const assert = require('node:assert/strict');
const BreathingSession = require('../js/session.js');

function setup({ cycles = 2, preparationSeconds = 3 } = {}) {
    let time = 0, id = 0;
    const callbacks = new Map(), cues = [], completed = [];
    const technique = { maxCycles: 10, phases: [
        { type: 'inhale', duration: 2 }, { type: 'hold', duration: 1 },
        { type: 'exhale', duration: 2 }, { type: 'hold', duration: 1 }
    ] };
    const session = new BreathingSession(technique, cycles, {
        now: () => time, request: fn => { callbacks.set(++id, fn); return id; },
        cancel: key => callbacks.delete(key), preparationSeconds,
        onCue: snap => cues.push([snap.cycle, snap.phaseIndex]),
        onComplete: snap => completed.push(snap)
    });
    const tick = milliseconds => {
        time += milliseconds;
        const frame = Array.from(callbacks.entries())[0];
        if (frame) { callbacks.delete(frame[0]); frame[1](time); }
    };
    const advance = milliseconds => {
        while (milliseconds > 0) { const delta = Math.min(100, milliseconds); tick(delta); milliseconds -= delta; }
    };
    return { session, tick, advance, cues, completed, callbacks, elapse: ms => { time += ms; } };
}

test('pause during preparation resumes the remaining countdown and excludes paused time', () => {
    const h = setup(); h.session.start(); h.advance(1000); h.session.pause();
    h.elapse(9000); h.session.resume(); h.advance(1999);
    assert.equal(h.session.snapshot().preparing, true);
    h.advance(1); assert.equal(h.session.mode, 'running');
    assert.equal(h.session.snapshot().practiceSeconds, 0);
    h.advance(500); assert.equal(h.session.snapshot().practiceSeconds, .5);
});

test('phase and cycle boundaries preserve frame overshoot without artificial gaps', () => {
    const h = setup({ preparationSeconds: 0 }); h.session.start();
    h.advance(1900); h.tick(250);
    assert.equal(h.session.snapshot().phaseIndex, 1);
    assert.ok(Math.abs(h.session.snapshot().progress - .15) < 1e-9);
    h.advance(3850);
    assert.deepEqual(h.cues, [[1,0],[1,1],[1,2],[1,3],[2,0]]);
    assert.equal(h.session.snapshot().practiceSeconds, 6);
    assert.equal(h.session.snapshot().cycle, 2);
});

test('stop and restart reject a stale frame, even if cancellation arrived too late', () => {
    const h = setup(); h.session.start();
    const stale = [...h.callbacks.values()][0];
    h.session.stop(); h.elapse(5000); h.session.start(); stale(999999);
    assert.equal(h.session.mode, 'preparing');
    assert.equal(h.session.snapshot().remaining, 3);
    assert.equal(h.callbacks.size, 1);
});

test('early hold release advances immediately and completion reports actual practice time once', () => {
    const h = setup({ cycles: 1, preparationSeconds: 0 }); h.session.start();
    h.session.endHold(); assert.equal(h.session.snapshot().phaseIndex, 0);
    h.advance(2200); h.session.endHold();
    assert.equal(h.session.snapshot().phaseIndex, 2);
    h.advance(2300); h.session.endHold();
    assert.equal(h.session.mode, 'complete');
    assert.equal(h.completed.length, 1);
    assert.equal(h.completed[0].practiceSeconds, 4.5);
    h.session.endHold(); h.advance(5000);
    assert.equal(h.completed.length, 1); assert.equal(h.callbacks.size, 0);
});

test('a stalled frame pauses instead of skipping breathing instructions', () => {
    const h = setup({ preparationSeconds: 0 }); h.session.start(); h.advance(500); h.tick(12000);
    assert.equal(h.session.mode, 'paused');
    assert.equal(h.session.snapshot().pauseReason, 'interrupted');
    assert.equal(h.session.snapshot().practiceSeconds, .5);
    h.session.resume(); h.advance(500);
    assert.equal(h.session.snapshot().practiceSeconds, 1);
});

test('paused holds cannot advance; resume preserves phase and excludes time away', () => {
    const h = setup({ preparationSeconds: 0 }); h.session.start(); h.advance(2300);
    h.session.pause('hidden'); h.elapse(300000); h.session.endHold();
    assert.equal(h.session.snapshot().phaseIndex, 1);
    h.session.resume(); h.advance(700);
    assert.equal(h.session.snapshot().phaseIndex, 2);
    assert.equal(h.session.snapshot().practiceSeconds, 3);
});
