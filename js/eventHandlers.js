//This file will contain all the event listener functions and handlers.


export function setupEventListeners() {
    const button = document.getElementById('toggleViewButton')
    button.addEventListener('click', () => this.toggleView())
  
    const undoButton = document.querySelector('.undo')
    undoButton.addEventListener('click', () => this.undo())
  
    const redoButton = document.querySelector('.redo')
    redoButton.addEventListener('click', () => this.redo())
  
    this.canvas2d.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas2d.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas2d.addEventListener('mouseup', this.handleMouseUp.bind(this))
  }
  
  export function toggleView() {
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
  }
  
  export function remove2DEventListeners() {
    this.canvas2d.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas2d.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas2d.removeEventListener('mouseup', this.handleMouseUp)
  }
  
  export function remove3DScene() {
    if (this.renderer) {
      cancelAnimationFrame(this.animationId)
      this.renderer.dispose()
      this.renderer = null
      this.scene.dispose()
      this.scene = null
      this.camera = null
      this.controls = null
    }
  }

  export function handleMouseDown(e) {
    this.startX = e.clientX
    this.startY = e.clientY
    this.isDrawing = true
  }

  export function handleMouseMove(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      this.drawTempLine(this.startX, this.startY, endX, endY)
    }
  }

  export function handleMouseUp(e) {
    if (this.isDrawing) {
      const endX = e.clientX
      const endY = e.clientY
      this.drawLine(this.startX, this.startY, endX, endY)
      this.isDrawing = false
    }
  }
  
  // ... (add the handleMouseDown, handleMouseMove, and handleMouseUp functions here)