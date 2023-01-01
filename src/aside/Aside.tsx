import React from "react"
import Nav from "./Nav"
import AddLink from "../modals/AddLink"
import YoutubeLink from "../modals/YoutubeLink"

import type {
  MakeModalFunction,
  AddNewDownloadEntry
} from "../types"

interface AsideProps {
  makeModal: MakeModalFunction
  addNewDownload: AddNewDownloadEntry
}

export default React.memo(function Asside({ makeModal, addNewDownload }: AsideProps) {
  return (
    <aside>

      <h1 className="app-name">Web Download Manager</h1>

      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <Nav>

        <li
          onClick={() => makeModal(
            <AddLink makeModal={makeModal} addNewDownload={addNewDownload} />,
            "Download anything from the web")}>
          Add Link
        </li>

        <li
          onClick={() => makeModal(
            <YoutubeLink makeModal={makeModal} addNewDownload={addNewDownload} />,
            "Download videos from Youtube"
          )}>
          From Youtube
        </li>

      </Nav>

    </aside>
  )
})
