import React from "react"
import ReactDOM from "react-dom"
import Aside from "./aside/Aside"
import Main from "./Main"
import Popup from "./Popup"

import type {
  DownloadEntryProperties,
  MakePopupFunction,
  ClosePopupFunction,
  AddNewDownloadEntry,
  RemoveDownloadEntryFunction
} from "./types"

const modalElement = document.querySelector("#modal-root")

if (!modalElement)
  throw new Error("No modual element found!")

export default function Interface() {

  const [displayPopup, setDisplayPopup] = React.useState<React.ReactNode | null>(null)
  const [popupTitle, setPopupTitle] = React.useState("")
  const [downloadList, setDownloadList] = React.useState<DownloadEntryProperties[]>([])

  const makePopup: MakePopupFunction = React.useCallback((component, title) => {
    setDisplayPopup(component)
    setPopupTitle(title)
  }, [setDisplayPopup, setPopupTitle])

  const closePopup: ClosePopupFunction = React.useCallback(() => {
    setDisplayPopup(null)
    setPopupTitle("")
  }, [setDisplayPopup, setPopupTitle])

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

      <Aside {...{ makePopup, addNewDownload }} />

      <Main {...{ downloadList, removeDownloadEntry }} />

      {ReactDOM.createPortal(
        <Popup
          closeFn={closePopup}
          title={popupTitle}
          render={displayPopup} />,
        modalElement as Element // Already type guarded it up above
      )}

    </div>
  )

}
