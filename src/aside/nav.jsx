import React from "react"
import AddLink from "../popups/add-link.jsx"
import YoutubeLink from "../popups/youtube-link.jsx"

export default function Nav({ makePopup, addNewDownload }) {
  return (
    <nav>
      <ol>

        <li
          onClick={() => makePopup(
            <AddLink makePopup={makePopup} addNewDownload={addNewDownload} />,
            "Insert the download link")}>
          Add Link
        </li>

        <li
          onClick={() => makePopup(
            <YoutubeLink makePopup={makePopup} addNewDownload={addNewDownload} />,
            "Download video from Youtube"
          )}>
            From Youtube
        </li>

        {/* <li>Prefrences</li> */}
      </ol>
    </nav>
  )
}