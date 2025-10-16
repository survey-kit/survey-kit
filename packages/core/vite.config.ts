import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SurveyKitCore',
      formats: ['es', 'umd'],
      fileName: (format) => `survey-kit-core.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@survey-kit/registry'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@survey-kit/registry': 'SurveyKitRegistry',
        },
      },
    },
  },
})
