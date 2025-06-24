import React, {useRef, useEffect, useState} from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import CameraOverlay from "./CameraOverlay";
import OverlayControls from "./OverlayControls";
import PathGuidance from "./pathGuidance";

function App() {
    const videoCam = useRef(null);
    const canvasCam = useRef(null);
    const wordsUsed = useRef(new Set());
    const [camOverlay, setOverlay] = useState(true);
    const alreadySpoken = useRef("");
    const to = useRef("");
    const [countTotal, setCountTotal] = useState(0);
    const objectsLastSeen = useRef(new Set());
    const objectWidths = useRef({});
    const previousCount = useRef(0);
    const path = useRef("unknown");
    const [isMuted, setMute] = useState(false);
    const [isPaused, setPause] = useState(false);
    const [newDetections, setND] = useState([]);
    const hazard = newSet(["knife", "stairs", "stovetop", "oven"]);

    const speakObject = async (text) => {
                if(isMuted || wordsUsed.current.has(text)) {
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

    const muteClick = () => {
        setMute(prev => !prev);
    };

    const pauseClick = () => {
        setPause(prev => !prev);
    };

    const summaryClick = () => {
        speakObject("Summarizing detected objects");
    };

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

            const detectObject = async () => {
                await tf.setBackend("webgl");
                await tf.ready();

                const detectModel = await cocoSsd.load();
                console.log("Model has ran successfully");

                const runDetect = async () => {
                    if(isPaused) {
                        requestAnimationFrame(runDetect);
                        return;
                    }

                    if(videoCam.current && canvasCam.current) {
                        const context = canvasCam.current.getContext("2d");

                        context.drawImage(videoCam.current, 0, 0, canvasCam.current.width, canvasCam.current.height);

                        const brightnessInfo = context.getImageData(0, 0, canvasCam.current.width, canvasCam.current.height);
                        let brightnessData = 0;

                        for(let i = 0; i < brightnessInfo.data.length; i += 4) {
                            const red = brightnessInfo[i];
                            const green = brightnessInfo[i + 1];
                            const blue = brightnessInfo[i + 2];

                            const average = (red + green + blue) / 3;
                            brightnessData += average;
                        }

                        const averageLight = brightnessData / (brightnessInfo.data.length / 4);

                        if(averageLight < 40) {
                            speakObject("Low light, please go to a brighter area");
                        }
                        
                        canvasCam.current.width = videoCam.current.videoWidth;
                        canvasCam.current.height = videoCam.current.videoHeight;

                        const detectedObjects = await detectModel.detect(videoCam.current, 20);

                        let pathIsBlocked = false;
                        const canvasWidth = canvasCam.current.width;
                        const centerStart = canvasWidth / 2;
                        const centerEnd = (canvasWidth * 2) / 3;

                        for(const pathDetectedObject of detectedObjects) {
                            if(pathDetectedObject.score < 0.6) {
                                continue;
                            }

                            const [bboxX, bboxY, bboxW, bboxH] = pathDetectedObject.bbox;
                            const pathObjectCenter = bboxX + bboxW / 2;

                            const isCenterPath = pathObjectCenter >= centerStart && pathObjectCenter <= centerEnd;
                            const isObstacle = bboxW > 200 || bboxH > 200;

                            if(isCenterPath && isObstacle) {
                                pathIsBlocked = true;
                                break;
                            }
                        }

                        if(pathIsBlocked && path.current !== "blocked") {
                            speakObject("Warning, path ahead is blocked");
                            path.current = "blocked";
                        } else if(!pathIsBlocked && path.current !== "clear") {
                            speakObject("Path ahead is clear");
                            path.current = "clear"
                        }

                        const validObjects = detectedObjects.filter(object => object.score > 0.6);
                        setND(validObjects);
                        setCountTotal(validObjects.length);

                        if(validObjects.length - previousCount.current > 3) {
                            speakObject("Multiple objects have entered the view");
                        }
                        previousCount.current = validObjects.length;

                        const currentObjects = new Set(validObjects.map(object => object.class));

                        const enteredInView = [...currentObjects].filter(object => !objectsLastSeen.current.has(object));
                        enteredInView.forEach(object => speakObject(`Detected ${object}`));

                        const noLongerInFrame = [...objectsLastSeen.current].filter(object => !currentObjects.has(object));
                        noLongerInFrame.forEach(object => speakObject(`${object} is no longer in view`));

                        objectsLastSeen.current = currentObjects;

                        const count = {};

                        context.clearRect(0, 0, videoCam.current.videoWidth, videoCam.current.videoHeight);

                        detectedObjects.forEach((o) => {
                            if (o.score >= 0.6) {
                                const [x, y, w, h] = o.bbox;

                                if(hazard.has(o.class)) {
                                    speakObject("Warning, hazardous objects ahead");
                                    fillerColor = "rgba(128, 0, 128, 0.2)"
                                    boxColor = "purple";
                                }

                                const previousWidth = objectWidths.current[o.class] || 0;

                                if(w > previousWidth + 30) {
                                    speakObject(`${o.class} is approaching`);
                                }
                                objectWidths.current[o.class] = w;

                                let labelY;

                                if(y > 10) {
                                    labelY = y - 5;
                                } else {
                                    labelY = y + 15;
                                }
                                
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

                                const centerObject = x + w / 2;
                                let position = "to the middle";

                                if(centerObject < canvasCam.current.width / 2) {
                                    position = "to your left";
                                } else if(centerObject > 2 * canvasCam.current.width / 3) {
                                    position = "to your right"
                                }

                                let distance = "far";

                                if(w > 250) {
                                    distance = "very close";
                                } else if(w > 100) {
                                    distance = "ahead";
                                }

                                if(distance === "very close" && position === "to the middle") {
                                    speakObject("Obstacle ahead");
                                }

                                const pdMessage = `${o.class} is ${distance}, ${position}`;
                                speakObject(pdMessage);

                                context.fillStyle = fillerColor;
                                context.fillRect(x, y, w, h);

                                context.font = "bold 18px Arial";
                                context.strokeStyle = boxColor;
                                context.lineWidth = 2;
                                context.strokeRect(x, y, w, h);
                                context.fillText(o.class, x, labelY);

                                if(count[o.class]) {
                                    count[o.class] += 1;
                                } else {
                                    count[o.class] = 1;
                                }
                            }   
                        });
                        speakCountObjects(count);
                    }
                    requestAnimationFrame(runDetect);
                };
                runDetect();
            }

            const checkReady = setInterval(() => {
                if(videoCam.current && videoCam.current.readyState === 4) {
                    detectObject();
                    clearInterval(checkReady);
                }
            });
            
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
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw', 
                height: '100vh', 
                objectFit: 'cover', 
                zIndex: 1,
            }}
        />
        
        <canvas
            ref={canvasCam}
            style = {{
                position: 'absolute', 
                top: 0, 
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2,
            }}
        />
        <div
            style = {{
                position: 'absolute',
                top: 20,
                right: 20,
                color: "white",
                fontSize: '25px',
                padding: '5px 10px',
                borderRadius: '14px',
                zIndex: 3,
            }}
        >
            Objects: {countTotal}
        </div>
        
        {!camOverlay && (
            <OverlayControls
            onPauseClick = {pauseClick}
            onVoiceClick = {muteClick}
            onSummaryClick = {summaryClick}
            isMuted = {isMuted}
            isPaused = {isPaused}
        />
        )}

        <PathGuidance
            detectedObjects = {newDetections}
            speak = {speakObject}
            canvasRef = {canvasCam}
        />
        </>
    );
}

export default App;