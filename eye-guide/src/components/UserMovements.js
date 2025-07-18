import {useEffect, useRef} from 'react';

function UserMovements({detectedObjects, setMoving}) {
    const prev = useRef([]);
    const update = useRef(Date.now());
    const last = useRef(false);
    const MOVEMENT_THRESHOLD = 5;

    useEffect(() => {
        if(!detectedObjects || detectedObjects.length === 0) {
            return;
        }

        const now = Date.now();
        const c = detectedObjects.map(o => {
            const [x, , w] = o.bbox;
            return x + w / 2;
        });

        if(prev.current.length === c.length) {
            let td = 0;
            
            for(let i = 0; i < c.length; i++) {
                td += Math.abs(c[i] - prev.current[i]);
            }

            const avg = td / c.length;
            const move = avg > MOVEMENT_THRESHOLD;

            if(now - update.current > 1000 && move !== lastState.current) {
                setMoving(move);
                update.current = now;
                last.current = now;
            }
        }
        prev.current = c;

    }, [detectedObjects, setMoving])
    return null;
}

export default UserMovements;