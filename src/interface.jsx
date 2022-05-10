import React from "react"
import Aside from "./aside/aside"
import Main from "./main/main"
import Popup from "./popup"

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

  const addNewDownload = React.useCallback((url, name) => {
    // TODO: save the download state in the list
    // TODO: save the list in localstorage
    setDownloadList([
      ...downloadList,
      {
        id: `${url.toString(32)}-${name.toString(32)}`,
        url,
        name
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

      <Aside makePopup={makePopup} addNewDownload={addNewDownload} />

      <Main downloadList={downloadList} removeDownloadEntry={removeDownloadEntry} downloadDirHandle={downloadDirHandle} />

      {displayPopup &&
      <Popup
        closeFn={closePopup}
        title={popupTitle}
        children={displayPopup} />}

    </div>
  )

}