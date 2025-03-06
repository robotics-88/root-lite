export async function extractTarballFiles(compressedFile) {

  if(!compressedFile) {
    console.log("no file")
    return
  }

  // get our decompression stream
  let decompressionStream = new DecompressionStream('gzip')

  // pipe our compressed file thru the decompressor
  // (would be cool to also pipe thru our tar extractor!)
  let decompressedFile = compressedFile
    .stream()
    .pipeThrough(decompressionStream)

  // now we do a weird thing to convert our read stream to an array buffer
  let response = new Response(decompressedFile)
  let arrayBuffer = await response.arrayBuffer()
  let bufferView = new DataView(arrayBuffer)

  let position = 0
  let files = []
  while (true) {

    // exit if we've reached the end of the buffer
    if (position + 4 > bufferView.byteLength) break

    // exit if we read four consecutive null characters
    if(bufferView.getInt32(position) == 0) break

    // get the file header
    let { name, size, typeFlag: fileType } = getHeader(bufferView, position)
    position += 512

    // if the file is a directory, we're done, move on!
    if(fileType == 5) continue

    files.push({
      name,
      content: new DataView(arrayBuffer, position, size)
    })

    // file sizes are rounded up to the nearest 512-byte block
    let remainder = size % 512
    position += (size + 512 - remainder)
  }

  return files
}

let getHeader = function(buffer, fileOffset) {
  return {
    name:       getStringFromBuffer(buffer, 100,   0 + fileOffset),
    mode:       getOctalFromBuffer( buffer,   8, 100 + fileOffset),
    uid:        getOctalFromBuffer( buffer,   8, 108 + fileOffset),
    gid:        getOctalFromBuffer( buffer,   8, 116 + fileOffset),
    size:       getOctalFromBuffer( buffer,  12, 124 + fileOffset),
    mtime:      getOctalFromBuffer( buffer,  12, 136 + fileOffset),
    checksum:   getOctalFromBuffer( buffer,   8, 148 + fileOffset),
    typeFlag:     getIntFromBuffer( buffer,   1, 156 + fileOffset),
    linkname:   getStringFromBuffer(buffer, 100, 157 + fileOffset),
    ustar:      getStringFromBuffer(buffer,   6, 257 + fileOffset),
    version:    getStringFromBuffer(buffer,   2, 263 + fileOffset),
    uname:      getStringFromBuffer(buffer,  32, 265 + fileOffset),
    gname:      getStringFromBuffer(buffer,  32, 297 + fileOffset),
    devmajor:   getStringFromBuffer(buffer,   8, 329 + fileOffset),
    devminor:   getStringFromBuffer(buffer,   8, 337 + fileOffset),
    namePrefix: getStringFromBuffer(buffer, 155, 345 + fileOffset)
  }
}

function getCharsFromBuffer(buffer, length, offset) {
  let charCodes = []
  for(let i=0; i<length; ++i) {
    let charCode = buffer.getUint8(i + offset)
    if (charCode == 0) break
    else charCodes.push(charCode)
  }
  if (charCodes.length > 0) return charCodes
  else return null
}

function getStringFromBuffer(buffer, length, offset) {
  // returns null if buffer read is empty
  return getCharsFromBuffer(buffer, length, offset)
    ?.map(c=> String.fromCharCode(c))
    .join("") || null
}

function getIntFromBuffer(buffer, length, offset) {
  return parseInt(getStringFromBuffer(buffer, length, offset))
}

function getOctalFromBuffer(buffer, length, offset) {
  return parseInt(getStringFromBuffer(buffer, length, offset), 8)
}