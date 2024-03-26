//This file will contain the main application logic and entry point.


import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { setupEventListeners, toggleView, remove2DEventListeners, remove3DScene } from './eventHandlers.js'
import { setupToolsEventListeners, toggleOptions, togglePencilTool, updatePencilWidth, updatePencilColor } from './toolsHandlers.js'
import { draw2DScene, drawTempLine, drawLine, redrawCanvas, logLinesData, undo, redo, createLineGeometries, draw3DScene, updateThreeDScene } from './drawingHandlers.js'

const DrawingApp = {
  canvas2d: document.querySelector('#canvas2d'),
  canvas3d: document.querySelector('#canvas3d'),
  tool: null,
  scene: null,
  renderer: null,
  camera: null,
  controls: null,
  lines: [],
  undoStack: [],
  redoStack: [],
  currentPencilColor: 'red',
  currentPencilWidth: 3,
  is3DView: false,
  optionsFlag: true,
  pencilFlag: false,

  init() {
    this.tool = this.canvas2d.getContext('2d')
    setupEventListeners.call(this)
    setupToolsEventListeners.call(this)
    draw2DScene.call(this)
  },
}

DrawingApp.init()