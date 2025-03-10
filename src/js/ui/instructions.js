export function setupInstructions() {
  document.getElementById('toggle-instructions-button').addEventListener('click', () => {
    let instructionsBox = document.getElementById('instructions-box')

    instructionsBox.classList.toggle('hidden')
    instructionsBox.classList.toggle('show')
  })
}