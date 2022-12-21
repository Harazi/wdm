import React from "react"
import type { DirHandleSetter } from "./App"

async function selectDownloadDirectory(setDownloadDirHandle: DirHandleSetter) {

  try {
    // Get the directory access
    const dirHandle = await showDirectoryPicker({ startIn: "downloads" })

    // Get read/write permissions
    await dirHandle.getFileHandle(".wdm", { create: true })
    await dirHandle.removeEntry(".wdm")

    setDownloadDirHandle(dirHandle)
  } catch (error) {
    console.error(error)
    setDownloadDirHandle(null)
  }

}
export default function GetDirHandle({ dirHandleSetter }: { dirHandleSetter: DirHandleSetter }) {
  return (
    <div className="get-dir-handle-container">
      <button type="button" onClick={() => selectDownloadDirectory(dirHandleSetter)} autoFocus>
        Click to choose the default install folder
      </button>
    </div>
  )
}
