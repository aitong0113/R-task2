import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/R-task2/', //跟 repo 名一樣
  plugins: [react()],
})
