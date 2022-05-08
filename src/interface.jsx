import React from "react"
import Aside from "./aside/aside.jsx"
import Main from "./main/main.jsx"
import Popup from "./popup.jsx"
import modularContext from './context/modularContext.jsx'

export default function Interface() {

  const modularState = React.useContext(modularContext)


  const [downloadList, setDownloadList] = React.useState([])

  function addNewDownload(url, name) {
    // TODO: save the download progress in the list
    // TODO: save the list in localstorage
    setDownloadList([
      ...downloadList,
      {
        id: `${url.toString(32)}-${name.toString(32)}`,
        url,
        name
      }
    ])
  }

  function removeDownloadEntry(id) {
    setDownloadList(list => (
      list.filter(downloadObj => downloadObj.id !== id)
    ))
  }

  return (
    <div className="main-container">

      <Aside addNewDownload={addNewDownload} />

      <Main downloadList={downloadList} removeDownloadEntry={removeDownloadEntry} />

      {modularState.Modular && (

        <Popup title={modularState.Modular.title} closeMethod={modularState.Modular.closeMethod} >
            {modularState.Modular.render}
        </Popup>

      )}

    </div>
  )

}