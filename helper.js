const htmlFormat = require('html-format')
const cheerio = require('cheerio')

const format = (data) => {
  const prettyHTML = htmlFormat(data, ' '.repeat(4), 1000000)

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

const replaceTag = (data, styleObj) => {
  const $ = cheerio.load(data)
  const link = `<link rel='stylesheet' ${styleObj.id? `id='${styleObj.id}'`: ''} type='text/css' href='${styleObj.filePath}' media='all' />`
  $('style[id]').first().replaceWith(link)

  return $.html()
}

const findTags = (data, tag) => {
  const $ = cheerio.load(data)
  const tags = $(tag).toString().split('>')

  return tags
}



module.exports = { format, findStyle, countTags, replaceTag, findTags }