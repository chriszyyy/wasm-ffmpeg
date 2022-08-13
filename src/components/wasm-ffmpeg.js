import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

export const WasmContainer = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [localVideo, setLocalVideo] = useState();

  const loadWasm = () => {
    if (!isLoaded) {
      ffmpeg.load().then((res) => {
        console.log(1, res);
        setIsLoaded(true);
      });
    }
  };

  const loadData = () => {
    if (isLoaded) {
      fetchFile("./static/flame.avi").then((res) => {
        console.log(1, res);
        setLocalVideo(res);
      });
    }
  };

  return (
    <div>
      <h1>WasmContainer</h1>
      <div>
        <button onClick={loadWasm}>Load ffmpeg</button>
        <button onClick={loadData}>Load data</button>
      </div>
    </div>
  );
};
