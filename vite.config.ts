import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import path from 'path'

export default defineConfig({
  base: '/knowledge/',
  plugins: [
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {},
      },
    },
  },
})
