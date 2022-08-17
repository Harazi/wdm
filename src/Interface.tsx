import React from "react"
import ReactDOM from "react-dom"
import Aside from "./aside/Aside"
import Main from "./Main"
import Popup from "./Popup"

export default function Interface({ downloadDirHandle }) {

  const [displayPopup, setDisplayPopup] = React.useState(false)
  const [popupTitle, setPopupTitle] = React.useState("")
  const [downloadList, setDownloadList] = React.useState([])

  const makePopup = React.useCallback((component, title) => {
    setDisplayPopup(component)
    setPopupTitle(title)
  }, [setDisplayPopup, setPopupTitle])

  const closePopup = React.useCallback(() => {
    setDisplayPopup(false)
    setPopupTitle("")
  }, [setDisplayPopup, setPopupTitle])

  const addNewDownload = React.useCallback((url, name, parts, resumable, size) => {
    // TODO: save the download state in the list
    // TODO: save the list in localstorage
    setDownloadList(list => [
      ...list,
      {
        //! `String.toString` doesn't accept any parameter
        //! I've mistaken it with `Number.toString`
        id: `${url.toString(32)}-${name.toString(32)}`,
        url,
        name,
        parts,
        resumable,
        size,
      }
    ])
  }, [setDownloadList])

  const removeDownloadEntry = React.useCallback((id) => {
    setDownloadList(list => (
      list.filter(downloadObj => downloadObj.id !== id)
    ))
  }, [setDownloadList])

  return (
    <div className="main-container">

      <Aside {...{makePopup, addNewDownload}} />

      <Main {...{downloadList, removeDownloadEntry, downloadDirHandle}} />

      {ReactDOM.createPortal(
        <Popup
          closeFn={closePopup}
          title={popupTitle}
          render={displayPopup} />,
          document.querySelector("#modal-root")
      )}

    </div>
  )

}