import React, {useRef, useEffect} from "react";

function PathGuidance({detectedObjects, speak, canvasRef}) {
    const guidance = useRef("none");
    const stopWarn = useRef(false);
    const hist = useRef([]);
    const zoneTime = useRef({left: 0, right: 0});

    useEffect(() => {
        if(!detectedObjects || detectedObjects.length === 0 || !canvasRef.current) {
            return;
        }

        const canvasWidth = canvasRef.current.width;
        const centerStart = canvasWidth / 3;
        const centerEnd = (canvasWidth * 2) / 3;
        const leftEnd = canvasWidth / 3;
        const rightEnd = (canvasWidth * 2) / 3;

        let bigObstacles = 0;
        let recomLeft = false;
        let recomRight = false;
        let leftClear = true;
        let rightClear = true;
        let middleBlocked = false;

        for(const o of detectedObjects) {
            const [x, y, w, h] = o.bbox;
            
            if(o.score < 0.6 || w < 150 || h < 150) {
                continue;
            }

            const c = x + w / 2;

            if(c >= centerStart && c <= centerEnd) {
                bigObstacles++;
                middleBlocked = true;
            } else if(c < centerStart) {
                recomRight = true;
                leftClear = false;
            } else if(c > centerEnd) {
                recomLeft = true;
                rightClear = false;
            }
        }

        if(middleBlocked && !leftClear && !rightClear) {
            if(guidance.current != "deadend") {
                speak("Dead end ahead, please turn around");
                guidance.current = "deadend";
            }
            return;
        }

        if(bigObstacles >= 3) {
            if(!stopWarn.current) {
                speak("There are too many obstacles ahead. Please stop walking.");
                stopWarn.current = true;
                guidance.current = "stop";
            }
            return;
        } else {
            stopWarn.current = false;
        }

        hist.current.push(guidance.current);
        if(hist.current.length > 5) {
            hist.current.shift();
        }

        if(bigObstacles === 0) {
            if(guidance.current !== "clear") {
                speak("Path ahead is clear");
                guidance.current = "clear";
            }
        } else if(recomLeft && guidance.current !== "left") {
            speak("Move a little to your left");
            guidance.current = "left";
        } else if(recomRight && guidance.current !== "right") {
            speak("Move a little to your right");
            guidance.current = "right";
        }

        if(hist.current.slice(-3).every(s => s === "left") && guidance.current === "left") {
            speak("Keep on moving to the left until clear message");
        } else if (hist.current.slice(-3).every(s => s === "right") && guidance.current === "right") {
            speak("Keep on moving to the left until clear message");
        }

        if(rightClear) {
            zoneTime.current.left++;
            if(zoneTime.current.right === 3) {
                speak("Right side is clear to walk");
            }
        } else {
            zoneTime.current.right(0);
        }
    }, [detectedObjects, speak, canvasRef]);
    return null;
}

export default PathGuidance;