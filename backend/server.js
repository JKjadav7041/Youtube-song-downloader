const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

const readExcel = require("./excelReader")
const searchYoutube = require("./youtubeSearch")
const downloadSong = require("./downloader")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/downloads", express.static(path.join(__dirname,"../downloads")))

const upload = multer({ dest: "../uploads/" })

function sleep(ms){
return new Promise(resolve => setTimeout(resolve,ms))
}

////////////////////////////////////////////////////////
// GET SONG LIST
////////////////////////////////////////////////////////

app.get("/songs",(req,res)=>{

const downloadsPath = path.join(__dirname,"../downloads")

if(!fs.existsSync(downloadsPath)){
return res.json([])
}

const files = fs.readdirSync(downloadsPath)

res.json(files)

})

////////////////////////////////////////////////////////
// UPLOAD EXCEL
////////////////////////////////////////////////////////

app.post("/upload", upload.single("file"), async (req,res)=>{

try{

const songs = readExcel(req.file.path)

console.log("Songs Found:",songs)

for(let song of songs){

if(!song) continue

console.log("Searching:",song)

const link = await searchYoutube(song)

console.log("Downloading:",link)

await downloadSong(link)

console.log("Downloaded:",song)

// delay 15 sec
await sleep(15000)

}

console.log("✅ All songs downloaded")

res.json({message:"Download complete"})

////////////////////////////////////////////////////////
// SERVER AUTO CLOSE AFTER 4 SEC
////////////////////////////////////////////////////////

setTimeout(()=>{

console.log("🛑 Server closing automatically...")
process.exit()

},4000)

}catch(err){

console.log(err)

res.json({message:"Error occurred"})

}

})

app.listen(5000,()=>{
console.log("🚀 Server running on http://localhost:5000")
})