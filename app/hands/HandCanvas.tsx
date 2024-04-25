"use client";

import { useEffect, useState, useRef, use } from "react";
import HandLandmarkManager from "@/class/HandLandmarkManager";
import DrawCanvas from "@/app/hands/DrawCanvas";

const HandCanvas = () => {

    const startButton = document.getElementById("start") as HTMLButtonElement;

    const videoRef = useRef<HTMLVideoElement>(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef(0);

    const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

    const animate = () => {
        if (
            videoRef.current &&
            videoRef.current.currentTime !== lastVideoTimeRef.current
        ) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            try {
                const handLandmarkManager = HandLandmarkManager.getInstance();
                handLandmarkManager.detectLandmarks(videoRef.current, Date.now());
            } catch (e) {
                console.log(e);
            }
        }
        requestRef.current = requestAnimationFrame(animate);
    };


    //getUserCamera function
    const getUserCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setVideoSize({
                        width: videoRef.current!.offsetWidth,
                        height: videoRef.current!.offsetHeight,
                    });
                    videoRef.current!.play();

                    // Start animation once video is loaded
                    requestRef.current = requestAnimationFrame(animate);
                };
            }
        } catch (e) {
            console.log(e);
            alert("Failed to load webcam!");
        }
    };


    //use useEffect to get user camera on button click
    
    // startButton.addEventListener("click", getUserCamera);

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center">
                <button id="start" onClick={getUserCamera}>Start</button>
                <video
                    className="w-full h-auto"
                    ref={videoRef}
                    loop={true}
                    muted={true}
                    autoPlay={true}
                    playsInline={true}
                ></video>
                <DrawCanvas width={videoSize.width} height={videoSize.height} />
            </div>
        </div>
    )
}

export default HandCanvas;