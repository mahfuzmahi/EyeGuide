import React, {useRef, useEffect} from "react";

function PathGuidance({detectedObjects, speak, canvasRef}) {
    const guidance = useRef("none");
    const stopWarn = useRef(false);

    useEffect(() => {
        if(!detectedObjects || detectedObjects.length === 0 || !canvasRef.current) {
            return;
        }

        const canvasWidth = canvasRef.current.width;
        const centerStart = canvasWidth / 3;
        const centerEnd = (canvasWidth * 2) / 3;

        let bigObstacles = 0;
        let recomLeft = false;
        let recomRight = false;

        for(const o of detectedObjects) {
            const [x, y, w, h] = o.bbox;
            
            if(o.score < 0.6 || w < 150 || h < 150) {
                continue;
            }

            const c = x + w / 2;

            if(c >= centerStart && c <= centerEnd) {
                bigObstacles++;
            } else if(c < centerStart) {
                recomRight = true;
            } else if(c > centerEnd) {
                recomleft = true;
            }
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
    })
}