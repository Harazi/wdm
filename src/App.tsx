import React from "react"
import GetDirHandle from "./GetDirHandle"
import Interface from "./Interface"


export default function App() {

  const [downloadDirHandle, setDownloadDirHandle] = React.useState(false)

  async function selectDownloadDirectory() {

    try {
      // Get the directory access
      const dirHandle = await showDirectoryPicker({ startIn: "downloads" })

      // Get read/write permissions
      await dirHandle.getFileHandle(".wdm", { create: true })
      await dirHandle.removeEntry(".wdm")

      setDownloadDirHandle(dirHandle)
    } catch (error) {
      console.error(error)
      setDownloadDirHandle(false)
    }

  }

  return downloadDirHandle
    ? <Interface downloadDirHandle={downloadDirHandle} />
    : ("showDirectoryPicker" in window)
    ? <GetDirHandle onClick={selectDownloadDirectory} />
    : <p>
        Your browser doesn't seem to support
        {" "}
        <a href="https://wicg.github.io/file-system-access/">File System Access</a>.
        <br />
        Use the latest version of
        {" "}
        <a href="https://www.google.com/chrome/">Chrome</a>
        {" "}
        to Access this website
      </p>
}