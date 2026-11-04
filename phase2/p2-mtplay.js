/* ================= MIKROTIK PLAYER + WINBOX ================= */
var MTPLAY=null, MTHIST=[];
function mtLabById(id){ for(var i=0;i<MTLABS.length;i++) if(MTLABS[i].id===id) return MTLABS[i]; return null; }
function mtPromptStr(mt){ return '[admin@'+mt.identity+'] >'; }
function openMT(){
  document.body.classList.remove('p2-inmt'); MTPLAY=null;
  $('mt-player').classList.add('hidden'); $('mt-list').classList.remove('hidden');
  $('mt-title').textContent='📡 '+T('MikroTik Labs','MikroTik Labs');
  renderMtList(); p2Show('view-mt');
}
function renderMtList(){
  var host=$('mt-list'); host.innerHTML='';
  var doneN=MTLABS.filter(function(l){ return PROGRESS[l.id]; }).length;
  $('mt-prog').textContent=doneN+' / '+MTLABS.length+' '+T('done','mukammal');
  var intro=el('div','panel','<p style="font-weight:700;margin:4px 2px">🌍 '+T('Welcome to the MikroTik universe! Same hero skills, a new router: a real <b>RouterOS console</b>, a <b>WinBox panel</b>, and the star Dual-WAN Failover mission. These labs are always open — no locks!','MikroTik ki duniya mein khush amdeed! Asli <b>RouterOS console</b>, <b>WinBox panel</b>, aur star Dual-WAN Failover mission. Yeh labs hamesha khuli hain — koi lock nahi!')+'</p>');
  host.appendChild(intro);
  if(P2S.mtpos && !PROGRESS[P2S.mtpos.id]){
    var lab=mtLabById(P2S.mtpos.id);
    if(lab){ var cc=el('section','p2-mission');
      cc.innerHTML='<span class="flame">👋</span><div class="mmain"><div class="mtitle">'+T('Welcome back, hero!','Wapas khush amdeed, hero!')+'</div><div class="msub">'+T('You left ','Tum ne chora tha ')+'<b>'+esc(lab.title)+'</b>'+T(' — everything is saved!',' — sab save hai!')+'</div></div>';
      var cb=el('button','btn orange','▶ '+T('Continue Lab','Lab Jari Rakho')); cb.type='button'; cb.addEventListener('click', function(){ openMTLab(lab.id); });
      cc.appendChild(cb); host.appendChild(cc);
    }
  }
  var grid=el('div','p2-cards'); grid.style.marginTop='12px';
  MTLABS.forEach(function(lab){ grid.appendChild(mtLabCard(lab)); });
  host.appendChild(grid);
  var sb=el('div','p2-rowbtns');
  var b1=el('button','btn','🧰 '+T('MikroTik in the Sandbox','Sandbox mein MikroTik')); b1.type='button';
  b1.addEventListener('click', function(){ openSandbox(); toast('🧰 Sandbox: use the 📡 MikroTik tool to add a MikroTik router, then click it!'); });
  sb.appendChild(b1); host.appendChild(sb);
}
function openMTLab(id){
  var lab=mtLabById(id); if(!lab) return;
  var mt=mtFresh(); var scen=mtClone(lab.scen||MT_SCEN_STD);
  var done=null;
  if(lab.pre) lab.pre(mt);
  if(P2S.mtpos && P2S.mtpos.id===id && !PROGRESS[id]){
    try{ mt=mtClone(P2S.mtpos.mt); done=P2S.mtpos.done; if(P2S.mtpos.scenUp){ for(var k in P2S.mtpos.scenUp){ if(scen.wanLinks[k]) scen.wanLinks[k].up=P2S.mtpos.scenUp[k]; } } }catch(e){}
  }
  MTPLAY={ lab:lab, mt:mt, scen:scen, steps:lab.steps.map(function(s, i){ return {s:s, done: !!(done&&done[i])}; }),
    hints:0, typed:0, hinted:{}, cmdLog:[], tapped:{}, finished:false, scroll:[{x:'RouterOS v7.15 (Course Ahead Simulator) — welcome, hero! Type  help  to see the magic words.', c:'dim'}], ui:{menu:'interfaces', sub:'addresses'} };
  $('mt-list').classList.add('hidden'); $('mt-player').classList.remove('hidden');
  $('mt-title').textContent=lab.icon+' '+(LANG==='ur'&&lab.titleUr? lab.titleUr : lab.title);
  document.body.classList.add('p2-inmt');
  p2Show('view-mt'); document.body.classList.add('p2-inmt');
  mtRenderAll(); mtCheck(true);
  toast('📡 '+lab.title+' — '+T('good luck, hero!','best of luck, hero!'));
}
function mtCtx(){
  return { scen:MTPLAY.scen,
    log:function(l){ MTPLAY.cmdLog.push(l); },
    changed:function(){ mtAfterChange(); },
    ping:function(t){ return labPingCtx(MTPLAY.mt, MTPLAY.scen, t); },
    onPing:function(t, ok){ mtAnimatePing(t, ok); },
    onDhcp:function(){ if(MTPLAY.scen.pcNeedsDhcp) toast('🎉 PC1 got an address from DHCP: 192.168.88.254!'); },
    leases:function(){ if(MTPLAY.mt.dhcpServer.on && MTPLAY.scen.pcNeedsDhcp) return [' # ADDRESS          MAC-ADDRESS        HOST-NAME  STATUS',' 0 192.168.88.254   AA:BB:CC:11:22:33   PC1        bound']; return [' # ADDRESS  MAC-ADDRESS  HOST-NAME  STATUS','   (no leases yet — DHCP hands them out)']; }
  };
}
function mtAfterChange(){ renderMtTopo(); renderMtWinbox(); mtRenderTerm(); mtCheck(); }
function mtRenderAll(){ renderMtSteps(); renderMtTopo(); renderMtWinbox(); mtRenderTerm(); renderMtEvent(); mtSetTraffic(); }
function mtSetTraffic(){
  var t=$('mt-traffic'); if(!t||!MTPLAY) return;
  var ad=mtActiveDefault(MTPLAY.mt, MTPLAY.scen);
  if(!ad) t.textContent='🌐 '+T('Traffic: no route','Traffic: koi rasta nahi');
  else if(ad.stuck) t.textContent='🌐 Traffic: '+T('STUCK on ','phansa hua ')+(ad.isp||'WAN')+' 🔴';
  else t.textContent='🌐 Traffic: '+(ad.isp||'WAN')+' 🟢';
}
function currentMtStep(){ if(!MTPLAY) return -1; for(var i=0;i<MTPLAY.steps.length;i++) if(!MTPLAY.steps[i].done) return i; return -1; }
function stepText(s){ if(LANG==='ur' && s.tu) return s.tu; return (typeof MODE!=='undefined' && MODE==='kids' && s.k) ? s.k : s.t; }
function renderMtSteps(){
  var host=$('mt-steps'); if(!host||!MTPLAY) return; host.innerHTML='';
  var idx=currentMtStep();
  var small=window.matchMedia('(max-width:900px)').matches;
  MTPLAY.steps.forEach(function(st, i){
    var s=st.s;
    var d=el('div','step'+(st.done?' done': i===idx?' current':''));
    if(small && i>idx) d.style.display='none';
    var head=st.done? '✅ ' : (i===idx? '🎯 ' : '🔒 ');
    var html=head+'<span class="st">'+T('Step ','Step ')+(i+1)+'</span>';
    if(st.done){ html+=' — <span class="sk">'+T('done!','ho gaya!')+'</span>'; }
    else if(i===idx){
      var inner=stepText(s)+(s.netro? '<div class="snetro">🤖 Netro: '+esc(s.netro)+'</div>' : '');
      if(s.cmds && s.cmds.length){ inner+='<div class="step-cmds">'+s.cmds.map(function(c){ return '<button type="button" class="mt-chip" data-cmd="'+esc(c).replace(/"/g,'&quot;')+'">'+esc(c)+'</button>'; }).join('')+'</div>'; }
      if(s.tap){ inner+='<div style="margin-top:8px"><button type="button" class="btn orange" data-tap="'+i+'">✔ '+T('Got it — I know the four doors!','Samajh gaya — charon darwaze yaad hain!')+'</button></div>'; }
      html+='<div class="st" style="margin-top:4px;flex:1;min-width:0">'+inner+'</div>';
    }
    d.innerHTML=html; host.appendChild(d);
  });
  host.querySelectorAll('[data-cmd]').forEach(function(b){ b.addEventListener('click', function(){ var inp=$('mt-in'); if(inp){ inp.value=b.dataset.cmd; inp.focus(); } }); });
  host.querySelectorAll('[data-tap]').forEach(function(b){ b.addEventListener('click', function(){ MTPLAY.tapped['s'+b.dataset.tap]=true; mtCheck(); }); });
  var total=MTPLAY.steps.length, dn=MTPLAY.steps.filter(function(x){ return x.done; }).length;
  $('mt-prog').textContent=T('Step ','Step ')+Math.min(dn+1,total)+' / '+total;
  $('mt-stepbtns').style.display = idx>=0 ? '' : 'none';
}
function renderMtEvent(){
  var host=$('mt-event'); if(!host) return; host.innerHTML='';
  if(!MTPLAY || !MTPLAY.scen.fo) return;
  var w1=MTPLAY.scen.wanLinks.ether1, w2=MTPLAY.scen.wanLinks.ether2;
  var box=el('div','','<p style="font-weight:900;margin:8px 0 6px">🌩️ '+T('ISP Disaster Buttons','ISP Aafat Buttons')+'</p>');
  var b1=el('button','btn', w1.up? '✂️ '+T('Cut ISP 1 cable','ISP 1 ka cable kaato') : '🔌 '+T('Repair ISP 1','ISP 1 theek karo')); b1.type='button'; b1.style.minHeight='52px'; b1.style.marginRight='8px';
  if(w1.up) b1.style.background='#dc2626'; b1.style.color='#fff';
  b1.addEventListener('click', function(){ w1.up=!w1.up; toast(w1.up? '🔌 ISP 1 is BACK!' : '✂️ ISP 1 cable CUT! Watch the traffic…'); renderMtEvent(); mtAfterChange(); });
  var b2=el('button','btn', w2.up? '✂️ '+T('Cut ISP 2 cable','ISP 2 ka cable kaato') : '🔌 '+T('Repair ISP 2','ISP 2 theek karo')); b2.type='button'; b2.style.minHeight='52px';
  if(w2.up) b2.style.background='#dc2626'; b2.style.color='#fff';
  b2.addEventListener('click', function(){ w2.up=!w2.up; toast(w2.up? '🔌 ISP 2 is BACK!' : '✂️ ISP 2 cable CUT!'); renderMtEvent(); mtAfterChange(); });
  box.appendChild(b1); box.appendChild(b2); host.appendChild(box);
}
function mtNodeById(id){ for(var i=0;i<MTPLAY.lab.topo.nodes.length;i++) if(MTPLAY.lab.topo.nodes[i].id===id) return MTPLAY.lab.topo.nodes[i]; return null; }
function mtNodeSub(n){
  var mt=MTPLAY.mt;
  if(n.id==='PC1') return MTPLAY.scen.pcNeedsDhcp ? (mt.dhcpServer.on? 'DHCP: 192.168.88.254' : 'no IP yet — needs DHCP') : '192.168.88.10';
  if(n.id==='PHONE') return mt.wifi.on&&mt.wifi.ssid? 'WiFi: '+mt.wifi.ssid : 'waiting for WiFi…';
  if(n.id==='MT1') return mt.identity;
  if(n.id==='ISP1') return MTPLAY.scen.wanLinks.ether1.up? 'UP 🟢' : 'DOWN 🔴';
  if(n.id==='ISP2') return MTPLAY.scen.wanLinks.ether2.up? 'UP 🟢' : 'DOWN 🔴';
  if(n.id==='NET'){ var ad=mtActiveDefault(mt, MTPLAY.scen); return ad&&ad.ok? 'via '+(ad.isp||'WAN') : 'unreachable'; }
  return '';
}
function renderMtTopo(){
  var svg=$('mt-topo'); if(!svg||!MTPLAY) return;
  var lab=MTPLAY.lab, s='';
  lab.topo.links.forEach(function(L){
    var a=mtNodeById(L[0]), b=mtNodeById(L[1]); if(!a||!b) return;
    var up=true; try{ up=typeof L[2]==='function'? !!L[2](MTPLAY.mt, MTPLAY.scen) : true; }catch(e){}
    s+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+(up?'#22c55e':'#ef4444')+'" stroke-width="5" stroke-linecap="round"'+(up?'':' stroke-dasharray="9 9"')+'/>';
    s+='<circle cx="'+((a.x+b.x)/2)+'" cy="'+((a.y+b.y)/2)+'" r="7" fill="'+(up?'#22c55e':'#ef4444')+'" stroke="#fff" stroke-width="2"/>';
  });
  lab.topo.nodes.forEach(function(n){
    s+='<g><rect x="'+(n.x-58)+'" y="'+(n.y-46)+'" width="116" height="92" rx="16" fill="#fff" stroke="#0ea5e9" stroke-width="2.5"/>';
    s+='<text x="'+n.x+'" y="'+(n.y-8)+'" text-anchor="middle" font-size="30">'+n.icon+'</text>';
    s+='<text x="'+n.x+'" y="'+(n.y+18)+'" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a">'+esc(n.label)+'</text>';
    s+='<text x="'+n.x+'" y="'+(n.y+36)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="#64748b">'+esc(mtNodeSub(n))+'</text></g>';
  });
  svg.innerHTML=s+'<g id="mt-fx"></g>';
  mtSetTraffic();
}
function mtAnimatePing(target, ok){
  var svg=$('mt-topo'); if(!svg||!MTPLAY) return;
  var nid;
  if(/^192\.168\./.test(target)) nid = MTPLAY.lab.topo.nodes.some(function(n){ return n.id==='PC1'; }) ? 'PC1' : 'PHONE';
  else if(MTPLAY.scen.fo){ var ad=mtActiveDefault(MTPLAY.mt, MTPLAY.scen); nid=ad&&ad.isp==='ISP 2' ? 'ISP2' : 'ISP1'; }
  else nid='NET';
  var from=mtNodeById('MT1'), to=mtNodeById(nid); if(!from||!to) return;
  var fx=svg.querySelector('#mt-fx'); if(!fx) return;
  var dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
  dot.setAttribute('r','10'); dot.setAttribute('fill', ok? '#22c55e':'#ef4444'); dot.setAttribute('stroke','#fff'); dot.setAttribute('stroke-width','3');
  fx.appendChild(dot);
  var t0=null, DUR=600;
  function frame(ts){ if(!document.body.contains(dot)) return; if(t0===null) t0=ts; var k=Math.min(1,(ts-t0)/DUR);
    var ph=k<0.5? k*2 : (1-k)*2;
    dot.setAttribute('cx', from.x+(to.x-from.x)*ph); dot.setAttribute('cy', from.y+(to.y-from.y)*ph);
    if(k<1) requestAnimationFrame(frame); else setTimeout(function(){ if(dot.parentNode) dot.parentNode.removeChild(dot); },350);
  }
  requestAnimationFrame(frame);
}
function mtRenderTerm(){
  var out=$('mt-term-out'); if(!out||!MTPLAY) return;
  out.innerHTML=MTPLAY.scroll.map(function(L){ return '<div class="'+(L.c||'')+'">'+esc(L.x)+'</div>'; }).join('');
  out.scrollTop=out.scrollHeight;
  $('mt-prompt').textContent=mtPromptStr(MTPLAY.mt);
  $('mt-devname').textContent='MT1 · '+MTPLAY.mt.identity;
}
function mtSubmit(line){
  if(!MTPLAY) return;
  line=String(line||'').trim(); if(!line) return;
  MTHIST.push(line); if(MTHIST.length>60) MTHIST.shift();
  MTPLAY.scroll.push({x:mtPromptStr(MTPLAY.mt)+' '+line, c:'cmd'});
  var out=runROS(MTPLAY.mt, line, mtCtx());
  var isErr=out.some(function(x){ return typeof x==='string' && (x.indexOf('bad command')===0 || x.indexOf('failure:')===0 || x.indexOf('syntax error')===0); });
  out.forEach(function(x){ MTPLAY.scroll.push({x:x, c:isErr?'err':''}); });
  if(MTPLAY.scroll.length>300) MTPLAY.scroll=MTPLAY.scroll.slice(-300);
  mtAfterChange();
}
function mtCheck(silent){
  if(!MTPLAY || MTPLAY.finished) return;
  var changed=false;
  for(var i=0;i<MTPLAY.steps.length;i++){
    var st=MTPLAY.steps[i];
    if(st.done) continue;
    var ok=false;
    if(st.s.tap) ok=!!MTPLAY.tapped['s'+i];
    else { try{ ok=!!st.s.check(MTPLAY.mt); }catch(e){ ok=false; } }
    if(ok){ st.done=true; changed=true; XP+=10; if(!silent) toast('⭐ '+T('Objective complete! +10 XP','Maqsad pura! +10 XP')); }
    else break;
  }
  if(changed){
    renderMtSteps(); renderMtTopo(); renderMtEvent();
    try{ var up={ether1:MTPLAY.scen.wanLinks.ether1? MTPLAY.scen.wanLinks.ether1.up : true, ether2:MTPLAY.scen.wanLinks.ether2? MTPLAY.scen.wanLinks.ether2.up : true};
      P2S.mtpos={ id:MTPLAY.lab.id, done:MTPLAY.steps.map(function(x){ return !!x.done; }), mt:mtClone(MTPLAY.mt), scenUp:up }; p2store(); }catch(e){}
    if(MTPLAY.steps.every(function(x){ return x.done; })) mtComplete();
  }
}
function mtComplete(){
  if(!MTPLAY || MTPLAY.finished) return; MTPLAY.finished=true;
  var id=MTPLAY.lab.id;
  var stars=MTPLAY.typed>0 ? 1 : (MTPLAY.hints===0 ? 3 : MTPLAY.hints<=2 ? 2 : 1);
  var first=!PROGRESS[id];
  PROGRESS[id]=Math.max(PROGRESS[id]||0, stars);
  if(first){ SESSION_DONE++; XP+=50+stars*10; }
  P2S.lastDone={kind:'mikrotik', id:id, title:MTPLAY.lab.title, stars:stars};
  delete P2S.mtpos;
  p2saveAll();
  if(typeof refreshTopPills==='function') refreshTopPills();
  $('mt-done-stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  $('mt-done-title').textContent=T('Lab Complete — ','Lab Mukammal — ')+MTPLAY.lab.title;
  $('mt-done-msg').textContent= stars===3 ? T('PERFECT! No hints — a true MikroTik Hero! 🎉','PERFECT! Koi hint nahi — asli MikroTik Hero! 🎉') : T('Brilliant work, hero! Every objective complete! 🎉','Zabardast, hero! Har maqsad pura! 🎉');
  $('mt-done').classList.add('open');
}
/* ---- WinBox panel (shared: labs + sandbox) ---- */
var WB_MENUS=[['interfaces','📋 Interfaces'],['ip','🌐 IP'],['wireless','📶 Wireless'],['queues','🚦 Queues'],['system','⚙️ System']];
var WB_SUBS=[['addresses','Addresses'],['dhcp-client','DHCP Client'],['dhcp-server','DHCP Server'],['nat','NAT'],['routes','Routes'],['dns','DNS'],['firewall','Firewall']];
function wbRun(mt, ctx, cmd){ var out=runROS(mt, cmd, ctx); return out; }
function wbTable(rows, head){ return '<table class="wb-table"><tr>'+head.map(function(h){ return '<th>'+h+'</th>'; }).join('')+'</tr>'+rows+'</table>'; }
function wbContent(mt, ui, ctx, uid){
  var scen=ctx.scen;
  if(ui.menu==='interfaces'){
    var rows=Object.keys(mt.ifs).map(function(n){
      var a=mtAddrOf(mt, n), c=mt.dhcpClient[n];
      var ip=a? a.address : (c&&c.on&&c.ip? c.ip+' (DHCP)' : '—');
      var st='<span class="wb-badge up">running</span>';
      if(scen&&scen.wanLinks&&scen.wanLinks[n]) st=scen.wanLinks[n].up? '<span class="wb-badge up">link up</span>' : '<span class="wb-badge down">LINK DOWN</span>';
      if(n==='wlan1') st=mt.wifi.on? '<span class="wb-badge up">WiFi ON</span>' : '<span class="wb-badge warn">WiFi off</span>';
      return '<tr><td><b>'+n+'</b></td><td>'+mt.ifs[n].type+'</td><td>'+ip+'</td><td>'+st+'</td><td>'+esc(mt.ifs[n].comment||'')+'</td></tr>';
    }).join('');
    return wbTable(rows, ['Name','Type','IP Address','Status','Comment'])+'<p class="wb-note">💡 The WinBox panel and the console below show the SAME device — change one, the other knows!</p>';
  }
  if(ui.menu==='ip'){
    if(ui.sub==='addresses'){
      var r1=mt.addrs.map(function(a, i){ return '<tr><td>'+i+'</td><td>'+a.address+'</td><td>'+a.network+'</td><td>'+a.interface+'</td></tr>'; }).join('')||'<tr><td colspan="4">(no addresses yet)</td></tr>';
      return wbTable(r1, ['#','Address','Network','Interface'])
      +'<form class="wb-form" data-form="addr"><label>Address (IP/prefix)<input id="'+uid+'-aip" placeholder="192.168.88.1/24" /></label><label>Interface<select id="'+uid+'-aif"><option>ether1</option><option selected>ether2</option><option>ether3</option><option>ether4</option><option>wlan1</option></select></label><button class="btn orange" type="submit">➕ Add</button></form>';
    }
    if(ui.sub==='dhcp-client'){
      var ifs=Object.keys((scen&&scen.wanLinks)||{ether1:1});
      var r2=ifs.map(function(n){ var c=mt.dhcpClient[n];
        return '<tr><td><b>'+n+'</b></td><td>'+(c&&c.on? '<span class="wb-badge up">bound</span>' : '<span class="wb-badge warn">off</span>')+'</td><td>'+(c&&c.on? c.ip+' · gw '+c.gw+' ('+c.isp+')' : '—')+'</td><td><button class="btn small" data-act="dc" data-if="'+n+'">'+(c&&c.on? 'Disable':'Enable')+'</button></td></tr>'; }).join('');
      return wbTable(r2, ['Interface','Status','Address','Action'])+'<p class="wb-note">DHCP client asks the ISP: "may I have an address, please?"</p>';
    }
    if(ui.sub==='dhcp-server'){
      var ds=mt.dhcpServer;
      return '<p class="wb-note">Status: '+(ds.on? '<span class="wb-badge up">ON</span>' : '<span class="wb-badge warn">OFF</span>')+' · Interface: <b>'+ds.interface+'</b> · Pool: <b>'+(ds.pool||'—')+'</b> · Network: <b>'+(ds.netAddr||'—')+'</b></p>'
      +'<div class="wb-form"><button class="btn orange" data-act="ds-setup" type="button">🧙 Run the Setup Wizard</button><button class="btn" data-act="ds-toggle" type="button">'+(ds.on? 'Disable':'Enable')+'</button></div>'
      +'<p class="wb-note">The wizard reads your LAN address and builds the pool, gateway and DNS for you.</p>';
    }
    if(ui.sub==='nat'){
      var r3=mt.nat.map(function(n, i){ return '<tr><td>'+i+'</td><td>srcnat</td><td>masquerade</td><td>'+n.outIf+'</td></tr>'; }).join('')||'<tr><td colspan="4">(no NAT rules yet)</td></tr>';
      return wbTable(r3, ['#','Chain','Action','Out Interface'])
      +'<form class="wb-form" data-form="nat"><label>Out interface<select id="'+uid+'-nif"><option>ether1</option><option>ether2</option></select></label><button class="btn orange" type="submit">➕ Add Masquerade</button></form>';
    }
    if(ui.sub==='routes'){
      var all=mtAllRoutes(mt);
      var r4=all.map(function(r, i){ return '<tr><td>'+(r.dyn?'D ':'')+i+'</td><td>'+r.dst+'</td><td>'+r.gw+'</td><td>'+(r.dist||1)+'</td><td>'+(r.checkGw?'ping':'—')+'</td></tr>'; }).join('')||'<tr><td colspan="5">(no routes yet)</td></tr>';
      var ad=mtActiveDefault(mt, scen);
      return wbTable(r4, ['#','Dst Address','Gateway','Distance','Check-GW'])
      +'<p class="wb-note">Active road: <b>'+(ad? (ad.isp||'WAN')+' via '+ad.route.gw+(ad.stuck?' (STUCK — ISP down!)':'') : 'none')+'</b></p>'
      +'<form class="wb-form" data-form="route"><label>Gateway<input id="'+uid+'-rgw" placeholder="10.0.1.1" /></label><label>Distance<input id="'+uid+'-rdist" type="number" value="1" min="1" max="250" /></label><label>Check gateway (ping)<input id="'+uid+'-rcg" type="checkbox" style="height:26px" /></label><button class="btn orange" type="submit">➕ Add Route</button></form>';
    }
    if(ui.sub==='dns'){
      return '<form class="wb-form" data-form="dns"><label>DNS servers (comma)<input id="'+uid+'-dns" value="'+esc(mt.dns.servers.join(','))+'" placeholder="8.8.8.8" /></label><label>Allow remote requests<input id="'+uid+'-drem" type="checkbox" style="height:26px" '+(mt.dns.allowRemote?'checked':'')+' /></label><button class="btn orange" type="submit">💾 Save DNS</button></form>'
      +'<p class="wb-note">DNS = the internet phone book. 8.8.8.8 is Google\'s famous DNS.</p>';
    }
    if(ui.sub==='firewall'){
      var r5=mt.filter.map(function(f, i){ return '<tr><td>'+i+'</td><td>'+f.chain+'</td><td>'+f.action+'</td><td>'+(f.src||'—')+'</td><td>'+(f.dst||'—')+'</td></tr>'; }).join('')||'<tr><td colspan="5">(no filter rules yet)</td></tr>';
      return wbTable(r5, ['#','Chain','Action','Src Address','Dst Address'])
      +'<form class="wb-form" data-form="fw"><label>Chain<select id="'+uid+'-fch"><option>forward</option><option>input</option></select></label><label>Src address<input id="'+uid+'-fsrc" placeholder="192.168.88.20" /></label><label>Dst address<input id="'+uid+'-fdst" placeholder="203.0.113.9" /></label><button class="btn orange" type="submit">🛡️ Add DROP Rule</button></form>';
    }
  }
  if(ui.menu==='wireless'){
    return '<form class="wb-form" data-form="wifi"><label>WiFi name (SSID)<input id="'+uid+'-wssid" value="'+esc(mt.wifi.ssid)+'" placeholder="HeroWiFi" /></label><label>WPA2 password (8+)<input id="'+uid+'-wpass" value="'+esc(mt.wifi.pass)+'" placeholder="hero12345" /></label><label>Radio ON<input id="'+uid+'-won" type="checkbox" style="height:26px" '+(mt.wifi.on?'checked':'')+' /></label><button class="btn orange" type="submit">💾 Save WiFi</button></form>'
    +'<p class="wb-note">'+(mt.wifi.on&&mt.wifi.ssid? '📶 Broadcasting <b>'+esc(mt.wifi.ssid)+'</b>'+(mt.wifi.pass? ' with a WPA2 lock 🔒' : ' — OPEN, no password! 🔓') : 'The radio is off or has no name yet.')+'</p>';
  }
  if(ui.menu==='queues'){
    var r6=mt.queues.map(function(q, i){ return '<tr><td>'+i+'</td><td>'+esc(q.name)+'</td><td>'+q.target+'</td><td>'+q.max+'</td></tr>'; }).join('')||'<tr><td colspan="4">(no queues yet)</td></tr>';
    return wbTable(r6, ['#','Name','Target','Max Limit'])
    +'<form class="wb-form" data-form="q"><label>Name<input id="'+uid+'-qn" placeholder="GamesPC" /></label><label>Target IP<input id="'+uid+'-qt" placeholder="192.168.88.20/32" /></label><label>Max limit<input id="'+uid+'-qm" placeholder="5M/5M" value="5M/5M" /></label><button class="btn orange" type="submit">➕ Add Queue</button></form>';
  }
  if(ui.menu==='system'){
    var ex=rosExport(mt).map(function(l){ return esc(l); }).join('\n');
    return '<form class="wb-form" data-form="id"><label>Router name (identity)<input id="'+uid+'-idn" value="'+esc(mt.identity)+'" /></label><button class="btn orange" type="submit">💾 Set Name</button></form>'
    +'<p class="wb-note">Admin password: '+(mt.users.admin? 'SET ✓' : 'EMPTY — set one in the console: /user set admin password=…')+'</p>'
    +'<p class="wb-note" style="margin-bottom:4px">📜 Export (the whole config):</p><pre style="background:#0f172a;color:#a5f3fc;border-radius:10px;padding:10px;font-size:.75rem;overflow-x:auto;white-space:pre-wrap">'+ex+'</pre>'
    +(ctx.sandbox? '<div class="wb-form"><button class="btn ghost" data-act="sys-reset" type="button">🧹 Reset this MikroTik</button></div>' : '');
  }
  return '<p class="wb-note">Pick a menu above.</p>';
}
function renderWinbox(host, mt, ui, ctx, onChange, uid){
  if(!host) return;
  var html='<div class="wb-menu">'+WB_MENUS.map(function(m){ return '<button type="button" data-m="'+m[0]+'" class="'+(ui.menu===m[0]?'on':'')+'">'+m[1]+'</button>'; }).join('')+'</div>';
  if(ui.menu==='ip') html+='<div class="wb-sub">'+WB_SUBS.map(function(sm){ return '<button type="button" data-s="'+sm[0]+'" class="'+(ui.sub===sm[0]?'on':'')+'">'+sm[1]+'</button>'; }).join('')+'</div>';
  html+=wbContent(mt, ui, ctx, uid);
  host.innerHTML=html;
  host.querySelectorAll('[data-m]').forEach(function(b){ b.addEventListener('click', function(){ ui.menu=b.dataset.m; renderWinbox(host, mt, ui, ctx, onChange, uid); }); });
  host.querySelectorAll('[data-s]').forEach(function(b){ b.addEventListener('click', function(){ ui.sub=b.dataset.s; renderWinbox(host, mt, ui, ctx, onChange, uid); }); });
  host.querySelectorAll('[data-act]').forEach(function(b){ b.addEventListener('click', function(){ wbAction(b.dataset.act, b, host, mt, ui, ctx, onChange, uid); }); });
  host.querySelectorAll('form[data-form]').forEach(function(f){ f.addEventListener('submit', function(ev){ ev.preventDefault(); wbAction('form-'+f.dataset.form, f, host, mt, ui, ctx, onChange, uid); }); });
}
function wbVal(host, uid, key){ var e=host.querySelector('#'+uid+'-'+key); return e? e.value.trim() : ''; }
function wbChk(host, uid, key){ var e=host.querySelector('#'+uid+'-'+key); return !!(e&&e.checked); }
function wbAction(act, srcEl, host, mt, ui, ctx, onChange, uid){
  function done(msg){ if(msg) toast(msg); if(ctx.changed) ctx.changed(); onChange(); }
  if(act==='dc'){ var ifn=srcEl.dataset.ifn||srcEl.dataset.if; var c=mt.dhcpClient[ifn];
    if(c&&c.on){ mt.dhcpClient[ifn]={on:false}; done('DHCP client on '+ifn+' disabled'); }
    else { var out=wbRun(mt, ctx, '/ip dhcp-client add interface='+ifn+' disabled=no'); done(out.join(' ').indexOf('bound')>=0? '✅ DHCP bound on '+ifn : 'DHCP client on '+ifn+' enabled'); } return; }
  if(act==='ds-setup'){ var o=wbRun(mt, ctx, '/ip dhcp-server setup'); done(o.some(function(x){ return x.indexOf('failure')===0; })? o[0] : '🧙 DHCP wizard finished!'); return; }
  if(act==='ds-toggle'){ mt.dhcpServer.on=!mt.dhcpServer.on; if(mt.dhcpServer.on&&ctx.onDhcp) ctx.onDhcp(); done(mt.dhcpServer.on? 'DHCP server ON' : 'DHCP server OFF'); return; }
  if(act==='sys-reset'){ var fresh=mtFresh(); Object.keys(mt).forEach(function(k){ delete mt[k]; }); Object.assign(mt, fresh); done('🧹 MikroTik reset to factory-fresh!'); return; }
  if(act==='form-addr'){ var a=wbVal(host, uid, 'aip'), i2=wbVal(host, uid, 'aif'); if(!a) return; var o2=wbRun(mt, ctx, '/ip address add address='+a+' interface='+i2); done(o2.length? o2[0] : '✔ Address added on '+i2); return; }
  if(act==='form-nat'){ var ni=wbVal(host, uid, 'nif'); wbRun(mt, ctx, '/ip firewall nat add chain=srcnat out-interface='+ni+' action=masquerade'); done('✔ NAT masquerade on '+ni); return; }
  if(act==='form-route'){ var gw=wbVal(host, uid, 'rgw'), di=wbVal(host, uid, 'rdist')||'1', cg=wbChk(host, uid, 'rcg'); if(!gw) return; wbRun(mt, ctx, '/ip route add dst-address=0.0.0.0/0 gateway='+gw+' distance='+di+(cg?' check-gateway=ping':'')); done('✔ Route added via '+gw); return; }
  if(act==='form-dns'){ var dn=wbVal(host, uid, 'dns'), rm=wbChk(host, uid, 'drem'); wbRun(mt, ctx, '/ip dns set servers='+dn+' allow-remote-requests='+(rm?'yes':'no')); done('✔ DNS saved'); return; }
  if(act==='form-fw'){ var ch=wbVal(host, uid, 'fch'), sr=wbVal(host, uid, 'fsrc'), ds=wbVal(host, uid, 'fdst'); if(!sr&&!ds){ toast('✏️ Fill a Src or Dst address first!'); return; } wbRun(mt, ctx, '/ip firewall filter add chain='+ch+(sr?' src-address='+sr:'')+(ds?' dst-address='+ds:'')+' action=drop'); done('🛡️ DROP rule added'); return; }
  if(act==='form-wifi'){ var ss=wbVal(host, uid, 'wssid'), pw=wbVal(host, uid, 'wpass'), on=wbChk(host, uid, 'won'); if(ss) wbRun(mt, ctx, '/interface wireless set wlan1 ssid='+ss+' disabled='+(on?'no':'yes')); if(pw) wbRun(mt, ctx, '/interface wireless security-profiles set default authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key='+pw); done('✔ WiFi saved'); return; }
  if(act==='form-q'){ var qn=wbVal(host, uid, 'qn'), qt=wbVal(host, uid, 'qt'), qm=wbVal(host, uid, 'qm')||'5M/5M'; if(!qn||!qt) { toast('✏️ Queue needs a name and a target!'); return; } wbRun(mt, ctx, '/queue simple add name='+qn+' target='+qt+' max-limit='+qm); done('✔ Queue "'+qn+'" added'); return; }
  if(act==='form-id'){ var idn=wbVal(host, uid, 'idn'); if(!idn) return; wbRun(mt, ctx, '/system identity set name='+idn); done('✔ Name set to '+idn); return; }
}
function renderMtWinbox(){
  if(!MTPLAY) return;
  renderWinbox($('mt-winbox'), MTPLAY.mt, MTPLAY.ui, mtCtx(), function(){ renderMtWinbox(); renderMtTopo(); mtCheck(); }, 'wbl');
}
/* ================= SANDBOX MIKROTIK ================= */
var SB_SCEN={ wanLinks:{ ether1:{isp:'ISP', gw:'10.0.1.1', dhcpIp:'10.0.1.50/24', up:true} }, pcNeedsDhcp:false, pcStatic:true };
var SBWB={menu:'interfaces', sub:'addresses'};
function mtStateOf(dev){ if(!dev.mt) dev.mt=mtFresh(); return dev.mt; }
function sbCtx(dev){ return { scen:SB_SCEN, sandbox:true, changed:function(){ renderCanvas(); }, ping:function(t){ return labPingCtx(mtStateOf(dev), SB_SCEN, t); }, log:function(){} }; }
function mtArtSVG(w){
  w=w||120; var h=Math.round(w*0.72);
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 120 86"><rect x="8" y="20" width="104" height="46" rx="9" fill="#1f2937" stroke="#0ea5e9" stroke-width="2.5"/>'
  +[0,1,2,3].map(function(i){ return '<rect x="'+(16+i*17)+'" y="34" width="12" height="11" rx="2" fill="#0ea5e9"/><circle cx="'+(22+i*17)+'" cy="53" r="2.3" fill="#4ade80" class="ledblink" style="animation-delay:'+(i*0.23)+'s"/>'; }).join('')
  +'<rect x="88" y="30" width="16" height="4" rx="2" fill="#facc15"/><text x="60" y="80" text-anchor="middle" font-size="8.5" fill="#64748b" font-weight="bold">MIKROTIK</text></svg>';
}
var _devArt2=window.devArt;
window.devArt=function(type, w){ if(type==='mikrotik') return mtArtSVG(w); return _devArt2(type, w); };
var _promptOf2=window.promptOf;
window.promptOf=function(dev){ if(dev&&dev.type==='mikrotik') return mtPromptStr(mtStateOf(dev)); return _promptOf2(dev); };
var _runCommand2=window.runCommand;
window.runCommand=function(dev, line){
  if(dev && dev.type==='mikrotik'){
    line=String(line||'').trim(); if(!line) return;
    var mt=mtStateOf(dev);
    dev.scroll.push({x:mtPromptStr(mt)+' '+line, c:'cmd'});
    var out=runROS(mt, line, sbCtx(dev));
    var isErr=out.some(function(x){ return typeof x==='string' && (x.indexOf('bad command')===0||x.indexOf('failure:')===0); });
    printTo(dev, out, isErr?'err':'');
    renderTerminal(); renderCanvas();
    var fw=$('form-wrap'); if(fw && !fw.classList.contains('hidden')) renderForm();
    return;
  }
  return _runCommand2(dev, line);
};
var _renderForm2=window.renderForm;
window.renderForm=function(){
  var dev=(typeof CUR!=='undefined'&&CUR&&CUR.selected)? D(CUR.selected) : null;
  if(dev && dev.type==='mikrotik'){
    renderWinbox($('form-wrap'), mtStateOf(dev), SBWB, sbCtx(dev), function(){ window.renderForm(); renderCanvas(); }, 'wbs');
    return;
  }
  return _renderForm2();
};
var _rdp2=window.renderDevPanel;
window.renderDevPanel=function(){
  _rdp2();
  try{ var dev=(typeof CUR!=='undefined'&&CUR&&CUR.selected)? D(CUR.selected) : null;
    if(dev && dev.type==='mikrotik'){
      var ds=document.querySelector('#devpanel-head .ds'); if(ds) ds.textContent='MikroTik RouterOS — open the 🪟 WinBox Panel tab to click-configure, or type real RouterOS commands in the console below. Same device, two doors!';
      var tt=$('term-title'); if(tt) tt.textContent='⌨️ RouterOS Console — '+dev.name;
      var pf=$('ptab-form'); if(pf) pf.textContent='🪟 WinBox Panel';
    }
  }catch(e){}
};
var _openSandbox3=window.openSandbox;
window.openSandbox=function(){ var r=_openSandbox3(); setTimeout(injectMtTool, 40); return r; };
function injectMtTool(){
  var host=$('sandbox-tools'); if(!host || $('sb-add-mt')) return;
  var b=el('button','btn small','📡 MikroTik'); b.type='button'; b.id='sb-add-mt';
  b.addEventListener('click', function(){
    if(!CUR || !CUR.sandbox) return;
    var n=1; while(D('MT'+n)) n++;
    var dev=newDevice('MT'+n, 'mikrotik', 140+Math.random()*520, 110+Math.random()*260);
    dev.mt=mtFresh(); NET.devices[dev.name]=dev;
    window.__sandboxAdds=(window.__sandboxAdds||0)+1; XP+=5;
    toast('➕ '+dev.name+' (MikroTik) added! +5 XP — click it, then try the WinBox Panel tab or the console!');
    selectDevice(dev.name); if(typeof refreshTopPills==='function') refreshTopPills();
  });
  host.appendChild(b);
}
/* ---- MT player bindings ---- */
document.addEventListener('DOMContentLoaded', function(){
  var form=$('mt-term-form');
  if(form) form.addEventListener('submit', function(ev){ ev.preventDefault(); var inp=$('mt-in'); var v=inp.value; inp.value=''; mtSubmit(v); });
  var hb=$('mt-histbtn');
  if(hb) hb.addEventListener('click', function(){
    var pop=$('mt-histpop'); if(!pop) return;
    if(!pop.classList.contains('hidden')){ pop.classList.add('hidden'); return; }
    var items=MTHIST.slice(-14).reverse().filter(function(v, i, a){ return a.indexOf(v)===i; });
    pop.innerHTML='<p style="font-weight:800;margin:4px 0">🕘 My old commands — tap to use one:</p>'+(items.length? '' : '<p style="font-weight:700;color:#94a3b8">No commands yet!</p>');
    items.forEach(function(cmd){ var b=el('button','mt-chip', esc(cmd)); b.type='button'; b.style.margin='0 6px 6px 0'; b.addEventListener('click', function(){ $('mt-in').value=cmd; $('mt-in').focus(); pop.classList.add('hidden'); }); pop.appendChild(b); });
    pop.style.cssText='background:#0f172a;border-radius:12px;padding:8px;margin-top:8px';
    pop.classList.remove('hidden');
  });
  var tf=$('mt-typeforme');
  if(tf) tf.addEventListener('click', function(){
    if(!MTPLAY || MTPLAY.finished) return;
    var idx=currentMtStep(); if(idx<0) return;
    var cmds=MTPLAY.steps[idx].s.cmds||[]; if(!cmds.length){ toast('👆 This step is a tap step — use its big button!'); return; }
    MTPLAY.typed=1;
    var i=0;
    (function next(){
      if(i>=cmds.length) return;
      var cmd=cmds[i++]; var inp=$('mt-in'); inp.value=''; var j=0;
      var iv=setInterval(function(){ inp.value=cmd.slice(0, ++j); if(j>=cmd.length){ clearInterval(iv); setTimeout(function(){ inp.value=''; mtSubmit(cmd); setTimeout(next, 320); }, 140); } }, 30);
    })();
  });
  var hintB=$('mt-hintbtn');
  if(hintB) hintB.addEventListener('click', function(){
    if(!MTPLAY) return; var idx=currentMtStep(); if(idx<0) return;
    var box=$('mt-hintbox'); if(!box) return;
    if(!MTPLAY.hinted[idx]){ MTPLAY.hinted[idx]=true; MTPLAY.hints++; }
    box.textContent='💡 '+MTPLAY.steps[idx].s.hint; box.classList.remove('hidden');
  });
  var back=$('mt-back');
  if(back) back.addEventListener('click', function(){
    if(MTPLAY){ MTPLAY=null; document.body.classList.remove('p2-inmt'); openMT(); }
    else goHome();
  });
  var dh=$('mt-done-home'); if(dh) dh.addEventListener('click', function(){ $('mt-done').classList.remove('open'); MTPLAY=null; document.body.classList.remove('p2-inmt'); openMT(); });
  var dr=$('mt-done-replay'); if(dr) dr.addEventListener('click', function(){ var id=MTPLAY? MTPLAY.lab.id : null; $('mt-done').classList.remove('open'); if(id){ delete P2S.mtpos; openMTLab(id); } });
  var dc=$('mt-done-card'); if(dc) dc.addEventListener('click', function(){ $('mt-done').classList.remove('open'); if(P2S.lastDone) showProgressCard(P2S.lastDone); });
});
window.__p2Rerender=function(){ if(MTPLAY){ renderMtSteps(); renderMtTopo(); } if(!$('view-home').classList.contains('hidden')) renderHome(); };
