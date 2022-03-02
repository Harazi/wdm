import React from "react"

export default function newFileDialog({ url, makePopup, addNewDownlaod }) {

  const fileNameInput = React.useRef(),
        extensionInput = React.useRef()

  function startDownload() {

    const name = `${fileNameInput.current.value}.${extensionInput.current.value}`

    console.log(url, name)

    addNewDownlaod(url, name)

    makePopup(false)
  }

  return (
    <div className="new-file-dialog">

      <div className="url-info label-input-pair">
        <label htmlFor="url-info">Downloading from: </label>
        <input type="url" id="url-info" readOnly value={url} />
      </div>

      <div className="file-name">

        <div className="base-name label-input-pair">
          <label htmlFor="base-name">File name</label>
          <input type="text" id="base-name" placeholder="Sky Picture" ref={fileNameInput} autoFocus />
        </div>

        <div className="dot">
          <span>.</span>
        </div>

        <div className="extension label-input-pair">
          <label htmlFor="extension">File extension</label>
          <input type="text" id="extension" placeholder="jpg" ref={extensionInput} />
        </div>
        
      </div>

      {/* <div className="download-options">

        <div className="download-parts label-input-pair">
          <label htmlFor="parts">Download parts (disabled)</label>
          <input type="number" id="parts" defaultValue={8} max={8} min={1} />
        </div>

      </div> */}

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