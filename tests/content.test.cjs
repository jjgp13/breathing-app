const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Recommendations = require('../js/recommendations.js');
const GuideMath = require('../js/breath-guide.js');
const catalog = vm.runInNewContext(fs.readFileSync('js/techniques.js','utf8') + '\ntechniques');
const en = require('../locales/en.json'), es = require('../locales/es.json');

test('all feeling, time, and hold choices produce bounded suggestions with gentle defaults', () => {
    assert.equal(Recommendations.suggest({feeling:'unknown'}, catalog), null);
    for (const feeling of Recommendations.feelings) for (const minutes of [1,3,5]) for (const holds of [false,true]) {
        const result = Recommendations.suggest({ feeling, minutes, holds }, catalog);
        assert.equal(result.choices.length, 2);
        assert.ok(en.checkin.reasons[result.reason]); assert.ok(es.checkin.reasons[result.reason]);
        for (const choice of result.choices) {
            const technique = catalog[choice.id];
            assert.equal(technique.advanced, false);
            assert.ok(choice.cycles >= 1 && choice.cycles <= technique.maxCycles);
            assert.ok(choice.seconds <= minutes * 60);
            if (!holds) assert.ok(technique.phases.every(p => !['hold','retention','power'].includes(p.type)));
        }
    }
    assert.equal(Recommendations.suggest({feeling:'busy',holds:true},catalog).choices[0].id, 'box');
});

test('guide expands continuously through the second inhale and rests during both kinds of hold', () => {
    const sigh = catalog.cyclicSighing;
    assert.equal(GuideMath.volume(sigh,0,1), GuideMath.volume(sigh,1,0));
    assert.equal(GuideMath.volume(sigh,1,1), GuideMath.volume(sigh,2,0));
    assert.equal(GuideMath.volume(sigh,2,1), GuideMath.volume(sigh,0,0));
    for(const progress of [0,.25,.5,1]) {
        assert.equal(GuideMath.volume(catalog.box,1,progress),1);
        assert.equal(GuideMath.volume(catalog.box,3,progress),0);
    }
    assert.equal(GuideMath.volume(catalog.humming,1,0),1);
    assert.equal(GuideMath.volume(catalog.humming,1,1),0);
});

test('each live technique has complete evidence content and translated phase instructions', () => {
    for (const technique of Object.values(catalog)) {
        assert.ok(technique.defaultCycles <= technique.maxCycles);
        assert.ok(technique.research.sources.length);
        technique.research.sources.forEach(source => assert.match(source.url,/^https:\/\//));
        for (const locale of [en,es]) {
            const copy = locale.techniques[technique.id];
            for (const key of ['name','tagline','science','limitations','safety','mechanism','evidenceLabel']) assert.ok(copy[key], technique.id + '.' + key);
            assert.ok(copy.benefits.length && copy.steps.length);
            technique.phases.forEach(phase => {
                assert.ok(phase.duration > 0); assert.ok(locale.phases[phase.type]);
                assert.ok(locale.guide.visualCues[technique.id][phase.type]);
                if (!['hold'].includes(phase.type)) assert.ok(locale.guide.cue[phase.type]);
            });
        }
    }
});

test('the shipped Blender export contains a morph animation, not a static placeholder', () => {
    const binary = fs.readFileSync('assets/models/breathing-bloom.glb');
    assert.equal(binary.toString('ascii',0,4),'glTF');
    assert.equal(binary.readUInt32LE(4),2);
    assert.equal(binary.readUInt32LE(8),binary.length);
    const json = JSON.parse(binary.toString('utf8',20,20+binary.readUInt32LE(12)));
    assert.ok(json.meshes.some(mesh => mesh.primitives.some(primitive => primitive.targets?.length)));
    assert.ok(json.animations[0].channels.some(channel => channel.target.path === 'weights'));
});
