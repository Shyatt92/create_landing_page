const scrape = require('website-scraper')
const fsHelper = require('./fsHelper')
const helper = require('./helper')

// Remove Directory for Testing
const { rmdirSync } = require('fs')

let options = {
  urls: ['https://corushotels.com/burnham-beeches-hotel/dining/'],
  directory: './downloaded'
}

const htmlPath = `${options.directory}/index.html`

let minifyOptions = {
    collapseWhitespace: true,
    conservativeCollapse: true,
    html5: true,
    //maxLineLength,
    minifyCSS: true,
    minifyJS: true,
    removeEmptyElements: false,
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
    const styleCount = helper.countTags(html, 'style')
    for(let i = 1; i <= styleCount; i++){
      const styleObj = helper.findStyle(html)
      styleObj.filePath = `./css/custom-css${i}.css`

      fsHelper.writeFile(`${options.directory}/css/custom-css${i}.css`, styleObj.innerHTML)
      html = helper.replaceStyleTag(html, styleObj)
    }
    console.log(`${styleCount} style tags moved to .css files`)

    //Find and move scripts to .js files
    const scripts = helper.scriptCount(html)
    for(let i = 0; i < scripts; i++){
      const script = helper.findScripts(html)
      let src = `./js/custom-js${i+1}.js`

      fsHelper.writeFile(`${options.directory}/js/custom-js${i+1}.js`, script)

      html = helper.replaceScripts(html, src)
    }
    console.log(`${scripts} script tags moved to 'js files`)

    // Find all meta tags and minify each
    html = helper.findMinifyReplaceTags(html, 'link', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'meta', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'script', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'div.avada-footer-scripts', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'div.fusion-fullwidth', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'section.fusion-tb-header', minifyOptions)
    html = helper.findMinifyReplaceTags(html, 'section.fusion-tb-footer', minifyOptions)

    html = helper.requiredTags(html)

    html = helper.addKeywords(html, 'a')
    html = helper.addKeywords(html, 'span')
    html = helper.addKeywords(html, 'img')
    html = helper.addKeywords(html, 'h1')
    html = helper.addKeywords(html, 'h2')
    html = helper.addKeywords(html, 'h3')
    html = helper.addKeywords(html, 'h4')
    html = helper.addKeywords(html, 'h5')
    html = helper.addKeywords(html, 'h6')

    //Rewrite .html file with updated html
    fsHelper.writeFile(htmlPath, html)
    console.log(`.html file completed`) 
  })
  .catch(error => {
    console.log("Scraper Error", error.message);
  })