import React from "react"
import { get, set } from "idb-keyval"
import type { DirHandleSetter } from "./App"

export default function GetDirHandle({ dirHandleSetter }: { dirHandleSetter: DirHandleSetter }) {
  return (
    <div className="get-dir-handle-container">
      <button type="button" onClick={() => selectDownloadDirectory(dirHandleSetter)} autoFocus>
        Click to choose the default install folder
      </button>
    </div>
  )
}

async function selectDownloadDirectory(setDownloadDirHandle: DirHandleSetter) {
  try {
    // Get the directory access
    let dirHandle = await get('downloadDir')
    if (!dirHandle) {
      dirHandle = await showDirectoryPicker({ startIn: "downloads" })
      await set('downloadDir', dirHandle)
    }

    // Get read/write permissions
    if (await verifyPermission(dirHandle, true)) {
      setDownloadDirHandle(dirHandle)
    }
  } catch (error) {
    console.error(error)
    setDownloadDirHandle(null)
  }
}

async function verifyPermission(fileHandle: FileSystemHandle, readWrite: boolean) {
  const options: { mode?: 'readwrite' } = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
