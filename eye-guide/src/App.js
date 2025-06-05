import React, {useRef, useEffect} from "react";

function App() {
    const videoCam = useRef(null);

    useEffect(() => {
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
        startCam();
    }, []);

    return (
        <video>
            ref = {videoCam}
            autoPlay
            playsInLine

            style = {{
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                display: 'block'
            }}
        </video>
    );
}

export default App;
