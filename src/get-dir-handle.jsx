import React from "react"

export default function GetDirHandle({ onclick }) {
  return (
    <div className="get-dir-handle-container">
      <button type="button" onClick={onclick}>
        Click to choose the default install folder
      </button>
    </div>
  )
}