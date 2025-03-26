export function showToast(message, type = 'info') {
  // Create a toast element
  let msg = document.createElement('div')
  msg.classList.add('toast', type) // Apply type classes (e.g., 'info', 'error', 'success')
  msg.textContent = message // Set message content
  
  // Append to body
  document.body.appendChild(msg)
  
  // Auto-remove the message after 3 seconds
  setTimeout(() => msg.remove(), 3000)
}
