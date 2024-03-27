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
  optionsFlag: false,
  pencilFlag: false,

  init() {
    this.tool = this.canvas2d.getContext('2d')
    this.setupEventListeners() //Calls the setupEventListeners() method of the DrawingApp object. 'this' refers to the DrawingApp object.
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

    //So why we are using bind() method here:
    // It does not immediately invoke the function but returns a new function with the specified this value.
    //It's commonly used when you want to create a function with a specific this context to be used later, 

    // call() method : It immediately invokes the function with the specified this value and arguments.

    // This bind() method creates a new function that, when called, has this set to the value passed as an argument (in this case, this, which refers to the DrawingApp object).
    // This ensures that inside the handleMouseDown method, this refers to the DrawingApp object, even when called as an event listener.

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



  //To show and hide tools container
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
  //To show and hide tools container



  // Pencil Event Handling Methods//
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
  // Pencil Event Handling Methods//




  // Mouse Event Handling Methods//
  handleMouseDown(e) {
    this.startX = e.clientX
    this.startY = e.clientY
    this.isDrawing = true
  },

  handleMouseMove(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      //This function is responsible for drawing temporary lines on the canvas while the user is actively drawing.
      //Once the user completes the drawing action, the temporary lines drawn by this function are cleared or replaced by the final drawn lines using drawLine function.
      this.drawTempLine(this.startX, this.startY, endX, endY)
    }
  },

  handleMouseUp(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      //Unlike drawTempLine, which is used for temporary visual feedback during drawing, drawLine adds the actual line to the canvas drawing.
      this.drawLine(this.startX, this.startY, endX, endY)
      this.isDrawing = false
    }
  },
  // Mouse Event Handling Methods//



// Toggles between 2D and 3D views.
  toggleView() {
    this.is3DView = !this.is3DView

    // console.log(this.lines)

    const toolsCont = document.querySelector('.tools-cont')
    const pencilToolCont = document.querySelector('.pencil-tool-cont')

    if (this.is3DView) {

      if (!this.optionsFlag) {
        this.toggleOptions(toolsCont, pencilToolCont)
      }
      
      this.canvas2d.style.display = 'none'
      this.canvas3d.style.display = 'block'
      this.remove2DEventListeners()
      this.draw3DScene()
    } else {
      this.toggleOptions(toolsCont, pencilToolCont)

      this.canvas3d.style.display = 'none'
      this.canvas2d.style.display = 'block'
      this.remove3DScene()
      this.setupEventListeners()
      this.redrawCanvas()
    }
  },
  // Toggles between 2D and 3D views.


  // Removes event listeners for 2D canvas.
  remove2DEventListeners() {
    this.canvas2d.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas2d.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas2d.removeEventListener('mouseup', this.handleMouseUp)
  },
  // Removes event listeners for 2D canvas.



  // Removes 3D scene components.
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
  // Removes 3D scene components.



  // Draws the initial 2D scene.
  draw2DScene() {
    this.canvas2d.width = window.innerWidth
    this.canvas2d.height = window.innerHeight
    this.redrawCanvas()
  },
  // Draws the initial 2D scene.





  // Methods for drawing and managing 2D canvas.
  drawTempLine(startX, startY, endX, endY) {

    // Clear the entire canvas to remove any previous drawings
    this.tool.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height)

    // Redraw the canvas with existing permanent lines
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
  // Methods for drawing and managing 2D canvas.


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



  //3D Rendering Methods:


  
  createLineGeometries() {

    //This line calculates the center of the canvas in the 3D scene 
    const canvasCenterX = this.canvas3d.width / 2
    const canvasCenterY = this.canvas3d.height / 2
    
    // A higher value will make the lines(wall) appear larger.
    const scaleFactor = 0.01


    const lineHeight = 2 // Predefined line height
    const lineWidthFactor = 5 // Factor to multiply with pencil width
    const lineGeometries = []

    this.lines.forEach((line) => {

      //Calculates the coordinates of the line, adjusting for the canvas center and scaling factor.
      const startX = (line.startX - canvasCenterX) * scaleFactor
      const startY = (canvasCenterY - line.startY) * scaleFactor
      const endX = (line.endX - canvasCenterX) * scaleFactor
      const endY = (canvasCenterY - line.endY) * scaleFactor

      const lineShape = new THREE.Shape()

      const lineWidth = line.width * scaleFactor * lineWidthFactor

      const halfLineWidth = lineWidth / 2

      // Calculate the normal vector to the line
      const dx = endX - startX
      const dy = endY - startY
      const length = Math.sqrt(dx * dx + dy * dy)
      const normalX = -dy / length
      const normalY = dx / length

      // Define the four corners of the rectangle
      const corner1X = startX - halfLineWidth * normalX
      const corner1Y = startY - halfLineWidth * normalY
      const corner2X = startX + halfLineWidth * normalX
      const corner2Y = startY + halfLineWidth * normalY
      const corner3X = endX + halfLineWidth * normalX
      const corner3Y = endY + halfLineWidth * normalY
      const corner4X = endX - halfLineWidth * normalX
      const corner4Y = endY - halfLineWidth * normalY

      lineShape.moveTo(corner1X, corner1Y)
      lineShape.lineTo(corner2X, corner2Y)
      lineShape.lineTo(corner3X, corner3Y)
      lineShape.lineTo(corner4X, corner4Y)
      lineShape.closePath()

      const extrudeSettings = {
        depth: lineHeight,
        bevelEnabled: false,
      }

      const extrudeGeometry = new THREE.ExtrudeGeometry(
        lineShape,
        extrudeSettings
      )
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(line.color),
      })
      const lineMesh = new THREE.Mesh(extrudeGeometry, lineMaterial)

        // Rotate the line mesh to make it face upwards
        lineMesh.rotateX(Math.PI / 2);

      lineGeometries.push(lineMesh)
    })

    return lineGeometries
  },
  draw3DScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75, //FOV
      window.innerWidth / window.innerHeight, //Aspect Ratio
      0.1, //Near : Objects closer than 0.1 units will not be rendered.
      1000 //Far : Objects farther than 1000 units will not be rendered.
    )
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor('#fff')

    const lineGeometries = this.createLineGeometries()
    lineGeometries.forEach((lineMesh) => {
      this.scene.add(lineMesh)
    })

    this.camera.position.y = 2;
    this.camera.position.z = 8;

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
      this.scene.children.forEach((child) => {
        this.scene.remove(child)
      })

      const lineGeometries = this.createLineGeometries() //Calls the createLineGeometries method to generate new 3D line geometries based on the updated data.
      lineGeometries.forEach((lineMesh) => {
        this.scene.add(lineMesh)
      })
    }
  },
  //3D Rendering Methods:
}

DrawingApp.init()
