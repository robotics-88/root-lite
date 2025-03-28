import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'babylon-engine': ['@babylonjs/core/Engines/engine'],
          'babylon-meshes': ['@babylonjs/core/Meshes'],
          'babylon-materials': ['@babylonjs/core/Materials'],
        },
      },
    },
  },
})
