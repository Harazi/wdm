import React, { useContext } from "react"
import { AskInputModalID } from "./modals/AskInput"
import { remove, show } from "@ebay/nice-modal-react"
import { dlDir } from "./utils/fs"
import { isValidLink } from "./utils/isValidLink"
import { fetchLinkInfo, YTVideoMetadata } from "./utils/network"
import { NewFileDialogModalID } from "./modals/NewFileDialog"
import { YTFormatSelectorModalID } from "./modals/YTFormatSelector"
import { LinkInfo, YoutubeResponse } from "@backend/types"
import { nextRound } from "./utils/loop"
import { isValidYoutubeURL } from "./utils/isValidYoutubeURL"
import { DownloadListContext } from "./contexts/DownloadListContext"

import type { DownloadListType } from "./contexts/DownloadListContext"
import type { NewFileDialogRes, NewFileDialogProps } from "./modals/NewFileDialog"
import type { YTFormatSelectorRes, YTFormatSelectorProps } from "./modals/YTFormatSelector"

export default function SideBar() {
  const { add } = useContext(DownloadListContext)
  return (
    <aside>

      <h1 className="app-name">Web Download Manager</h1>

      <div className="img-wrapper">
        <img src="icons/download-from-cloud_550.png" alt="Keyboard Chair" />
      </div>

      <nav>
        <ol>
          <li onClick={() => AddLinkClick(add)}> Add Link </li>
          <li onClick={() => handleYTClick(add)}> Youtube Video </li>
        </ol>
      </nav>

    </aside>
  )
}

async function AddLinkClick(add: DownloadListType["add"]) {
  const linkInfo = await modalGetLinkInfo()

  const props: NewFileDialogProps = {
    url: new URL(linkInfo.finalUrl),
    size: typeof linkInfo.contentLength === "number" ? linkInfo.contentLength : undefined,
    resumable: linkInfo.acceptRange,
  }

  const fileInfo: NewFileDialogRes = await show(NewFileDialogModalID, props)

  console.log(fileInfo)
  await dlDir()
  remove(NewFileDialogModalID)
  add(fileInfo)
}

async function handleYTClick(add: DownloadListType["add"]) {
  const videoMetadata = await modalGetYTVideoMetadata()
  const props: YTFormatSelectorProps = { videoMetadata }
  console.log(props)
  const res: YTFormatSelectorRes = await show(YTFormatSelectorModalID, props)

  console.log(res)
  await dlDir()
  remove(YTFormatSelectorModalID)
  add(res)
}

async function modalGetLinkInfo(errorMsg?: string): Promise<LinkInfo> {
  const link = await show<string>(AskInputModalID, { title: "Download from link", errorMsg })

  const url = isValidLink(link)
  if (!url) {
    remove(AskInputModalID)
    await nextRound()
    return modalGetLinkInfo("Invalid Link")
  }

  const linkInfo = await fetchLinkInfo(url)
  if (!linkInfo.success) {
    remove(AskInputModalID)
    await nextRound()
    return modalGetLinkInfo("Error while retrieving data")
  }
  remove(AskInputModalID)
  return linkInfo.data
}

async function modalGetYTVideoMetadata(errorMsg?: string): Promise<YoutubeResponse> {
  const input = await show<string>(AskInputModalID, {
    title: "Download Youtube video",
    errorMsg,
    label: "Youtube link or video ID",
    inputPlaceHolder: "youtu.be/Sklc_fQBmcs"
  })

  const id = isValidYoutubeURL(input)
  if (!id) {
    remove(AskInputModalID)
    await nextRound()
    return modalGetYTVideoMetadata("Invalid video identifier")
  }

  const metadata = await YTVideoMetadata(id)
  if (!metadata.success) {
    remove(AskInputModalID)
    await nextRound()
    return modalGetYTVideoMetadata("Error while retrieving data")
  }
  remove(AskInputModalID)
  return metadata.data
}
