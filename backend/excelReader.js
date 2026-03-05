const XLSX = require("xlsx")

function readExcel(filePath){

const workbook = XLSX.readFile(filePath)

const sheet = workbook.Sheets[workbook.SheetNames[0]]

const data = XLSX.utils.sheet_to_json(sheet)

let songs=[]

data.forEach(row=>{
const value = Object.values(row)[0]
if(value) songs.push(value)
})

return songs

}

module.exports = readExcel