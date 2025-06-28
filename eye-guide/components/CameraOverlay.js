import React from 'react';

const CameraOverlay = ({onEntry}) => {
    return (
        <div
            onClick = {onEntry}
            style = {{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'center',
                color: 'black',
                backgroundColor: 'transparent',
                fontSize: '30px',
                zIndex: '9999',
                alignItems: 'center',
                transition: 'fade'
            }}
        >
            Tap anywhere for Camera access <br/>
        </div>
    );
};

export default CameraOverlay;