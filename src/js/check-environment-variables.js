export default function () {
  // Array of each environment variable we expect
  let expectedEnvironmentVariables = ['VITE_DEFAULT_SPLAT_FILE_PATH', 'VITE_DEFAULT_IMAGES_FILE_PATH', 'VITE_DEFAULT_CAMERAS_FILE_PATH']

  // For each environment variable,
  for (let expectedEnvironmentVariable of expectedEnvironmentVariables) {
    // if the value is `undefined` throw an error
    if (import.meta.env[expectedEnvironmentVariable] == undefined) {
      throw new Error(
        `Environment variable ${expectedEnvironmentVariable} not defined`
      )
    }
  }
}
