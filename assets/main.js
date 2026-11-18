/* Silnik dem Impulseo - zachowanie strony. Bez danych klienta: adres e-mail formularza czyta z atrybutu data-to. */
(function(){
  var d=document.documentElement;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* płynne przewijanie */
  var lenis=null;
  if(!reduce&&window.Lenis){
    lenis=new Lenis({lerp:.1,smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);
  }

  /* menu */
  var burger=document.querySelector('.burger'),menu=document.getElementById('menu');
  function setMenu(open){
    d.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');
    menu.setAttribute('aria-hidden',open?'false':'true');
    if(lenis){open?lenis.stop():lenis.start()}
  }
  if(burger&&menu){
    burger.addEventListener('click',function(){setMenu(!d.classList.contains('menu-open'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.classList.contains('menu-open')){setMenu(false);burger.focus()}});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  }

  var pill=document.querySelector('.pill');

  /* tekst odsłaniany słowo po słowie (twarde spacje zostają) */
  var rt=document.querySelector('.reveal-text'),words=[];
  if(rt){
    var parts=rt.textContent.trim().split(/[ \t\n\r]+/);
    rt.setAttribute('aria-label',rt.textContent.trim());
    rt.innerHTML=parts.map(function(w){return '<span class="w" aria-hidden="true">'+w+'</span>'}).join(' ');
    words=[].slice.call(rt.querySelectorAll('.w'));
  }
  var rsec=document.querySelector('.reveal-sec');
  var cards=[].slice.call(document.querySelectorAll('.card-wrap'));
  var heroImg=document.querySelector('.hero-img');

  function prog(el){
    var r=el.getBoundingClientRect(),h=window.innerHeight;
    var total=r.height-h; if(total<=0)return r.top<h*.5?1:0;
    return Math.min(1,Math.max(0,-r.top/total));
  }
  function tick(){
    var y=window.scrollY;
    if(pill)pill.classList.toggle('solid',y>window.innerHeight*.6);
    if(reduce)return;
    if(heroImg&&y<window.innerHeight*1.2)heroImg.style.transform='translate3d(0,'+(y*.18)+'px,0)';
    if(rsec&&words.length){
      var p=prog(rsec)*1.15,n=Math.round(p*words.length);
      for(var i=0;i<words.length;i++)words[i].classList.toggle('on',i<n);
    }
    cards.forEach(function(w){
      var r=w.getBoundingClientRect(),h=window.innerHeight;
      var p=Math.min(1,Math.max(0,(h-r.top)/(h*1.05)));
      w.querySelector('.card').style.setProperty('--p',(p*p*(3-2*p)).toFixed(3));
    });
  }
  var ticking=false;
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(function(){ticking=false;tick()})}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  tick();

  /* wejścia sekcji i aktywne wiersze listy */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('.up').forEach(function(el){io.observe(el)});
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('on',e.isIntersecting)})},{rootMargin:'-38% 0px -38% 0px'});
    document.querySelectorAll('.svc-row').forEach(function(el){ro.observe(el)});
  }else{
    document.querySelectorAll('.up').forEach(function(el){el.classList.add('in')});
    document.querySelectorAll('.svc-row').forEach(function(el){el.classList.add('on')});
  }

  /* opinie: przełączanie strzałkami (gdy są) */
  var qs=[].slice.call(document.querySelectorAll('.quote')),qi=0;
  function showQ(i){qi=(i+qs.length)%qs.length;qs.forEach(function(q,k){q.classList.toggle('on',k===qi)})}
  if(qs.length){
    showQ(0);
    var prev=document.querySelector('.arrow-prev'),next=document.querySelector('.arrow-next');
    if(prev)prev.addEventListener('click',function(){showQ(qi-1)});
    if(next)next.addEventListener('click',function(){showQ(qi+1)});
  }

  /* galeria: powiększenie zdjęcia */
  var lb=document.querySelector('.lb');
  if(lb){
    var lbImg=lb.querySelector('img'),lbCap=lb.querySelector('p'),lbClose=lb.querySelector('button'),last=null;
    document.querySelectorAll('.gal button').forEach(function(b){
      b.addEventListener('click',function(){
        var im=b.querySelector('img');last=b;
        lbImg.src=im.currentSrc||im.src;lbImg.alt=im.alt;lbCap.textContent=im.alt;
        lb.classList.add('on');lb.setAttribute('aria-hidden','false');lbClose.focus();
        if(lenis)lenis.stop();
      });
    });
    function closeLb(){lb.classList.remove('on');lb.setAttribute('aria-hidden','true');if(lenis)lenis.start();if(last)last.focus()}
    lbClose.addEventListener('click',closeLb);
    lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('on'))closeLb()});
  }

  /* formularz: otwiera e-mail z wypełnioną treścią; adres z data-to */
  var form=document.querySelector('.form[data-to]');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var lines=[];
      [].slice.call(form.querySelectorAll('input,textarea')).forEach(function(f){
        if(f.value)lines.push((f.getAttribute('data-label')||f.name)+': '+f.value);
      });
      location.href='mailto:'+form.getAttribute('data-to')+'?subject='+encodeURIComponent('Zapytanie ze strony')+'&body='+encodeURIComponent(lines.join('\n'));
    });
  }
})();
