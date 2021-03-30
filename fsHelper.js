const fs = require('fs')

const fileEditor = (filePath, callBack = null, callBackParams = null) => {
  let result
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    if(callBackParams) {
      result = callBack(data, callBackParams)
    } else if(callBack) {
        result = callBack(data)
    }
  } catch(error) {
    console.error(error)
  }
  
  if(typeof result === 'string') {
    fs.writeFileSync(filePath, result, (error) => {
      if(error){
        console.log("WriteFile Error:", error.message)
      }
      console.log("File saved to " + filePath)
    })
  } else {
    return result
  }
}

const readFile = (filePath) => {
  let result = fs.readFileSync(filePath, 'utf-8')
  
  // Remove IE comment from footer script
  if(result.includes('//IE specific code goes here')){
    result = result.replace('//IE specific code goes here', '')
  }

  return result
}

const writeFile = (filePath, data) => {
  //Find and ammend all script errors
  let newData
  newData = data.replace(new RegExp('}</script>', 'g'), '};</script>')
  newData = newData.replace(/\)<\/script>/g, ');</script>')

  fs.writeFileSync(filePath, newData, (error) => {
    if(error){
      console.log("CreateFile Error: ", error.message)
    }
    console.log("File Saved to " + filePath)
  })
}

module.exports = { fileEditor, readFile, writeFile }