import React from "react"
import Nav from "./nav.jsx"

export default function Aside({ makePopup, addNewDownlaod }) {
  return (
    <aside>
      <h1 className="app-name">Web Download Manager</h1>
      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <Nav makePopup={makePopup} addNewDownlaod={addNewDownlaod} />

    </aside>
  )
}