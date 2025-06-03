import React, {useRef, useEffect} from 'react';

function CameraFeed() {
    const videoRef = useRef(null);

    useEffect(() => {
        const startCamera = async() => {
            try {
                const streamCamera = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {ideal: 'environment'}
                    },
                    audio: false
                })

                if(videoRef.current) {
                    videoRef.current.srcObject = streamCamera;
                }
            } catch(error) {
                console.log("Unable to access camera", error);
                alert("Camera access required in order for EyeGuide to work!");
            }
        };
        startCamera(); 
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline

            style = {{
                width: '100vw', height: '100vh', objectFit: 'cover', display: 'block'
            }}
        />
    );
}

export default CameraFeed;