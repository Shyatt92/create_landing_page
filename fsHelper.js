const fs = require('fs')

const readFile = (filePath) => {
  let result = fs.readFileSync(filePath, 'utf-8')
  
  // Remove IE comment from footer script
  if(result.includes('//IE specific code goes here')){
    result = result.replace('//IE specific code goes here', '')
  }

  return result
}

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, data, (error) => {
    if(error){
      console.log("CreateFile Error: ", error.message)
    }
    console.log("File Saved to " + filePath)
  })
}

module.exports = { readFile, writeFile }