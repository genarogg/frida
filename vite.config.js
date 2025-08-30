import { resolve } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default {
  root: resolve(process.cwd(), 'src', 'client'),
  plugins: [
    viteFastify({ spa: true, useRelativePaths: true }),
    viteReact()
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(process.cwd(), 'dist', "src"),
  },
}