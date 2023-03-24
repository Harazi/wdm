import React, { useContext } from "react"
import DownloadEntry from "./components/DownloadEntry"
import { DownloadListContext } from "./contexts/DownloadListContext"

export default function Main() {
  const { list } = useContext(DownloadListContext)

  return (
    <main>
      <div id="download-list">
        <ul>

          {list.map((entry) => (
            <DownloadEntry key={entry.ID} ID={entry.ID} />
          ))}

        </ul>
      </div>
    </main>
  )
}
