const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true});
  const errors=[];
  page.on('pageerror',e=>{errors.push(e.stack||e.message);console.error('JS_ERROR',e.stack||e.message)});
  page.on('console',msg=>{if(msg.type()==='error'){errors.push(msg.text());console.error('CONSOLE_ERROR',msg.text())}});
  page.on('requestfailed',r=>console.error('NETWORK_ERROR',r.url(),r.failure()?.errorText));
  const response=await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle',timeout:30000});
  if(response.status()!==200)throw Error('HTTP '+response.status());
  const status=await page.locator('#bootStatus').textContent();
  console.log('BOOT STATUS',status);
  await page.waitForFunction(()=>window.__nexoBootReady===true,{timeout:25000}).catch(async e=>{throw Error('BOOT TIMEOUT: '+await page.locator('#bootStatus').textContent()+'\n'+errors.join('\n'))});
  const button=page.locator('#startBtn');
  if(await button.isDisabled())throw Error('START BUTTON STILL DISABLED');
  await button.click({timeout:10000});
  await page.waitForFunction(()=>document.querySelector('#start')?.classList.contains('hidden'),{timeout:8000});
  if(await page.locator('[data-page]').count()<5)throw Error('MISSING RP MENUS');
  await page.keyboard.press('f');
  await page.waitForTimeout(350);
  if(!await page.locator('#panel').evaluate(e=>e.classList.contains('visible')))throw Error('PHONE NOT OPENING');
  console.log('PASS: game started and phone works');
  if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
