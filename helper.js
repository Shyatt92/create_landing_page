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



const format = (data) => {
  const prettyHTML = pretty(data, { ocd: true }/*, ' '.repeat(4), 1000000*/)

  return prettyHTML.toString()
}

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

const countTags = (data, tag) => {
  const $ = cheerio.load(data)
  const count = $(tag).length

  return count
}

const replaceStyleTag = (data, styleObj) => {
  const $ = cheerio.load(data)
  const link = `<link rel='stylesheet' ${styleObj.id? `id='${styleObj.id}'`: ''} type='text/css' href='${styleObj.filePath}' media='all' />`
  $('style').first().replaceWith(link)

  return $.html()
}

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

const scriptCount = (data) => {
  const $ = cheerio.load(data)
  const count = $('script').not('[src]').not('[type="application/ld+json"]').length

  return count
}

const findScripts = (data) => {
  const $ = cheerio.load(data)

  return $('script').not('[src]').not('[type="application/ld+json"]').html()
}

const replaceScripts = (data, src) => {
  const $ = cheerio.load(data)

  $('script').not('[src]').not('[type="application/ld+json"]').first().html('')
  $('script').not('[src]').not('[type="application/ld+json"]').first().attr('src', src)

  return $.html()
}

const requiredTags = (data) => {
  const $ = cheerio.load(data)

  let title = $('title').html()
  let description = $('meta[name="description"]').attr('content')

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

const addKeywords = (data, tag) => {
  const $ = cheerio.load(data)

  $(tag).attr('alt', '[keyword]')
  $(tag).attr('title', '[keyword]')

  return $.html()
}


module.exports = { format, findStyle, countTags, replaceStyleTag, findAndRemoveTags, insertTags, findMinifyReplaceTags, scriptCount, findScripts, replaceScripts, requiredTags, addKeywords }