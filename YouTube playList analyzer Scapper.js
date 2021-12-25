console.log();

const puppeteer = require("puppeteer");

let page;
(async function fun(){
    const browser = puppeteer.launch({
        headless : false,
        defaultViewport : null,
        args : ["--start-maximized", "--disable-notification"]
    })
    page = await (await browser).newPage();
    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
    
    await page.waitForSelector('h1[id="title"]', {visible : true});
    let element = await page.$('h1[id="title"]');
    let value = await page.evaluate(function(element){
        return element.textContent;
    }, element);
    
    console.log("PlayList Name : " + value);
    console.log();

    let arrayElem = await page.$$('.style-scope.ytd-playlist-sidebar-primary-info-renderer');
    value = await page.evaluate(function(element){
        return element.textContent;
    }, arrayElem[5]);

    console.log("Total Number of Videos  : " + value);
    console.log();

    let video = value.split(" ")[0].trim();

    value = await page.evaluate(function(element) {
        return element.textContent;
    }, arrayElem[6]);

    console.log("Total views : " + value)
    console.log();

    let loopCount = Math.floor(video / 100);

    for(let i = 0; i < loopCount; i++) {
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        await waitTillHTMLRendered(page);
        console.log("okay done...!");
    }

    let videoTimeArray = await page.$$('span[id="text"]');
    console.log("Video time length : " + videoTimeArray.length);

    let totalTimeInSecond = sumArray(videoTimeArray);
    console.log("Total time is Second : " + totalTimeInSecond);
    console.log();

    let videoTitleArray = await page.$$('a[id="video-title"]');
    console.log("Video name length : " + videoTimeArray.length);

    let lastVideoName = videoTitleArray[videoTitleArray.length - 1];
    await page.evaluate(function(element){
        element.scrollIntoView();
    }, lastVideoName)

    let videosArr = [];

    for(let i = 0; i < videoTimeArray.length; i++) {
        let timeAndTitleObj = await page.evaluate(getTimeAndTitle, videoTimeArray[i], videoTitleArray[i]);
        videosArr.push(timeAndTitleObj);
    }
    console.log();
    console.table(videosArr);
    
})();

function getTimeAndTitle(element_1, element_2) {
    return {
        time : element_1.textContent.trim(),
        title : element_2.textContent.trim()
    }
}

const waitTillHTMLRendered = async (page, timeout = 2000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitFor(checkDurationMsecs);
    }  
};
  
console.log();