import React from "react"
import { format } from "bytes"

export default function NewFileDialog({ url, makePopup, addNewDownload, size, defaultName, resumable }) {

  const fileNameInput = React.useRef(),
        extensionInput = React.useRef(),
        partsNumber = React.useRef()

  function startDownload() {

    const name = `${fileNameInput.current.value}.${extensionInput.current.value}`
    const parts = resumable && partsNumber.current.value || 1

    console.log(url, name, parts, resumable, size)

    addNewDownload(url, name, Number(parts), resumable, Number(size))

    makePopup(false)
  }

  return (
    <div className="new-file-dialog">

      <div className="file-info">
        <div className="info">size: {format(Number(size), { unitSeparator: ' ' })}</div>
        <div className="info">resumable: {resumable ? "Yes" : "No"}</div>
      </div>

      <div className="url-info label-input-pair">
        <label htmlFor="url-info">Downloading from: </label>
        <input type="url" id="url-info" readOnly value={url} />
      </div>

      <div className="file-name">

        <div className="base-name label-input-pair">
          <label htmlFor="base-name">File name</label>
          <input type="text" id="base-name" placeholder="Sky Picture" ref={fileNameInput} autoFocus defaultValue={defaultName.match(/^(.*)\..*$/)?.[1]} />
        </div>

        <div className="dot">
          <span>.</span>
        </div>

        <div className="extension label-input-pair">
          <label htmlFor="extension">File extension</label>
          <input type="text" id="extension" placeholder="jpg" ref={extensionInput} defaultValue={defaultName.match(/^.*\.(.*)/)?.[1]} />
        </div>

      </div>

      <div className="download-options">

        <div className="download-parts label-input-pair">
          <label htmlFor="parts">Download parts</label>
          <input type="number" id="parts" defaultValue={resumable && 8 || 1} max={8} min={1} readOnly={!resumable} ref={partsNumber} />
        </div>

      </div>

      <div className="controll-buttons">

        <div className="button-container cancel">
          <button type="button" onClick={() => makePopup(false)}>Cancel</button>
        </div>

        <div className="button-container start">
          <button type="button" onClick={startDownload}>Download</button>
        </div>

      </div>

    </div>
  )
}