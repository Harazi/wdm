import React from "react"
import DownloadEntry from "./components/DownloadEntry"

export default React.memo(function Main({ downloadList, removeDownloadEntry, downloadDirHandle }) {
  return (
    <main>
      <div id="download-list">
        <ul>

          {downloadList.map((downloadObj) => (
            <DownloadEntry
              key={downloadObj.id}
              id={downloadObj.id}
              url={downloadObj.url}
              name={downloadObj.name}
              parts={downloadObj.parts}
              resumable={downloadObj.resumable}
              size={downloadObj.size}
              removeDownloadEntry={removeDownloadEntry}
              downloadDirHandle={downloadDirHandle} />
          ))}

        </ul>
      </div>
    </main>
  )
})