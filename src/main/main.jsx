import React from "react"
import DownloadEntry from "./downlaod-entry.jsx"

export default function Main({ downloadList, removeDownloadEntry }) {
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
                  removeDownloadEntry={removeDownloadEntry} />
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