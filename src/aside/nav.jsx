import React from "react"
import AddLink from "../popups/add-link.jsx"
import YoutubeLink from "../popups/youtube-link.jsx"
import modularContext from '../context/modularContext.jsx'

export default function Nav({ addNewDownload }) {

  const modularState = React.useContext(modularContext)

  return (
    <nav>
      <ol>

        <li
          // onClick={() => makePopup(
          //   <AddLink makePopup={makePopup} addNewDownload={addNewDownload} />,
          //   "Insert the download link")}>

          onClick={() => modularState.makeModular({ title: "Insert the download link", render: <AddLink addNewDownload={addNewDownload} /> })}>

          Add Link
        </li>

        <li
          // onClick={() => makePopup(
          //   <YoutubeLink makePopup={makePopup} addNewDownload={addNewDownload} />,
          //   "Download video from Youtube"
          // )}

          onClick={() => modularState.makeModular({ title: "Download video from Youtube", render: <YoutubeLink addNewDownload={addNewDownload} /> })}>

            From Youtube
        </li>

        {/* <li>Prefrences</li> */}
      </ol>
    </nav>
  )
}