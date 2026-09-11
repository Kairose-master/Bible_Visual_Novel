const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let report=[];
for(const width of [1440,390,320]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto((process.env.APP_URL||'http://localhost:5173')+'/?debug');await p.waitForSelector('.novel.reduced');
 await p.getByRole('button',{name:'이야기 시작하기',exact:true}).click();
 for(let i=0;i<24;i++){
  await p.locator('.landmark-strip').waitFor({timeout:60000});
  if(!await p.locator('.choice').first().isDisabled())throw Error('unlocked without observation '+i);
  await p.locator('.landmark-strip button').nth(i%4).click();
  await p.locator('.observe-button').click();
  if(await p.locator('.choice').first().isDisabled())throw Error('remains locked '+i);
  if(i%4===0){await p.getByRole('button',{name:'시점 초기화',exact:true}).click();const stats=JSON.parse(await p.locator('.webgl-host').getAttribute('data-render-stats'));if(!stats.model||stats.triangles<1000)throw Error('missing GLB '+i);report.push({width,panel:i,stats});if(width===1440)await p.screenshot({path:'qa/world-'+i+'.png',fullPage:true});}
  if(i===0){await p.getByRole('button',{name:'오른쪽으로 회전',exact:true}).click();await p.getByRole('button',{name:'확대',exact:true}).click();await p.getByRole('button',{name:'본문과 해설 열기',exact:true}).click();if(await p.locator('.note-section').count()!==4)throw Error('notes');await p.getByRole('button',{name:'닫기',exact:true}).click();}
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('overflow '+width+' '+i);
  await p.locator('.choice').nth(i%2).click();await p.locator('.next-button').click();
  if(i%4===3&&i<23)await p.getByRole('button',{name:'다음 장으로',exact:true}).click();
 }
 await p.locator('.ending-body').waitFor();if(await p.locator('.reflection-cards article').count()!==4)throw Error('ending');
 report.push({width,complete:true,errors,storage:await p.evaluate(()=>({local:localStorage.length,session:sessionStorage.length,cookie:document.cookie}))});
 await p.reload();await p.locator('.cover').waitFor();await p.close();
}
console.log(JSON.stringify(report));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
