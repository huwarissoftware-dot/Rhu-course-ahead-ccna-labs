/* ============================================================
   PHASE 2 (2026-10-24) — MikroTik track + approved features.
   Additive enhancer: reuses the app's globals (PROGRESS, XP,
   LABS, CATS, QUIZZES...) and never changes Cisco lab data.
   ============================================================ */
(function(){
"use strict";
function $(id){ return document.getElementById(id); }
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function todayStr(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fmtDate(d){ return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }
var SAVE_KEY='rhu-labs-save-v1';
var MONO='data:image/png;base64,__MONO_B64__';
var SIGFONT='__GV_B64__';
try{ var st=document.createElement('style'); st.textContent='@font-face{font-family:\'RHUSig\';src:url(data:font/woff2;base64,'+SIGFONT+') format(\'woff2\');}'; document.head.appendChild(st); }catch(e){}

/* ---------------- profiles ---------------- */
var PROF_KEY='rhu-profiles-v2';
function slotKey(id){ return 'rhu-profslot-'+id; }
function freshSave(){ return {v:1, savedAt:Date.now(), progress:{}, xp:0, sessionDone:0, sessionDate:todayStr(), streak:{last:'',count:0}, mode:'kids', owner:!!window.OWNER, pos:null}; }
var P2={ profiles:null };
function storeProfiles(){ try{ localStorage.setItem(PROF_KEY, JSON.stringify(P2.profiles)); }catch(e){} }
function initProfiles(){
  var reg=null; try{ reg=JSON.parse(localStorage.getItem(PROF_KEY)); }catch(e){}
  if(!reg || !reg.list || !reg.list.length){
    reg={ active:'p1', list:[{id:'p1', name:'Hero 1'}] };
    try{ var cur=localStorage.getItem(SAVE_KEY); if(cur) localStorage.setItem(slotKey('p1'), cur); else localStorage.setItem(slotKey('p1'), JSON.stringify(freshSave())); }catch(e){}
    P2.profiles=reg; storeProfiles();
  } else P2.profiles=reg;
  if(!reg.list.some(function(p){ return p.id===reg.active; })) { reg.active=reg.list[0].id; storeProfiles(); }
}
initProfiles();
try{ sessionStorage.removeItem('p2-switching'); }catch(e){}
/* mirror: keep the active profile's slot in sync with the master save.
   Runs AFTER the Phase-1 save listener (registered later). During a
   profile switch it first patches streak/pos from the incoming slot. */
window.addEventListener('pagehide', function(){
  try{
    var switching=false; try{ switching=sessionStorage.getItem('p2-switching')==='1'; }catch(e){}
    var raw=localStorage.getItem(SAVE_KEY); if(!raw) return;
    if(switching){
      var slotRaw=localStorage.getItem(slotKey(P2.profiles.active));
      if(slotRaw){ var d=JSON.parse(raw), s=JSON.parse(slotRaw); d.streak=s.streak||d.streak; d.pos=s.pos||null; raw=JSON.stringify(d); localStorage.setItem(SAVE_KEY, raw); }
    }
    localStorage.setItem(slotKey(P2.profiles.active), raw);
  }catch(e){}
});
function activeProfile(){ for(var i=0;i<P2.profiles.list.length;i++) if(P2.profiles.list[i].id===P2.profiles.active) return P2.profiles.list[i]; return P2.profiles.list[0]; }

/* ---------------- per-profile phase-2 store ---------------- */
var P2S=null;
function p2load(){ try{ P2S=JSON.parse(localStorage.getItem('rhu-p2-'+P2.profiles.active))||{}; }catch(e){ P2S={}; } if(!P2S) P2S={}; }
function p2store(){ try{ localStorage.setItem('rhu-p2-'+P2.profiles.active, JSON.stringify(P2S)); }catch(e){} }
p2load();
function p2saveAll(){ p2store(); try{ window.dispatchEvent(new Event('pagehide')); }catch(e){} }

/* ---------------- language (English / Roman Urdu) ---------------- */
var LANG='en'; try{ LANG=localStorage.getItem('rhu-lang')||'en'; }catch(e){}
function T(en, ur){ return LANG==='ur' ? ur : en; }
function setLang(l){ LANG=l; try{ localStorage.setItem('rhu-lang', l); }catch(e){} applyLang(); if(window.__p2Rerender) window.__p2Rerender(); toast(l==='ur' ? '🇵🇰 Roman Urdu ON — ab sab آسان urdu mein!' : '🇬🇧 English ON'); }

/* ---------------- view manager ---------------- */
var P2VIEWS=['view-mt','view-exam','view-cert'];
function p2HideAll(){ P2VIEWS.forEach(function(v){ var e=$(v); if(e) e.classList.add('hidden'); }); document.body.classList.remove('p2-inmt'); }
var _showView2=window.showView;
window.showView=function(id){ _showView2(id); if(P2VIEWS.indexOf(id)<0) p2HideAll(); };
function p2Show(id){
  ['view-home','view-lab','view-quiz','view-about'].forEach(function(v){ var e=$(v); if(e) e.classList.add('hidden'); });
  P2VIEWS.forEach(function(v){ var e=$(v); if(e) e.classList.toggle('hidden', v!==id); });
  document.body.classList.remove('v-home','v-lab','v-quiz','v-about');
  document.querySelectorAll('#bottomnav button').forEach(function(b){ b.classList.toggle('on', (id==='view-mt'&&b.dataset.nav==='mt')); });
  window.scrollTo(0,0);
}
window.__p2Show=p2Show;

/* ---------------- top bar + nav buttons ---------------- */
function injectChrome(){
  var tb=$('topbar');
  if(tb && !$('p2-topbtns')){
    var row=el('div','p2-topbtns'); row.id='p2-topbtns';
    var bp=el('button','btn small','👤 '+esc(activeProfile().name)); bp.type='button'; bp.id='p2-btn-profile';
    bp.addEventListener('click', function(){ openProfiles(); });
    var bl=el('button','btn small', LANG==='ur' ? '🇬🇧 English' : '🇵🇰 Roman Urdu'); bl.type='button'; bl.id='p2-btn-lang';
    bl.addEventListener('click', function(){ setLang(LANG==='ur' ? 'en' : 'ur'); bl.textContent=LANG==='ur' ? '🇬🇧 English' : '🇵🇰 Roman Urdu'; });
    row.appendChild(bp); row.appendChild(bl); tb.appendChild(row);
  }
  var nav=$('bottomnav');
  if(nav && !nav.querySelector('[data-nav="mt"]')){
    var b=el('button','','<span class="ni">📡</span><span class="nl">MikroTik</span>'); b.type='button'; b.dataset.nav='mt';
    nav.appendChild(b);
    nav.addEventListener('click', function(ev){
      var btn=ev.target.closest('button'); if(!btn || btn.dataset.nav!=='mt') return;
      ev.stopPropagation(); ev.preventDefault(); openMT();
    }, true);
  }
}

/* ---------------- profiles UI ---------------- */
function openProfiles(){
  var ov=$('p2-profiles'); if(!ov) return; renderProfList(); ov.classList.add('open');
}
function closeProfiles(){ var ov=$('p2-profiles'); if(ov) ov.classList.remove('open'); try{ sessionStorage.setItem('p2-picked','1'); }catch(e){} }
function renderProfList(){
  var host=$('p2-prof-list'); if(!host) return; host.innerHTML='';
  P2.profiles.list.forEach(function(p){
    var slot={}; try{ slot=JSON.parse(localStorage.getItem(slotKey(p.id)))||{}; }catch(e){}
    var xp=(p.id===P2.profiles.active) ? XP : (slot.xp||0);
    var doneN=Object.keys((p.id===P2.profiles.active) ? PROGRESS : (slot.progress||{})).length;
    var card=el('div','prof-card'+(p.id===P2.profiles.active?' on':''));
    card.innerHTML='<span class="av">🦸</span><span class="pn">'+esc(p.name)+'<small>⭐ '+xp+' XP · '+doneN+' labs/quizzes done'+(p.id===P2.profiles.active?' · learning now':'')+'</small></span>';
    if(p.id!==P2.profiles.active){
      var sw=el('button','btn orange','▶ Learn'); sw.type='button';
      sw.addEventListener('click', function(){ profSwitch(p.id); });
      card.appendChild(sw);
    }
    if(P2.profiles.list.length>1){
      var del=el('button','btn ghost','🗑'); del.type='button'; del.title='Delete profile';
      del.addEventListener('click', function(){ profDelete(p.id); });
      card.appendChild(del);
    }
    host.appendChild(card);
  });
}
function profSwitch(id){
  if(id===P2.profiles.active){ closeProfiles(); return; }
  try{ window.dispatchEvent(new Event('pagehide')); }catch(e){} /* freshen old slot */
  var raw=localStorage.getItem(slotKey(id));
  var data; try{ data=raw? JSON.parse(raw) : freshSave(); }catch(e){ data=freshSave(); }
  PROGRESS=data.progress||{}; XP=data.xp||0;
  SESSION_DONE=(data.sessionDate===todayStr()) ? (data.sessionDone||0) : 0;
  try{ MODE=data.mode||'kids'; }catch(e){}
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }catch(e){}
  P2.profiles.active=id; storeProfiles();
  try{ sessionStorage.setItem('p2-switching','1'); sessionStorage.setItem('p2-picked','1'); }catch(e){}
  location.reload();
}
function profDelete(id){
  var wasActive=(id===P2.profiles.active);
  P2.profiles.list=P2.profiles.list.filter(function(p){ return p.id!==id; });
  try{ localStorage.removeItem(slotKey(id)); localStorage.removeItem('rhu-p2-'+id); }catch(e){}
  if(wasActive){ P2.profiles.active=P2.profiles.list[0].id; storeProfiles(); profSwitch(P2.profiles.list[0].id); return; }
  storeProfiles(); renderProfList();
}

/* ---------------- daily mission ---------------- */
function missionPool(){
  var pool=[];
  (window.QUIZZES||[]).forEach(function(q){ (q.questions||[]).forEach(function(qu){ if(qu.options) pool.push({q:qu.q, options:qu.options, answer:qu.answer, why:qu.why, from:q.title}); }); });
  return pool;
}
function missionOfToday(){
  var pool=missionPool(); if(!pool.length) return null;
  var d=new Date(); var seed=d.getFullYear()*372+(d.getMonth()+1)*31+d.getDate();
  return pool[seed % pool.length];
}
function missionCard(){
  var m=P2S.mission||{}; var today=todayStr();
  var card=el('section','p2-mission'+(m.date===today&&m.done?' done':''));
  var streak=m.streak||0;
  if(m.date===today && m.done){
    card.innerHTML='<span class="flame">🔥</span><div class="mmain"><div class="mtitle">'+T('Daily Mission complete!','Roz ka Mission mukammal!')+' ✅</div><div class="msub">'+T('Streak: ','Silsila: ')+streak+' '+T('day(s) — come back tomorrow for a new mission!','din — kal naye mission ke liye wapas aana!')+'</div></div>';
    return card;
  }
  var q=missionOfToday(); if(!q) return card;
  card.innerHTML='<span class="flame">🔥</span><div class="mmain"><div class="mtitle">'+T('Daily Mission','Roz ka Mission')+(streak? ' · 🔥 '+streak : '')+'</div><div class="msub">'+T('Answer right and win +20 XP! From: ','Sahi jawab do aur +20 XP jeeto! Yeh sawal: ')+esc(q.from)+'</div><p style="font-weight:800;margin:8px 0">'+esc(q.q)+'</p></div>';
  var opts=el('div'); opts.style.cssText='display:flex;flex-direction:column;gap:6px;min-width:200px;flex:1';
  q.options.forEach(function(op, i){
    var b=el('button','btn ghost', esc(op)); b.type='button'; b.style.minHeight='48px';
    b.addEventListener('click', function(){
      if(i===q.answer){
        var mm=P2S.mission||{}; var y=new Date(); y.setDate(y.getDate()-1);
        mm.streak=(mm.last===todayStr(y)) ? (mm.streak||0)+1 : 1;
        mm.last=today; mm.date=today; mm.done=true; P2S.mission=mm;
        XP+=20; p2saveAll();
        toast('🔥 Mission complete! +20 XP — streak '+mm.streak+'!');
        renderHome();
      } else { b.classList.add('wrong'); b.disabled=true; toast('❌ Not that one — try again, hero!'); }
    });
    opts.appendChild(b);
  });
  card.appendChild(opts);
  return card;
}

/* ---------------- home injection ---------------- */
function p2HomeInject(){
  var host=$('domains'); if(!host) return;
  var old=$('p2-mission-card'); if(old) old.remove();
  var mc=missionCard(); mc.id='p2-mission-card';
  host.parentNode.insertBefore(mc, host);
  document.querySelectorAll('.p2-sec').forEach(function(s){ s.remove(); });
  /* MikroTik section */
  var sec=el('section','p2-sec'); sec.style.background='linear-gradient(135deg,#0f4c81,#0ea5e9)';
  var mtDone=Object.keys(PROGRESS).filter(function(k){ return k.indexOf('mt-')===0; }).length;
  sec.innerHTML='<h2>📡 MikroTik World</h2><span class="sub">'+T('A second router universe! Real RouterOS console, a WinBox panel, and 8 hands-on labs — with the famous Dual-WAN Auto-Failover mission.','Doosri router duniya! Asli RouterOS console, WinBox panel, aur 8 mazaydar labs — mashhoor Dual-WAN Auto-Failover mission ke saath.')+'</span><div class="sub" style="margin-top:6px">'+mtDone+' / '+((typeof MTLABS!=='undefined'&&MTLABS)? MTLABS.length : 8)+' '+T('labs done','labs mukammal')+'</div>';
  var cards=el('div','p2-cards');
  if(typeof MTLABS!=='undefined'&&MTLABS) MTLABS.forEach(function(lab){ cards.appendChild(mtLabCard(lab)); });
  sec.appendChild(cards);
  host.appendChild(sec);
  /* features section */
  var fs=el('section','p2-sec'); fs.style.background='linear-gradient(135deg,#7c3aed,#db2777)';
  fs.innerHTML='<h2>🎁 '+T('Hero Treasures','Hero ke Khazanay')+'</h2><span class="sub">'+T('Mock exam, certificates, progress cards and profiles.','Mock exam, certificates, progress cards aur profiles.')+'</span>';
  var row=el('div','p2-rowbtns');
  var bExam=el('button','btn orange','📝 '+T('Mock Exam','Mock Exam')); bExam.type='button'; bExam.addEventListener('click', function(){ openExam(); });
  var bCert=el('button','btn','🏆 '+T('Certificates','Certificates')); bCert.type='button'; bCert.addEventListener('click', function(){ openCert(); });
  var bCard=el('button','btn','📤 '+T('Progress Card','Progress Card')); bCard.type='button'; bCard.addEventListener('click', function(){ showProgressCard(null); });
  var bProf=el('button','btn','👤 '+T('Profiles','Profiles')); bProf.type='button'; bProf.addEventListener('click', function(){ openProfiles(); });
  row.appendChild(bExam); row.appendChild(bCert); row.appendChild(bCard); row.appendChild(bProf);
  fs.appendChild(row); host.appendChild(fs);
  applyLang();
}
function mtLabCard(lab){
  var stars=PROGRESS[lab.id]||0;
  var c=el('div','p2-card');
  c.innerHTML='<span class="meta"><span>MIKROTIK · '+lab.mins+' min</span><span>'+starsStr(stars)+'</span></span><h3>'+lab.icon+' '+esc(LANG==='ur'&&lab.titleUr? lab.titleUr : lab.title)+'</h3><p>'+esc(lab.story)+'</p>';
  var b=el('button','btn orange', stars? T('↺ Play Again','↺ Dobara Khelo') : T('▶ Start Lab','▶ Lab Shuru Karo')); b.type='button';
  b.addEventListener('click', function(){ openMTLab(lab.id); });
  c.appendChild(b); return c;
}
var _renderHome2=window.renderHome;
window.renderHome=function(){ _renderHome2(); p2HomeInject(); };

/* ---------------- language application ---------------- */
function swapText(selector, en, ur){
  var e=document.querySelector(selector); if(!e) return;
  e.textContent = (LANG==='ur' ? ur : en);
}
function applyLang(){
  document.querySelectorAll('#bottomnav button').forEach(function(b){
    var k=b.dataset.nav;
    var map={home:['Home','Ghar'], labs:['Labs','Labs'], quiz:['Quiz','Quiz'], about:['About','Maloomat'], mt:['MikroTik','MikroTik']};
    if(!map[k]) return; var txt=T(map[k][0], map[k][1]);
    var label=b.querySelector('.nl');
    if(label) label.textContent=txt;
    else if(b.lastChild && b.lastChild.nodeType===3) b.lastChild.nodeValue=txt;
  });
  swapText('#mode-kids','🧒 Kids Mode','🧒 Baccha Mode');
  swapText('#mode-normal','Normal Mode','Normal Mode');
  swapText('#btn-sandbox','🧰 Open the Sandbox','🧰 Sandbox Kholo');
  swapText('#btn-typeforme','⌨️ Type it for me','⌨️ Mere liye type karo');
  swapText('#btn-hint','💡 Hint','💡 Ishara');
  var ti=$('term-in'); if(ti) ti.placeholder=T('Type a command, then press Enter… (try: help)','Command likho, phir Enter dabao… (help likh kar dekho)');
  swapText('#ptab-form','🧩 Interfaces Form','🧩 Interfaces Form');
  var bl=$('p2-btn-lang'); if(bl) bl.textContent=LANG==='ur' ? '🇬🇧 English' : '🇵🇰 Roman Urdu';
  var mtb=$('mt-back'); if(mtb) mtb.textContent='← '+T('Home','Ghar');
  var eb=$('exam-back'); if(eb) eb.textContent='← '+T('Home','Ghar');
  var cb=$('cert-back'); if(cb) cb.textContent='← '+T('Home','Ghar');
}

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded', function(){
  var add=$('p2-prof-add'); if(add) add.addEventListener('submit', function(ev){
    ev.preventDefault();
    var name=($('p2-prof-name').value||'').trim(); if(!name){ toast('✏️ Pehle hero ka naam likho!'); return; }
    var id='p'+Date.now().toString(36);
    P2.profiles.list.push({id:id, name:name});
    try{ localStorage.setItem(slotKey(id), JSON.stringify(freshSave())); }catch(e){}
    storeProfiles(); $('p2-prof-name').value=''; renderProfList();
    toast('🦸 Profile ban gaya: '+name);
  });
  var pc=$('p2-prof-close'); if(pc) pc.addEventListener('click', closeProfiles);
  setTimeout(function(){
    injectChrome(); applyLang();
    var picked=false; try{ picked=sessionStorage.getItem('p2-picked')==='1'; }catch(e){}
    if(!picked) openProfiles();
  }, 480);
});
window.__p2={ T:T, p2Show:p2Show, p2saveAll:p2saveAll, activeProfile:activeProfile, MONO:MONO, fmtDate:fmtDate, todayStr:todayStr, get P2S(){ return P2S; }, LANG:function(){ return LANG; } };
