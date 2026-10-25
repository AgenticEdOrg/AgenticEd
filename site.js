/* AgenticEd — shared interactions: sticky nav state, mobile menu, scroll reveals,
   cursor spotlight on cards, and count-up numbers. No dependencies. */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: shadow once scrolled, mobile toggle */
  var nav=document.querySelector('.nav');
  if(nav){
    var onScroll=function(){nav.classList.toggle('nav--scrolled',window.scrollY>8);};
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    var toggle=nav.querySelector('.nav__toggle');
    if(toggle){
      toggle.addEventListener('click',function(){
        var open=nav.classList.toggle('nav--open');
        toggle.setAttribute('aria-expanded',open?'true':'false');
      });
      nav.querySelectorAll('.nav__links a').forEach(function(a){
        a.addEventListener('click',function(){nav.classList.remove('nav--open');toggle.setAttribute('aria-expanded','false');});
      });
    }
  }

  /* Reveal elements as they enter the viewport */
  var revealEls=document.querySelectorAll('.reveal,.reveal-left');
  if(reduce||!('IntersectionObserver' in window)){
    revealEls.forEach(function(el){el.classList.add('reveal--in');});
  } else {
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('reveal--in');io.unobserve(e.target);}
      });
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el){io.observe(el);});
  }

  /* Stagger children marked with data-stagger */
  document.querySelectorAll('[data-stagger]').forEach(function(group){
    var step=parseFloat(group.getAttribute('data-stagger'))||.08;
    Array.prototype.forEach.call(group.children,function(child,i){child.style.setProperty('--d',(i*step)+'s');});
  });

  /* Cursor-following spotlight on .spot cards */
  if(!reduce){
    document.addEventListener('pointermove',function(e){
      var card=e.target.closest&&e.target.closest('.spot');
      if(!card) return;
      var r=card.getBoundingClientRect();
      card.style.setProperty('--mx',(e.clientX-r.left)+'px');
      card.style.setProperty('--my',(e.clientY-r.top)+'px');
    },{passive:true});
  }

  /* Count-up for [data-count] once visible; call window.agenticedCount(el, value) to set later */
  function countUp(el,target){
    if(reduce||!isFinite(target)){el.textContent=new Intl.NumberFormat().format(target);return;}
    var start=null,dur=1400;
    function tick(t){
      if(!start) start=t;
      var p=Math.min((t-start)/dur,1),eased=1-Math.pow(1-p,3);
      el.textContent=new Intl.NumberFormat().format(Math.round(target*eased));
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  window.agenticedCount=countUp;
  var counters=document.querySelectorAll('[data-count]');
  if(counters.length&&'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){countUp(e.target,parseFloat(e.target.getAttribute('data-count')));co.unobserve(e.target);}
      });
    },{threshold:.4});
    counters.forEach(function(el){co.observe(el);});
  }
})();
