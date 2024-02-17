import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

const socket = io("/");

function App() {
  const [link, setLink] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);

  const buttonRef = useRef(null);

  const handleChangeLink = (e) => setLink(e.target.value);
  const handleChangeWithVideo = () => setChecked(!checked);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!link) {
      toast.error("The youtube link is required", {
        duration: 4000,
        position: "bottom-right",
      });
      setLoading(false);
    } else {
      socket.emit("download", { url: link, video: checked });
    }
  };

  useEffect(() => {
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const fireConfetti = (x, y) => {
      confetti({
        angle: randomInRange(55, 125),
        spread: randomInRange(80, 100),
        particleCount: randomInRange(200, 300),
        gravity: randomInRange(0.6, 0.9),
        drift: randomInRange(-0.4, 0.4),
        origin: {
          x: x,
          y: y,
        },
      });
    };

    socket.on("isValidUrl", (response) => {
      if (!response) {
        toast.error("The link you provided is not valid", {
          duration: 4000,
          position: "bottom-right",
        });
        setLoading(false);
      }
    });

    socket.on("download_percentage", (response) => {
      setPercentage(response);
      if (response >= 100) {
        let rect = buttonRef.current.getBoundingClientRect();

        let originX = (rect.x + 0.5 * rect.width) / window.innerWidth;
        let originY = (rect.y + 0.5 * rect.height) / window.innerHeight;

        fireConfetti(originX, originY);

        toast.success("Resource downloaded successfully", {
          duration: 4000,
          position: "bottom-right",
        });
        setLoading(false);
        setPercentage(0);
        setLink("");
      }
    });

    socket.on("error", (error) => {
      toast.error(error, {
        duration: 4000,
        position: "bottom-right",
      });
      setLoading(false);
    });

    socket.on("downloaded_file", ({ fileName }) => {
      const pathFile = `${window.location.href}download/${fileName}`;
      const link = document.createElement("a");
      link.href = pathFile;
      link.download = fileName;
      link.click();
    });

    return () => {
      socket.off("isValidUrl");
      socket.off("download_percentage");
      socket.off("error");
      socket.off("downloaded_file");
    };
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="w-screen h-screen flex justify-center sm:items-center flex-col sm:flex-row p-5 sm:p-0">
          <span className="absolute bottom-0 mb-5 text-white font-mono text-sm z-10 self-center">
            With ❤️ 4ndresdev.js
          </span>
          <div className="container max-w-full sm:max-w-lg py-1 px-3 rounded-lg sm:rounded-e-none bg-white shadow-2xl flex items-center z-10">
            🔎
            <input
              type="url"
              name="link"
              placeholder="Paste the youtube link here"
              className="yt_link w-full p-4 !outline-none text-md"
              onChange={handleChangeLink}
              value={link}
              autoComplete="off"
            />
            <label className="relative inline-flex items-center me-5 cursor-pointer">
              <input
                type="checkbox"
                value={checked}
                className="sr-only peer !outline-none"
                onChange={handleChangeWithVideo}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Video
              </span>
            </label>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="circle w-60 h-60 bg-pink-500 rounded-full blur-3xl absolute"></div>
            <input
              type="submit"
              value={loading ? `Downloading ${percentage}%` : "Download"}
              className="p-5 rounded-lg sm:rounded-s-none mt-5 sm:mt-0 w-full bg-black text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 z-10 block"
              disabled={loading}
              ref={buttonRef}
            />
          </div>
        </div>
      </form>
      <ToastContainer />
    </>
  );
}

export default App;
