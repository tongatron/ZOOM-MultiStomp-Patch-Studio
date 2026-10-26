// Advice rules for the Zoom MS-50G+ (not tested on the pedal yet).
// Only objective checks for now: the order, style and tone advice of the MS-60B+ cites bass sources and does not
// carry over to guitar. Add guitar rules here with their own sources (see site/advice-rules.js for the shapes).

(() => {
  ADVICE.addSources({
    zoomManual: { title: 'ZOOM MS-50G+ Operation Manual', url: 'https://zoomcorp.com/manuals/ms-50gplus-en/' },
    zoomFxList: { title: 'ZOOM MS-50G+ Effects List', url: 'https://zoomcorp.com/media/documents/E_MS-50Gplus_EffectsList.pdf' }
  });

  const { setValue } = ADVICE.edit;
  // Effects the Effects List describes as operated with the foot switch
  const footswitchFx = new Set(EFFECTS_DATA.filter(([, , , description]) => /foot ?switch/i.test(description)).map(([name]) => name));

  ADVICE.addRules([
    {
      id: 'dsp.overflow', severity: 'error', topic: 'dsp', title: 'Processing load over 100%',
      why: 'The effects of a patch share the processing capacity of the pedal. Values are estimated on the Handy Guitar Lab "Processor" scale (calibrated on the MS-60B+).',
      sources: [],
      check: ctx => ctx.dsp > 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Remove or replace an effect (amps are the heaviest).` }] : []
    },
    {
      id: 'dsp.near-limit', severity: 'tip', topic: 'dsp', title: 'Close to the processing limit',
      why: 'The DSP estimate is calibrated on the MS-60B+ and not yet checked on the MS-50G+. A patch right at the limit may not fit on the pedal.',
      sources: [],
      check: ctx => ctx.dsp > 95 && ctx.dsp <= 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Leave a little headroom.` }] : []
    },
    {
      id: 'level.muted', severity: 'error', topic: 'levels', title: 'Effect volume at zero',
      why: 'VOL sets the output level of the effect. At 0 the effect is switched on but nothing comes out of it, so the whole patch goes silent.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('VOL') && s.num('VOL') === 0).map(s => ({
        slots: [s.i], message: `${s.label} has VOL at 0.`,
        fix: { label: 'Set VOL to 80', apply: p => setValue(p, s.i, 'VOL', 80) }
      }))
    },
    {
      id: 'chain.all-off', severity: 'warning', topic: 'chain', title: 'Every effect is off',
      why: 'With all effects bypassed the patch only passes the dry signal.',
      sources: [],
      check: ctx => ctx.slots.length && !ctx.active.length ? [{ message: 'Switch on at least one effect.' }] : []
    },
    {
      id: 'mix.silent-effect', severity: 'warning', topic: 'levels', title: 'Effect mixed out completely',
      why: 'MIX sets how much of the effect is blended with the original sound. At 0 the effect uses processing power but is inaudible.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('MIX') && s.num('MIX') === 0).map(s => ({
        slots: [s.i], message: `${s.label} has MIX at 0, so it cannot be heard.`, fix: { label: 'Set MIX to 30', apply: p => setValue(p, s.i, 'MIX', 30) }
      }))
    },
    {
      id: 'linesel.last', severity: 'warning', topic: 'routing', title: 'Line Selector at the end does nothing',
      why: 'LINE SELECTOR sends the signal either to the next effect or straight to the outputs. As the last effect both routes end at the outputs.',
      sources: ['zoomFxList'],
      check: ctx => {
        const last = ctx.active.at(-1);
        return last && last.role === 'linesel' && ctx.active.length > 1 ? [{ slots: [last.i], message: 'Move LINE SELECTOR in front of the effects you want to be able to skip.' }] : [];
      }
    },
    {
      id: 'usage.footswitch', severity: 'tip', topic: 'usage', title: 'Footswitch-controlled effect',
      why: 'This effect is operated with the footswitch (see its description in the Effects List), so its sound depends on how you press it. Try it on the pedal before relying on it.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => footswitchFx.has(s.fx.name)).map(s => ({
        slots: [s.i], message: `${s.fx.name} is controlled with the footswitch: practise the footwork before a gig.`
      }))
    },
    {
      id: 'usage.tempo-sync', severity: 'tip', topic: 'usage', title: 'Delay synced to the tempo',
      why: 'When the delay MODE is set to the metronome symbol, the delay time follows the tempo, so the result depends on the tempo of the patch.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('MODE') && String(s.v('MODE')).includes('♩')).map(s => ({
        slots: [s.i], message: `${s.fx.name}: the delay time follows the tempo. Set the tempo of this patch on the pedal.`
      }))
    }
  ]);

  ADVICE.addRoleTips({
    linesel: { place: 'In front of the effects to skip', text: 'LINE SELECTOR sends the signal to the next effect or straight to the outputs, so effects after it can be skipped. It does nothing as the last effect.', sources: ['zoomFxList'] }
  });

  ADVICE.addStyles([
    { id: 'general', name: 'General', summary: 'Objective checks only: guitar style advice is not written yet.', severity: {}, sources: [], starter: null }
  ]);
})();
