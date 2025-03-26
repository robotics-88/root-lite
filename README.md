# Babylon.js 3D Scene Loader

This project initializes a 3D scene using Babylon.js and allows loading `.ply` files into the scene.

## 🚀 Getting Started

### 1. Install Dependencies

Ensure you have Node.js installed, then install dependencies:

```sh
npm install
```

### 2. Install Dependencies

To have a model loaded by default, place a .ply file in the public folder

filename must be

splat.ply

This will trigger an attempt to fetch cameras.txt and images.txt from localhost:8000 --
The automated animation is turned off for the moment

### 3. Start the Development Server

```sh
npm run dev
```

##Project Structure

```php
├── public/              # Default folder for loading .ply files
│   ├── splat.ply        # Default 3D model (add your own file here)
│   ├── cameras.txt      # colmap file
|   ├── images.txt       # colmap file
├── src/
|   ├── js/              # Main source code
      ├── babylon/       # Management of babylon.js specfici 3d rendering and animations
│       ├── scene/           # Scene setup and logic
│       ├── camera/          # Animated camera setup
│       ├── lighting/        # Lighting configurations
│       ├── meshLoader/      # Functions to load meshes from files/URLs
|     ├── colmap/        # parsing of auto generated colmap files for camera movements
│     ├── ui/            # UI components like loading indicators
│   ├── style.css        # global styling
├── index.html         # Entry point
├── main.js            # Initializes and runs the app
├── README.md          # Project documentation

```
