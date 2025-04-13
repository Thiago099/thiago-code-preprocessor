

import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'highlight.js/styles/vs2015.min.css'

window.copyToClipboard = (base64String)=> {
  return new Promise((resolve, reject) => {
    try {
      const decodedString = atob(base64String);
      navigator.clipboard.writeText(decodedString)
    } catch (error) {
      console.error(error)
    }
  });
}

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
