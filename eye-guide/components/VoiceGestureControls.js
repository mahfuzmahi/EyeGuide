import React, {useEffect, useState} from "react";
import CameraOverlay from "./CameraOverlay";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechRecognition();
recog.continouus = true;
recog.lang = 'eng-US';

useEffect(() => {
    if(!CameraOverlay) {
        recog.start();

        recog.onresult = (event) => {
            const ts = event.results[event.results.length - 1][0].ts.toLowerCase().trim();
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

        recog.onerror = () => {
            console.error("VC error", error);
        }
    }
}) 
