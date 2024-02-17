import {
    isValidUrl,
    getAudio
} from './core.js';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import {
    fileURLToPath
} from 'url';
import {
    Server
} from 'socket.io';
import {
    createServer
} from "http";

const app = express();
const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 4000;

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../client/dist')));

io.on('connection', (socket) => {

    socket.on("download", async (arg) => {
        const validUrl = isValidUrl(arg.url);
        if (!validUrl) {
            socket.emit("isValidUrl", validUrl);
        } else {
            await getAudio(arg.url, socket, arg.video);
        }
    });
});

app.get("/download/:fileName", (req, res) => {
    const pathFile = path.join(__dirname, '../public/', req.params.fileName);
    res.download(pathFile);
});

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});