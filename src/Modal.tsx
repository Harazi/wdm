import React from "react"
import type { MouseEventHandler, KeyboardEventHandler } from "react"

interface ModalProps {
  children: React.ReactNode,
  title: string,
  onClose: VoidFunction,
  afterClose: VoidFunction,
  visible: boolean,
}

export default React.memo(function Modal({ children, title, onClose, afterClose, visible }: ModalProps) {

  const closeTimer = React.useRef(0)

  function closeModal() {
    if (closeTimer.current) return

    onClose() // Starts the animation
    closeTimer.current = setTimeout(afterClose, 500) // remove from tree after 0.5s to get animation
  }

  const click: MouseEventHandler<HTMLDivElement | HTMLButtonElement> = (e) => {
    if (
      !(e.target as Element).closest(".close-button")
      && (e.target as Element).closest(".modal-box")
    ) return // Clicked inside the box

    closeModal()
  }

  const keyDown: KeyboardEventHandler = (e) => {
    if (e.key === "Escape")
      closeModal()
  }

  return (
    <div id="modal" className={visible ? "open" : "closed"} onMouseDown={click} onKeyDown={keyDown}>

      <div className="modal-box">

        <div className="titlebar">

          <div className="title" title={title}>
            <p>{title}</p>
          </div>

          <div className="close-button">
            <button type="button" onClick={click}></button>
          </div>

        </div>

        <section className="content">

          {children}

        </section>

      </div>

    </div>
  )
})
