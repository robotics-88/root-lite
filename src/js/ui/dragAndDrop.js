import { processTarballFiles } from './tarball/processTarball'

export function setupDragAndDrop(
  canvas,
  scene,
  animationController,
  updateScene
) {
  let dragCounter = 0 // Keeps track of drag events to determine when to show/hide the overlay
  let dropOverlay = document.getElementById('drop-overlay')

  // Handles the file drop event
  async function handleFileDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    dragCounter = 0

    let file = event.dataTransfer.files[0] // Get the first dropped file
    showMessage('Loading file...', 'info')
    if (file && file.name.endsWith('.tar.gz')) {
      // Attempt to process the tarball file
      processTarballFiles(scene, file, animationController)
        .then(() => showMessage('Tarball loaded successfully!', 'success'))
        .catch(() => showMessage('Error loading tarball.', 'error'))
    } else if (file && file.name.endsWith('.ply')) {
      // Attempt to update the scene with the dropped file
      updateScene(scene, file, animationController)
        .then(() => showMessage('File loaded successfully!', 'success'))
        .catch(() => showMessage('Error loading file.', 'error'))
    } else {
      showMessage('Invalid file type. Please drop a .ply file.', 'error')
      return
    }
    dropOverlay.classList.toggle('visible')
  }

  // Prevents default browser behavior for drag events
  function preventDefaults(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // Displays a temporary toast message
  function showMessage(text, type) {
    let msg = document.createElement('div')
    msg.classList.add('toast', type)
    msg.textContent = text
    document.body.appendChild(msg)
    setTimeout(() => msg.remove(), 3000) // Auto-remove the message after 3 seconds
  }

  // Detect when a file is dragged into the document
  document.addEventListener('dragenter', (event) => {
    preventDefaults(event)
    dragCounter++ // Increase drag counter
    dropOverlay.classList.toggle('visible') // Show overlay
  })

  // Detect when the dragged file leaves the document
  document.addEventListener('dragleave', (event) => {
    preventDefaults(event)
    dragCounter-- // Decrease drag counter
    if (dragCounter === 0) {
      dropOverlay.classList.toggle('visible') // Hide overlay only when all drags leave
    }
  })

  document.addEventListener('dragover', preventDefaults) // Prevent default dragover behavior
  document.addEventListener('drop', handleFileDrop) // Handle file drop event
}
