const {chromium}=require('playwright');
const URL=process.env.SMOKE_URL||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true});
  const errors=[];
  page.on('pageerror',e=>errors.push('PAGE: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text())});
  const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
  if(response?.status()!==200)throw Error('HTTP '+response?.status());
  await page.waitForFunction(()=>window.__nexoBootReady===true,null,{timeout:55000});
  await page.locator('#startBtn').click({timeout:10000});
  const btn=page.locator('#gfxButton');
  if(!await btn.isVisible())throw Error('Graphics shortcut not visible');
  await btn.click({timeout:10000});
  if(!await page.locator('#panel h2').textContent().then(x=>x.includes('GRAPHICS')))throw Error('Graphics menu missing');
  // The CI runner uses a software renderer; full Ultra/Ultra+ stress is opt-in.
  const modes=process.env.GRAPHICS_STRESS==='1'?['low','balanced','high','ultra','ultraPlus','balanced']:['low','balanced','high'];
  for(const mode of modes){
   const option=page.locator('[data-quality="'+mode+'"]');
   if(await option.count()!==1)throw Error('Quality profile missing: '+mode);
   if(!await option.isDisabled())await option.evaluate(el=>el.click(),{timeout:120000});
   await page.waitForFunction(expected=>JSON.parse(localStorage.getItem('nexo-life-rp-alpha2')||'{}').quality===expected,mode,{timeout:60000});
   await page.waitForTimeout(mode==='ultraPlus'?2000:700);
   const state=await page.evaluate(()=>({
     saved:JSON.parse(localStorage.getItem('nexo-life-rp-alpha2')||'{}').quality,
     ui:document.querySelector('#gfxValue')?.textContent,
     fps:document.querySelector('#qualityFps')?.textContent,
     canvas:!!document.querySelector('#world')?.width
   }));
   if(state.saved!==mode||!state.canvas||!state.ui)throw Error('Profile not applied: '+mode+' '+JSON.stringify(state));
   if(errors.length)throw Error('Errors after '+mode+': '+errors.join('; '));
   console.log('PASS QUALITY',mode,JSON.stringify(state));
  }
  await page.locator('#day').evaluate(el=>el.click()); // dawn
  await page.locator('#day').click(); // day
  await page.locator('#day').click(); // sunset
  if(!await page.locator('#day').textContent().then(x=>x.includes('ZACHÓD')))throw Error('Sunset mode missing');
  await page.locator('#day').click(); // night
  if(!await page.locator('#day').textContent().then(x=>x.includes('NOC')))throw Error('Night mode missing');
  await page.locator('#day').click(); // dawn
  await page.locator('[data-quality="low"]').evaluate(el=>el.click());
  console.log('PASS: four time-of-day modes and low-profile fallback');
  await page.locator('[data-page="weather"]').evaluate(el=>el.click());
  await page.locator('[data-weather="rain"]').evaluate(el=>el.click());
  await page.waitForTimeout(500);
  await page.locator('[data-weather="fog"]').evaluate(el=>el.click());
  await page.waitForTimeout(500);
  if(errors.length)throw Error(errors.join('\n'));
  await page.close();
  const mobile=await browser.newPage({viewport:{width:420,height:903},hasTouch:true,isMobile:true,ignoreHTTPSErrors:true});
  const mobileErrors=[];
  mobile.on('pageerror',e=>mobileErrors.push(e.message));
  await mobile.goto(URL,{waitUntil:'domcontentloaded',timeout:40000});
  await mobile.waitForFunction(()=>window.__nexoBootReady===true,null,{timeout:55000});
  await mobile.locator('#startBtn').click({timeout:15000});
  await mobile.locator('#gfxButton').click({timeout:10000});
  const modes=await mobile.locator('[data-quality]').count();
  if(modes!==5)throw Error('Mobile graphics settings missing profiles: '+modes);
  if(mobileErrors.length)throw Error(mobileErrors.join('\n'));
  console.log('PASS: mobile graphics menu contains all five options');
  await mobile.close();
  console.log('SUCCESS: Graphics 7.0 browser tests passed');
 }finally{await browser.close()}
})().catch(e=>{console.error('GRAPHICS QA FAILED',e.stack||e);process.exitCode=1});
