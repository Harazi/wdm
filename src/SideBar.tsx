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

  const fileInfo: any = await show(NewFileDialogModalID, {
    url: new URL(linkInfo.finalUrl),
    size: linkInfo.contentLength,
    resumable: linkInfo.acceptRange,
    defaultName: ''
  })

  console.log(fileInfo)
  await dlDir()
  remove(NewFileDialogModalID)
  add({
    url: fileInfo.url,
    fileName: fileInfo.name,
    parts: fileInfo.parts,
    resumable: fileInfo.resumable,
    size: fileInfo.size
  })
}

async function handleYTClick(add: DownloadListType["add"]) {
  const metadata = await modalGetYTVideoMetadata()

  console.log(metadata)

  const res: any = await show(YTFormatSelectorModalID, {
    videoMetadata: metadata,
  })

  console.log(res)
  await dlDir()
  remove(YTFormatSelectorModalID)
  add({
    url: res.url,
    fileName: res.fileName,
    parts: res.parts,
    resumable: res.resumable,
    size: res.size
  })
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
