import React from "react"
import Interface from "./Interface"
import LandingPage from "./landingPage"

import type { Dispatch, SetStateAction } from "react"

export default function App() {

  const [downloadDirHandle, setDownloadDirHandle] = React.useState<FileSystemDirectoryHandle | null>(null)

  return downloadDirHandle
    ? <Interface downloadDirHandle={downloadDirHandle} />
    : <LandingPage dirHandleSetter={setDownloadDirHandle} />
}

export type DirHandleSetter = Dispatch<SetStateAction<FileSystemDirectoryHandle | null>>
