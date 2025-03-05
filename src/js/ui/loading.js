let loadingSpinner = document.getElementById('loadingSpinner')

export function setLoading(isLoading) {
  loadingSpinner.style.display = isLoading ? 'block' : 'none'
}
