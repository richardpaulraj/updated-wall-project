//This file will contain functions related to drawing on the 2D and 3D canvases.


export function draw2DScene() {
  this.canvas2d.width = window.innerWidth
  this.canvas2d.height = window.innerHeight
  this.redrawCanvas()
}

export function drawTempLine(startX, startY, endX, endY) {
  this.tool.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height)
  this.redrawCanvas()
  this.tool.beginPath()
  this.tool.moveTo(startX, startY)
  this.tool.lineTo(endX, endY)
  this.tool.strokeStyle = this.currentPencilColor
  this.tool.lineWidth = this.currentPencilWidth
  this.tool.stroke()
  this.tool.closePath()
}

export function drawLine(startX, startY, endX, endY) {
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
}

export function redrawCanvas() {
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
}

export function logLinesData() {
  console.log('Lines drawn:')
  this.lines.forEach((line, index) => {
    console.log(
      `Line ${index + 1}: startX=${line.startX}, startY=${
        line.startY
      }, endX=${line.endX}, endY=${line.endY}`
    )
  })
}

export function undo() {
  if (this.undoStack.length > 0) {
    this.redoStack.push(this.lines.slice())
    this.lines = this.undoStack.pop()
    this.redrawCanvas()

    if (this.is3DView) {
      this.updateThreeDScene()
    }
  }
}

export function redo() {
  if (this.redoStack.length > 0) {
    this.undoStack.push(this.lines.slice())
    this.lines = this.redoStack.pop()
    this.redrawCanvas()

    if (this.is3DView) {
      this.updateThreeDScene()
    }
  }
}

export function createLineGeometries() {
  const canvasCenterX = this.canvas3d.width / 2
  const canvasCenterY = this.canvas3d.height / 2
  const scaleFactor = 0.02
  const lineHeight = 2 // Predefined line height
  const lineWidthFactor = 5 // Factor to multiply with pencil width
  const lineGeometries = []

  this.lines.forEach((line) => {
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

    lineGeometries.push(lineMesh)
  })

  return lineGeometries
}

export function draw3DScene() {
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

  const lineGeometries = this.createLineGeometries()
  lineGeometries.forEach((lineMesh) => {
    this.scene.add(lineMesh)
  })

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
}

export function updateThreeDScene() {
  if (this.scene && this.renderer) {
    this.scene.children.forEach((child) => {
      this.scene.remove(child)
    })

    const lineGeometries = this.createLineGeometries()
    lineGeometries.forEach((lineMesh) => {
      this.scene.add(lineMesh)
    })
  }
}