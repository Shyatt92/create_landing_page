const pretty = require('pretty')
const minify = require('minify')
let prompt = require('prompt-sync')()
const cheerio = require('cheerio')

const requiredMetaTags = [
  "<!-- Required meta tags -->",
  '<meta charset="utf-8">',
  '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="robots" content="ALL">',
  '<meta name="robots" content="INDEX,FOLLOW">',
  '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
  '<meta name="Title" content="">',
  '<meta name="Distribution" content="Global">',
  '<meta name="Revisit-After" content="7 days">',
  '<meta name="description" content="">',
  '<meta name="keywords" content="">',
  '<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
  '<meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">'
  ]


// Format HTML
const format = (data) => {
  const prettyHTML = pretty(data, { ocd: true })

  return prettyHTML.toString()
}

// Find first Style tag and capture ID attribute and contained CSS
const findStyle = (data) => {
  const $ = cheerio.load(data)
  const id = $('style').attr('id')
  const innerHTML = $('style').html()

  const result = {
    id,
    innerHTML
  }

  return result
}

// Count all Style tags in HTML document
const countTags = (data, tag) => {
  const $ = cheerio.load(data)
  const count = $(tag).length

  return count
}

// Replace first found Style Tag with link tag to given .css file
const replaceStyleTag = (data, styleObj) => {
  const $ = cheerio.load(data)
  const link = `<link rel='stylesheet' ${styleObj.id? `id='${styleObj.id}'`: ''} type='text/css' href='${styleObj.filePath}' media='all' />`
  $('style').first().replaceWith(link)

  return $.html()
}

// Find all given tags and either remove or replace with a placeholder div element
const findAndRemoveTags = (data, tag) => {
  const $ = cheerio.load(data)
  let tags

  const found = $(tag).map(function (i, el) {
    return $(this).toString().replace(/\n/g, '')
  }).get()

  if(tag === 'meta' || tag === 'link'){
    $(tag).remove()
  } else {
    $(tag).replaceWith(function(i, el) {
      return $('<div id="placeholder-'+ i +'"></div>')
    })
  }

  return [ $.html(), found ]
}

// Reinsert new tags back into appropriate place in HTML
const insertTags = (data, tag, tagsArray) => {
  const $ = cheerio.load(data)

  if(tag === 'meta' || tag === 'link') {
    for(let i = tagsArray.length - 1; i >= 0; i--){
      $('head').prepend(tagsArray[i].replace(/^/, '\n    '))
    }
  } else {
    for(let i = 0; i <= tagsArray.length; i++){
      $('div#placeholder-' + i).replaceWith(function(){
        return $(tagsArray[i])
      })
    }
  }
  
  return $.html()
}


// Function to combine finding, minifying, and reinserting a given tag
const findMinifyReplaceTags = (data, tag, minifyOptions = undefined) => {
  let tagsArray

  [ data , tagsArray ] = findAndRemoveTags(data, tag)

  let minified = []
  for(let i = 0; i < tagsArray.length; i++){
    minified.push(minify.html(tagsArray[i], minifyOptions))
  }

  if(tag === 'meta' || tag === 'link') {
    data = insertTags(data, tag, minified)
  } else {
    data = insertTags(data, tag, minified)
  }

  return data
}

// Count all .js scripts in HTML document that do not have SRC attributes
const scriptCount = (data) => {
  const $ = cheerio.load(data)
  const count = $('script').not('[src]').not('[type="application/ld+json"]').not('script:contains("gtag")').length

  return count
}

// Find first script tag in HTML document that does not have SRC attribute
const findScripts = (data) => {
  const $ = cheerio.load(data)

  return $('script').not('[src]').not('[type="application/ld+json"]').not('script:contains("gtag")').html()
}

// Edit first instance of script tag with new SRC attribute, and remove contained JS code
const replaceScripts = (data, src) => {
  const $ = cheerio.load(data)

  $('script').not('[src]').not('[type="application/ld+json"]').not('script:contains("gtag")').first().html('')
  $('script').not('[src]').not('[type="application/ld+json"]').not('script:contains("gtag")').first().attr('src', src)

  return $.html()
}

// Add in required meta tags for SEO, remove duplicate meta tags, and cleaning up the head element
const requiredTags = (data) => {
  const $ = cheerio.load(data)

  let title = $('title').html()
  let description = $('meta[name="description"]').attr('content')

  $('meta[property="og:url"]').remove()
  $('link[rel="canonical"]').remove()
  $('meta[name="generator"]').remove()
  $('meta[content="text/html; charset=utf-8"]').remove()
  $('meta[name="viewport"]').remove()
  $('meta[name="robots"]').remove()

  for(let i = requiredMetaTags.length - 1; i > 0; i--){
    $('head').prepend(requiredMetaTags[i].replace(/^/, '\n    '))
  }

  console.log(`Current title is: ${title}`);
  title = prompt('Please Enter Title: ', title)

  $('title').html(title)
  $("meta[property='og:title']").attr('content', title)
  $("meta[name='"+/title/i+"']").attr('content', title)
  $('meta[name="description"]').attr('content', description)
  
  let titleTag = $('title').map(function (i, el) {
    return $(this).toString().replace(/\n/g, '')
  }).get()

  $('title').remove()
  $('head').prepend(titleTag[0].replace(/^/, '\n    '))

  let keywords = prompt('Please enter desired keywords: ')

  $('meta[name="keywords"]').attr('content', keywords)

  let seen = {}
  $('head meta').each(function() {
    let thisTag = $(this).toString()
    if (seen[thisTag])
      $(this).remove()
    else
      seen[thisTag] = true
  })
  
  const headInner = $('head').html()
  let changed = headInner.replace(/\n/g, '')
  $('head').html(changed)

  const head = $('head > *').map(function(){return $(this).toString()}).get()
  $('head > *').remove()

  for(let i = head.length - 1; i >= 0; i--){
    $('head').prepend(head[i].replace(/^/, '\n    '))
  }

  return $.html()
}

// Add [keyword] to alt and title attribute of given tag
const addKeywords = (data, tag) => {
  const $ = cheerio.load(data)

  $(tag).attr('alt', '[keyword]')
  $(tag).attr('title', '[keyword]')

  return $.html()
}


module.exports = { format, findStyle, countTags, replaceStyleTag, findAndRemoveTags, insertTags, findMinifyReplaceTags, scriptCount, findScripts, replaceScripts, requiredTags, addKeywords }