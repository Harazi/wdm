import React from "react"
import Nav from "./nav.jsx"

export default function Aside({ addNewDownload }) {
  return (
    <aside>
      <h1 className="app-name">Web Download Manager</h1>
      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <Nav addNewDownload={addNewDownload} />

    </aside>
  )
}