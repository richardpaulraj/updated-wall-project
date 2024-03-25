import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
    this.setupEventListeners()
    this.setupToolsEventListeners()
    this.draw2DScene()
  },

  setupEventListeners() {
    const button = document.getElementById('toggleViewButton')
    button.addEventListener('click', () => this.toggleView())

    const undoButton = document.querySelector('.undo')
    undoButton.addEventListener('click', () => this.undo())

    const redoButton = document.querySelector('.redo')
    redoButton.addEventListener('click', () => this.redo())

    this.canvas2d.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas2d.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas2d.addEventListener('mouseup', this.handleMouseUp.bind(this))
  },

  setupToolsEventListeners() {
    const optionsCont = document.querySelector('.options-cont')
    const toolsCont = document.querySelector('.tools-cont')
    const pencilToolCont = document.querySelector('.pencil-tool-cont')
    const pencil = document.querySelector('.pencil')
    const pencilWidth = document.querySelector('.pencil-width')
    const pencilColors = document.querySelectorAll('.pencil-color')

    optionsCont.addEventListener('click', () =>
      this.toggleOptions(toolsCont, pencilToolCont)
    )
    pencil.addEventListener('click', () =>
      this.togglePencilTool(pencilToolCont)
    )
    pencilWidth.addEventListener('input', () =>
      this.updatePencilWidth(pencilWidth.value)
    )

    pencilColors.forEach((color) => {
      color.addEventListener('click', () =>
        this.updatePencilColor(color.classList[0])
      )
    })
  },

  toggleOptions(toolsCont, pencilToolCont) {
    this.optionsFlag = !this.optionsFlag
    const optionsCont = document.querySelector('.options-cont')
    const iconElem = optionsCont.children[0]

    if (this.optionsFlag) {
      iconElem.classList.remove('fa-xmark')
      iconElem.classList.add('fa-bars')
      toolsCont.style.display = 'none'
      pencilToolCont.style.display = 'none'
    } else {
      iconElem.classList.remove('fa-bars')
      iconElem.classList.add('fa-xmark')
      toolsCont.style.display = 'flex'
    }
  },

  togglePencilTool(pencilToolCont) {
    this.pencilFlag = !this.pencilFlag
    pencilToolCont.style.display = this.pencilFlag ? 'block' : 'none'
  },

  updatePencilWidth(width) {
    this.currentPencilWidth = width
  },

  updatePencilColor(color) {
    this.currentPencilColor = color
  },

  handleMouseDown(e) {
    this.startX = e.clientX
    this.startY = e.clientY
    this.isDrawing = true
  },

  handleMouseMove(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      this.drawTempLine(this.startX, this.startY, endX, endY)
    }
  },

  handleMouseUp(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      this.drawLine(this.startX, this.startY, endX, endY)
      this.isDrawing = false
    }
  },

  toggleView() {
    this.is3DView = !this.is3DView
    if (this.is3DView) {
      this.canvas2d.style.display = 'none'
      this.canvas3d.style.display = 'block'
      this.remove2DEventListeners()
      this.draw3DScene()
    } else {
      this.canvas3d.style.display = 'none'
      this.canvas2d.style.display = 'block'
      this.remove3DScene()
      this.setupEventListeners()
      this.redrawCanvas()
    }
  },

  remove2DEventListeners() {
    this.canvas2d.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas2d.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas2d.removeEventListener('mouseup', this.handleMouseUp)
  },

  remove3DScene() {
    if (this.renderer) {
      cancelAnimationFrame(this.animationId)
      this.renderer.dispose()
      this.renderer = null
      this.scene.dispose()
      this.scene = null
      this.camera = null
      this.controls = null
    }
  },

  draw2DScene() {
    this.canvas2d.width = window.innerWidth
    this.canvas2d.height = window.innerHeight
    this.redrawCanvas()
  },

  drawTempLine(startX, startY, endX, endY) {
    this.tool.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height)
    this.redrawCanvas()
    this.tool.beginPath()
    this.tool.moveTo(startX, startY)
    this.tool.lineTo(endX, endY)
    this.tool.strokeStyle = this.currentPencilColor
    this.tool.lineWidth = this.currentPencilWidth
    this.tool.stroke()
    this.tool.closePath()
  },

  drawLine(startX, startY, endX, endY) {
    if (!(startX === endX && startY === endY)) {
      const line = {
        startX,
        startY,
        endX,
        endY,
        color: this.currentPencilColor,
        width: this.currentPencilWidth,
      }

      this.undoStack.push(this.lines.slice())
      this.redoStack = []
      this.lines.push(line)
      this.redrawCanvas()
      this.logLinesData()

      if (this.is3DView) {
        this.updateThreeDScene()
      }
    }
  },

  redrawCanvas() {
    this.tool.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height)
    this.lines.forEach((line) => {
      this.tool.beginPath()
      this.tool.moveTo(line.startX, line.startY)
      this.tool.lineTo(line.endX, line.endY)
      this.tool.strokeStyle = line.color
      this.tool.lineWidth = line.width
      this.tool.stroke()
      this.tool.closePath()
    })
  },

  saveDrawing() {
    // Not implemented as we are not using undo/redo
  },

  logLinesData() {
    console.log('Lines drawn:')
    this.lines.forEach((line, index) => {
      console.log(
        `Line ${index + 1}: startX=${line.startX}, startY=${
          line.startY
        }, endX=${line.endX}, endY=${line.endY}`
      )
    })
  },

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(this.lines.slice())
      this.lines = this.undoStack.pop()
      this.redrawCanvas()

      if (this.is3DView) {
        this.updateThreeDScene()
      }
    }
  },

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(this.lines.slice())
      this.lines = this.redoStack.pop()
      this.redrawCanvas()

      if (this.is3DView) {
        this.updateThreeDScene()
      }
    }
  },

  draw3DScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor('#fff')

    const canvasCenterX = this.canvas3d.width / 2
    const canvasCenterY = this.canvas3d.height / 2
    const scaleFactor = 0.02
    const linesGroup = new THREE.Group()

    this.lines.forEach((line) => {
      const startX = (line.startX - canvasCenterX) * scaleFactor
      const startY = (canvasCenterY - line.startY) * scaleFactor
      const endX = (line.endX - canvasCenterX) * scaleFactor
      const endY = (canvasCenterY - line.endY) * scaleFactor

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, 0.1, startY),
        new THREE.Vector3(endX, 0.1, endY),
      ])
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(line.color),
      })
      const lineObject = new THREE.Line(lineGeometry, lineMaterial)

      linesGroup.add(lineObject)
    })

    linesGroup.rotation.y = Math.PI
    linesGroup.rotation.z = Math.PI
    linesGroup.rotation.x = Math.PI / 2

    this.scene.add(linesGroup)

    this.camera.position.y = 3
    this.camera.position.z = 8

    this.controls = new OrbitControls(this.camera, this.canvas3d)
    this.controls.enableDamping = true

    const animate = () => {
      if (this.renderer) {
        this.animationId = requestAnimationFrame(animate)
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
      }
    }

    animate()
  },

  updateThreeDScene() {
    if (this.scene && this.renderer) {
      this.scene.remove(this.scene.children[0])

      const canvasCenterX = this.canvas3d.width / 2
      const canvasCenterY = this.canvas3d.height / 2
      const scaleFactor = 0.02
      const linesGroup = new THREE.Group()

      this.lines.forEach((line) => {
        const startX = (line.startX - canvasCenterX) * scaleFactor
        const startY = (canvasCenterY - line.startY) * scaleFactor
        const endX = (line.endX - canvasCenterX) * scaleFactor
        const endY = (canvasCenterY - line.endY) * scaleFactor

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(startX, 0.1, startY),
          new THREE.Vector3(endX, 0.1, endY),
        ])
        const lineMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(line.color),
        })
        const lineObject = new THREE.Line(lineGeometry, lineMaterial)

        linesGroup.add(lineObject)
      })

      linesGroup.rotation.y = Math.PI
      linesGroup.rotation.z = Math.PI
      linesGroup.rotation.x = Math.PI / 2

      this.scene.add(linesGroup)
    }
  },
}

DrawingApp.init()
