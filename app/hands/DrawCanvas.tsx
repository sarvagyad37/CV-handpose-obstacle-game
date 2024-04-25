import HandLandmarkManager from "@/class/HandLandmarkManager";
import { useEffect, useRef, useState } from "react";

interface DrawCanvasProps {
    width: number;
    height: number;
}

const DrawCanvas = ({ width, height }: DrawCanvasProps) => {
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef(0);

    const animate = () => {
        if (drawCanvasRef.current) {
            drawCanvasRef.current.width = width;
            drawCanvasRef.current.height = height;

            const handLandmarkManager = HandLandmarkManager.getInstance();
            handLandmarkManager.drawLandmarks(drawCanvasRef.current);
        }
        requestRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, );

    return (
        <canvas
            className="absolute"
            style={{ width: width, height: height, transform: "scaleX(-1)" }}
            ref={drawCanvasRef}
        ></canvas>
    );
}

export default DrawCanvas;