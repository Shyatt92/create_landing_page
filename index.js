const scrape = require('website-scraper')
const minify = require('minify')
const fsHelper = require('./fsHelper')
const helper = require('./helper')

// Remove Directory for Testing
const { rmdirSync } = require('fs')

let options = {
  urls: ['https://corushotels.com/corus-hyde-park/accommodation/'],
  directory: './downloaded'
}

const htmlPath = `${options.directory}/index.html`

let minifyOptions = {
  html: {
    collapseWhitespace: false,
    conservativeCollapse: false,
    html5: true,
    //maxLineLength,
    minifyCSS: false,
    minifyJS: false,
    removeEmptyElements: false,
  }
}

//Remove any current directory with same name as options.directory
rmdirSync(options.directory, { recursive: true })
console.log(`Deleted Directory: ${options.directory}`);

scrape(options)
  .then(result => {
    let html

    //Read .html file and save to html variable
    html = fsHelper.readFile(htmlPath)
    console.log(`Read file at: ${htmlPath}`)

    //Use html-format plugin to format html
    html = helper.format(html)
    console.log('Formatted HTML')

    //Find all style tags with id attributes, save css content to external stylesheet, and replace style tags with link tags
    const styleCount = helper.countTags(html, 'style[id]')
    for(let i = 1; i <= styleCount; i++){
      const styleObj = helper.findStyle(html)
      styleObj.filePath = `./css/custom-css${i}.css`

      fsHelper.writeFile(`${options.directory}/css/custom-css${i}.css`, styleObj.innerHTML)
      html = helper.replaceTag(html, styleObj)
    }
    console.log(`${styleCount} style tags moved to .css files`)

    const metaTags = helper.findTags(html, 'meta')
    //metaTags.forEach(async tag => await minify(tag))
    console.log(metaTags)

    //Rewrite .html file with updated html
    fsHelper.writeFile(htmlPath, html)
    console.log(`.html file completed`)    
  })
  .catch(error => {
    console.log("Scraper Error", error.message);
  })