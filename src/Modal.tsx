import React from "react"
import type { MouseEventHandler, KeyboardEventHandler } from "react"

interface ModalProps {
  render: React.ReactNode,
  title: string,
  closeFn: VoidFunction
}

export default React.memo(function Modal({ render, title, closeFn }: ModalProps) {

  const [classN, setClassN] = React.useState("open")

  function closeModal() {
    setClassN("closed") // Starts the animation

    const timeoutID = setTimeout(closeFn, 500) // Close after 0.5s to get animation
    return (() => clearTimeout(timeoutID))
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

  React.useEffect(() => {
    setClassN("open")
  }, [render])

  return render ? (
    <div id="modal" className={classN} onMouseDown={click} onKeyDown={keyDown}>

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

          {render}

        </section>

      </div>

    </div>
  ) : null
})
