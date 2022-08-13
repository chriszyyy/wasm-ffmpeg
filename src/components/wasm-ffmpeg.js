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
      const filePattern = '%d.jpg';
      const output = 'output.mp4';

      await ffmpeg.run(
        '-r',
        '1',
        '-i',
        filePattern,
        '-b',
        '80k',
        '-s',
        '640x480',
        output
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      setVideoSrc(
        URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      );
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    ffmpeg.load().then((res) => {
      console.log(1, res);
    });
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
            <video src={videoSrc} controls></video>
            <br />
          </React.Fragment>
        )}
        {!isLoaded && <span>Initializing</span>}
      </div>
    </div>
  );
};
