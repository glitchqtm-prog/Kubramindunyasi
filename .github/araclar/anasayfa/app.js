(function(){
"use strict";
var D=document,W=window,RM=W.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
function $(s,r){return (r||D).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function onNear(el,fn,m){if(!el)return;if(!("IntersectionObserver" in W)){fn();return}var o=new IntersectionObserver(function(e){for(var i=0;i<e.length;i++)if(e[i].isIntersecting){o.disconnect();fn();break}},{rootMargin:m||"600px 0px"});o.observe(el)}
function lateLoad(fn,ms){var done=0,ev=["pointerdown","keydown","touchstart","scroll","wheel"];function go(){if(done)return;done=1;ev.forEach(function(e){removeEventListener(e,go,true)});fn()}ev.forEach(function(e){addEventListener(e,go,{capture:true,passive:true})});function t(){setTimeout(go,ms)}if(D.readyState==="complete")t();else addEventListener("load",t)}

/* ---- çerez bandı kapanınca ayrılan yer geri verilir ---- */
D.addEventListener("click",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("ay-cerez-kabul"))D.documentElement.classList.remove("cz")});

/* ---- görünürken beliren öğeler ---- */
if("IntersectionObserver" in W){var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");ro.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});$$(".rv").forEach(function(e){ro.observe(e)})}else $$(".rv").forEach(function(e){e.classList.add("in")});

/* ---- açılış filmi: kaydırmayla ilerleyen kareler ---- */
(function(){
  var hero=$("#ust"),pin=$("#pin"),film=$("#film"),he=$("#he");if(!hero||!film)return;
  var cv=$("canvas",film),cx=cv.getContext("2d"),N=96,HIZ=.22,KAR=0,im=[],pre,cur="",sp=0,tp=0,raf=0,started=0,all=0;
  /* telefon: 96 kare, olduğu gibi. bilgisayar: 102 kare (hareketin yoğun olduğu yerde her kare), daha yumuşak takip ve iki kare arasında geçiş */
  function setup(){var port=matchMedia("(max-aspect-ratio:1/1)").matches,p=port?"m":"d";if(p===pre)return;pre=p;im=[];cur="";N=port?96:102;HIZ=port?.22:.085;KAR=port?0:1;cv.width=port?720:1280;cv.height=port?1280:720;if(started){started=0;all=0;start()}}
  function nearest(i){if(im[i]&&im[i].ok)return i;for(var d=1;d<N;d++){if(im[i-d]&&im[i-d].ok)return i-d;if(im[i+d]&&im[i+d].ok)return i+d}return -1}
  function draw(){
    var f=Math.min(1,Math.max(0,(sp-.03)/.8))*(N-1),a=KAR?Math.floor(f):Math.round(f),k=nearest(a);if(k<0)return;
    var fr=KAR&&k===a&&im[a+1]&&im[a+1].ok?Math.round((f-a)*24)/24:0,key=k+"_"+fr;if(key===cur)return;cur=key;
    cx.globalAlpha=1;cx.drawImage(im[k],0,0,cv.width,cv.height);
    if(fr>0){cx.globalAlpha=fr;cx.drawImage(im[a+1],0,0,cv.width,cv.height);cx.globalAlpha=1}
    film.classList.add("on")
  }
  function get(i){if(i<0||i>=N||im[i])return;var g=new Image(),p=pre;g.decoding="async";g.onload=function(){if(p!==pre)return;g.ok=1;cur="";draw()};g.src="film/"+pre+("00"+i).slice(-3)+".webp";im[i]=g}
  function start(){if(started||RM)return;started=1;get(0);[1,.5,.25,.75,.125,.375,.625,.875].forEach(function(q){get(Math.round(q*(N-1)))})}
  function rest(){if(all||RM)return;all=1;start();for(var s=6;s>=1;s=s>>1)for(var i=0;i<N;i+=s)get(i)}
  function tick(){raf=0;var r=hero.getBoundingClientRect(),h=r.height-innerHeight;tp=h>0?Math.min(1,Math.max(0,-r.top/h)):0;sp+=(tp-sp)*HIZ;if(Math.abs(tp-sp)<.0004)sp=tp;pin.style.setProperty("--p",sp.toFixed(4));var a=sp>.76;if(he&&he.classList.contains("act")!==a){he.classList.toggle("act",a);$$("a",he).forEach(function(x){x.tabIndex=a?0:-1})}draw();if(sp!==tp)raf=requestAnimationFrame(tick)}
  function req(){if(!raf)raf=requestAnimationFrame(tick)}
  setup();
  if(RM)return;
  addEventListener("scroll",req,{passive:true});addEventListener("resize",function(){setup();req()});
  if(D.readyState==="complete")setTimeout(start,60);else addEventListener("load",function(){setTimeout(start,60)});
  lateLoad(rest,2600);req();
})();

/* ---- rapor kartları ve ortak menü: ilk çizimden sonra ---- */
var KAT=[
 {ad:"Pusula Serisi",alt:"Astro Yuvam'a özgü: haritanın bütününden çıkan yollar ve bugünün koşullarıyla adım adım planı",g:"pusula",ids:["pusula_butun","pusula_is","pusula_ask","pusula_para","pusula_beceri","pusula_yasam"]},
 {ad:"Kişisel Haritalar",alt:"Kendi doğum haritan ve hayatının alanları",g:"kisisel",ids:["natal","cocuk","kariyer","ask","karmik","vedik","astrokartografi"]},
 {ad:"Zaman ve Öngörü",alt:"Önündeki dönemler ve doğru anı seçmek",g:"zaman",ids:["transit","solar_return","lunar_return","progresyon","secim"]},
 {ad:"İlişki Raporları",alt:"İki kişinin uyumu ve ilişki dinamiği",g:"iliski",ids:["sinastri","iliski_haritasi","matrix_uyum"]},
 {ad:"Numeroloji ve Soru Astrolojisi",alt:"Sayıların dili ve tek soruna anlık yanıt",g:"numero",ids:["matrix","numeroloji","horary"]}
];
var EK={{EK}};
var ONERI={natal:"Başlangıç için önerilen",pusula_butun:"En kapsamlısı"};
var rpAktif=0,rpHazir=0;
function tl(n){return Number(n).toLocaleString("tr-TR")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function kart(r){
  var e=EK[r.id]||{},td=r.liste&&(!r.tanitimBitis||new Date()<=new Date(r.tanitimBitis+"T23:59:59+03:00"));
  var fy=tl(r.liste&&!td?r.liste:r.price),alt=td?"tanıtım fiyatı · sonra "+tl(r.liste)+" TL":"tek seferlik · e-postana gelir";
  var href=r.page||("order.html?type="+r.id),g=e.g?e.g.charAt(0).toLocaleLowerCase("tr")+e.g.slice(1):"";
  return '<article class="rk">'+(ONERI[r.id]?'<span class="rk-o">'+ONERI[r.id]+"</span>":"")+"<h3>"+esc(r.title)+"</h3>"+(e.s?'<div class="rk-s">'+e.s+" sayfa · PDF</div>":'<div class="rk-s">Kişiye özel plan · PDF</div>')+"<p>"+(e.k||esc(r.short))+"</p><ul>"+(g?"<li>Gerekenler: "+g+"</li>":"")+(e.o?'<li><a href="'+e.o+'" target="_blank" rel="noopener">Ücretsiz 3 sayfalık örneği gör<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"> ('+esc(r.title)+")</span></a></li>":"")+'</ul><div class="rk-f"><div><b>'+fy+" TL</b><span>"+alt+'</span></div><a class="rk-b" href="'+href+'" aria-label="İncele: '+esc(r.title)+'">İncele <svg aria-hidden="true"><use href="#ok"/></svg></a></div></article>'
}
function katGoster(k){
  rpAktif=k;var K=KAT[k],box=$("#rpCards"),kat=$("#rpKat");
  $$("#rpTabs .tab").forEach(function(t,i){var s=i===k;t.setAttribute("aria-selected",s?"true":"false");t.tabIndex=s?0:-1});
  $("#rpAd").textContent=K.ad;$("#rpAlt").textContent=K.alt;
  var img=$('img[data-g="'+K.g+'"]',kat);
  if(!img){img=new Image();img.alt="";img.decoding="async";img.setAttribute("data-g",K.g);img.width=1200;img.height=805;img.sizes="(min-width:960px) 40vw, 100vw";img.srcset="ay-kat-"+K.g+"-720.webp 720w, ay-kat-"+K.g+"-1200.webp 1200w";img.src="ay-kat-"+K.g+"-720.webp";kat.insertBefore(img,kat.firstChild)}
  $$("img",kat).forEach(function(x){x.classList.toggle("on",x===img)});
  if(!rpHazir||typeof REPORTS==="undefined")return;
  var by={};REPORTS.forEach(function(r){by[r.id]=r});
  var list=K.ids.map(function(id){return by[id]}).filter(Boolean);
  if(k===KAT.length-1){var known={};KAT.forEach(function(c){c.ids.forEach(function(id){known[id]=1})});REPORTS.forEach(function(r){if(!known[r.id])list.push(r)})}
  box.innerHTML=list.map(kart).join("");box.scrollLeft=0
}
W.kartlariKur=function(){rpHazir=1;katGoster(rpAktif)};
(function(){
  var tabs=$$("#rpTabs .tab");
  tabs.forEach(function(t,i){t.addEventListener("click",function(){katGoster(i)});t.addEventListener("keydown",function(e){var d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();var n=(i+d+tabs.length)%tabs.length;katGoster(n);tabs[n].focus()})});
  onNear($("#cards"),function(){katGoster(rpAktif)},"900px 0px");
  var oldu=0,ev=["pointerdown","keydown","touchstart"];
  function yukle(){if(oldu)return;oldu=1;ev.forEach(function(o){removeEventListener(o,yukle,true)});var r=D.createElement("script");r.src="reports-data.js";r.onload=W.kartlariKur;D.body.appendChild(r);var m=D.createElement("script");m.src="menu.js";D.body.appendChild(m)}
  ev.forEach(function(o){addEventListener(o,yukle,{capture:true,passive:true})});
  try{var po=new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.name==="first-contentful-paint"){po.disconnect();setTimeout(yukle,0)}})});po.observe({type:"paint",buffered:true})}catch(e){}
  setTimeout(yukle,1500);
  if(location.hash==="#fiyat-listesi"){var f=$("#fiyat-listesi");if(f)f.open=true}
})();

/* ---- bugünün gökyüzü: günlük veri dosyasından ---- */
var BURC=["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
var SLUG=["koc","boga","ikizler","yengec","aslan","basak","terazi","akrep","yay","oglak","kova","balik"];
var GZ={"Güneş":"gunes","Ay":"ay","Merkür":"merkur","Venüs":"venus","Mars":"mars","Jüpiter":"jupiter","Satürn":"saturn","Uranüs":"uranus","Neptün":"neptun","Plüton":"pluton"};
var AYLAR=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
onNear($("#gok"),function(){
  var c=$("#gkC");
  if("IntersectionObserver" in W){var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){o.disconnect();c.classList.add("in")}},{threshold:.25});o.observe(c)}else c.classList.add("in");
  if(!W.fetch)return;
  fetch("gokyuzu.json").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var gs=(d.gezegenler||[]).filter(function(g){return GZ[g.ad]&&typeof g.boylam==="number"});if(!gs.length)return;
    var ps=gs.map(function(g){return{g:g,a:g.boylam,t:g.boylam}}).sort(function(a,b){return a.a-b.a}),n=ps.length,MIN=12;
    for(var it=0;it<40;it++){var mv=0;for(var i=0;i<n;i++){var a=ps[i],b=ps[(i+1)%n],df=(b.t-a.t+360)%360;if(df<MIN){var sh=(MIN-df)/2;a.t-=sh;b.t+=sh;mv=1}}if(!mv)break}
    var NS="http://www.w3.org/2000/svg",G=$("#gkP");
    function xy(r,a){var q=a*Math.PI/180;return[-r*Math.cos(q),r*Math.sin(q)]}
    function mk(t,at){var e=D.createElementNS(NS,t);for(var k in at)e.setAttribute(k,at[k]);G.appendChild(e);return e}
    ps.forEach(function(p,i){
      var d0=xy(150,p.a),d1=xy(137,p.t),gp=xy(118,p.t);
      mk("line",{x1:d0[0].toFixed(1),y1:d0[1].toFixed(1),x2:d1[0].toFixed(1),y2:d1[1].toFixed(1),"class":"gk-l fd","stroke-width":".7"});
      mk("circle",{cx:d0[0].toFixed(1),cy:d0[1].toFixed(1),r:"2.6","class":"gk-d fd"});
      var u=mk("use",{href:"#g-"+GZ[p.g.ad],x:(gp[0]-10).toFixed(1),y:(gp[1]-10).toFixed(1),width:"20",height:"20","class":"gk-p fd"});
      u.style.transitionDelay=(.7+i*.07)+"s";
      var ti=D.createElementNS(NS,"title");ti.textContent=p.g.ad+": "+p.g.burc+" "+p.g.derece+(p.g.retro?" (geri hareket)":"");u.appendChild(ti);
      if(p.g.retro){var rp=xy(100,p.t),tx=mk("text",{x:rp[0].toFixed(1),y:(rp[1]+3).toFixed(1),"text-anchor":"middle","font-size":"8","class":"gk-g fd"});tx.textContent="R"}
    });
    function bul(ad){for(var i=0;i<gs.length;i++)if(gs[i].ad===ad)return gs[i]}
    var gu=bul("Güneş"),ay=bul("Ay"),L=$("#gkL"),rows=[];
    function trh(iso){var t=new Date(iso);if(isNaN(t))return"";var p=new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",timeZone:"Europe/Istanbul"}).format(t);return p}
    if(d.tarih){var tp=d.tarih.split("-");rows.push(["Tarih",(+tp[2])+" "+AYLAR[+tp[1]-1]+" "+tp[0]+" · 12:00 TSİ"])}
    if(gu)rows.push(["Güneş",gu.burc+" "+gu.derece]);
    if(ay)rows.push(["Ay",ay.burc+" "+ay.derece]);
    var rt=gs.filter(function(g){return g.retro}).map(function(g){return g.ad});
    rows.push(["Geri giden gezegenler",rt.length?rt.join(", "):"Yok"]);
    var now=Date.now(),sn=null;gs.forEach(function(g){if(g.sonrakiBurc&&g.sonrakiBurc.zaman&&g.ad!=="Ay"){var t=Date.parse(g.sonrakiBurc.zaman);if(t>now&&(!sn||t<sn.t))sn={t:t,g:g}}});
    if(sn)rows.push(["Sıradaki burç değişimi",sn.g.ad+" "+sn.g.sonrakiBurc.burc+" burcuna, "+trh(sn.g.sonrakiBurc.zaman)]);
    L.innerHTML=rows.map(function(r){return"<li><span>"+esc(r[0])+"</span><span>"+esc(r[1])+"</span></li>"}).join("");L.hidden=false;
    if(d.ay&&d.ay.evre){$("#gkEvre").textContent=d.ay.evre;$("#gkAy").innerHTML="Ay · "+esc(d.ay.burc)+(typeof d.ay.aydinlanmaYuzde==="number"?"<br>%"+d.ay.aydinlanmaYuzde+" aydınlık":"")}
  }).catch(function(){});
},"500px 0px");

/* ---- sayılar ---- */
(function(){var nm=$(".nm");if(!nm||RM||!("IntersectionObserver" in W))return;var o=new IntersectionObserver(function(e){if(!e[0].isIntersecting)return;o.disconnect();$$("b[data-n]",nm).forEach(function(b){var n=+b.getAttribute("data-n"),t0=0;function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1300);b.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)})},{threshold:.4});o.observe(nm)})();

/* ---- küçük araç: güneş burcu ve yaşam yolu sayısı ---- */
(function(){
  var F=$("#mtF");if(!F)return;var G=$("#mtG"),A=$("#mtA"),Y=$("#mtY"),R=$("#mtR"),E=$("#mtE");
  function op(s,v,t){var o=D.createElement("option");o.value=v;o.textContent=t;s.appendChild(o)}
  op(G,"","Gün");for(var i=1;i<=31;i++)op(G,i,i);
  op(A,"","Ay");AYLAR.forEach(function(a,i){op(A,i+1,a)});
  op(Y,"","Yıl");for(var y=new Date().getFullYear();y>=1925;y--)op(Y,y,y);
  var SIN=[[1,20,10],[2,19,11],[3,21,0],[4,20,1],[5,21,2],[6,21,3],[7,23,4],[8,23,5],[9,23,6],[10,23,7],[11,22,8],[12,22,9]];
  var EL=["Ateş","Toprak","Hava","Su"],NT=["Öncü","Sabit","Değişken"];
  var TRH=["21 Mart – 19 Nisan","20 Nisan – 20 Mayıs","21 Mayıs – 20 Haziran","21 Haziran – 22 Temmuz","23 Temmuz – 22 Ağustos","23 Ağustos – 22 Eylül","23 Eylül – 22 Ekim","23 Ekim – 21 Kasım","22 Kasım – 21 Aralık","22 Aralık – 19 Ocak","20 Ocak – 18 Şubat","19 Şubat – 20 Mart"];
  var TEMA={1:"Öncü",2:"Uyumcu",3:"Yaratıcı",4:"Kurucu",5:"Özgür Ruh",6:"Şefkatli",7:"Arayışçı",8:"İnşa Eden Güç",9:"İnsancıl",11:"Usta Sezgi",22:"Usta Kurucu",33:"Usta Öğretmen"};
  function indir(n){while(n>9&&n!==11&&n!==22&&n!==33){n=String(n).split("").reduce(function(a,d){return a+(+d||0)},0)}return n}
  F.addEventListener("submit",function(ev){
    ev.preventDefault();E.textContent="";var g=+G.value,a=+A.value,y=+Y.value;
    if(!g||!a||!y){E.textContent="Gün, ay ve yılı seç.";R.hidden=true;return}
    var dt=new Date(y,a-1,g);if(dt.getMonth()!==a-1||dt.getDate()!==g){E.textContent="Bu tarih takvimde yok. Günü kontrol et.";R.hidden=true;return}
    var s=SIN[a-1],bi=g>=s[1]?s[2]:(s[2]+11)%12,sinir=Math.abs(g-s[1])<=1||g===s[1]-2;
    var yy=indir(indir(g)+indir(a)+indir(y)),usta=yy>9;
    R.innerHTML='<a class="mt-k" href="'+SLUG[bi]+'-burcu.html"><small>Güneş burcun</small><b><svg aria-hidden="true"><use href="#g-'+SLUG[bi]+'"/></svg>'+BURC[bi]+"</b><span>"+EL[bi%4]+" · "+NT[bi%3]+" · "+TRH[bi]+'</span></a><a class="mt-k" href="yasam-yolu.html"><small>Yaşam yolu sayın</small><b>'+yy+"</b><span>"+TEMA[yy]+(usta?" · usta sayı":"")+"</span></a>"+(sinir?'<p class="mt-n">Burç değişim günlerine yakın doğdun. Güneş\'in burç değiştirdiği saat yıldan yıla oynar; kesin burcunu doğum haritanda görürsün.</p>':"")+'<div class="mt-c"><p>Yükselen burcun ve Ay burcun için doğum saatin ve doğduğun yer de gerekir.</p><a class="btn b2" href="dogum-haritasi-hesaplama.html">Tüm haritanı ücretsiz çıkar <svg aria-hidden="true"><use href="#ok"/></svg></a></div>';
    R.hidden=false;if(W.gtag)gtag("event","anasayfa_mini_arac");
  });
})();


/* ---- kapanış filmi: yaklaşınca yüklenir ---- */
(function(){var v=$("#kpV");if(!v||RM)return;if(navigator.connection&&navigator.connection.saveData)return;onNear(v,function(){v.src=v.getAttribute("data-src");v.addEventListener("playing",function(){v.classList.add("on")},{once:true});var p=v.play();if(p&&p.catch)p.catch(function(){});if("IntersectionObserver" in W){new IntersectionObserver(function(e){if(e[0].isIntersecting){var q=v.play();if(q&&q.catch)q.catch(function(){})}else v.pause()}).observe(v)}},"300px 0px")})();
})();
