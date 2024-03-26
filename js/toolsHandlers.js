// This file will contain functions related to handling tools and UI elements.


export function setupToolsEventListeners() {
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
  }
  
  export function toggleOptions(toolsCont, pencilToolCont) {
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
  }
  
  export function togglePencilTool(pencilToolCont) {
    this.pencilFlag = !this.pencilFlag
    pencilToolCont.style.display = this.pencilFlag ? 'block' : 'none'
  }
  
  export function updatePencilWidth(width) {
    this.currentPencilWidth = width
  }
  
  export function updatePencilColor(color) {
    this.currentPencilColor = color
  }