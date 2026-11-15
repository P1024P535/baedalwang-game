// Visual regression checks against disposable local saves; never connects to Firebase.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'out/layout');
fs.mkdirSync(out, {recursive:true});
const sizes = [[320,568],[360,640],[375,667],[393,786],[412,824],[520,900],[768,1024],[640,360],[320,510],[393,720]];
const screens = ['main','jobs','veh','comp','region','fame','mis','shop','set','rank','dex','ach','st','rk','modal','card-SR','card-SSR','gate'];
const adapter = path.join(root, 'android/app/src/main/res/raw/layout_bridge.js');
const styles = path.join(root, 'android/app/src/main/res/raw/layout.css');
const results = [];
(async()=>{
 const browser = await chromium.launch({headless:true});
 for(const fixed of fs.existsSync(adapter)?[false,true]:[false]) {
  for(const [width,height] of sizes) {
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.addInitScript(()=>localStorage.setItem('baedal_king_v1',JSON.stringify({ver:2,lang:'ko',snd:false,bgm:false})));
   await page.goto(pathToFileURL(path.join(root,fixed?'android/app/src/main/assets/index.html':'index.html')).href);
   await page.waitForFunction(()=>typeof openSheet==='function'&&typeof S==='object');
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Object.values(AS).map(i=>i.decode().catch(()=>{})));});
   // Let boot finish before replacing onboarding with a deterministic, private test fixture.
   await page.waitForTimeout(2200);
   await page.evaluate(()=>{
    document.querySelectorAll('#boot,#gate,#splash').forEach(e=>e.remove());
    S.snd=false;S.bgm=false;S.acct={type:'google',id:'layout-test-uid-123456789012345678',email:'long-layout-test-address@example.invalid'};
    S.money=1.234567e60;S.total=S.money;S.fame=1234567890;S.lv=12345;S.taps=100;
    S.comps.forEach(c=>{c.own=true;c.n=12345;c.pow=123456;});S.jobs[0]=1000;S.veh=5;
    closeModal();closeSheet();hud();
   });
   if(fixed){await page.addStyleTag({content:fs.readFileSync(styles,'utf8')});await page.addScriptTag({content:fs.readFileSync(adapter,'utf8')});}
   for(const screen of screens){
    await page.evaluate(screen=>{
     closeModal();closeSheet();document.getElementById('gate')?.remove();
     if(screen.startsWith('card-'))showModal(cardFlip(screen.slice(5),screen==='card-SR'?'st_1':'st_0'),screen.slice(5)+' 직원 등장!','<span class="hl">윤총알</span>배달 대행사 직원 파워 x5<div class="trnew"><b>보스 담당</b> 보스 손님 시간 +1초</div>',[['환영해요!','y',closeModal]]);
     else if(screen==='modal')showModal('<img src="assets/logo2.png" alt="">','자는 동안 배달했어요','긴 안내 문구와 보상 확인<span class="hl">1.23e+100원</span>'+('<br>오프라인 배달 보상 안내').repeat(12),[['확인','y',closeModal],['광고 보고 2배','b',closeModal]]);
     else if(screen==='gate')gate('<h2>언어 선택 · Language</h2><div class="gt-langs">'+LANGS.map(([k,n])=>'<button class="gb">'+n+'</button>').join('')+'</div><p class="gt-p">'+('작은 화면에서도 안내를 읽고 계속할 수 있어야 합니다. ').repeat(12)+'</p><button class="gb wide">계속하기</button>');
     else if(['dex','ach','st','rk'].includes(screen)){colTab=screen;if(screen==='rk'){RK.list=[];RK.ready=false;}openSheet('col');}
     else if(screen!=='main')openSheet(screen);
    },screen);
    await page.waitForTimeout(screen.startsWith('card-')?1500:350);
    const data=await page.evaluate(()=>{
     const sheet=document.getElementById('sheet');const active=sheet.classList.contains('on');
     const scope=active?sheet:document.querySelector('#modal.show')||document.querySelector('#gate.on')||document.getElementById('top');
     const issues=[];const label=e=>e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+String(e.className).trim().replaceAll(' ','.');
     if(!active && scope.id==='top')for(const id of ['money','ips','fame','lvNum']){const e=document.getElementById(id),s=getComputedStyle(e);if(e.getBoundingClientRect().height>parseFloat(s.fontSize)*1.65)issues.push({type:'hud-line-wrap',el:'#'+id});}
     for(const e of scope.querySelectorAll('.ci,.cn,.cd,.gb,.stat div,.stat b,#shTitle,#money,#ips,#fame,.hn2,.rm .n,#shBody,#shSub,.rks,.gt-box,#mbox,.mp,.mt')){
      const s=getComputedStyle(e);if(!e.getClientRects().length||s.display==='none')continue;
      if(e.scrollWidth>e.clientWidth+2&&s.textOverflow!=='ellipsis')issues.push({type:'text-overflow',el:label(e),text:e.textContent.slice(0,90),extra:e.scrollWidth-e.clientWidth});
     }
     for(const img of scope.querySelectorAll('img')){
      const r=img.getBoundingClientRect(),s=getComputedStyle(img);if(!r.width||!r.height)continue;
      if(!img.complete||!img.naturalWidth)issues.push({type:'missing-image',el:label(img),src:img.getAttribute('src')?.slice(0,60)});
      else if(s.objectFit==='fill'&&Math.abs(Math.log((r.width/r.height)/(img.naturalWidth/img.naturalHeight)))>.05)issues.push({type:'image-stretch',src:img.getAttribute('src')?.slice(0,60)});
      if(img.parentElement.classList.contains('thumb')){const p=img.parentElement.getBoundingClientRect();if(r.width>p.width+2||r.height>p.height+2)issues.push({type:'image-crop',src:img.getAttribute('src')?.slice(0,60)});}
     }
     const flip=scope.querySelector('.cflip');
     if(flip){
      const box=flip.getBoundingClientRect(),frame=flip.querySelector('.cf-fr').getBoundingClientRect(),portrait=flip.querySelector('.cf-st').getBoundingClientRect();
      if(Math.abs(frame.height-box.height)>2||Math.abs(frame.width-box.width)>2)issues.push({type:'staff-card-frame-size',frameHeight:frame.height,cardHeight:box.height});
      if(portrait.bottom>frame.bottom+1||portrait.top<frame.top-1)issues.push({type:'staff-card-portrait-outside'});
     }
     const popup=document.querySelector('#modal.show #mbox,#gate.on .gt-box');
     if(popup){const r=popup.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+1)issues.push({type:'unreachable-popup',top:r.top,bottom:r.bottom});}
     if(active){const body=document.getElementById('shBody');if(body.clientHeight<40)issues.push({type:'sheet-too-short',height:body.clientHeight});}
     return {issues};
    });
    results.push({fixed,width,height,screen,...data,errors:[...errors]});
    if((width===320&&['main','jobs','veh','set','modal','card-SR','card-SSR'].includes(screen))||(width===640&&screen==='gate')||(width===393&&screen==='shop')){
     if(screen==='set')await page.evaluate(()=>document.querySelector('#shBody [data-act="signout"]')?.closest('.card').scrollIntoView({block:'center'}));
     await page.screenshot({path:path.join(out,`${fixed?'after':'before'}-${width}-${screen}.png`)});
    }
    if(fixed&&(screen==='modal'||screen.startsWith('card-'))){
     await page.evaluate(()=>document.querySelector('#mbox .mbs button:last-child')?.scrollIntoView({block:'end'}));
     const reachable=await page.evaluate(()=>{const r=document.querySelector('#mbox .mbs button:last-child').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});
     if(!reachable)results.at(-1).issues.push({type:'unreachable-popup-action'});
    }
   }
   if(width===320){
    const fallback=await page.evaluate(()=>{const image=AS.co_1;try{AS.co_1=new Image();return coImg(0).includes('<svg')?[]:[{type:'missing-image-fallback'}];}catch(e){return [{type:'recursive-image-fallback',message:e.message}];}finally{AS.co_1=image;}});
    results.push({fixed,width,height,screen:'company-image-loading',issues:fallback,errors:[]});
   }
   // Language changes re-render the same original views; adapters must fit translated copy too.
   for(const language of ['en','ja','zh','es','pt']){
    await page.evaluate(language=>{document.getElementById('gate')?.remove();LANG=language;S.lang=language;applyLang();closeModal();closeSheet();openSheet('set');},language);
    await page.waitForTimeout(400);
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('#shBody .ci,#shBody .gb,#shSub')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,80)));
    results.push({fixed,width,height,screen:'set-'+language,issues:overflow.map(text=>({type:'translation-overflow',text})),errors:[...errors]});
   }
   await context.close();
  }
 }
 await browser.close();fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(results,null,2));
 const summary={};for(const x of results){const k=x.fixed?'after':'before';summary[k]??={screens:0,issues:0,types:{},errors:[]};summary[k].screens++;summary[k].issues+=x.issues.length;for(const i of x.issues)summary[k].types[i.type]=(summary[k].types[i.type]||0)+1;summary[k].errors=[...new Set([...summary[k].errors,...x.errors])];}
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
 if(summary.after&&(summary.after.issues||summary.after.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
