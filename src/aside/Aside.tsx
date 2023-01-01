import React from "react"
import Nav from "./Nav"
import { AddLinkModalID } from "../modals/AddLink"
// import YoutubeLink from "../modals/YoutubeLink"
import { show } from "@ebay/nice-modal-react"

import type {
  AddNewDownloadEntry
} from "../types"

interface AsideProps {
  addNewDownload: AddNewDownloadEntry
}

export default React.memo(function Asside({ addNewDownload }: AsideProps) {
  return (
    <aside>

      <h1 className="app-name">Web Download Manager</h1>

      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <Nav>

        <li onClick={AddLinkClick}>
          Add Link
        </li>

        {/* <li
          onClick={() => makeModal(
            <YoutubeLink makeModal={makeModal} addNewDownload={addNewDownload} />,
            "Download videos from Youtube"
          )}>
          From Youtube
        </li> */}

      </Nav>

    </aside>
  )
})

function AddLinkClick() {
  show(AddLinkModalID).then(linkInfo => {
    console.log(linkInfo)
    /* makeModal(
      <NewFileDialog
        url={new URL(res.headers.get("x-wdm-finalurl") ?? '')}
        makeModal={makeModal}
        addNewDownload={addNewDownload}
        size={fileSize}
        defaultName={fileDefaultName}
        resumable={resumable} />,
      "File information"
    )
  */
  }).catch(console.error)
}
