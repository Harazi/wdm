import React from "react"
import ReactDOM from "react-dom"
import GetDirHandle from "./get-dir-handle.jsx"
import Interface from "./interface.jsx"

window._wdmConfig = {
  scraperProxy: {
    addLink: "http://localhost:5000/apt/get"
  },
}

function App() {

  const [downloadDirHandle, setDownloadDirHandle] = React.useState(false)

  async function selectDownloadDirectory() {

    // Production Code
    // await showDirectoryPicker({
    //   startIn: "downloads"
    // }).then(handle => useDownloadDirHandle(handle)).catch(console.error)


    // Development Code
    try {
      // Get the directory access
      window.downloadDirHandle = await showDirectoryPicker({ startIn: "downloads" })

      // Get read/write permissions
      await window.downloadDirHandle.getFileHandle("wdm", { create: true })
      await window.downloadDirHandle.removeEntry("wdm")
      
      setDownloadDirHandle(window.downloadDirHandle)
    } catch (error) {
      console.error(error)
      setDownloadDirHandle(false)
    }

  }

  return downloadDirHandle
    ? <Interface />
    : ("showDirectoryPicker" in window)
    ? <GetDirHandle onclick={selectDownloadDirectory} />
    : <p>
        Your browser doesn't seem to support
        <a href="https://wicg.github.io/file-system-access/">File System Access</a>.
        <br />
        Use the latest version of
        <a href="https://www.google.com/chrome/">Chrome</a>
        to Access this website
      </p>
}


ReactDOM.render(<App />, document.querySelector("#react-root"))