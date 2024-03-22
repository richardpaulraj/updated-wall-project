import * as THREE from 'three';


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let canvas2d = document.querySelector('#canvas2d');
let canvas3d = document.querySelector('#canvas3d');
let tool = canvas2d.getContext('2d');

const button = document.getElementById('toggleViewButton');
let is3DView = false;

let lines = []; // Store all lines drawn
let removedLines = []; // Array to store removed lines

let currentPencilColor = 'red'; // Default pencil color
let currentPencilWidth = 1; // Default pencil width

button.addEventListener('click', toggleView);

function toggleView() {
    is3DView = !is3DView;
    if (is3DView) {
        canvas2d.style.display = 'none';
        canvas3d.style.display = 'block';
        draw3DScene();
        // Clear lines data when switching to 3D scene
        lines = [];
    } else {
        canvas3d.style.display = 'none';
        canvas2d.style.display = 'block';
        draw2DScene();
    }
}

function draw2DScene() {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;

    // Draw lines from stored data
    lines.forEach((line) => {
        tool.beginPath();
        tool.moveTo(line.startX, line.startY);
        tool.lineTo(line.endX, line.endY);
        tool.strokeStyle = line.color;
        tool.lineWidth = line.width;
        tool.stroke();
        tool.closePath();
    });

    // Add event listeners for drawing lines
    let isDrawing = false;
    let startX, startY;

    canvas2d.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDrawing = true;
    });

    canvas2d.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            let endX = e.clientX;
            let endY = e.clientY;
            drawTempLine(startX, startY, endX, endY);
        }
    });

    canvas2d.addEventListener('mouseup', (e) => {
        if (isDrawing) {
            let endX = e.clientX;
            let endY = e.clientY;
            drawLine(startX, startY, endX, endY);
            isDrawing = false;
        }
    });

    function drawLine(startX, startY, endX, endY) {
        if (!(startX === endX && startY === endY)) {
            lines.push({
                startX,
                startY,
                endX,
                endY,
                color: currentPencilColor,
                width: currentPencilWidth,
            });
            redrawCanvas();
            saveDrawing();
            logLinesData();
        }
    }

    function drawTempLine(startX, startY, endX, endY) {
        tool.clearRect(0, 0, canvas2d.width, canvas2d.height);
        redrawCanvas(); // Redraw all lines
        tool.beginPath();
        tool.moveTo(startX, startY);
        tool.lineTo(endX, endY);
        tool.strokeStyle = currentPencilColor; // Update current color
        tool.lineWidth = currentPencilWidth; // Update current width
        tool.stroke();
        tool.closePath();
    }

    function redrawCanvas() {
        tool.clearRect(0, 0, canvas2d.width, canvas2d.height);
        lines.forEach((line) => {
            tool.beginPath();
            tool.moveTo(line.startX, line.startY);
            tool.lineTo(line.endX, line.endY);
            tool.strokeStyle = line.color;
            tool.lineWidth = line.width;
            tool.stroke();
            tool.closePath();
        });
    }

    function saveDrawing() {
        // Not implemented as we are not using undo/redo
    }

    function logLinesData() {
        console.log('Lines drawn:');
        lines.forEach((line, index) => {
            console.log(
                `Line ${index + 1}: startX=${line.startX}, startY=${line.startY}, endX=${line.endX}, endY=${line.endY}`
            );
        });
    }
}

function draw3DScene() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas: canvas3d });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('#fff');

  // Create the surface mesh
  // const floor = new THREE.Mesh(
  //   new THREE.BoxGeometry(10, 0.1, 10),
  //   new THREE.MeshBasicMaterial({ color: '#DDDDDD' })
  // );
  // scene.add(floor);

  // Define the center of the canvas
  const canvasCenterX = canvas3d.width / 2;
  const canvasCenterY = canvas3d.height / 2;

  // Scale factor to fit lines within the bounds of the surface
  const scaleFactor = 0.02;

  // Create a group to hold all the lines
  const linesGroup = new THREE.Group();

  // Draw lines in 3D space based on the lines data from the 2D canvas
  lines.forEach((line) => {
    // Calculate the position of the line relative to the canvas center
    const startX = (line.startX - canvasCenterX) * scaleFactor;
    const startY = (canvasCenterY - line.startY) * scaleFactor; // Adjust the y-coordinate to correct orientation
    const endX = (line.endX - canvasCenterX) * scaleFactor;
    const endY = (canvasCenterY - line.endY) * scaleFactor; // Adjust the y-coordinate to correct orientation

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(startX, 0.1, startY), // Raise the line slightly above the surface
      new THREE.Vector3(endX, 0.1, endY), // Raise the line slightly above the surface
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const lineObject = new THREE.Line(lineGeometry, lineMaterial);

    linesGroup.add(lineObject); // Add the line to the group
  });

  // Rotate the entire group of lines
  linesGroup.rotation.y = Math.PI ; // Rotate 90 degrees around the y-axis
  linesGroup.rotation.z = Math.PI  ; // Rotate 90 degrees around the y-axis
  linesGroup.rotation.x = Math.PI /2; // Rotate 90 degrees around the y-axis



  // Add the group of lines to the scene
  scene.add(linesGroup);

  camera.position.y = 3;
  camera.position.z = 8;

  const controls = new OrbitControls(camera, canvas3d);
  controls.enableDamping = true;

  const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}





// Initial drawing
draw2DScene();
