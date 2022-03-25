import React from "react"
import AddLink from "../popups/add-link.jsx"
import YoutubeLink from "../popups/youtube-link.jsx"

export default function Nav({ makePopup, addNewDownlaod }) {
  return (
    <nav>
      <ol>

        <li
          onClick={() => makePopup(
            <AddLink makePopup={makePopup} addNewDownlaod={addNewDownlaod} />,
            "Insert the download link")}>
          Add Link
        </li>

        <li
          onClick={() => makePopup(
            <YoutubeLink makePopup={makePopup} addNewDownlaod={addNewDownlaod} />,
            "Download video from Youtube"
          )}>
            From Youtube
        </li>

        {/* <li>Prefrences</li> */}
      </ol>
    </nav>
  )
}