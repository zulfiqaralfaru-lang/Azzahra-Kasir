/* Azzahra - efek tampilan.
   Hanya menambah gerak di atas aplikasi (menu bergeser, angka naik, riak di tombol, sorotan kursor).
   Tidak menyentuh data atau logika kasir. Hapus baris <script src="ui.js"> di index.html untuk mematikan semuanya. */
(function(){
"use strict";
const doc=document,body=doc.body;
const mq=q=>window.matchMedia?window.matchMedia(q).matches:false;
const RM=mq("(prefers-reduced-motion: reduce)");
const FINE=mq("(hover: hover) and (pointer: fine)");
const $=(s,r)=>(r||doc).querySelector(s);
const $$=(s,r)=>Array.from((r||doc).querySelectorAll(s));
const side=$("#side"),main=$("#main"),title=$("#title");
if(!side||!main||!title)return;

/* ---------- 1. penanda emas yang meluncur antar menu sidebar ---------- */
let lastY=null,lastH=null,rt=null;
function placePill(animate){
  const act=$('.s-link[aria-current="page"]',side);
  if(!act||!act.offsetHeight){body.classList.remove("has-pill");return}
  const y=act.offsetTop,h=act.offsetHeight;
  let p=$(".pill-bg",side);
  if(!p){
    p=doc.createElement("i");p.className="pill-bg";p.setAttribute("aria-hidden","true");
    const fy=animate&&lastY!==null&&!RM?lastY:y,fh=animate&&lastH!==null&&!RM?lastH:h;
    p.style.height=fh+"px";p.style.transform="translateY("+fy+"px)";
    side.insertBefore(p,side.firstChild);
    if(!body.classList.contains("has-pill"))body.classList.add("has-pill");
    void p.offsetWidth;
  }
  p.style.height=h+"px";p.style.transform="translateY("+y+"px)";
  lastY=y;lastH=h;
}
function relayout(){
  const p=$(".pill-bg",side),act=$('.s-link[aria-current="page"]',side);
  if(!p||!act||!act.offsetHeight)return;
  if(act.offsetTop===lastY&&act.offsetHeight===lastH)return;
  p.style.transition="none";
  p.style.height=act.offsetHeight+"px";p.style.transform="translateY("+act.offsetTop+"px)";
  lastY=act.offsetTop;lastH=act.offsetHeight;
  void p.offsetWidth;p.style.transition="";
}
const sideObs=new MutationObserver(()=>{
  sideObs.disconnect();
  try{placePill(true)}finally{sideObs.observe(side,{childList:true})}
});
sideObs.observe(side,{childList:true});
new MutationObserver(()=>{clearTimeout(rt);rt=setTimeout(relayout,80);setTimeout(relayout,480)}).observe(body,{attributes:true,attributeFilter:["class"]});
window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(relayout,120)});

/* ---------- 2. isi halaman masuk berurutan setiap pindah menu ---------- */
let enterT=null,lastTot=null;
const ENTER_SEL=".stack>*:not(.stack):not(.sale):not(.cols):not(.cards),.sale>*,.cols>*:not(.stack),.cards>.card";
function entrance(){
  if(RM)return;
  const els=$$(ENTER_SEL,main).filter(el=>!el.parentElement.closest(".panel,.obc"));
  els.forEach((el,i)=>{el.classList.add("rv");el.style.setProperty("--i",i)});
  main.classList.remove("enter");void main.offsetWidth;main.classList.add("enter");
  clearTimeout(enterT);
  enterT=setTimeout(()=>{main.classList.remove("enter");els.forEach(el=>{el.classList.remove("rv");el.style.removeProperty("--i")})},1700);
}
new MutationObserver(()=>{lastTot=null;entrance()}).observe(title,{childList:true,characterData:true,subtree:true});

/* ---------- 3. kartu ringkasan: ikon, jenis kartu, angka yang naik ---------- */
const NF=new Intl.NumberFormat("id-ID");
const IC={
  trx:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  item:'<path d="M6 8h12l1 12H5z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  omzet:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8v8M9.5 8.5h3a2 2 0 0 1 0 4h-3M12.2 12.5 15 16"/>',
  laba:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  kas:'<path d="M4 7a2 2 0 0 1 2-2h12v3"/><path d="M4 7v10a2 2 0 0 0 2 2h14V8H6a2 2 0 0 1-2-1z"/><circle cx="16.5" cy="13.5" r="1.1"/>',
  kasin:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
  kasout:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 20h14"/>',
  open:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  change:'<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M20 4v4h-4M4 20v-4h4"/>',
  dot:'<circle cx="12" cy="12" r="3"/>'
};
function kindOf(t){
  t=t.toLowerCase();
  if(/omzet/.test(t))return"omzet";
  if(/laba/.test(t))return"laba";
  if(/kas masuk/.test(t))return"kasin";
  if(/kas keluar/.test(t))return"kasout";
  if(/kas/.test(t))return"kas";
  if(/open bill|belum dibayar/.test(t))return"open";
  if(/kembalian/.test(t))return"change";
  if(/item/.test(t))return"item";
  if(/transaksi/.test(t))return"trx";
  return"dot";
}
function countUp(b){
  if(RM)return;
  const txt=b.textContent.trim(),m=/^(Rp\s)?(-?)([\d.]+)$/.exec(txt);
  if(!m)return;
  const to=parseInt(m[3].replace(/\./g,""),10);
  if(!isFinite(to)||to<=0)return;
  const pre=(m[1]||"")+m[2],dur=Math.min(1300,500+Math.log10(to+1)*130);
  let t0=null;
  const step=t=>{
    if(t0===null)t0=t;
    const p=Math.min(1,(t-t0)/dur);
    b.textContent=p>=1?txt:pre+NF.format(Math.round(to*(1-Math.pow(2,-10*p))));
    if(p<1)requestAnimationFrame(step);
  };
  b.textContent=pre+"0";
  requestAnimationFrame(step);
}
function decorate(){
  $$(".cards .card:not([data-kind])",main).forEach(c=>{
    const s=c.querySelector("span"),k=kindOf(s?s.textContent:"");
    c.setAttribute("data-kind",k);
    const i=doc.createElement("i");i.className="ci";i.setAttribute("aria-hidden","true");
    i.innerHTML='<svg viewBox="0 0 24 24">'+IC[k]+"</svg>";
    c.insertBefore(i,c.firstChild);
    const b=c.querySelector("b");if(b)countUp(b);
  });
}

/* ---------- 4. total yang berdenyut saat berubah, baris baru yang masuk dari kiri ---------- */
function watch(){
  decorate();
  const b=$("#tot .gt b",main);
  if(!b)lastTot=null;
  else{
    const v=b.textContent;
    if(lastTot!==null&&v!==lastTot&&!RM)b.classList.add("bump");
    lastTot=v;
  }
  const box=$("#lines",main);
  if(box){
    const rows=box.querySelectorAll(".ln"),n=rows.length;
    if(box._n===undefined)box._n=n;
    else{if(n>box._n&&!RM)rows[n-1].classList.add("pop");box._n=n}
  }
}
new MutationObserver(watch).observe(main,{childList:true,subtree:true});

/* ---------- 5. riak di tombol dan sorotan yang mengikuti kursor ---------- */
const RIPPLE=".btn,.qk,.s-link,.seg button,.stp button,.pad button,.burger,.x";
doc.addEventListener("pointerdown",e=>{
  if(RM||(e.button!==undefined&&e.button>0))return;
  const t=e.target.closest&&e.target.closest(RIPPLE);
  if(!t||t.disabled)return;
  const r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2;
  const s=doc.createElement("span");s.className="rip";s.setAttribute("aria-hidden","true");
  s.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
  t.appendChild(s);
  s.addEventListener("animationend",()=>s.remove());
  setTimeout(()=>s.remove(),1000);
},{passive:true});

if(FINE&&!RM){
  let raf=0,px=0,py=0,pt=null;
  doc.addEventListener("pointermove",e=>{
    const t=e.target.closest&&e.target.closest(".card,.qk,.obc");
    if(!t)return;
    px=e.clientX;py=e.clientY;pt=t;
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      const r=pt.getBoundingClientRect();
      pt.style.setProperty("--mx",(px-r.left)+"px");pt.style.setProperty("--my",(py-r.top)+"px");
    });
  },{passive:true});
}

/* kondisi awal: kalau sidebar atau isi halaman sudah ada sebelum skrip ini jalan */
if(side.firstChild)placePill(false);
decorate();
})();
