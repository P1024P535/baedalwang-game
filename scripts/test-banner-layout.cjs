const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('android/app/src/main/assets/index.html','utf8');
const resize=html.slice(html.indexOf('function resize(){'),html.indexOf('try{new ResizeObserver(resize)'));
const gameBannerHeight=fs.readFileSync('improvements/advertising.js','utf8').match(/function gameBannerHeight\(\)\{[^\n]+/)[0];
const c=vm.createContext({cv:{clientWidth:393,clientHeight:786},g:{setTransform(){}},window:{devicePixelRatio:1},ads:{state:{bannerHeight:0}}});
vm.runInContext('let W=0,H=0,K=1,RH=0,GY=0,RX=0,RY=0;const BOT=190;function nativeAds(){return ads;}\n'+gameBannerHeight+'\n'+resize,c);
for(const [w,h] of [[393,786],[320,568],[520,650],[640,360]]){
 c.cv.clientWidth=w;c.cv.clientHeight=h;c.ads.state.bannerHeight=0;vm.runInContext('resize()',c);const scale=vm.runInContext('K',c);
 c.cv.clientHeight=h-54;c.ads.state.bannerHeight=54;vm.runInContext('resize()',c);assert.equal(vm.runInContext('K',c),scale,'Banner should not shrink rider '+w+'x'+h);
}
assert.ok(!html.includes('native-ads-panel'));assert.ok(!html.includes('data-act="ad-test-'));
assert.ok(html.includes('--game-safe-top'));assert.ok(html.includes('Math.min((H+gameBannerHeight())/500,W/245)'));
assert.ok(fs.readFileSync('android/app/src/main/java/com/ssokcompany/baedalwang/DisplayAds.java','utf8').includes('view.setAdSize(AdSize.BANNER)'));
console.log('PASS: stable rider scale with 54px banner space at 4 sizes; removed temporary ad controls; native safe-area and fixed banner wiring');
