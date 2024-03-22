let optionsCont = document.querySelector('.options-cont')
let toolsCont = document.querySelector('.tools-cont')
let pencilToolCont = document.querySelector('.pencil-tool-cont')
let pencil = document.querySelector('.pencil')

//Flag
let optionsFlag = true
let pencilFlag = false

optionsCont.addEventListener('click', (e) => {
  if (optionsFlag) {
    openTools()
  } else {
    closeTools()
  }

  optionsFlag = !optionsFlag

  function openTools() {
    let iconElem = optionsCont.children[0]

    iconElem.classList.remove('fa-xmark')
    iconElem.classList.add('fa-bars')
    toolsCont.style.display = 'none'
    pencilToolCont.style.display = 'none'
  }
  function closeTools() {
    let iconElem = optionsCont.children[0]
    iconElem.classList.remove('fa-bars')
    iconElem.classList.add('fa-xmark')
    toolsCont.style.display = 'flex'
  }
})

pencil.addEventListener('click', () => {
  pencilFlag
    ? (pencilToolCont.style.display = 'none')
    : (pencilToolCont.style.display = 'block') //here generally to show the display:none elements we use display: block or display: flex depending on What is used in the css class if nothing then block

  pencilFlag = !pencilFlag
})
