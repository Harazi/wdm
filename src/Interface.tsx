import React from "react"
import SideBar from "./SideBar"
import Main from "./Main"

import type {
  DownloadEntryProperties,
  AddNewDownloadEntry,
  RemoveDownloadEntryFunction
} from "./types"


export default function Interface() {

  const [downloadList, setDownloadList] = React.useState<DownloadEntryProperties[]>([])

  const addNewDownload: AddNewDownloadEntry = React.useCallback((url, fileName, parts, resumable, size) => {
    // TODO: save the download state in the list
    // TODO: save the list in localstorage
    setDownloadList(list => [
      ...list,
      {
        id: `${url.toString()}-${fileName.toString()}`,
        url,
        fileName,
        parts,
        resumable,
        size,
      }
    ])
  }, [setDownloadList])

  const removeDownloadEntry: RemoveDownloadEntryFunction = React.useCallback((id) => {
    setDownloadList(list => (
      list.filter(downloadObj => downloadObj.id !== id)
    ))
  }, [setDownloadList])

  return (
    <div className="main-container">

      <SideBar addNewDownload={addNewDownload} />

      <Main {...{ downloadList, removeDownloadEntry }} />

    </div>
  )

}
