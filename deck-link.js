/* ===== DECK LINK — Tape Loop Deck shares its tapes with other apps in the ecosystem =====
   One identical copy of this block is embedded in each app that uses it (between the DECK-LINK
   markers); deck-link.js is the source copy. Same browser, same origin, any number of tabs.

   Tape Loop Deck is the *deck*. Any app can be a *taker* (Axis Stack is the first): it lists the
   tapes on every open deck, picks one, gets that tape's loop audio once, and plays its own copy
   locked to the deck — so the copy can go through the taker's effects while the deck plays on.

   Time is the shared wall clock in ms: performance.timeOrigin + performance.now(), meaning the
   moment a sound is *heard*. Each app maps it to its own AudioContext with getOutputTimestamp(),
   so two tabs on one computer line up to within a few milliseconds.

   Deck:
     const dl = DeckLink.deck({
       title: 'Tape Loop Deck',
       tapes: () => [ { id, name, ver, len, speed, playing, anchorWall, anchorPhase, on, onAt, fadeMs } ],
       audio: id => ({ ver, sampleRate, left, right }) | null,   // the tape's whole loop, as heard
       onTakers: map => {}                                        // { tapeId: ['Axis Stack', ...] }
     });
     dl.changed()     // tapes, timing or on/off changed: tell takers now (it also repeats every second)

     Per tape: len is the loop's length in seconds of audio, speed its playback rate; the loop is at
     anchorPhase seconds (of audio) at wall time anchorWall, and runs on at speed. ver changes
     whenever the audio itself changes. on is whether the deck is sounding it (mute, solo, patterns);
     onAt is the wall time that state takes effect (it may be just ahead), fadeMs how long it ramps.

   Taker:
     const tk = DeckLink.taker({ app: 'axis', title: 'Axis Stack',
       onDecks: decks => {},           // [{ id, title, tapes: [...] }] whenever anything changes
       onAudio: msg => {} });          // { deck, tape, ver, sampleRate, left, right }
     tk.use(deckId, tapeId)            // or tk.use(null): which tape this app is playing
     tk.fetch(deckId, tapeId, ver)     // ask for a tape's audio (answered by onAudio)
     tk.phaseAt(tape, wall)            // where a tape's loop is (seconds of audio) at wall time

   Messages: { dv:1, from, kind, ... } on channel CHANNEL.
     deck  -> all   deck    { title, tapes }                 heartbeat and on every change
     taker -> all   taker   { title, uses: { deckId, tapeId } | null }   heartbeat
     taker -> deck  want    { to, tape, ver, reqId }
     deck  -> taker audio   { to, reqId, tape, ver, sampleRate, left, right }
     either -> all  bye */
(function(global){
  'use strict';
  if(global.DeckLink) return;
  var CHANNEL = 'aaronvandorn-deck-v1', DV = 1;
  var HB_MS = 1000, TTL_MS = 4000;
  function rid(){ return Math.random().toString(36).slice(2, 10); }
  function wallNow(){ return performance.timeOrigin + performance.now(); }
  function fin(v, lo, hi){ return typeof v === 'number' && isFinite(v) && v >= lo && v <= hi; }
  function open(onMsg){
    if(typeof BroadcastChannel === 'undefined') return null;
    var ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = function(e){ var m = e.data; if(m && m.dv === DV && typeof m.kind === 'string' && typeof m.from === 'string') onMsg(m); };
    return ch;
  }
  function cleanTape(t){
    if(!t || (typeof t.id !== 'string' && typeof t.id !== 'number')) return null;
    if(!fin(t.len, 0.001, 36000) || !fin(t.speed, 0.01, 100)) return null;
    return {
      id: String(t.id).slice(0, 40), name: String(t.name || 'Tape').slice(0, 60), ver: String(t.ver == null ? '' : t.ver).slice(0, 40),
      len: t.len, speed: t.speed, playing: !!t.playing,
      anchorWall: fin(t.anchorWall, 0, Infinity) ? t.anchorWall : 0, anchorPhase: fin(t.anchorPhase, 0, 36000) ? t.anchorPhase : 0,
      on: t.on !== false, onAt: fin(t.onAt, 0, Infinity) ? t.onAt : 0, fadeMs: fin(t.fadeMs, 0, 60000) ? t.fadeMs : 0
    };
  }
  function phaseAt(t, wall){
    if(!t || !t.playing) return 0;
    var p = (t.anchorPhase + (wall - t.anchorWall) / 1000 * t.speed) % t.len;
    return p < 0 ? p + t.len : p;
  }

  function deck(o){
    var id = rid(), ch = null, takers = {}, hb = 0, lastTakers = '';
    function post(m){ if(!ch) return; m.dv = DV; m.from = id; try{ ch.postMessage(m); }catch(e){} }
    function tapes(){ var a = []; try{ a = o.tapes() || []; }catch(e){} return a.map(cleanTape).filter(Boolean); }
    function changed(){ if(ch) post({ kind:'deck', title: o.title || 'Tape Loop Deck', tapes: tapes() }); }
    function sweep(){
      var now = Date.now(), map = {};
      Object.keys(takers).forEach(function(k){
        var t = takers[k];
        if(now - t.seen > TTL_MS){ delete takers[k]; return; }
        if(t.uses && t.uses.deckId === id){ (map[t.uses.tapeId] = map[t.uses.tapeId] || []).push(t.title); }
      });
      var sig = JSON.stringify(map);
      if(sig !== lastTakers){ lastTakers = sig; try{ o.onTakers && o.onTakers(map); }catch(e){} }
    }
    function onMsg(m){
      if(m.kind === 'taker'){
        var u = m.uses && typeof m.uses === 'object' ? { deckId: String(m.uses.deckId), tapeId: String(m.uses.tapeId) } : null;
        var fresh = !takers[m.from];
        takers[m.from] = { title: String(m.title || 'An app').slice(0, 40), uses: u, seen: Date.now() };
        sweep();
        if(fresh) changed();
      } else if(m.kind === 'bye'){ if(takers[m.from]){ delete takers[m.from]; sweep(); } }
      else if(m.kind === 'want' && m.to === id){
        var a = null; try{ a = o.audio(String(m.tape)); }catch(e){}
        if(!a || !a.left) return;
        post({ kind:'audio', to: m.from, reqId: m.reqId, tape: String(m.tape), ver: String(a.ver), sampleRate: a.sampleRate, left: a.left, right: a.right || a.left });
      }
    }
    ch = open(onMsg);
    if(ch){
      hb = setInterval(function(){ changed(); sweep(); }, HB_MS);
      setTimeout(changed, 50);
      addEventListener('pagehide', function(){ post({ kind:'bye' }); });
    }
    return { id: id, changed: changed, active: !!ch, takers: function(){ return takers; } };
  }

  function taker(o){
    var id = rid(), ch = null, decks = {}, uses = null, sig = '';
    function post(m){ if(!ch) return; m.dv = DV; m.from = id; try{ ch.postMessage(m); }catch(e){} }
    function hello(){ post({ kind:'taker', title: o.title || o.app || 'App', uses: uses }); }
    function list(){
      var now = Date.now();
      return Object.keys(decks).filter(function(k){ return now - decks[k].seen <= TTL_MS; })
        .map(function(k){ return { id: k, title: decks[k].title, tapes: decks[k].tapes }; });
    }
    function emit(force){
      var l = list(), s = JSON.stringify(l);
      if(force || s !== sig){ sig = s; try{ o.onDecks && o.onDecks(l); }catch(e){} }
    }
    function onMsg(m){
      if(m.kind === 'deck'){
        var ts = Array.isArray(m.tapes) ? m.tapes.slice(0, 256).map(cleanTape).filter(Boolean) : [];
        decks[m.from] = { title: String(m.title || 'Tape Loop Deck').slice(0, 40), tapes: ts, seen: Date.now() };
        emit();
      } else if(m.kind === 'bye'){ if(decks[m.from]){ delete decks[m.from]; emit(); } }
      else if(m.kind === 'audio' && m.to === id){
        if(!(m.left instanceof Float32Array) || !fin(m.sampleRate, 3000, 768000)) return;
        var right = m.right instanceof Float32Array && m.right.length === m.left.length ? m.right : m.left;
        try{ o.onAudio && o.onAudio({ deck: m.from, tape: String(m.tape), ver: String(m.ver), sampleRate: m.sampleRate, left: m.left, right: right }); }catch(e){}
      }
    }
    ch = open(onMsg);
    if(ch){
      setInterval(function(){ hello(); emit(); }, HB_MS);
      hello();
      addEventListener('pagehide', function(){ post({ kind:'bye' }); });
    }
    return {
      id: id, active: !!ch, decks: list, phaseAt: phaseAt, wallNow: wallNow,
      use: function(deckId, tapeId){ var u = deckId && tapeId != null ? { deckId: String(deckId), tapeId: String(tapeId) } : null; if(JSON.stringify(u) !== JSON.stringify(uses)){ uses = u; hello(); } },
      fetch: function(deckId, tapeId, ver){ post({ kind:'want', to: deckId, tape: String(tapeId), ver: String(ver || ''), reqId: rid() }); }
    };
  }

  global.DeckLink = { deck: deck, taker: taker, phaseAt: phaseAt, wallNow: wallNow, CHANNEL: CHANNEL };
})(typeof window !== 'undefined' ? window : globalThis);
