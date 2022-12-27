import React from "react"
import Interface from "./Interface"
import LandingPage from "./landingPage"

export default function App() {

  return "showDirectoryPicker" in window
    ? <Interface />
    : <LandingPage />
}
