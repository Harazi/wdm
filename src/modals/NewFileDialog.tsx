import React from "react"
import { format } from "bytes"
import { useModal, create, register } from "@ebay/nice-modal-react"
import Modal from "../Modal"
import type { DownloadEntry } from "../contexts/DownloadListContext"

export type NewFileDialogProps = Omit<DownloadEntry, "ID" | "fileName" | "parts"> & {
  defaultName?: string
}

export type NewFileDialogRes = Omit<DownloadEntry, "ID">

const NewFileDialog = create(({ url, size, defaultName, resumable }: NewFileDialogProps) => {

  const modal = useModal()
  const fileNameInput = React.useRef<HTMLInputElement>(null),
    extensionInput = React.useRef<HTMLInputElement>(null),
    partsNumber = React.useRef<HTMLInputElement>(null)

  function startDownload() {
    if (!fileNameInput.current) return
    if (!extensionInput.current) return
    if (!partsNumber.current) return

    const fileName = `${fileNameInput.current.value}.${extensionInput.current.value}` as const
    const parts = Number(partsNumber.current.value)

    const res: NewFileDialogRes = {
      url,
      fileName,
      size,
      resumable,
      parts,
    }

    console.log(res)
    modal.resolve(res)
  }

  return (
    <Modal
      title="File information"
      visible={modal.visible}
      onClose={modal.hide}
      afterClose={modal.remove} >
      <div className="new-file-dialog">

        <div className="file-info">
          <div className="info">size: {typeof size === "number" ? format(size, { unitSeparator: ' ' }) : "unknown"}</div>
          <div className="info">resumable: {resumable ? "Yes" : "No"}</div>
        </div>

        <div className="url-info label-input-pair">
          <label htmlFor="url-info">Downloading from: </label>
          <input type="url" id="url-info" readOnly value={url.href} />
        </div>

        <div className="file-name">

          <div className="base-name label-input-pair">
            <label htmlFor="base-name">File name</label>
            <input type="text" id="base-name" placeholder="Sky Picture" ref={fileNameInput} autoFocus defaultValue={defaultName?.match(/^(.*)\..*$/)?.[1]} />
          </div>

          <div className="dot">
            <span>.</span>
          </div>

          <div className="extension label-input-pair">
            <label htmlFor="extension">File extension</label>
            <input type="text" id="extension" placeholder="jpg" ref={extensionInput} defaultValue={defaultName?.match(/^.*\.(.*)/)?.[1]} />
          </div>

        </div>

        <div className="download-options">

          <div className="download-parts label-input-pair">
            <label htmlFor="parts">Download parts</label>
            <input type="number" id="parts" defaultValue={resumable && 6 || 1} max={6} min={1} readOnly={!resumable} ref={partsNumber} />
          </div>

        </div>

        <div className="controll-buttons">

          <div className="button-container cancel">
            <button type="button" onClick={modal.remove}>Cancel</button>
          </div>

          <div className="button-container start">
            <button type="button" onClick={startDownload}>Download</button>
          </div>

        </div>

      </div>
    </Modal>
  )
})

export default NewFileDialog
export const NewFileDialogModalID = "NEW_FILE_DIALOG"
register(NewFileDialogModalID, NewFileDialog)
