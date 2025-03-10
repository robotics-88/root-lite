let loadingSpinner = document.getElementById('loading-spinner')

export function setLoading(isLoading) {
  loadingSpinner.style.display = isLoading ? 'block' : 'none'
}
