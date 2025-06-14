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
    const alreadySpoken = useRef("");
    const to = useRef("");

    useEffect(() => { 
        if(!camOverlay) {
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

            const speakCountObjects = (objectCount) => {
                if(alreadySpoken.current) {
                    return;
                }

                let sentenceParts = [];

                for(let key in objectCount) {
                    const count = objectCount[key];

                    if(count === 1) {
                        sentenceParts.push(`one ${key},`);
                    } else {
                        sentenceParts.push(`${count} ${key}s,`);
                    }
                }

                if(sentenceParts.length > 0) {
                        const fullSentence = "There is " + sentenceParts.join(", ");
                        const utter = new SpeechSynthesisUtterance(fullSentence);
                        utter.rate = 1;
                        window.speechSynthesis.speak(utter);

                        alreadySpoken.current = true;

                        to.current = setTimeout(() => {
                            alreadySpoken.current = false;
                        }, 10000);
                }
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
                            if (o.score >= 0.6) {
                                const [x, y, w, h] = o.bbox;
                                const label = y + 10;
                                
                                let tooClose = false;
                                if(w > 250) {
                                    tooClose = true;
                                }

                                let boxColor = "";
                                let fillerColor = "";

                                if(tooClose) {
                                    fillerColor = "rgba(255, 0, 0, 0.2)";
                                    boxColor = "red";
                                } else {
                                    fillerColor = "rgba(0, 255, 0, 0.2)";
                                    boxColor = "green";
                                }
                                
                                context.fillStyle = fillerColor;
                                context.fillRect(x, y, w, h);

                                context.strokeStyle = boxColor;
                                context.lineWidth = 2;
                                context.strokeRect(x, y, w, h);
                                context.fillText(o.class, x, label);

                                if(count[o.class]) {
                                    count[o.class] += 1;
                                } else {
                                    count[o.class] = 1;
                                }
                                speakObject(o.class);
                            }   
                        });
                        speakCountObjects(count);
                    }
                    requestAnimationFrame(runDetect);
                };
                runDetect();

                return () => {
                    window.removeEventListener("deviceorientation", directionFacing);
                };
            }

            const checkReady = setInterval(() => {
                if(videoCam.current && videoCam.current.readyState === 4) {
                    detectObject();
                    clearInterval(checkReady);
                }
            });

            if(window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", directionFacing, true);
            }
            
            startCam();
        }
    }, [camOverlay]);

    return (
        <>
        {camOverlay && <CameraOverlay onEntry = {() => setOverlay(false)}/>}
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