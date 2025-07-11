import React, {useEffect, useState} from "react";
import CameraOverlay from "./CameraOverlay";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechRecognition();
recog.continuous = true;
recog.lang = 'eng-US';

let run = false;

function VoiceGestureControls ({listen, onPause, onResume, onSummarize, onMute, onUnmute}) {
    useEffect(() => {
        if(listen && !run) {
            recog.start();
            run = true;

            recog.onresult = (event) => {
                const ts = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                console.log("VC: ", ts);

                if(ts.includes("pause")) {
                    onPause();
                } else if(ts.includes("resume")) {
                    onResume();
                } else if(ts.includes("summarize")) {
                    onSummarize();
                } else if(ts.includes("mute")) {
                    onMute();
                } else if(ts.includes("unmute")) {
                    onUnmute();
                }
            };

            recog.onerror = (error) => {
                console.error("VC error", error);
            };

            recog.onend = () => {
                run.current = false;
                if(listen) {
                    recog.start();
                }
            };
        }

        return () => {
            recog.stop();
        };
    }, [listen, onPause, onResume, onSummarize, onMute, onUnmute]) 
    return null;
}

export default VoiceGestureControls;