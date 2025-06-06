import React, {useRef, useEffect} from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

function App() {
    const videoCam = useRef(null);
    const canvasCam = useRef(null);

    useEffect(() => {
        const startCam = async () => {
            try {
                const camStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {ideal: 'environment'} // access to the back camera
                    },
                    audio: false
                });

                if(videoCam.current) {
                    videoCam.current.srcObject = camStream;
                }
            } catch (error) {
                console.log("Unable to access camera", error);
                alert("Camera access required in order for EyeGuide to work!");
            }
        };

        const detectObject = async () => {
            const detectModel = await cocoSsd.load();
            console.log("Model has ran successfully");

            const runDetect = async () => {
                if(videoCam.current && detectModel) {
                    const detectedObjects = await detectModel.detect(videoCam.current);
                };

                const canvas = canvasCam.current;
                const context = canvas.getContext("2d");

                context.clearRect(0, 0, videoCam.current.videoWidth, videoCam.current.videoHeight);

                detectedObjects.forEach((o) => {
                    const [x, y, w, h] = o.bbox;

                    context.strokeStyle = "green";
                    context.lineWidth = 2;
                    context.strokeRect(x, y, w, h);
                });
                objectFrame(runDetect);
            }
        };
        startCam();
    }, []);

    return (
        <video
            ref={videoCam}
            autoPlay
            playsInline
            style= {{width: '100vw', height: '100vh', objectFit: 'cover',display: 'block'}}
        />
        
    )
}

export default App;
