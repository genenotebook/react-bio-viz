import { defineConfig } from 'vite'
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vitejs.d ev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['lib'], tsconfigPath: './tsconfig.build.json' })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        interop: 'auto'
      }
    }
  }
})
