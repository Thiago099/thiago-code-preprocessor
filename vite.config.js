import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import monacoEditorPluginImport from 'vite-plugin-monaco-editor';

const monacoEditorPlugin = monacoEditorPluginImport.default || monacoEditorPluginImport

export default defineConfig({
  base: '/thiago-code-preprocessor/', 
  plugins: [svelte(),monacoEditorPlugin({customDistPath : (root, buildOutDir, base) => `${buildOutDir}/monacoeditorwork`})]
})
