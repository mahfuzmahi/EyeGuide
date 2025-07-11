import React, {useEffect, useRef} from "react";

function MemoryGuide({detectedObjects, speak}) {
    const log = useRef([]);
    const time = useRef(Date.now());
    const stationary = 15000;
    const seenAgain = 30000;

    useEffect(() => {
        if(detectedObjects || detectedObjects.length === 0) {
            return;
        }

        const now = Date.now();

        log.current = log.current.filter(
            (entry) => now - entry.timestamp < 120000
        );

        const c = detectedObjects.map((o) => o.class);

        log.current.push({
            timestamp: now,
            objects: c
        });

        const hist = {};
        log.current.forEach((e) => {
            e.objects.forEach(o => {
                if(hist[o]) {
                    hist[o]++;
                } else {
                    hist[o] = 1;
                }
            });
        });

        const recent = log.current.slice(-5);
        const variation = new Set(recent.flatMap((e) => e.objects)).size;

        if(variation < 3 && now - time.current > stationary) {
            speak("You may be standing still, would you like to retrace your steps?");
            time.current = now;
            return;
        }
        for(const o in hist) {
            if(hist[o] > 6 && now - time.current > seenAgain) {
                speak(`You have seen ${o} several times, you may have been in this area already`);
                time.current = now;
                break;
            }
        } 
    }, [detectedObjects, speak])
    return null;
}

export default MemoryGuide;