
const { execFile } = require("child_process");

function downloadSong(link) {

    return new Promise((resolve, reject) => {

        const args = [
            "--no-overwrites",
            "--js-runtimes", "node",
            "-x",
            "--audio-format", "mp3",
            "--ffmpeg-location",
            "C:\\ffmpeg-8.0.1-essentials_build\\bin",
            "-o",
            "../downloads/%(title)s-%(id)s.%(ext)s",
            link
        ];

        execFile(
            "python",
            ["-m", "yt_dlp", ...args],
            { cwd: __dirname },
            (error, stdout, stderr) => {

                if (error) {
                    console.log("Download Error:", stderr);
                    reject(new Error(stderr || error.message));
                    return;
                }

                console.log("Download Complete!");
                resolve(stdout);
            }
        );

    });

}

module.exports = downloadSong;
