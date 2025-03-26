export function trackPerformanceStats(scene, engine) {
  document.getElementById('toggle-performance-stats-button').addEventListener('click', () => {
    let performanceSection = document.getElementById('performance-stats')
    performanceSection.classList.toggle('show')
  })
  
  let fpsCounter = document.getElementById('fps')
  let resolutionCounter = document.getElementById('resolution')
  let verticesCounter = document.getElementById('vertices')
  let memoryCounter = document.getElementById('memory')
  let frameTimeCounter = document.getElementById('frame-time')
  let activeMeshesCounter = document.getElementById('active-meshes')
  
  let lastUpdateTime = 0

  scene.onBeforeRenderObservable.add(() => {
    let now = performance.now()
    if (now - lastUpdateTime > 450) {
      lastUpdateTime = now

      let fps = engine.getFps()
      let width = engine.getRenderWidth()
      let height = engine.getRenderHeight()
      let totalVertices = getTotalVertices(scene)      
      
      fpsCounter.textContent = fps.toFixed(2)
      resolutionCounter.textContent = `${width} x ${height}`
      verticesCounter.textContent = totalVertices
      memoryCounter.textContent = (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB'
      frameTimeCounter.textContent = (1000 / fps).toFixed(2) + 'ms'
      activeMeshesCounter.textContent = scene.meshes.filter(mesh => mesh.isEnabled()).length
    }
  })
}

function getTotalVertices(scene) {
  return scene.meshes.reduce((total, mesh) => {
    return total + (mesh.getTotalVertices() || 0)
  }, 0)
}