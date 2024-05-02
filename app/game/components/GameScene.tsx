"use client";
import HandLandmarkManager from '@/class/HandLandmarkManager';
import * as THREE from 'three';
import { useRef, useState } from 'react';

import DrawCanvas from '@/app/hands/DrawCanvas';

export default function GameScene() {

    //create a scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //create a renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //remove the game-scene div if it exists
    let gameScene = document.getElementById("game-scene") as HTMLDivElement;
    //tailwind css position fixed, top 0, left 0, z-index 0
    gameScene.style.zIndex = "-2"
    gameScene.className = "absolute";
    gameScene.appendChild(renderer.domElement);

    const targetFPS = 120;
    const timeInterval = 1000 / targetFPS;  // Time in milliseconds per frame
    let then = Date.now();

    const requestRef = useRef(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastVideoTimeRef = useRef(-1);

    //create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    //position the camera
    camera.position.z = 5;

    //create red cubes as obstacles, the player has to avoid them, they are smaller than the player, if the player collides with them, the game is over
    const obstacles: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];
    const obstacleGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = 0; i < 3; i++) {
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.x = Math.random() * 10 - 5;
        obstacle.position.y = Math.random() * 10 - 5;
        scene.add(obstacle);
        obstacles.push(obstacle);
    }

    // create coins that the player has to collect, they are smaller than the player, 
    // if the player collides with them, the player gets a point
    const coins: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];
    const coinGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const coinMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    for (let i = 0; i < 10; i++) {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.position.x = Math.random() * 10 - 5;
        coin.position.y = Math.random() * 10 - 5;
        scene.add(coin);
        coins.push(coin);
    }

    //create score text
    const scoreElement = document.createElement("div");

    scoreElement.className = "score";

    scoreElement.innerText = '';

    document.body.appendChild(scoreElement);
    let score = 0;

    //create a clock
    const clock = new THREE.Clock();

    //collision detection
    const playerBox = new THREE.Box3().setFromObject(cube);
    const obstacleBox = new THREE.Box3();
    const coinBox = new THREE.Box3();

    //get hands x and y coordinates
    let handX: number | undefined = 0;
    let handY: number | undefined = 0;

    //create a video element, this will be used to get the hand x and y coordinates
    const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

    //get user camera
    const getUserCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setVideoSize({
                        width: 320,
                        height: 240,
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

    let prevHandX: number | undefined = 0;
    let prevHandY: number | undefined = 0;

    //update hand x and y coordinates
    const updateHandCoordinates = async () => {
        if (
            videoRef.current &&
            videoRef.current.currentTime !== lastVideoTimeRef.current
        ) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            try {
                const handLandmarkManager = HandLandmarkManager.getInstance();
                const res = await handLandmarkManager.detectLandmarks(videoRef.current, clock.getElapsedTime() * 1000);
                //if no hands are detected, use the previous hand x and y coordinates, otherwise use the new hand x and y coordinates and update the previous hand x and y coordinates
                if (res) {
                    handX = res?.handcenter?.x;
                    handY = res?.handcenter?.y;

                    //flip x and y coordinates
                    handX = 1 - handX!;

                    prevHandX = handX;
                    prevHandY = handY;
                } else {
                    handX = prevHandX;
                    handY = prevHandY;
                }

                // console.log(handX, handY);

            } catch (e) {
                console.log(e);
            }
        }
    }

    //animate function
    const animate = async () => {

        //update hand x and y coordinates
        await updateHandCoordinates();

        // FPS and Timing Control
        const now = Date.now();
        const elapsed = now - then;

        if (elapsed > timeInterval) {
            then = now - (elapsed % timeInterval);

            //move the player
            cube.position.x = handX! * 10 - 5;
            cube.position.y = -handY! * 10 + 5;

            //move the obstacles
            obstacles.forEach(obstacle => {
                obstacle.position.y -= 0.1;
                if (obstacle.position.y < -5) {
                    obstacle.position.y = 5;
                    obstacle.position.x = Math.random() * 10 - 5;
                }
            });

            //move the coins
            coins.forEach(coin => {
                coin.position.y -= 0.1;
                if (coin.position.y < -5) {
                    coin.position.y = 5;
                    coin.position.x = Math.random() * 10 - 5;
                }
            });

            //check for collisions
            playerBox.setFromObject(cube);
            obstacles.forEach(obstacle => {
                obstacleBox.setFromObject(obstacle);
                if (playerBox.intersectsBox(obstacleBox)) {
                    if (handX && handY) { gameOver() }
                }
            });

            coins.forEach(coin => {
                coinBox.setFromObject(coin);
                if (playerBox.intersectsBox(coinBox)) {
                    // check hands not null
                    if (handX && handY) {
                        score++;
                        scoreElement.innerText = `Score: ${score}`;
                        // PlayAudio();

                        //reset coin position
                        coin.position.y = 5;
                        coin.position.x = Math.random() * 10 - 5;
                    }
                }
            });

            //render the scene
            renderer.render(scene, camera);
        }

        //request next frame
        requestRef.current = requestAnimationFrame(animate);
    };

    //gameOver
    const gameOver = () => {
        cancelAnimationFrame(requestRef.current);
        //alert the user, gameover, score, restart the game
        alert(`Game Over! Your score is ${score}`);
        // PlayGameOverAudio();

        //reset score
        score = 0;
        scoreElement.innerText = `Score: ${score}`;

    };
    
    //start the game
    const startup = () => {
        getUserCamera();
        //delete the start button
        let startButton = document.getElementById("start") as HTMLButtonElement;
        startButton.remove();
    }
    
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="flex justify-center">
                    <button id="start" className="m-4 p-4 bg-blue-500 text-white rounded-lg" onClick={startup}>Start Game</button>
                    <video
                        className="fixed top-0 left-0"
                        ref={videoRef}
                        loop={true}
                        muted={true}
                        autoPlay={true}
                        playsInline={true}
                        style={{ zIndex: -1 }}
                        width={videoSize.width}
                        height={videoSize.height}
                    ></video>
                    <style>
                        {`
                            .score{
                                color: white;
                                position: fixed;
                                top: 0;
                                right: 0;
                            }
                            
                            #drawCanvas {
                                position: fixed;
                                top: 0;
                                left: 0;
                            }                            
                        `}
                    </style>
                    
                    <DrawCanvas width={videoSize.width} height={videoSize.height} />
                </div>
            </div>
        </>
    )
}