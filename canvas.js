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

  handleWallOutlineToggle(event) {
    const isChecked = event.target.checked
    if (isChecked) {
      console.log('Wall outline is ON')
      // Add your code to perform actions when the wall outline is ON
    } else {
      console.log('Wall outline is OFF')
      // Add your code to perform actions when the wall outline is OFF
    }
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

  toggleButtonOutlineWall() {
    const toggleBtn = document.querySelector('.toggle-btn')
    const isChecked = toggleBtn.classList.toggle('checked')
    if (isChecked) {
      // Perform actions when toggle button is checked (toggled on)
      console.log('Toggle button is ON')
      // Add your code to perform actions when the toggle button is ON
    } else {
      // Perform actions when toggle button is unchecked (toggled off)
      console.log('Toggle button is OFF')
      // Add your code to perform actions when the toggle button is OFF
    }
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
    if (e.shiftKey) {
      // Check if the mouse is pressed with the shift key
      const mouseX = e.clientX
      const mouseY = e.clientY

      // Check if the mouse is hovering over any line
      this.lines.forEach((line, index) => {
        if (this.isPointOnLine(mouseX, mouseY, line)) {
          // If the mouse is hovering over a line, set the index of the line being dragged
          this.draggedLineIndex = index
          this.dragStartX = mouseX
          this.dragStartY = mouseY
          this.originalStartX = line.startX
          this.originalStartY = line.startY
          this.originalEndX = line.endX
          this.originalEndY = line.endY
        }
      })
    } else {
      // If the shift key is not pressed, handle it as a pencil drawing action
      this.startX = e.clientX
      this.startY = e.clientY
      this.isDrawing = true
    }
  },

  handleMouseMove(e) {
    if (this.draggedLineIndex !== null) {
      // If a line is being dragged, update its coordinates based on mouse movement
      const mouseX = e.clientX
      const mouseY = e.clientY
      const line = this.lines[this.draggedLineIndex]
      const offsetX = mouseX - this.dragStartX
      const offsetY = mouseY - this.dragStartY
      line.startX = this.originalStartX + offsetX
      line.startY = this.originalStartY + offsetY
      line.endX = this.originalEndX + offsetX
      line.endY = this.originalEndY + offsetY
      this.redrawCanvas()
    } else if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      // Handle pencil drawing action
      this.drawTempLine(this.startX, this.startY, endX, endY)
    }
  },

  handleMouseUp(e) {
    console.log(this.lines)
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      // If drawing with the pencil tool, complete the line
      this.drawLine(this.startX, this.startY, endX, endY)
      this.isDrawing = false
    }
    // Reset the draggedLineIndex when mouse is released
    this.draggedLineIndex = null
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

    // Add event listener for mousemove to detect hovering over lines
    this.canvas2d.addEventListener(
      'mousemove',
      this.handleMouseHover.bind(this)
    )
  },

  isPointOnLine(pointX, pointY, line) {
    const startX = line.startX
    const startY = line.startY
    const endX = line.endX
    const endY = line.endY

    // Calculate the distance from the point to the line segment
    const distanceToStart = Math.sqrt(
      (pointX - startX) ** 2 + (pointY - startY) ** 2
    )
    const distanceToEnd = Math.sqrt((pointX - endX) ** 2 + (pointY - endY) ** 2)
    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)

    // Calculate the sum of distances from the point to the endpoints of the line segment
    const distanceSum = distanceToStart + distanceToEnd

    // Check if the sum of distances is approximately equal to the length of the line segment
    // Using a very small tolerance value to ensure accuracy
    const tolerance = 0.1 // Adjust as needed
    return Math.abs(distanceSum - lineLength) < tolerance
  },

  handleMouseHover(e) {
    const mouseX = e.clientX
    const mouseY = e.clientY

    // Clear canvas
    this.tool.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height)

    // Redraw canvas with existing lines
    this.redrawCanvas()

    // Check for hover effect
    this.lines.forEach((line) => {
      this.tool.beginPath()
      this.tool.moveTo(line.startX, line.startY)
      this.tool.lineTo(line.endX, line.endY)

      // Check if mouse is on the line
      if (this.isPointOnLine(mouseX, mouseY, line)) {
        // Change color to Gold Color if Shift key is pressed
        if (e.shiftKey) {
          this.tool.strokeStyle = 'gold'
        } else {
          this.tool.strokeStyle = line.color
        }
      } else {
        this.tool.strokeStyle = line.color
      }

      this.tool.lineWidth = line.width
      this.tool.stroke()
      this.tool.closePath()
    })
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
        circleRadius: 5, // Radius of the circle at the end of the line
      }

      this.undoStack.push(this.lines.slice())
      this.redoStack = []
      this.lines.push(line)
      this.redrawCanvas()
      this.drawCircle(startX, startY, line.circleRadius) // Draw circle at start point
      this.drawCircle(endX, endY, line.circleRadius) // Draw circle at end point
      this.logLinesData()

      if (this.is3DView) {
        this.updateThreeDScene()
      }
    }
  },
  // Implement event listeners for mouse events on the circles
  setupCircleEventListeners() {
    this.canvas2d.addEventListener(
      'mousedown',
      this.handleCircleMouseDown.bind(this)
    )
    this.canvas2d.addEventListener(
      'mousemove',
      this.handleCircleMouseMove.bind(this)
    )
    this.canvas2d.addEventListener(
      'mouseup',
      this.handleCircleMouseUp.bind(this)
    )
  },

  // Handle mouse down event on the circles
  handleCircleMouseDown(e) {
    if (e.shiftKey) {
      const mouseX = e.clientX
      const mouseY = e.clientY

      this.lines.forEach((line, index) => {
        // Check if the mouse is pressed on the circle at the end of the line
        if (
          this.isPointOnCircle(
            mouseX,
            mouseY,
            line.endX,
            line.endY,
            line.circleRadius
          )
        ) {
          // If yes, set the index of the line and the circle being dragged
          this.draggedLineIndex = index
          this.draggedCircleIndex = index
          this.dragStartX = mouseX
          this.dragStartY = mouseY
          this.dragOffsetX = mouseX - line.endX
          this.dragOffsetY = mouseY - line.endY
        }
      })
    }
  },
  // Handle mouse move event on the circles
  handleCircleMouseMove(e) {
    if (this.draggedLineIndex !== null && this.draggedCircleIndex !== null) {
      // If a circle is being dragged, update the end point of the line based on mouse movement
      const mouseX = e.clientX
      const mouseY = e.clientY
      const line = this.lines[this.draggedLineIndex]
      line.endX = mouseX - this.dragOffsetX
      line.endY = mouseY - this.dragOffsetY
      this.redrawCanvas()
    }
  },

  // Handle mouse up event on the circles
  handleCircleMouseUp() {
    // Reset the draggedLineIndex and draggedCircleIndex when mouse is released
    this.draggedLineIndex = null
    this.draggedCircleIndex = null
  },

  // Check if a point is on the circle
  isPointOnCircle(pointX, pointY, circleX, circleY, radius) {
    const distanceSquared = (pointX - circleX) ** 2 + (pointY - circleY) ** 2
    return distanceSquared <= radius ** 2
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
      this.drawCircle(line.endX, line.endY, line.circleRadius, line.color) // Draw circle at the end of each line
      this.tool.closePath()
    })
  },
  drawCircle(x, y, radius, color) {
    this.tool.beginPath()
    this.tool.arc(x, y, radius, 0, 2 * Math.PI)
    this.tool.fillStyle = color
    this.tool.fill()
    this.tool.closePath()
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
  // Array to store line meshes
  lineMeshes: [],

  createLineGeometries() {
    //This line calculates the center of the canvas in the 3D scene
    const canvasCenterX = this.canvas3d.width / 2
    const canvasCenterY = this.canvas3d.height / 2

    // A higher value will make the lines(wall) appear larger.
    const scaleFactor = 0.01

    const lineHeight = 2 // Predefined line height
    const lineWidthFactor = 5 // Factor to multiply with pencil width
    const lineGeometries = []

    // const isWireframe = document.getElementById('toggleWallOutlineButton')
    //   .checked
    //   ? false
    //   : true

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
        wireframe: false,
      })
      const lineMesh = new THREE.Mesh(extrudeGeometry, lineMaterial)

      // Rotate the line mesh to make it face upwards
      lineMesh.rotateX(Math.PI / 2)
      // Store reference to the line mesh
      this.lineMeshes.push(lineMesh)

      lineGeometries.push(lineMesh)
    })

    return lineGeometries
  },

  //   // Update line meshes when toggle button state changes
  //   updateLineMeshes(isWireframe) {
  //     this.lineMeshes.forEach((lineMesh) => {
  //       lineMesh.material.wireframe = isWireframe
  //     })
  //   },

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

    this.camera.position.y = 2
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
