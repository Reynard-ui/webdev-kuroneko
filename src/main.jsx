import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// BrowserRouter gives the app real, addressable URLs: the client's Menu
// page lives at /menu, everything else at /. The basename keeps every URL
// inside the GitHub Pages subfolder (/webdev-kuroneko/), so navigation and
// refresh never escape to the domain root where no site exists.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/webdev-kuroneko">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
