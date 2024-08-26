import fs from "fs";
import { isValidUrl, getMedia } from "./core.js";
import express from "express";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 4000;

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "../client/dist")));

io.on("connection", (socket) => {
  socket.on("download", async (arg) => {
    const validUrl = isValidUrl(arg.url);
    if (!validUrl) {
      socket.emit("isValidUrl", validUrl);
    } else {
      await getMedia(arg.url, socket, arg.video);
    }
  });
});

app.get("/download/:fileName", (req, res) => {
  const pathFile = path.join(__dirname, req.params.fileName);
  res.download(pathFile, (error) => {
    if (error) {
      socket.emit("error", error.message);
    } else {
      fs.unlink(pathFile, (error) => {
        if (error) {
          socket.emit("error", error.message);
        }
      });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
