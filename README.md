# Uncanny Boxes: A Hand-Controlled Game

This project is a fun and challenging game built with Next.js that uses your webcam and hand detection to control cubes.

## Prerequisites:

Node.js and npm (or yarn) installed on your system. You can check by running the following commands in your terminal:
```bash
node -v
npm -v # (or yarn -v)
```

## Installation:

### 1. Clone this repo:
(skip this step if you already have the files)
```bash
git clone https://github.com/sarvagyad37/uncanny-boxes-cv-game.git
```

### 2. Navigate to project directory:
```bash
cd uncanny-boxes
```

### 3. Install dependencies:
```bash
npm install
```

## Running the Development Server:

### 1. Start the development server
```bash
npm run dev
```

### 2. Open [http://localhost:3000/game](http://localhost:3000/game) in your web browser.

## How to play:

1. Click the "Start Game" button.
2. Allow access to your webcam when prompted.
3. Scroll down to ensure the entire game scene is visible.
4. Raise your hand in front of the webcam. A blue cube will appear as your player model.
5. Move your hand to control the movement of the blue cube.
6. Collect yellow cube coins to score points.
7. Avoid red boxes, touching them will end the game and display your final score.

## Developed with:
- TypeScript
- Next.js
- MediaPipe (for hand detection)
- Three.js (for rendering 3d scenes)

---
Feel free to contribute or modify this project!
