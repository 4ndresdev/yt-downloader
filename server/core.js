import ytdl from 'ytdl-core';
import * as fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';
import stringFormat from './utils/functions.js';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));

const getAudio = async (url, socket, video = false) => {
    try {
        const media = ytdl(url, {
            quality: video ? "highestvideo" : "highestaudio",
            filter: video ? "videoandaudio" : "audioonly",
        }).on("progress", (_, downloadedChunk, totalChunk) => {
            socket.emit("download_percentage", Math.floor((downloadedChunk * 100) / totalChunk), "%");
        });
        let info = await ytdl.getBasicInfo(url);
        let ext = video ? ".mp4" : ".mp3";
        const fileName = `${stringFormat(info?.videoDetails?.title)}${ext}`;
        const filePath = path.join(__dirname, '../public/', fileName);
        const file = fs.createWriteStream(filePath);
        media.pipe(file);
        file.on('finish', () => {
            file.close();
            socket.emit('downloaded_file', {
                fileName,
            });
        });
    } catch (error) {
        socket.emit("error", error.message);
    }
};

const isValidUrl = (url) => ytdl.validateURL(url);

export {
    getAudio,
    isValidUrl
};