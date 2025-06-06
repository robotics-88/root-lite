import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'

// Function to fetch and parse a text file
async function fetchTextFile(url) {
  let response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.statusText}`)
  }
  return response.text()
}

// Function to parse images.txt
function parseImagesTxt(text) {
  let lines = text
    .split('\n')
    .filter((line) => !line.startsWith('#') && line.trim() !== '')

  let images = []

  for (let i = 0; i < lines.length; i += 2) {
    let parts = lines[i].split(' ')

    let imageId = parseInt(parts[0], 10)
    let qw = parseFloat(parts[1])
    let qx = parseFloat(parts[2])
    let qy = parseFloat(parts[3])
    let qz = parseFloat(parts[4])
    let tx = parseFloat(parts[5])
    let ty = parseFloat(parts[6])
    let tz = parseFloat(parts[7])
    let cameraId = parseInt(parts[8], 10)
    let name = parts[9]

    let colmapQuat = new Quaternion(qx, qy, qz, qw)

    images.push({
      imageId,
      cameraId,
      rotation: colmapQuat,
      translation: new Vector3(tx, ty, tz),
      name,
    })
  }

  // Step 2: Sort by filenames to get the correct order
  images.sort((a, b) => {
    let numA = parseInt(a.name.replace(/\D/g, '')) // Extract number from filename (e.g., out1.png -> 1)
    let numB = parseInt(b.name.replace(/\D/g, '')) // Extract number from filename (e.g., out2.png -> 2)
    return numA - numB
  })
  return images
}

/* eslint-disable no-unused-vars */
// Function to parse pose.txt
async function parseCameraPoses(posesURL, scale = 2) {
  let poses = []

  try {
    let posesText = await fetchTextFile(posesURL)
    poses = posesText
      .split('\n')
      .map((line) => {
        let parts = line.trim().split(/\s+/)
        if (parts.length < 10) return null

        let qw = parseFloat(parts[1])
        let qx = parseFloat(parts[2])
        let qy = parseFloat(parts[3])
        let qz = -parseFloat(parts[4])

        let colmapQuat = new Quaternion(qx, qy, qz, qw)
        colmapQuat.normalize()

        return {
          id: parseInt(parts[0], 10),
          rotation: new Quaternion(qx, qy, qz, qw),
          translation: new Vector3(
            parseFloat(parts[5]) * scale,
            parseFloat(parts[6]) * scale,
            parseFloat(parts[7]) * scale,
          ),
          frame: parseInt(parts[8], 10),
          image: parts[9],
        }
      })
      .filter((pose) => pose !== null)

    return poses
  }
  catch (error) {
    console.error('Error parsing camera poses:', error)
  }
}

// Function to parse camera positions from images.txt and cameras.txt
async function parseCameraPositions(imagesSource, camerasSource) {
  try {
    let imagesText = await getTextContent(imagesSource)
    let imagesArray = parseImagesTxt(imagesText)

    return imagesArray.map((image) => ({
      location: image.translation,
      rotation: image.rotation,
    }))
  }
  catch (error) {
    console.error('Error parsing camera positions:', error)
    return []
  }
}

// Function to parse text from a DataView or fetch from a URL
async function getTextContent(source) {
  if (source instanceof DataView) return dataViewToString(source)
  else if (typeof source === 'string') return fetchTextFile(source)
  else throw new Error('Invalid source type: expected DataView or URL string')
}

// Function to convert DataView to a string
function dataViewToString(dataView) {
  let decoder = new TextDecoder('utf-8')
  return decoder.decode(dataView)
}

// Main function to execute everything
async function processCameraData(imagesSource, camerasSource) {
  let cameraPositions = await parseCameraPositions(imagesSource, camerasSource)

  return { positions: cameraPositions }
}

export { parseCameraPositions, processCameraData }
