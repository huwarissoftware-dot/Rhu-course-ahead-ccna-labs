/* ================= MOCK EXAM ================= */
var MT_EXAM_QS=[
 {q:'What is the default IP address of a new MikroTik router?', options:['10.0.0.1','192.168.1.1','192.168.88.1','172.16.0.1'], answer:2, why:'Every MikroTik waits at 192.168.88.1, user admin.', from:'MikroTik'},
 {q:'In RouterOS, "masquerade" is a kind of…', options:['Firewall filter','Source NAT — home devices share one public address','Routing protocol','DHCP pool'], answer:1, why:'Masquerade = srcnat: many private faces, one public mask.', from:'MikroTik'},
 {q:'A route with check-gateway=ping…', options:['Blocks all pings','Keeps pinging the gateway so the router KNOWS when the road dies','Makes the route faster','Encrypts the gateway'], answer:1, why:'That ping-watch is the heart of auto-failover.', from:'MikroTik'},
 {q:'In dual-WAN failover, the BACKUP route should have…', options:['Distance 0','The same distance','A BIGGER distance than the main route','No gateway'], answer:2, why:'Bigger distance = waits quietly until the hero road dies.', from:'MikroTik'},
 {q:'WinBox, WebFig and SSH are…', options:['Different routers','Three doors to manage the SAME MikroTik','WiFi standards','Cable types'], answer:1, why:'Four doors (with the console cable), one brain!', from:'MikroTik'},
 {q:'A DHCP server\'s job is to…', options:['Block websites','Hand out IP addresses automatically','Speed up WiFi','Name the router'], answer:1, why:'DHCP = the address giver. No typing addresses by hand!', from:'MikroTik'}
];
var EXAM=null;
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function examPool(){
  var pool=[];
  (window.QUIZZES||[]).forEach(function(q){ (q.questions||[]).forEach(function(qu){ if(qu.options) pool.push({q:qu.q, options:qu.options, answer:qu.answer, why:qu.why, from:q.title}); }); });
  MT_EXAM_QS.forEach(function(qu){ pool.push(qu); });
  return pool;
}
function openExam(){ p2Show('view-exam'); renderExamIntro(); }
function renderExamIntro(){
  if(EXAM && EXAM.timer){ clearInterval(EXAM.timer); EXAM=null; }
  $('exam-timer').textContent='';
  var best=P2S.examBest;
  $('exam-card').innerHTML='<h3 style="margin-top:0">📝 '+T('Mock Exam — CCNA 200-301 Practice','Mock Exam — CCNA 200-301 Practice')+'</h3>'
  +'<p style="font-weight:700">'+T('30 questions · 45 minutes · pass mark 70%. Questions come from every Quiz Arena module plus the MikroTik track. No peeking at hints — this is the real-feel test, hero!','30 sawal · 45 minute · pass marks 70%. Sawal har Quiz module aur MikroTik track se aayenge. Koi hint nahi — yeh asli imtihan jaisa hai, hero!')+'</p>'
  +(best? '<p style="font-weight:900">🏅 '+T('Your best score: ','Tumhara best score: ')+best+'%</p>' : '')
  +'<button class="btn orange" id="exam-start" style="min-height:56px">▶ '+T('Start the Exam','Exam Shuru Karo')+'</button>';
  $('exam-start').addEventListener('click', startExam);
}
function startExam(){
  var pool=shuffle(examPool().slice());
  var qs=pool.slice(0, Math.min(30, pool.length));
  EXAM={ qs:qs, i:0, ans:{}, secs:45*60, timer:null, done:false };
  EXAM.timer=setInterval(function(){
    EXAM.secs--;
    var t=$('exam-timer'); if(t) t.textContent='⏱ '+Math.floor(EXAM.secs/60)+':'+String(EXAM.secs%60).padStart(2,'0');
    if(EXAM.secs<=0) finishExam();
  }, 1000);
  renderExamQ();
}
function renderExamQ(){
  if(!EXAM) return;
  var q=EXAM.qs[EXAM.i];
  $('exam-timer').textContent='⏱ '+Math.floor(EXAM.secs/60)+':'+String(EXAM.secs%60).padStart(2,'0');
  var host=$('exam-card');
  var html='<p style="font-weight:900">'+T('Question ','Sawal ')+(EXAM.i+1)+' / '+EXAM.qs.length+' <span style="color:var(--muted)">· '+esc(q.from||'')+'</span></p>'
  +'<p style="font-weight:800;font-size:1.05rem">'+esc(q.q)+'</p><div>';
  q.options.forEach(function(op, i){
    html+='<button type="button" class="btn exam-opt'+(EXAM.ans[EXAM.i]===i?' orange':' ghost')+'" data-xo="'+i+'">'+esc(op)+'</button>';
  });
  html+='</div><div class="p2-rowbtns">'
  +(EXAM.i>0? '<button class="btn ghost" id="exam-prev">← '+T('Back','Peeche')+'</button>' : '')
  +(EXAM.i<EXAM.qs.length-1? '<button class="btn" id="exam-next">'+T('Next','Aage')+' →</button>' : '<button class="btn orange" id="exam-finish">🏁 '+T('Finish Exam','Exam Khatam')+'</button>')
  +(EXAM.i===EXAM.qs.length-1? '' : '<button class="btn orange" id="exam-finish2">🏁 '+T('Finish Now','Abhi Khatam')+'</button>')
  +'</div>';
  host.innerHTML=html;
  host.querySelectorAll('[data-xo]').forEach(function(b){ b.addEventListener('click', function(){ EXAM.ans[EXAM.i]=parseInt(b.dataset.xo,10); renderExamQ(); }); });
  var pv=$('exam-prev'); if(pv) pv.addEventListener('click', function(){ EXAM.i--; renderExamQ(); });
  var nx=$('exam-next'); if(nx) nx.addEventListener('click', function(){ EXAM.i++; renderExamQ(); });
  var fn=$('exam-finish'); if(fn) fn.addEventListener('click', finishExam);
  var f2=$('exam-finish2'); if(f2) f2.addEventListener('click', finishExam);
}
function finishExam(){
  if(!EXAM || EXAM.done) return; EXAM.done=true;
  if(EXAM.timer) clearInterval(EXAM.timer);
  $('exam-timer').textContent='';
  var right=0, wrong=[];
  EXAM.qs.forEach(function(q, i){ if(EXAM.ans[i]===q.answer) right++; else wrong.push({q:q, mine:EXAM.ans[i]}); });
  var pct=Math.round(right/EXAM.qs.length*100);
  var pass=pct>=70;
  XP+=right*2;
  if(!P2S.examBest || pct>P2S.examBest) P2S.examBest=pct;
  p2saveAll();
  var html='<div style="text-align:center"><div style="font-size:3rem">'+(pass?'🏆':'💪')+'</div>'
  +'<h3>'+(pass? T('PASSED! ','PASS! ') : T('Not yet — keep training! ','Abhi nahi — mashq jari rakho! '))+pct+'%</h3>'
  +'<p style="font-weight:800">'+right+' / '+EXAM.qs.length+' '+T('correct · +','sahi · +')+(right*2)+' XP</p></div>';
  if(wrong.length){
    html+='<h4>'+T('Review your misses:','Apni ghaltiyan dekho:')+'</h4>'+wrong.map(function(w){
      return '<div class="exam-review"><b>'+esc(w.q.q)+'</b><br>'+T('You said: ','Tum ne kaha: ')+(w.mine===undefined? '—' : esc(w.q.options[w.mine]))+'<br>'+T('Right answer: ','Sahi jawab: ')+esc(w.q.options[w.q.answer])+'<br>💡 '+esc(w.q.why||'')+'</div>';
    }).join('');
  } else html+='<p style="font-weight:900;text-align:center">💎 PERFECT — zero misses!</p>';
  html+='<div class="p2-rowbtns"><button class="btn orange" id="exam-again">↺ '+T('New Exam','Naya Exam')+'</button><button class="btn ghost" id="exam-home2">🏠 '+T('Home','Ghar')+'</button></div>';
  $('exam-card').innerHTML=html;
  $('exam-again').addEventListener('click', renderExamIntro);
  $('exam-home2').addEventListener('click', function(){ EXAM=null; goHome(); });
  toast(pass? '🏆 Exam PASSED with '+pct+'%!' : '💪 Exam done: '+pct+'% — review and try again!');
}
/* ================= CERTIFICATES ================= */
function certCats(){
  var list=CATS.map(function(c){ return {id:c.id, name:c.name, icon:c.icon, color:c.color, mt:false}; });
  list.push({id:'mikrotik', name:'MikroTik Networking', icon:'📡', color:'#0f4c81', mt:true});
  return list;
}
function catLabs(cat){ return cat.mt ? MTLABS : LABS.filter(function(l){ return l.cat===cat.id; }); }
function catComplete(cat){ var labs=catLabs(cat); return labs.length>0 && labs.every(function(l){ return (PROGRESS[l.id]||0)>0; }); }
function openCert(){ p2Show('view-cert'); renderCertHome(); }
function renderCertHome(){
  $('cert-stage').classList.add('hidden'); $('cert-home').classList.remove('hidden');
  var host=$('cert-home'); host.innerHTML='';
  var doneCats=certCats().filter(catComplete).length;
  $('cert-prog').textContent=doneCats+' '+T('unlocked','khul gaye');
  var intro=el('div','panel','<p style="font-weight:700;margin:4px 2px">🏆 '+T('Finish ALL labs of a colour to earn its certificate — signed by Raja Huwaris Usmani, valid for 2 years. Only your NAME is printed on the certificate.','Kisi rang ki SARI labs mukammal karo aur certificate hasil karo — Raja Huwaris Usmani ke dastakhat ke saath, 2 saal valid. Certificate par sirf tumhara NAAM chhapta hai.')+'</p>');
  host.appendChild(intro);
  var grid=el('div','p2-cards'); grid.style.marginTop='12px';
  certCats().forEach(function(cat){
    var labs=catLabs(cat); var done=labs.filter(function(l){ return PROGRESS[l.id]; }).length; var full=catComplete(cat);
    var c=el('div','p2-card');
    c.innerHTML='<span class="meta"><span>'+done+' / '+labs.length+' labs</span><span>'+(full?'🏆':'🔒')+'</span></span><h3>'+cat.icon+' '+esc(cat.name)+'</h3><p>'+(full? T('Category complete — your certificate is ready!','Category mukammal — certificate tayyar hai!') : T('Finish every lab in this category to unlock the certificate.','Is category ki har lab mukammal karo, certificate khul jayega.'))+'</p>';
    if(full){ var b=el('button','btn orange','🎓 '+T('Get My Certificate','Mera Certificate')); b.type='button'; b.addEventListener('click', function(){ renderCertForm(cat); }); c.appendChild(b); }
    grid.appendChild(c);
  });
  host.appendChild(grid);
  var issued=P2S.certs||[];
  if(issued.length){
    var h=el('h3','','🏆 '+T('My certificates','Mere certificates')); host.appendChild(h);
    var g2=el('div','p2-cards');
    issued.forEach(function(cert){
      var c2=el('div','p2-card');
      c2.innerHTML='<span class="meta"><span>'+cert.id+'</span><span>'+cert.issue+'</span></span><h3>🎓 '+esc(cert.catName)+'</h3><p>'+T('For: ','Naam: ')+esc(cert.name)+' · '+T('Valid until ','Valid: ')+cert.valid+'</p>';
      var vb=el('button','btn', '👁 '+T('View Certificate','Certificate Dekho')); vb.type='button'; vb.addEventListener('click', function(){ renderCertDoc(cert); });
      c2.appendChild(vb); g2.appendChild(c2);
    });
    host.appendChild(g2);
  }
}
function renderCertForm(cat){
  $('cert-home').classList.add('hidden'); $('cert-stage').classList.add('hidden');
  var stage=$('cert-home'); stage.classList.remove('hidden');
  var cl=P2S.claims||{};
  stage.innerHTML='<div class="panel" style="padding:16px"><h3 style="margin-top:0">🎓 '+esc(cat.name)+'</h3>'
  +'<p style="font-weight:700">'+T('Fill this little form to claim your certificate. Your email and contact stay ONLY on this device — the certificate prints just your name.','Certificate lene ke liye yeh chhota form bharo. Email aur contact SIRF is device par rahenge — certificate par sirf naam chhapay ga.')+'</p>'
  +'<form class="cert-form" id="cert-form">'
  +'<label>'+T('Full name (printed on the certificate)','Pura naam (certificate par yahi chhapay ga)')+'<input id="cf-name" maxlength="40" value="'+esc(cl.name||activeProfile().name||'')+'" /></label>'
  +'<label>Email address<input id="cf-email" type="email" maxlength="60" value="'+esc(cl.email||'')+'" placeholder="you@example.com" /></label>'
  +'<label>'+T('Contact details (phone / WhatsApp)','Rabta tafseel (phone / WhatsApp)')+'<input id="cf-contact" maxlength="40" value="'+esc(cl.contact||'')+'" placeholder="03xx-xxxxxxx" /></label>'
  +'<button class="btn orange" type="submit" style="min-height:56px;width:100%">🎓 '+T('Make My Certificate','Mera Certificate Banao')+'</button></form></div>';
  $('cert-form').addEventListener('submit', function(ev){
    ev.preventDefault();
    var name=$('cf-name').value.trim(), email=$('cf-email').value.trim(), contact=$('cf-contact').value.trim();
    if(name.length<2){ toast('✏️ '+T('Please write your full name.','Meherbani karke pura naam likho.')); return; }
    if(email.indexOf('@')<1 || email.indexOf('.')<0){ toast('✉️ '+T('That email looks wrong — check it please.','Email theek nahi lag raha — check karo.')); return; }
    if(contact.replace(/\D/g,'').length<7){ toast('📱 '+T('Please add a contact number.','Rabta number likho.')); return; }
    P2S.claims={name:name, email:email, contact:contact};
    var seq=1; try{ seq=(parseInt(localStorage.getItem('rhu-certseq')||'0',10)||0)+1; localStorage.setItem('rhu-certseq', String(seq)); }catch(e){}
    var now=new Date(); var valid=new Date(now); valid.setFullYear(valid.getFullYear()+2);
    var cert={ id:'CA-'+now.getFullYear()+'-'+String(seq).padStart(4,'0'), cat:cat.id, catName:cat.name, mt:!!cat.mt, name:name, issue:fmtDate(now), valid:fmtDate(valid), year:now.getFullYear() };
    if(!P2S.certs) P2S.certs=[];
    P2S.certs.push(cert); p2saveAll();
    toast('🏆 Certificate ban gaya!');
    renderCertDoc(cert);
  });
}
function certCorner(){ return '<svg viewBox="0 0 40 40" width="42" height="42"><path d="M2 38 L2 12 Q2 2 12 2 L38 2" fill="none" stroke="#c9a227" stroke-width="2.4"/><circle cx="7" cy="7" r="2.6" fill="#0a1e3f"/></svg>'; }
function renderCertDoc(cert){
  $('cert-home').classList.add('hidden'); $('cert-stage').classList.remove('hidden');
  var ach=cert.mt ? 'MikroTik Networking — Course Ahead' : ('Networking — CCNA Labs (CCNA 200-301) · '+cert.catName);
  var seal='<svg viewBox="0 0 100 100" width="102" height="102"><circle cx="50" cy="50" r="46" fill="#0a1e3f"/><circle cx="50" cy="50" r="40" fill="none" stroke="#c9a227" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="#c9a227" stroke-width="1"/><text x="50" y="47" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-weight="bold" fill="#c9a227">CA</text><text x="50" y="63" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" letter-spacing="1" fill="#fdfcf6">EST • 2026</text></svg>';
  $('cert-doc').innerHTML='<img class="wm" src="'+MONO+'" alt="" />'
  +'<div class="fo"></div><div class="fi"></div>'
  +'<div style="position:absolute;top:31px;left:31px;z-index:2">'+certCorner()+'</div>'
  +'<div style="position:absolute;top:31px;right:31px;z-index:2;transform:scaleX(-1)">'+certCorner()+'</div>'
  +'<div style="position:absolute;bottom:31px;left:31px;z-index:2;transform:scaleY(-1)">'+certCorner()+'</div>'
  +'<div style="position:absolute;bottom:31px;right:31px;z-index:2;transform:scale(-1,-1)">'+certCorner()+'</div>'
  +'<div class="content"><img class="logo" src="'+MONO+'" alt="Course Ahead logo" />'
  +'<div class="brand">Course Ahead</div><h1>Certificate of Achievement</h1><div class="rule"></div>'
  +'<div class="presented">This certificate is proudly presented to</div>'
  +'<div class="student">'+esc(cert.name)+'</div><div class="nameline"></div>'
  +'<div class="ach">for successfully completing <b>'+esc(ach)+'</b></div></div>'
  +'<div class="bottom"><div class="details">Certificate ID <b>'+cert.id+'</b><span class="sep">◆</span>Issue Date <b>'+cert.issue+'</b><span class="sep">◆</span>Valid Until <b>'+cert.valid+'</b></div>'
  +'<div class="cols"><div class="cl"></div><div class="cm">'+seal+'</div>'
  +'<div class="cr"><div class="sig">Raja Huwaris Usmani</div><div class="sigline"></div><div class="signame">Raja Huwaris Usmani</div><div class="sigtitle">Founder, Course Ahead<br />Technical Lead, Operations &amp; Customer Support</div></div></div></div>'
  +'<div class="footer">© '+cert.year+' RAJA HUWARIS USMANI — ALL RIGHTS RESERVED</div>';
  var cc=$('cert-connect');
  cc.innerHTML='<h3 style="margin-top:0">🎉 '+T('You earned it — now connect with your teacher!','Tum ne kama liya — ab apne ustad se juro!')+'</h3>'
  +'<p style="font-weight:700">'+T('Share your achievement and connect — professionals on LinkedIn, students on Instagram:','Apni kamyabi share karo aur connect karo — professionals LinkedIn par, students Instagram par:')+'</p>'
  +'<div class="p2-rowbtns"><button class="btn" id="cc-li" type="button">💼 LinkedIn — Raja Huwaris Usmani</button><button class="btn" id="cc-ig" type="button">📸 Instagram — i.huwaris</button></div>';
  $('cc-li').addEventListener('click', function(){ window.open('https://pk.linkedin.com/in/raja-huwaris-usmani-939a1411a','_blank'); });
  $('cc-ig').addEventListener('click', function(){ window.open('https://www.instagram.com/i.huwaris','_blank'); });
  fitCert();
}
function fitCert(){
  var sc=$('cert-scale'), doc=$('cert-doc'); if(!sc||!doc) return;
  var w=sc.clientWidth||doc.parentNode.clientWidth||360;
  var k=Math.min(1, w/1122);
  doc.style.transform='scale('+k+')';
  sc.style.height=(794*k)+'px';
}
window.addEventListener('resize', function(){ if($('cert-stage') && !$('cert-stage').classList.contains('hidden')) fitCert(); });
/* ================= PROGRESS CARD ================= */
function totalStars(){ return Object.keys(PROGRESS).reduce(function(a, k){ return a+(PROGRESS[k]||0); }, 0); }
function showProgressCard(info){
  var prof=activeProfile().name;
  var title=info&&info.title? info.title : (P2S.lastDone? P2S.lastDone.title : 'Course Ahead CCNA Labs');
  var stars=info&&typeof info.stars==='number'? info.stars : (P2S.lastDone? P2S.lastDone.stars : 0);
  var kind=info&&info.kind? info.kind : (P2S.lastDone? (P2S.lastDone.kind==='mikrotik'?'MikroTik Lab':'CCNA Lab') : 'Learning Journey');
  var cv=document.createElement('canvas'); cv.width=1200; cv.height=630;
  var g=cv.getContext('2d');
  var grad=g.createLinearGradient(0,0,1200,630); grad.addColorStop(0,'#0a1e3f'); grad.addColorStop(0.6,'#0f4c81'); grad.addColorStop(1,'#0ea5e9');
  g.fillStyle=grad; g.fillRect(0,0,1200,630);
  g.strokeStyle='#c9a227'; g.lineWidth=6; g.strokeRect(18,18,1164,594);
  g.strokeStyle='rgba(201,162,39,.5)'; g.lineWidth=2; g.strokeRect(30,30,1140,570);
  g.fillStyle='rgba(125,211,252,.14)'; g.beginPath(); g.arc(1050,90,190,0,7); g.fill();
  g.beginPath(); g.arc(120,560,150,0,7); g.fill();
  var img=new Image();
  img.onload=function(){
    g.drawImage(img, 430, 26, 340, 146);
    g.textAlign='center';
    g.fillStyle='#fbbf24'; g.font='900 44px Georgia,serif'; g.fillText('COURSE AHEAD', 600, 218);
    g.fillStyle='#fff'; g.font='900 58px system-ui,sans-serif';
    g.fillText('🏆 Progress Card', 600, 292);
    g.font='800 40px system-ui,sans-serif'; g.fillStyle='#e0f2fe';
    g.fillText(prof, 600, 352);
    g.font='700 32px system-ui,sans-serif'; g.fillStyle='#bae6fd';
    var line='finished: '+title;
    while(g.measureText(line).width>1060 && line.length>10){ line=line.slice(0,-2); }
    g.fillText(line, 600, 402);
    g.font='900 54px system-ui,sans-serif'; g.fillStyle='#f59e0b';
    g.fillText('★'.repeat(Math.max(0,stars))+'☆'.repeat(Math.max(0,3-stars)), 600, 472);
    g.font='800 30px system-ui,sans-serif'; g.fillStyle='#fff';
    g.fillText('⭐ '+XP+' XP · '+totalStars()+' total stars · '+kind, 600, 528);
    g.font='700 21px system-ui,sans-serif'; g.fillStyle='#cbd5e1';
    g.fillText('© 2026 Raja Huwaris Usmani — All Rights Reserved', 600, 578);
    var url=cv.toDataURL('image/png');
    $('p2-card-img').src=url;
    var dl=$('p2-card-dl'); if(dl) dl.href=url;
    $('p2-card-modal').classList.add('open');
  };
  img.src=MONO;
}
/* ---- feature bindings ---- */
document.addEventListener('DOMContentLoaded', function(){
  var eb=$('exam-back'); if(eb) eb.addEventListener('click', function(){ if(EXAM&&EXAM.timer) clearInterval(EXAM.timer); EXAM=null; goHome(); });
  var cb=$('cert-back'); if(cb) cb.addEventListener('click', function(){ goHome(); });
  var cp=$('cert-print'); if(cp) cp.addEventListener('click', function(){ window.print(); });
  var cn=$('cert-new'); if(cn) cn.addEventListener('click', function(){ renderCertHome(); });
  var cc2=$('p2-card-close'); if(cc2) cc2.addEventListener('click', function(){ $('p2-card-modal').classList.remove('open'); });
  var dl2=$('btn-done-home'); /* noop guard */
});
/* Cisco completion → remember + share button */
var _completeLab3=window.completeLab;
window.completeLab=function(){
  _completeLab3();
  try{
    if(typeof CUR!=='undefined' && CUR && CUR.lab){
      P2S.lastDone={kind:'cisco', id:CUR.lab.id, title:CUR.lab.title, stars:PROGRESS[CUR.lab.id]||0};
      p2store();
      var mb=document.querySelector('#modal-done .hero-btns');
      if(mb && !$('btn-done-card')){
        var b=el('button','btn','📤 Share My Progress'); b.type='button'; b.id='btn-done-card';
        b.addEventListener('click', function(){ $('modal-done').classList.remove('open'); showProgressCard(P2S.lastDone); });
        mb.appendChild(b);
      }
    }
  }catch(e){}
};
