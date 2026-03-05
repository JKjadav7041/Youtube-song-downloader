const yts = require("yt-search")

async function searchYoutube(song){

const result = await yts(song)

return result.videos[0].url

}

module.exports = searchYoutube