import React, {useRef, useEffect, useState} from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import CameraOverlay from "./CameraOverlay";

function App() {
    const videoCam = useRef(null);
    const canvasCam = useRef(null);
    const wordsUsed = useRef(new Set());
    const [currentDirection, setdirectionFacing] = useState("");
    const lastDirection = useRef("");
    const [camOverlay, setOverlay] = useState(true);

    const handleOverlay = () => {
            setOverlay(false);
            startCam();
        }

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

    useEffect(() => {
        const speakObject = async (text) => {
            if(wordsUsed.current.has(text)) {
                return;
            }

            wordsUsed.current.add(text);

            const synth = window.speechSynthesis;
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1;
            synth.speak(utter);

            setTimeout(() => {
                wordsUsed.current.delete(text);
            }, 3000);
        };

        const directionFacing = (event) => {
            const head = event.alpha;

            if(head != null) {
                let arrow = "";

                if(head < 45 || head >= 315) {
                    arrow = "North";
                } else if (head < 135) {
                    arrow = "East";
                } else if(head > 225) {
                    arrow = "South";
                } else {
                    arrow = "West";
                }
                
                const directionMessage = `You are currently facing ${arrow}`;

                if(lastDirection.current !== directionMessage) {
                    setdirectionFacing(directionMessage);
                    speakObject(directionMessage);
                    lastDirection.current = directionMessage;
                }
            }
        };

        const detectObject = async () => {
            await tf.setBackend("webgl");
            await tf.ready();

            const detectModel = await cocoSsd.load();
            console.log("Model has ran successfully");

            const runDetect = async () => {
                if(videoCam.current && canvasCam.current) {
                    const detectedObjects = await detectModel.detect(videoCam.current);
                    const context = canvasCam.current.getContext("2d");

                    const count = {};

                    context.clearRect(0, 0, videoCam.current.videoWidth, videoCam.current.videoHeight);

                    detectedObjects.forEach((o) => {
                        const [x, y, w, h] = o.bbox;
                        const label = y + 10;

                        context.strokeStyle = "green";
                        context.lineWidth = 2;
                        context.strokeRect(x, y, w, h);
                        context.fillText(o.class, x, label);

                        if(count[o.class]) {
                            count[o.class] += 1;
                        } else {
                            count[o.class] = 1;
                        }

                        speakObject(o.class);
                    });
                }
                requestAnimationFrame(runDetect);
            };
            runDetect();

            return () => {
                window.removeEventListener("deviceorientation", directionFacing);
            };
        }

        if(window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", directionFacing, true);
        }
    }, []);

    return (
        <>
        {camOverlay && <CameraOverlay onStart = {handleOverlay}/>}

        <video
            ref={videoCam}
            autoPlay
            playsInline
            style = {{
                width: '100vw', 
                height: '100vh', 
                objectFit: 'cover', 
                display: 'block'
            }}
        />
        
        <canvas
            ref={canvasCam}
            style = {{
                width: '100vw', 
                height: '100vh', 
                position: 'absolute', 
                top: 0, 
                left: 0
            }}
        />
        <div
            style = {{
                position: 'absolute',
                top: 20,
                left: 20,
                color: "white",
                fontSize: '12px'
            }}
        >
            {currentDirection}
        </div>
        </>
    );
}

export default App;
