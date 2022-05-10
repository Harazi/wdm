import React from "react"
import DownloadEntry from "./downlaod-entry"

export default function Main({ downloadList, removeDownloadEntry, downloadDirHandle }) {
  return (
    <main>

      {
        downloadList && (
          <div id="download-list">
            <ul>

              {downloadList.map((downloadObj) => (
                <DownloadEntry
                  key={downloadObj.id}
                  id={downloadObj.id}
                  url={downloadObj.url}
                  name={downloadObj.name}
                  removeDownloadEntry={removeDownloadEntry}
                  downloadDirHandle={downloadDirHandle} />
              ))}

            </ul>
          </div>
        )
        //* Never runs because arrays are always true
        || <p>Click Add Link button</p>
      }

    </main>
  )
}