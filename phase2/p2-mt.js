/* ================= MIKROTIK MODULE ================= */
function mtFresh(){
  return { identity:'MikroTik',
    ifs:{ ether1:{type:'eth',comment:'WAN — Internet'}, ether2:{type:'eth',comment:'LAN — Home'}, ether3:{type:'eth',comment:''}, ether4:{type:'eth',comment:''}, wlan1:{type:'wlan',comment:'WiFi'} },
    addrs:[], dhcpClient:{}, dhcpServer:{ on:false, interface:'ether2', pool:'', netAddr:'', gw:'', dns:'' },
    nat:[], routes:[], filter:[], queues:[], dns:{ servers:[], allowRemote:false },
    wifi:{ ssid:'', pass:'', on:false }, users:{ admin:'' } };
}
function mtClone(o){ return JSON.parse(JSON.stringify(o)); }
function parseKV(str){
  var o={}; var re=/(\S+?)=("([^"]*)"|\S+)/g, m;
  while((m=re.exec(str))){ o[m[1].toLowerCase()]= m[3]!==undefined? m[3] : m[2]; }
  var pos=str.replace(/(\S+?)=("([^"]*)"|\S+)/g,' ').trim().split(/\s+/).filter(Boolean);
  o._pos=pos; return o;
}
function mtAddrOf(mt, ifn){ for(var i=0;i<mt.addrs.length;i++) if(mt.addrs[i].interface===ifn) return mt.addrs[i]; return null; }
function mtNetOf(cidr){ var p=String(cidr||'').split('/'); var ip=p[0], pre=parseInt(p[1]||'24',10); var n=ipToInt(ip); if(n===null) return ''; return intToIp((n & maskToInt(maskFromPrefix(pre)))>>>0)+'/'+pre; }
function mtWanIp(mt, ifn){ var a=mtAddrOf(mt, ifn); if(a) return a.address; var c=mt.dhcpClient[ifn]; if(c&&c.on&&c.ip) return c.ip; return null; }
function wanLinkFor(mt, scen, route){
  if(!scen||!scen.wanLinks) return null;
  if(route.via && scen.wanLinks[route.via]) return Object.assign({ifname:route.via}, scen.wanLinks[route.via]);
  for(var k in scen.wanLinks){ if(scen.wanLinks[k].gw===route.gw) return Object.assign({ifname:k}, scen.wanLinks[k]); }
  return null;
}
function mtAllRoutes(mt){
  var rs=mt.routes.map(function(r){ return Object.assign({}, r); });
  Object.keys(mt.dhcpClient).forEach(function(k){ var c=mt.dhcpClient[k]; if(c.on&&c.ip) rs.push({dst:'0.0.0.0/0', gw:c.gw, dist:1, checkGw:false, dyn:true, via:k}); });
  return rs;
}
function mtActiveDefault(mt, scen){
  var defs=mtAllRoutes(mt).filter(function(r){ return r.dst==='0.0.0.0/0'; });
  defs.sort(function(a,b){ return (a.dist||1)-(b.dist||1); });
  var i, r, link;
  for(i=0;i<defs.length;i++){ r=defs[i]; link=wanLinkFor(mt, scen, r);
    if(!link) return { route:r, ok:true, viaIf:r.via||null, isp:'WAN' };
    if(link.up) return { route:r, ok:true, viaIf:link.ifname, isp:link.isp };
  }
  for(i=0;i<defs.length;i++){ r=defs[i]; link=wanLinkFor(mt, scen, r);
    if(link && !link.up) return { route:r, ok:false, stuck:true, viaIf:link.ifname, isp:link.isp };
  }
  return null;
}
function mtInternetOK(mt, scen){ var ad=mtActiveDefault(mt, scen); if(!ad||!ad.ok) return false; return !!mtWanIp(mt, ad.viaIf||'ether1') || !!ad.viaIf; }
function mtPcInternet(mt, scen){
  if(!mtInternetOK(mt, scen)) return false;
  var ad=mtActiveDefault(mt, scen);
  var natOk=mt.nat.some(function(n){ return n.action==='masquerade' && (!ad.viaIf || n.outIf===ad.viaIf); });
  if(!natOk) return false;
  if(!mt.addrs.some(function(a){ return a.interface!=='ether1'; })) return false;
  if(scen && scen.pcNeedsDhcp && !mt.dhcpServer.on) return false;
  return true;
}
function rosHelp(){
  return ['RouterOS menu — the magic words (type the whole line):',
  '  /system identity print            see the router name',
  '  /system identity set name=X       give it a name',
  '  /user set admin password=X        set the boss password',
  '  /interface print                  see all ports',
  '  /ip address add address=IP/24 interface=ether2',
  '  /ip address print',
  '  /ip dhcp-client add interface=ether1 disabled=no',
  '  /ip dhcp-server setup             the friendly DHCP wizard',
  '  /ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade',
  '  /ip firewall filter add chain=forward dst-address=IP action=drop',
  '  /ip route add gateway=IP distance=1 check-gateway=ping',
  '  /ip dns set servers=8.8.8.8 allow-remote-requests=yes',
  '  /interface wireless set wlan1 ssid=Name disabled=no',
  '  /queue simple add name=X target=IP max-limit=5M/5M',
  '  ping 8.8.8.8                      shout at the internet',
  '  /export                           show the whole config'];
}
function rosExport(mt){
  var L=['# Course Ahead RouterOS export — '+mt.identity];
  L.push('/system identity set name='+mt.identity);
  mt.addrs.forEach(function(a){ L.push('/ip address add address='+a.address+' interface='+a.interface); });
  Object.keys(mt.dhcpClient).forEach(function(k){ if(mt.dhcpClient[k].on) L.push('/ip dhcp-client add interface='+k+' disabled=no'); });
  if(mt.dhcpServer.on) L.push('/ip dhcp-server add interface='+mt.dhcpServer.interface+' address-pool=dhcp-pool disabled=no');
  mt.nat.forEach(function(n){ L.push('/ip firewall nat add chain=srcnat out-interface='+n.outIf+' action=masquerade'); });
  mt.filter.forEach(function(f){ L.push('/ip firewall filter add chain='+f.chain+(f.src?' src-address='+f.src:'')+(f.dst?' dst-address='+f.dst:'')+' action='+f.action); });
  mt.routes.forEach(function(r){ L.push('/ip route add dst-address='+r.dst+' gateway='+r.gw+' distance='+(r.dist||1)+(r.checkGw?' check-gateway=ping':'')); });
  if(mt.dns.servers.length) L.push('/ip dns set servers='+mt.dns.servers.join(',')+' allow-remote-requests='+(mt.dns.allowRemote?'yes':'no'));
  if(mt.wifi.ssid) L.push('/interface wireless set wlan1 ssid='+mt.wifi.ssid+' disabled='+(mt.wifi.on?'no':'yes'));
  mt.queues.forEach(function(q){ L.push('/queue simple add name='+q.name+' target='+q.target+' max-limit='+q.max); });
  return L;
}
function rosPingLines(mt, ctx, target){
  var res=ctx.ping ? ctx.ping(target) : {ok:false};
  var L=[];
  if(res.ok){
    L.push('  SEQ HOST                                           SIZE TTL TIME       STATUS');
    for(var i=0;i<4;i++) L.push('    '+i+' '+target+Array(Math.max(1,44-target.length)).join(' ')+'56  64 '+(1+i%2)+'ms');
    L.push('    sent=4 received=4 packet-loss=0% min-rtt=1ms avg-rtt=1ms max-rtt=2ms');
  } else {
    L.push('  SEQ HOST                                           SIZE TTL TIME       STATUS');
    for(var j=0;j<3;j++) L.push('    '+j+' '+target+Array(Math.max(1,44-target.length)).join(' ')+'timeout');
    L.push('    sent=3 received=0 packet-loss=100%');
    if(res.why) L.push('  (Netro: '+res.why+')');
  }
  if(ctx.onPing) ctx.onPing(target, res.ok);
  return L;
}
function runROS(mt, raw, ctx){
  ctx=ctx||{};
  var line=String(raw||'').trim().replace(/\s+/g,' ');
  if(!line) return [];
  if(ctx.log) ctx.log(line);
  var low=line.toLowerCase();
  function changed(){ if(ctx.changed) ctx.changed(); }
  function badCmd(){ return ['bad command name '+line.split(' ')[0]+' (line 1 column 1)','(Netro tip: type  help  to see the magic words!)']; }
  if(low==='help'||low==='?'||low==='menu') return rosHelp();
  if(low==='quit'||low==='exit') return ['Hehe — heroes never quit! Type  help  to keep going.'];
  if(/^ping\s+/i.test(line)){ var t=line.split(/\s+/)[1]; return rosPingLines(mt, ctx, t); }
  if(/^\/export/i.test(low)) return rosExport(mt);
  /* ---- system identity ---- */
  if(/^\/system identity set\b/i.test(line)){ var kv=parseKV(line); var nm=kv.name||''; if(!nm) return ['failure: give a name, e.g.  /system identity set name=HeroTik']; mt.identity=nm; changed(); return []; }
  if(/^\/system identity( print)?$/i.test(line)) return ['name: '+mt.identity];
  if(/^\/system resource( print)?$/i.test(line)) return ['board-name: hAP ax3 (Course Ahead Simulator)','version: 7.15 (stable)'];
  /* ---- user ---- */
  if(/^\/user print$/i.test(line)) return [' # NAME        GROUP     COMMENT',' 0 admin       full      password '+(mt.users.admin?'is SET ✓':'is EMPTY — set one!')];
  var mu=line.match(/^\/user set\s+(\S+)\s+(.+)$/i);
  if(mu){ var ku=parseKV(mu[2]); if(ku.password){ mt.users[mu[1].toLowerCase()]=ku.password; changed(); return []; } return ['failure: give password=..., e.g.  /user set admin password=hero123']; }
  /* ---- interfaces ---- */
  if(/^\/interface print$/i.test(line)){
    var L=[' # NAME        TYPE     RUNNING  COMMENT'];
    Object.keys(mt.ifs).forEach(function(n, i){ var a=mtAddrOf(mt, n); var c=mt.dhcpClient[n];
      L.push(' '+i+' '+n+Array(Math.max(1,13-n.length)).join(' ')+(mt.ifs[n].type==='wlan'?'wlan':'ether')+'    '+(n==='wlan1'?(mt.wifi.on?'yes':'no'):'yes')+'     '+(a? a.address : (c&&c.on&&c.ip? c.ip+' (DHCP)' : mt.ifs[n].comment||''))); });
    return L;
  }
  if(/^\/interface wireless set\s+wlan1\b/i.test(line)){
    var kw=parseKV(line);
    if(kw.ssid) mt.wifi.ssid=kw.ssid;
    if(kw.password) mt.wifi.pass=kw.password;
    if(kw.disabled!==undefined) mt.wifi.on=!(kw.disabled==='yes'||kw.disabled==='true');
    changed(); return [];
  }
  if(/^\/interface wireless security-profiles set\b/i.test(line)){
    var ks=parseKV(line);
    if(ks['wpa2-pre-shared-key']) mt.wifi.pass=ks['wpa2-pre-shared-key'];
    if(ks['wpa-pre-shared-key'] && !mt.wifi.pass) mt.wifi.pass=ks['wpa-pre-shared-key'];
    changed(); return [];
  }
  if(/^\/interface wireless print$/i.test(line)) return [' # NAME   SSID              ENABLED',' 0 wlan1  '+(mt.wifi.ssid||'(no name yet)')+'   '+(mt.wifi.on?'yes':'no')+'   password '+(mt.wifi.pass?'SET ✓':'not set')];
  /* ---- ip address ---- */
  if(/^\/ip address add\b/i.test(line)){
    var ka=parseKV(line); var addr=ka.address, ifn=(ka.interface||'').toLowerCase();
    if(!addr||addr.indexOf('/')<0) return ['failure: address must look like 192.168.88.1/24'];
    if(!mt.ifs[ifn]) return ['failure: no such interface "'+ifn+'" — try ether1, ether2 or wlan1'];
    if(mtAddrOf(mt, ifn) && mtAddrOf(mt, ifn).address===addr) return [];
    mt.addrs=mt.addrs.filter(function(a){ return a.interface!==ifn; });
    mt.addrs.push({address:addr, interface:ifn, network:mtNetOf(addr)}); changed(); return [];
  }
  if(/^\/ip address print$/i.test(line)){
    if(!mt.addrs.length) return [' # ADDRESS  NETWORK  INTERFACE','   (no addresses yet — add one!)'];
    var LA=[' # ADDRESS            NETWORK           INTERFACE'];
    mt.addrs.forEach(function(a, i){ LA.push(' '+i+' '+a.address+Array(Math.max(1,19-a.address.length)).join(' ')+a.network+Array(Math.max(1,18-a.network.length)).join(' ')+a.interface); });
    return LA;
  }
  if(/^\/ip address remove\b/i.test(line)){ var kr=parseKV(line); var idx=parseInt((kr._pos[0]||'').replace(/\D/g,''),10); if(!isNaN(idx)&&mt.addrs[idx]){ mt.addrs.splice(idx,1); changed(); return []; } return ['failure: which number? See /ip address print']; }
  /* ---- dhcp client ---- */
  if(/^\/ip dhcp-client add\b/i.test(line)){
    var kd=parseKV(line); var dif=(kd.interface||'ether1').toLowerCase();
    if(!mt.ifs[dif]) return ['failure: no such interface "'+dif+'"'];
    var link=ctx.scen&&ctx.scen.wanLinks? ctx.scen.wanLinks[dif] : null;
    if(kd.disabled==='yes'){ mt.dhcpClient[dif]={on:false}; changed(); return []; }
    mt.dhcpClient[dif]={ on:true, ip: link? link.dhcpIp : '10.0.1.50/24', gw: link? link.gw : '10.0.1.1', isp: link? link.isp : 'WAN' };
    changed();
    return ['  (DHCP client on '+dif+' is asking for an address…)','  bound — address '+mt.dhcpClient[dif].ip+', gateway '+mt.dhcpClient[dif].gw+' ✓'];
  }
  if(/^\/ip dhcp-client print$/i.test(line)){
    var LD=[' # INTERFACE  STATUS  ADDRESS         GATEWAY'];
    var any=false;
    Object.keys(mt.dhcpClient).forEach(function(k, i){ var c=mt.dhcpClient[k]; if(!c.on) return; any=true; LD.push(' '+i+' '+k+'   bound   '+(c.ip||'')+'  '+(c.gw||'')); });
    if(!any) LD.push('   (no DHCP client yet)');
    return LD;
  }
  /* ---- dhcp server ---- */
  if(/^\/ip dhcp-server setup/i.test(line)){
    var lan=mtAddrOf(mt,'ether2')||mt.addrs[0];
    if(!lan) return ['failure: the wizard needs an address first! Add one: /ip address add address=192.168.88.1/24 interface=ether2'];
    var net=mtNetOf(lan.address); var base=net.split('/')[0].split('.'); base[3]='0';
    mt.dhcpServer={ on:true, interface:lan.interface, pool:base.join('.').replace(/\.0$/,'.2')+'-'+base.join('.').replace(/\.0$/,'.254'), netAddr:net, gw:lan.address.split('/')[0], dns:'8.8.8.8' };
    changed(); if(ctx.onDhcp) ctx.onDhcp();
    return ['DHCP server wizard — pressing Enter like a hero…','  dhcp address space: '+net,'  gateway for the network: '+mt.dhcpServer.gw,'  address pool: '+mt.dhcpServer.pool,'  DNS server: 8.8.8.8','  [OK] DHCP server is ON — it now hands out addresses! 🎉'];
  }
  if(/^\/ip dhcp-server add\b/i.test(line)){
    var kds=parseKV(line); var sif=(kds.interface||'ether2').toLowerCase();
    var lanA=mtAddrOf(mt, sif);
    mt.dhcpServer.on = kds.disabled!=='yes';
    mt.dhcpServer.interface=sif;
    if(lanA){ mt.dhcpServer.netAddr=mtNetOf(lanA.address); mt.dhcpServer.gw=lanA.address.split('/')[0]; if(!mt.dhcpServer.pool) mt.dhcpServer.pool=mt.dhcpServer.netAddr.split('/')[0].replace(/\.0$/,'.2')+'-'+mt.dhcpServer.netAddr.split('/')[0].replace(/\.0$/,'.254'); }
    changed(); if(mt.dhcpServer.on&&ctx.onDhcp) ctx.onDhcp(); return [];
  }
  if(/^\/ip dhcp-server network add\b/i.test(line)){ var kn=parseKV(line); if(kn.address) mt.dhcpServer.netAddr=kn.address; if(kn.gateway) mt.dhcpServer.gw=kn.gateway; if(kn['dns-server']) mt.dhcpServer.dns=kn['dns-server']; changed(); return []; }
  if(/^\/ip dhcp-server print$/i.test(line)) return [' # NAME     INTERFACE  ADDRESS-POOL   LEASE-TIME',' 0 dhcp1    '+mt.dhcpServer.interface+'   '+(mt.dhcpServer.pool||'—')+'   10m   '+(mt.dhcpServer.on?'':'X (disabled)')];
  if(/^\/ip dhcp-server lease print$/i.test(line)){ if(ctx.leases) return ctx.leases(); return [' # ADDRESS        MAC-ADDRESS        HOST-NAME  SERVER','   (leases appear when PCs join)']; }
  /* ---- nat ---- */
  if(/^\/ip firewall nat add\b/i.test(line)){
    var knat=parseKV(line);
    if((knat.action||'masquerade')!=='masquerade') return ['failure: heroes use action=masquerade to share the internet'];
    var oif=(knat['out-interface']||'ether1').toLowerCase();
    if(!mt.nat.some(function(n){ return n.outIf===oif; })) mt.nat.push({outIf:oif, action:'masquerade'});
    changed(); return [];
  }
  if(/^\/ip firewall nat print$/i.test(line)){ if(!mt.nat.length) return [' # CHAIN  ACTION  OUT-INTERFACE','   (no NAT rules yet)']; var LN=[' # CHAIN   ACTION       OUT-INTERFACE']; mt.nat.forEach(function(n, i){ LN.push(' '+i+' srcnat  masquerade   '+n.outIf); }); return LN; }
  /* ---- filter ---- */
  if(/^\/ip firewall filter add\b/i.test(line)){
    var kf=parseKV(line);
    mt.filter.push({ chain:(kf.chain||'forward').toLowerCase(), action:(kf.action||'accept').toLowerCase(), src:kf['src-address']||'', dst:kf['dst-address']||'', comment:kf.comment||'' });
    changed(); return [];
  }
  if(/^\/ip firewall filter print$/i.test(line)){ if(!mt.filter.length) return [' # CHAIN  ACTION  SRC  DST','   (no filter rules yet)']; var LF=[' # CHAIN    ACTION  SRC-ADDRESS      DST-ADDRESS']; mt.filter.forEach(function(f, i){ LF.push(' '+i+' '+f.chain+'  '+f.action+'   '+(f.src||'—')+'   '+(f.dst||'—')); }); return LF; }
  /* ---- routes ---- */
  if(/^\/ip route add\b/i.test(line)){
    var krt=parseKV(line);
    var dst=krt['dst-address']||'0.0.0.0/0'; var gw=krt.gateway||'';
    if(!gw) return ['failure: a route needs a gateway=…, e.g. gateway=10.0.1.1'];
    var dist=parseInt(krt.distance||'1',10)||1;
    var cg=(krt['check-gateway']||'').toLowerCase()==='ping';
    mt.routes=mt.routes.filter(function(r){ return !(r.dst===dst&&r.gw===gw); });
    mt.routes.push({dst:dst, gw:gw, dist:dist, checkGw:cg}); changed(); return [];
  }
  if(/^\/ip route print$/i.test(line)){
    var LR=[' # DST-ADDRESS        GATEWAY           DISTANCE  CHECK-GW'];
    var all=mtAllRoutes(mt);
    if(!all.length) LR.push('   (no routes yet)');
    all.forEach(function(r, i){ LR.push((r.dyn?' D':'  ')+' '+r.dst+Array(Math.max(1,19-r.dst.length)).join(' ')+r.gw+Array(Math.max(1,18-r.gw.length)).join(' ')+(r.dist||1)+'         '+(r.checkGw?'ping':'')); });
    var ad=mtActiveDefault(mt, ctx.scen); if(ad) LR.push('  → Active internet road: via '+(ad.isp||'WAN')+' (gateway '+ad.route.gw+')'+(ad.stuck?' — but that ISP is DOWN and this route has no check-gateway! Traffic is stuck.':''));
    return LR;
  }
  /* ---- dns ---- */
  if(/^\/ip dns set\b/i.test(line)){ var kdn=parseKV(line); if(kdn.servers) mt.dns.servers=kdn.servers.split(','); if(kdn['allow-remote-requests']) mt.dns.allowRemote=(kdn['allow-remote-requests']==='yes'); changed(); return []; }
  if(/^\/ip dns( print)?$/i.test(line)) return ['servers: '+(mt.dns.servers.join(', ')||'(none)'),'allow-remote-requests: '+(mt.dns.allowRemote?'yes':'no')];
  /* ---- queues ---- */
  if(/^\/queue simple add\b/i.test(line)){ var kq=parseKV(line); if(!kq.name||!kq.target) return ['failure: a queue needs name= and target=, e.g. /queue simple add name=Kids target=192.168.88.20/32 max-limit=5M/5M'];
    mt.queues.push({name:kq.name, target:kq.target, max:kq['max-limit']||'5M/5M'}); changed(); return []; }
  if(/^\/queue simple print$/i.test(line)){ if(!mt.queues.length) return [' # NAME  TARGET  MAX-LIMIT','   (no queues yet)']; var LQ=[' # NAME          TARGET             MAX-LIMIT']; mt.queues.forEach(function(q, i){ LQ.push(' '+i+' '+q.name+Array(Math.max(1,15-q.name.length)).join(' ')+q.target+Array(Math.max(1,19-q.target.length)).join(' ')+q.max); }); return LQ; }
  return badCmd();
}
