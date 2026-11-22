const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--disable-gpu-sandbox','--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true});
  const errors=[];
  page.on('pageerror',e=>{errors.push('PAGEERROR '+(e.stack||e.message));console.error('PAGEERROR',e.stack||e.message)});
  page.on('console',msg=>{if(msg.type()==='error'){errors.push('CONSOLE '+msg.text());console.error('CONSOLE',msg.text())}});
  page.on('requestfailed',r=>{console.error('REQUEST_FAILED',r.url(),r.failure()?.errorText)});
  const response=await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded',timeout:20000});
  console.log('response',response.status());
  await page.waitForTimeout(3500);
  console.log('webGL',await page.evaluate(()=>{try{return !!document.createElement('canvas').getContext('webgl2')}catch(e){return e.message}}));
  console.log('start shown',await page.locator('#start').evaluate(e=>getComputedStyle(e).display));
  await page.locator('#startBtn').click({timeout:20000});
  await page.waitForTimeout(750);
  console.log('after click',await page.locator('#start').evaluate(e=>({display:getComputedStyle(e).display,class:e.className})));
  console.log('buttons',await page.locator('[data-page]').count());
  console.log('errors',errors.length);
  await browser.close();
  if(errors.length)process.exitCode=1;
  const after=await Promise.resolve(true);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1})