import React from "react"

export default function GetDirHandle({ onClick }) {
  return (
    <div className="get-dir-handle-container">
      <button type="button" onClick={onClick} autoFocus>
        Click to choose the default install folder
      </button>
    </div>
  )
}