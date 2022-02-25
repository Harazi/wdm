import React from "react"
import DownloadEntry from "./downlaod-entry.jsx"

export default function Main({ downloadList }) {

  // const [progressValue, useProgressValue] = React.useState(0)

  // React.useEffect(() =>
  //   progressValue < 100 && setTimeout(useProgressValue, 1000, progressValue + 10),
  // [progressValue])

  const [buttonClass, useButtonClass] = React.useState("play")

  function controllButtonClassToggle() {
    switch (buttonClass) {
      case "play":
        useButtonClass("pause")
        break
      case "pause":
        useButtonClass("play")
        break
    }
  }

  return (
    <main>

      <div id="download-list">
        <ul>

          <li>

            <p className="filename">
              keychair.jpg
            </p>

            <span className="download-url" title="http://127.0.0.1:5500/public/img/keychair.jpg">
              http://127.0.0.1:5500/public/img/keychair.jpg
            </span>
            <div className="download-prog">
              {/* replace it with a div container and n span children
                  the n is relative to the download parts. e.g. 8 spans */}
              <progress max="100" value="60"></progress>
            </div>
            <div className="controll-button">
              <button type="button" className={buttonClass} onClick={controllButtonClassToggle}></button>
            </div>
          </li>
          
          
          {downloadList.map((downloadObj, i) => {
            return <DownloadEntry url={downloadObj.url} name={downloadObj.name} key={i} />
          })}

        </ul>
      </div>

    </main>
  )
}