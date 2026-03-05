const { exec } = require("child_process")

function downloadSong(link){

return new Promise((resolve,reject)=>{

const command=`python -m yt_dlp --no-overwrites -x --audio-format mp3 --ffmpeg-location "C:\\ffmpeg-8.0.1-essentials_build\\bin" -o "../downloads/%(title)s-%(id)s.%(ext)s" ${link}`

exec(command,(error,stdout,stderr)=>{

if(error){
console.log(stderr)
reject(error)
}else{
resolve(stdout)
}

})

})

}

module.exports = downloadSong