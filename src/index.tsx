import React from "react"
import ReactDOMClient from "react-dom/client"
import App from "./App"

const rootElement = document.querySelector("#react-root")

if (!rootElement)
  throw new Error("No root element found!")

ReactDOMClient.createRoot(rootElement).render(<App />)
