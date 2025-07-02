import {useEffect, useRef} from 'react';

function UserMovements({detectedObjects, setMoving}) {
    const prev = useRef([]);
    const update = useRef(Date.now());

    useEffect(() => {
        if(!detectedObjects || detectedObjects.length === 0) {
            return;
        }

        const now = Date.now();
        const c = detectedObjects.map(o => {
            const [x, w] = o.bbox;
            return x + w / 2;
        });

        
    })
}