import React from "react"
import ReactDOMClient from "react-dom/client"
import NiceModal from "@ebay/nice-modal-react"
import App from "./App"

const rootElement = document.querySelector("#react-root")

if (!rootElement)
  throw new Error("No root element found!")

ReactDOMClient.createRoot(rootElement).render(
  <NiceModal.Provider>
    <App />
  </NiceModal.Provider>
)
