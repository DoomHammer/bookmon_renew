const puppeteer = require('puppeteer');
const puppeteer_fp = require('puppeteer-full-page-screenshot');
const fs = require('fs');
const parser = require('node-html-parser');

const urls = ['https://www.amazon.com/dp/B08TQBR8F4/', 'https://www.amazon.com/dp/1838554599/', 'https://www.amazon.com/gp/bestsellers/digital-text/8288738011/ref=pd_zg_hrsr_digital-text', 'https://www.amazon.com/gp/bestsellers/digital-text/16977177011/ref=pd_zg_hrsr_digital-text', 'https://www.amazon.com/gp/bestsellers/digital-text/156150011/ref=pd_zg_hrsr_digital-text'];

async function run () {
  const now = new Date();
  const stamp = now.toISOString();
  fs.mkdirSync('results', {'recursive': true});
  for (const url of urls) {
    let product = url.split('/')[4];
    if (product == 'bestsellers') {
      let product = 'bestsellers-' + url.split('/')[6];
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.waitFor(500);
    
    const html = await page.content();
    browser.close();
    fs.writeFile(`results/index-${product}-${stamp}.html`, html, error => {
      if (error) {
	console.error(error);
	return;
      }
    });
    const root = parser.parse(html);
    const position = root.querySelector('#detailBullets_feature_div + .detail-bullet-list .a-list-item');
    if (position) {
      fs.writeFile(`results/position-${product}-${stamp}.html`, position.toString(), error => {
	if (error) {
	  console.error(error);
	  return;
	}
      });
    }
  };
};
run();
