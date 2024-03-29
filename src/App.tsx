import React, { StrictMode } from "react"
import Interface from "./Interface"
import LandingPage from "./landingPage"
import { DownloadListProvider } from "./contexts/DownloadListContext"

export default function App() {

  if (!Object.hasOwn(window, "showDirectoryPicker")) {
    return <LandingPage />
  }

  return (
    <StrictMode>
      <DownloadListProvider>
        <Interface />
      </DownloadListProvider>
    </StrictMode>
  )
}
