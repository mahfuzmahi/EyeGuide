import React, {useEffect, useRef} from "react";

function MemoryGuide({detectedObjects, speak}) {
    const log = useRef([]);
    const time = useRef(Date.now());

    const stationary = 15000;
    const seenAgain = 30000;
    const mWindow = 120000;

    useEffect(() => {
        if(!detectedObjects || detectedObjects.length === 0) {
            return;
        }

        const now = Date.now();

        log.current = log.current.filter(
            (entry) => now - entry.timestamp < mWindow
        );

        const c = detectedObjects.map((o) => o.class);

        log.current.push({
            timestamp: now,
            objects: c
        });

        const freq = {};
        for (const entry of log.current) {
            for (const obj of entry.objects) {
                freq[obj] = (freq[obj] || 0) + 1;
            }
        }

        const recent = log.current.slice(-5);
        const variation = new Set(recent.flatMap((e) => e.objects)).size;

        if(variation < 3 && now - time.current > stationary) {
            speak("You may be standing still, would you like to retrace your steps?");
            time.current = now;
            return;
        }
        for(const o in freq) {
            if(freq[o] > 6 && now - time.current > seenAgain) {
                speak(`You have seen ${o} several times, you may have been in this area already`);
                time.current = now;
                break;
            }
        } 
    }, [detectedObjects, speak])
    return null;
}

export default MemoryGuide;