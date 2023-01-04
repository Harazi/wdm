import React from "react"
// import YoutubeLink from "../modals/YoutubeLink"
import { AskInputModalID } from "./modals/AskInput"
import { remove, show } from "@ebay/nice-modal-react"
import { dlDir } from "./utils/fs"

import type {
  AddNewDownloadEntry
} from "./types"
import { isValidLink } from "./utils/isValidLink"
import { fetchLinkInfo } from "./utils/fetchLinkInfo"
import { NewFileDialogModalID } from "./modals/NewFileDialog"

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

      <nav>
        <ol>

          <li onClick={() => AddLinkClick(addNewDownload)}>
            Add Link
          </li>

          {/* <li
          onClick={() => makeModal(
            <YoutubeLink makeModal={makeModal} addNewDownload={addNewDownload} />,
            "Download videos from Youtube"
          )}>
          From Youtube
        </li> */}

        </ol>
      </nav>

    </aside>
  )
})

async function AddLinkClick(addNewDownload: AddNewDownloadEntry) {
  let errorMsg
  let linkInfo: any

  do {
    const link = await show<string>(AskInputModalID, { title: "Download from link", errorMsg })

    const url = isValidLink(link)
    if (!url) {
      errorMsg = "Invalid Link"
      continue
    }

    linkInfo = await fetchLinkInfo(url)
    if (!linkInfo.success) {
      errorMsg = "Error while retrieving data"
      continue
    }

    console.log(linkInfo)
    remove(AskInputModalID)
  } while (errorMsg)

  const fileInfo: any = await show(NewFileDialogModalID, {
    url: new URL(linkInfo.data.finalUrl),
    size: linkInfo.data.contentLength,
    resumable: linkInfo.data.acceptRange,
    defaultName: ''
  })

  console.log(fileInfo)
  await dlDir()
  remove(NewFileDialogModalID)
  addNewDownload(fileInfo.url, fileInfo.name, fileInfo.parts, fileInfo.resumable, fileInfo.size)
}
