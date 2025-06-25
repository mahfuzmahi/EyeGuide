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
    })
}