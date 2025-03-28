import { processTarballFiles } from '../tarball/processTarball'
import { setLoading } from './loading'
import { showToast } from './toast'

export function setupDragAndDrop(
  canvas,
  scene,
  animationController,
  updateScene,
) {
  let dragCounter = 0 // Keeps track of drag events to determine when to show/hide the overlay
  let dropOverlay = document.getElementById('drop-overlay')

  // Handles the file drop event
  async function handleFileDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    dragCounter = 0

    let file = event.dataTransfer.files[0] // Get the first dropped file
    if(!file) {
      dropOverlay.classList.toggle('visible')
      return
    }
    setLoading(true)
    showToast('Loading file...', 'info')
    if (file && file.name.endsWith('.tar.gz')) {
      // Attempt to process the tarball file
      processTarballFiles(scene, file, animationController)
        .then(() => showToast('Tarball loaded successfully!', 'success'))
        .catch(() => showToast('Error loading tarball.', 'error'))
    }
    else if (file && file.name.endsWith('.ply')) {
      // Attempt to update the scene with the dropped file
      updateScene(scene, file, animationController)
        .then(() => showToast('File loaded successfully!', 'success'))
        .catch(() => showToast('Error loading file.', 'error'))
    }
    else {
      showToast('Invalid file type. Please drop a .ply file.', 'error')
      setLoading(false)
      return
    }
    dropOverlay.classList.toggle('visible')
    setLoading(false)
  }

  // Prevents default browser behavior for drag events
  function preventDefaults(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // Detect when a file is dragged into the document
  canvas.addEventListener('dragenter', (event) => {
    preventDefaults(event)
    dragCounter++ // Increase drag counter
    dropOverlay.classList.toggle('visible') // Show overlay
  })

  // Detect when the dragged file leaves the document
  canvas.addEventListener('dragleave', (event) => {
    preventDefaults(event)
    dragCounter-- // Decrease drag counter
    if (dragCounter === 0) {
      dropOverlay.classList.toggle('visible') // Hide overlay only when all drags leave
    }
  })

  canvas.addEventListener('dragover', preventDefaults) // Prevent default dragover behavior
  canvas.addEventListener('drop', handleFileDrop) // Handle file drop event
}
