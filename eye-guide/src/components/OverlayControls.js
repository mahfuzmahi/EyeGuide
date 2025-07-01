import React from "react";

function OverlayControls({
    onPauseClick,
    onVoiceClick,
    onSummaryClick,
    isMuted,
    isPaused
}) {
    const PauseButton = () => {
        if (isPaused) {
            return "Resume";
        } else {
            return "Pause";
        }
    }

    const MuteButton = () => {
        if (isMuted) {
            return "Unmute";
        } else {
            return "Mute";
        }
    }

    return (
        <>
        <div
            style = {{
                width: '100%',
                height: "50px",
                backgroundColor: '#28282B',
                bottom: 0,
                left: 0,
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                color: 'white',
                fontsize: '16px',
                zIndex: 10,
            }}
        >
            <button onClick = {onPauseClick} style = {button} className="glow-click">
            {PauseButton()}
            </button>
            <button onClick = {onSummaryClick} style = {button} className="glow-click">
            Summarize
            </button>
            <button onClick = {onVoiceClick} style = {button} className="glow-click">
            {MuteButton()}
            </button>
        </div>
        </>
    );
}

const button =  {
    color: 'white',
    fontsize: '16px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: '2px solid white',
    overflow: 'hidden',
    transition: 'all 0.3s ease',

};

export default OverlayControls;