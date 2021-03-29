const htmlFormat = require('html-format')
const pretty = require('pretty')
const minify = require('minify')
const cheerio = require('cheerio')

const format = (data) => {
  const prettyHTML = pretty(data, { ocd: true }/*, ' '.repeat(4), 1000000*/)

  return prettyHTML.toString()
}

const findStyle = (data) => {
  const $ = cheerio.load(data)
  const id = $('style[id]').attr('id')
  const innerHTML = $('style[id]').html()

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
  $('style[id]').first().replaceWith(link)

  return $.html()
}

const findAndRemoveTags = (data, tag) => {
  const $ = cheerio.load(data)
  let tags

  if(tag === 'meta' || tag === 'link'){
    const found = $(tag).toString().split('>')

    tags = found.map(element => {
      return element.replace(/\n/g, '').concat('>')
    })

    $(tag).remove()

    tags.pop()
  } else {
    const found = $(tag).toString()

    // for(let i = 0; i < tags.length; i++ ){
    //   let placeholderDiv = $(`<div id="placeholder-${i}"></div>`)
    //   $(tag).replaceWith(placeholderDiv)
    // }
  }

  return [ $.html(), tags ]
}

const insertTags = (data, tag, tagsArray) => {
  const $ = cheerio.load(data)

  if(tag === 'meta' || tag === 'link') {
    for(let i = tagsArray.length - 1; i > 0; i--){
      $('head').prepend(tagsArray[i].replace(/^/, '\n'))
    }
  } else {
    // for(let i = 0; i < tagsArray.length; i++ ){
    //   $(`<div id="placeholder-${i}"></div>`).replaceWith(tagsArray[i])
    // }
  }
  

  return $.html()
}

const findMinifyReplaceTags = (data, tag, minifyOptions = undefined) => {
  let tagsArray

  if(tag === 'meta' || tag === 'link') {
    [ data , tagsArray ] = findAndRemoveTags(data, tag)

    let minified = []
    for(let i = 0; i < tagsArray.length; i++){
      minified.push(minify.html(tagsArray[i], minifyOptions))
    }

    data = insertTags(data, tag, minified)
  } else {
    
  }

  return data
}


module.exports = { format, findStyle, countTags, replaceStyleTag, findAndRemoveTags, insertTags, findMinifyReplaceTags }