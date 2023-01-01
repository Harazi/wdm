import React from "react"
import ReactDOM from "react-dom"
import Aside from "./aside/Aside"
import Main from "./Main"
import Modal from "./Modal"

import type {
  DownloadEntryProperties,
  MakeModalFunction,
  CloseModalFunction,
  AddNewDownloadEntry,
  RemoveDownloadEntryFunction
} from "./types"

const modalElement = document.querySelector("#modal-root")

if (!modalElement)
  throw new Error("No modal element found!")

export default function Interface() {

  const [displayModal, setDisplayModal] = React.useState<React.ReactNode | null>(null)
  const [modalTitle, setModalTitle] = React.useState("")
  const [downloadList, setDownloadList] = React.useState<DownloadEntryProperties[]>([])

  const makeModal: MakeModalFunction = React.useCallback((component, title) => {
    setDisplayModal(component)
    setModalTitle(title)
  }, [setDisplayModal, setModalTitle])

  const closeModal: CloseModalFunction = React.useCallback(() => {
    setDisplayModal(null)
    setModalTitle("")
  }, [setDisplayModal, setModalTitle])

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

      <Aside {...{ makeModal, addNewDownload }} />

      <Main {...{ downloadList, removeDownloadEntry }} />

      {ReactDOM.createPortal(
        <Modal
          closeFn={closeModal}
          title={modalTitle}
          render={displayModal} />,
        modalElement as Element // Already type guarded it up above
      )}

    </div>
  )

}
