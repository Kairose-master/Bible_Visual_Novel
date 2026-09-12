const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
for(const width of [1440,390,320,960]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto((process.env.APP_URL||'http://localhost:5173')+'/?debug');await p.waitForSelector('.novel.reduced');await p.waitForFunction(()=>JSON.parse(document.querySelector('.webgl-host').dataset.renderStats||'{}').model,{},{timeout:60000});
 if(width===1440)await p.screenshot({path:'qa/final-cover.png',fullPage:true});
 await p.getByRole('button',{name:'이야기 시작하기',exact:true}).click();await p.getByRole('button',{name:'탐색으로 이어가기',exact:true}).first().click();
 for(let panel=0;panel<(width===960?4:24);panel++){
  await p.locator('.landmark-strip').waitFor({timeout:60000});
  await p.waitForFunction(ch=>{const s=JSON.parse(document.querySelector('.webgl-host').dataset.renderStats||'{}');return s.model&&s.chapter===ch&&s.textures>=6},Math.floor(panel/4));
  if(!await p.locator('.choice').first().isDisabled())throw Error('gate '+panel);
  if(panel%4===0){
   const stats=JSON.parse(await p.locator('.webgl-host').getAttribute('data-render-stats'));results.push({width,panel,stats});console.log('CHAPTER',width,panel);
   if(width===1440)await p.screenshot({path:'qa/final-world-'+panel+'.png',fullPage:true});
   if(width===390&&panel===0)await p.screenshot({path:'qa/final-mobile.png',fullPage:true});
  }
  if(panel===0){
   await p.getByRole('button',{name:'장면 크게 보기',exact:false}).click();if(await p.locator('.narrative').isVisible())throw Error('immersive');
   await p.getByRole('button',{name:'대화 함께 보기',exact:false}).click();
   await p.getByRole('button',{name:'오른쪽으로 회전',exact:true}).click();
   await p.getByRole('button',{name:'시점 초기화',exact:true}).click();
  }
  await p.locator('.landmark-strip button').nth(panel%4).click();await p.locator('.observe-button').click();
  if(await p.locator('.choice').first().isDisabled())throw Error('observation '+panel);
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('overflow '+width);
  await p.locator('.choice').nth(panel%2).click();await p.locator('.next-button').click();
  if(panel%4===3&&panel<23){await p.getByRole('button',{name:'다음 장으로',exact:true}).click();await p.getByRole('button',{name:'탐색으로 이어가기',exact:true}).first().click();}
 }
 if(width!==960){await p.locator('.ending-body').waitFor();if(await p.locator('.reflection-cards article').count()!==4)throw Error('ending');}
 if(errors.length)throw Error(JSON.stringify(errors));
 console.log('PASS',width);results.push({width,pass:true});await ctx.close();
}
console.log('RESULT '+JSON.stringify(results));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});