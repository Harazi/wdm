import React, { HTMLAttributes } from "react"

interface PopupProps {
  render: React.ReactNode,
  title: string,
  closeFn: VoidFunction
}

export default React.memo(function Popup({ render, title, closeFn }: PopupProps) {

  const [classN, setClassN] = React.useState("open")

  const click: React.MouseEventHandler<HTMLDivElement | HTMLButtonElement> = (e) => {
    if (
      !(e.target as Element).closest(".close-button")
      && (e.target as Element).closest(".popup-box")
    ) return // Clicked inside the box

    setClassN("closed") // Starts the animation

    const timeoutID = setTimeout(closeFn, 500) // Close after 0.5s to get animation
    return (() => clearTimeout(timeoutID))
  }

  React.useEffect(() => {
    setClassN("open")
  }, [render])

  return render ? (
    <div id="popup" className={classN} onMouseDown={click}>

      <div className="popup-box">

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
