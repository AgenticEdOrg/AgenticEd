/* AgenticEd — shared lesson behaviour: table-of-contents scrollspy, autosave of answers,
   copy buttons, progress card placement, and the portfolio activity summary.
   Autosave keys match the original pages ("agenticed:autosave:<page>:<id>") so saved work carries over. */
(function(){
  var page=(location.pathname.split("/").pop()||"index");
  var NS="agenticed:autosave:"+page+":";

  /* Autosave every field that has an id (answers, lab checklists) to this browser only */
  document.querySelectorAll(".content input[id],.content textarea[id],.content select[id]").forEach(function(el){
    var k=NS+el.id;
    try{
      var v=localStorage.getItem(k);
      if(v!==null){ if(el.type==="checkbox"||el.type==="radio") el.checked=(v==="1"); else el.value=v; }
    }catch(e){}
    var save=function(){
      try{ localStorage.setItem(k,(el.type==="checkbox"||el.type==="radio")?(el.checked?"1":"0"):el.value); }catch(e){}
    };
    el.addEventListener("input",save);
    el.addEventListener("change",save);
  });

  /* Table of contents with scrollspy */
  var toc=document.getElementById("toc-links");
  var secs=Array.prototype.slice.call(document.querySelectorAll(".content>section[id][data-toc]"));
  if(toc&&secs.length){
    toc.innerHTML=secs.map(function(s){return '<a href="#'+s.id+'">'+s.getAttribute("data-toc")+'</a>';}).join("");
    var links=toc.querySelectorAll("a");
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id);});
          }
        });
      },{rootMargin:"-30% 0px -60% 0px"});
      secs.forEach(function(s){io.observe(s);});
    }
  }

  /* Copy buttons on prompt blocks */
  document.querySelectorAll(".prompt").forEach(function(box){
    var b=document.createElement("button");
    b.type="button"; b.className="prompt__copy"; b.textContent="Copy";
    b.addEventListener("click",function(){
      var text=box.getAttribute("data-text")||box.innerText.replace(/Copy$|Copied$/,"").trim();
      (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){
        b.textContent="Copied"; setTimeout(function(){b.textContent="Copy";},1600);
      }).catch(function(){ b.textContent="Select and copy"; });
    });
    box.appendChild(b);
  });

  /* Move the progress card (created by progress.js) into the lesson */
  document.addEventListener("DOMContentLoaded",function(){
    setTimeout(function(){
      var card=document.querySelector(".agenticed-progress-card"),slot=document.getElementById("progress-slot");
      if(card&&slot) slot.appendChild(card);
    },0);
  });

  /* Portfolio activity: validate required fields and show a safe summary.
     Each .activity has data-required="id1,id2" and fields with data-label. */
  window.agenticedActivity=function(formId){
    var form=document.getElementById(formId); if(!form) return;
    var req=(form.getAttribute("data-required")||"").split(",").filter(Boolean);
    var missing=req.filter(function(id){var el=document.getElementById(id);return !el||!String(el.value).trim();});
    var out=form.querySelector(".result");
    if(missing.length){
      var names=missing.map(function(id){var el=document.getElementById(id);return el&&el.getAttribute("data-label")||id;});
      out.className="result show"; out.style.background="#FFF7ED"; out.style.borderColor="#FED7AA";
      out.textContent="Complete these first: "+names.join(", ")+".";
      return;
    }
    out.removeAttribute("style"); out.className="result show"; out.innerHTML="";
    var h=document.createElement("h4"); h.textContent=form.getAttribute("data-done")||"Saved. Nice work."; out.appendChild(h);
    var dl=document.createElement("dl");
    form.querySelectorAll("[data-label]").forEach(function(el){
      var v=String(el.value||"").trim(); if(!v) return;
      var dt=document.createElement("dt"); dt.textContent=el.getAttribute("data-label");
      var dd=document.createElement("dd"); dd.textContent=v;
      dl.appendChild(dt); dl.appendChild(dd);
    });
    out.appendChild(dl);
    var p=document.createElement("p");
    p.innerHTML='Your answers are saved in this browser. Add this as evidence in your <a href="portfolio.html">portfolio</a>, then take the <a href="quiz.html?week='+form.getAttribute("data-week")+'">Week '+form.getAttribute("data-week")+' quiz</a>.';
    out.appendChild(p);
    out.scrollIntoView({behavior:"smooth",block:"nearest"});
  };
  window.agenticedClear=function(formId){
    var form=document.getElementById(formId); if(!form) return;
    form.querySelectorAll("input[id],textarea[id],select[id]").forEach(function(el){
      el.value=""; try{localStorage.removeItem(NS+el.id);}catch(e){}
    });
    var out=form.querySelector(".result"); if(out) out.className="result";
  };
})();
