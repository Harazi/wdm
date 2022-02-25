import React from "react"
import AddLink from "./popups/add-link.jsx"

export default function Nav({ makePopup, addNewDownlaod }) {
  return (
    <nav>
      <ol>
        <li onClick={() => makePopup(<AddLink makePopup={makePopup} addNewDownlaod={addNewDownlaod} />)}>Add Link</li>
        <li>From Youtube</li>
        <li>Prefrences</li>
      </ol>
    </nav>
  )
}