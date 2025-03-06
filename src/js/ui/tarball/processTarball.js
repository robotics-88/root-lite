import { extractTarballFiles } from './extractTarball.js'

export async function processTarball(file) {
  let files = await extractTarballFiles(file)
  return files
}
