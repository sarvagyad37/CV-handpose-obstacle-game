import { HandLandmarker, FilesetResolver, DrawingUtils, HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

class HandLandmarkManager {
    private static instance: HandLandmarkManager = new HandLandmarkManager();
    private results!: HandLandmarkerResult;
    handLandmarker!: HandLandmarker | null;


    private constructor() {
        this.initializeModel();
    }

    public static getInstance(): HandLandmarkManager {
        return HandLandmarkManager.instance;
    }

    initializeModel = async () => {
        this.handLandmarker = null;
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        })
    }

    getResults = () => {
        return this.results;
    }

    detectLandmarks = async (video: HTMLVideoElement, timestamp: number) => {
        if (!this.handLandmarker) {
            return;
        }

        const results = await this.handLandmarker.detectForVideo(video, timestamp);

        const handcenter = this.getHandCenter(results);

        this.results = results;
        return {results, handcenter};
    }

    getHandCenter = (results: HandLandmarkerResult) => {
        //we will just get the center of 9th landmark
        const landmarks = results.landmarks;
        if (landmarks) {
            for (const landmark of landmarks) {
                const center = this.getLandmarkCenter(landmark[9]);
                return center;
            }
        }
    }

    getLandmarkCenter = (landmark: NormalizedLandmark) => {
        return {
            x: landmark.x,
            y: landmark.y
        }
    }

    drawLandmarks = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!ctx || !this.results) {
            return;
        }

        const drawing = new DrawingUtils(ctx);
        if (this.results.landmarks) {
            for (const landmarks of this.results.landmarks) {
                drawing.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 3 });

                // get x and y coordinates of landmark at index 8
                const landmark: NormalizedLandmark = landmarks[8];
                const x = landmark.x;
                const y = landmark.y;

                // // draw a circle at the landmark
                // ctx.beginPath();
                // ctx.arc(x, y, 10, 0, 2 * Math.PI);
                // ctx.fillStyle = "#FF0000";
                // ctx.fill();

                // // draw the landmark index
                // ctx.fillStyle = "#FFFFFF";
                // ctx.font = "12px Arial";
                // ctx.fillText("8", x, y);

                // console.log(landmark);

            }
        }

    }


}

export default HandLandmarkManager;