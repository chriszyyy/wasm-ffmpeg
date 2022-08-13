import './wasm-ffmpeg.css';
import React, { useEffect, useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({
  corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
  log: true,
});

export const WasmContainer = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [fileList, setFileList] = useState([]);

  const loadLocalData = async () => {
    ffmpeg.FS('writeFile', 'test.avi', await fetchFile('/flame.avi'));
    await ffmpeg.run('-i', 'test.avi', 'test.mp4');
    const data = ffmpeg.FS('readFile', 'test.mp4');
    setVideoSrc(
      URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
    );
  };

  const onFilesSelected = (event) => {
    const {
      target: { files },
    } = event;

    console.log('selected files', files);
    console.log('old files', fileList);

    //Clear old files in FS
    Promise.all(fileList.map((name) => ffmpeg.FS('unlink', name))).then(() => {
      const pros = [];
      const newFileList = [];

      for (let i = 0; i < files.length; i++) {
        newFileList.push(`${i + 1}.jpg`);
        pros.push(files[i].arrayBuffer());
      }

      Promise.all(pros).then((res) => {
        console.log(res);
        setFileList(newFileList);
        console.log(newFileList);

        res.map((data, index) =>
          ffmpeg.FS('writeFile', newFileList[index], new Uint8Array(data))
        );
      });
    });
  };

  const makeVideo = async () => {
    if (fileList.length > 0) {
      const fileInputConfigs = ['-r', '1', '-i', '%d.jpg'];

      const outputConfigs = [
        '-b:v',
        '200k',
        '-s',
        '1920x1080',
        // '-filter_complex',
        // '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=out:st=4:d=1[v0]; \
        // [1:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v1]; \
        // [2:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v2]; \
        // [3:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v3]; \
        // [4:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v4]; \
        // [5:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v5]; \
        // [v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0,format=yuv420p[v]',
        // '-map',
        // '[v]',
        // '-map',
        // '6:a',
        // '-shortest',
        'output.mp4',
      ];

      await ffmpeg.run(...fileInputConfigs, ...outputConfigs);

      const data = ffmpeg.FS('readFile', 'output.mp4');
      setVideoSrc(
        URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      );
    }
  };

  useEffect(() => {
    if (!ffmpeg.isLoaded()) {
      ffmpeg.load().then(() => setIsLoaded(true));
    }
  }, []);

  return (
    <div>
      <h1>WasmContainer</h1>
      <div>
        {isLoaded && (
          <React.Fragment>
            <button onClick={loadLocalData}>Load data</button>
            <button onClick={makeVideo}>Make video</button>
            <input
              type="file"
              name="select multiple image"
              multiple
              onChange={onFilesSelected}
            />
            <br />
            <video src={videoSrc} controls></video>
          </React.Fragment>
        )}
        {!isLoaded && <span>Initializing</span>}
      </div>
    </div>
  );
};
