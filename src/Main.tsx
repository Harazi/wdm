import React from "react"
import DownloadEntry from "./components/DownloadEntry"

import type {
  DownloadEntryProperties,
  RemoveDownloadEntryFunction,
} from "./types"

interface MainProps {
  downloadList: DownloadEntryProperties[]
  removeDownloadEntry: RemoveDownloadEntryFunction
  downloadDirHandle: FileSystemDirectoryHandle
}

export default React.memo(function Main({ downloadList, removeDownloadEntry, downloadDirHandle }: MainProps) {
  return (
    <main>
      <div id="download-list">
        <ul>

          {downloadList.map((downloadObj) => (
            <DownloadEntry
              key={downloadObj.id}
              {...downloadObj}
              removeDownloadEntry={removeDownloadEntry}
              downloadDirHandle={downloadDirHandle} />
          ))}

        </ul>
      </div>
    </main>
  )
})
