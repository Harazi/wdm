import React from "react"

export default function Popup({ children, title, closeMethod }) {

  function click(e) {
    if (e.target.closest(".popup-box")) return
    else closeMethod(e)
  }

  return (
    <div id="popup" onMouseDown={click}>

      <div className="popup-box">

        <div className="titlebar">

          <div className="title" title={title}>
            <p>{title}</p>
          </div>

          <div className="close-button">
            <button type="button" onClick={closeMethod}></button>
          </div>

        </div>

        <section className="content">

          {children}

        </section>

      </div>

    </div>
  )
}