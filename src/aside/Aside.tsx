import React from "react"
import Nav from "./Nav"
import AddLink from "../popups/AddLink"
import YoutubeLink from "../popups/YoutubeLink"

import type {
  MakePopupFunction,
  AddNewDownloadEntry
} from "../types"

interface AsideProps {
  makePopup: MakePopupFunction
  addNewDownload: AddNewDownloadEntry
}

export default React.memo(function Asside({ makePopup, addNewDownload }: AsideProps) {
  return (
    <aside>

      <h1 className="app-name">Web Download Manager</h1>

      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <Nav>

        <li
          onClick={() => makePopup(
            <AddLink makePopup={makePopup} addNewDownload={addNewDownload} />,
            "Download anything from the web")}>
          Add Link
        </li>

        <li
          onClick={() => makePopup(
            <YoutubeLink makePopup={makePopup} addNewDownload={addNewDownload} />,
            "Download videos from Youtube"
          )}>
          From Youtube
        </li>

      </Nav>

    </aside>
  )
})
