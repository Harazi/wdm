import React from "react"
import prettyMS from "pretty-ms"
import { format } from "bytes"
import { humanNumber } from "../utils/humanNumber"

import type {
  MakePopupFunction,
  AddNewDownloadEntry,
  YoutubeApiResponse
} from "../types"

interface YoutubeFileProps {
  makePopup: MakePopupFunction
  addNewDownload: AddNewDownloadEntry
  details: YoutubeApiResponse
}

export default function YoutubeFile({ makePopup, addNewDownload, details }: YoutubeFileProps) {

  const [videoFormat, setVideoFormat] = React.useState(0)
  const [formatsSize, setFormatsSize] = React.useState<number[]>([])

  const videoFileNameInput = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const videoIndex = videoFormat
    if (videoIndex in formatsSize)
      return

    const abortController = new AbortController()
    let aborted = false

    fetch(`api/get?url=${encodeURIComponent(details.formats[videoIndex].url)}`, { signal: abortController.signal })
      .then(res => {
        const videoSize = res.headers.get("content-length")
        setFormatsSize(prevFormatsSize => {
          const formatsSize = [...prevFormatsSize]
          formatsSize[videoIndex] = Number(videoSize)
          return formatsSize
        })
        abortController.abort()
        aborted = true
        console.log(details.formats[videoIndex].qualityLabel, Number(videoSize))
      })

    return () => aborted === false ? abortController.abort() : undefined
  }, [videoFormat])

  function startDownload() {

    const fileName = `${videoFileNameInput.current?.value}.${details.formats[videoFormat].extension}`

    console.log(details.formats[videoFormat].url, fileName)

    addNewDownload(new URL(details.formats[videoFormat].url), fileName, 1, false, null)

    makePopup(null, '')
  }

  return (
    <div className="youtube-file">

      <div className="video-details">

        <div className="thumbnail-wrapper">
          <img src={details.thumbnail.url} alt="video thumbnail" />
        </div>

        <div className="text-container">

          <div className="title-author">
            <p className="title" title="video title">{details.title}</p>
            <span className="author">By <em>{details.author}</em></span>
          </div>

          <div className="meta-info">
            <div className="length" title="video length">{prettyMS(
              Number(Number(details.lengthSeconds).toFixed() + "000"),
              { colonNotation: true }
            )}</div>
            •
            <div className="views" title="views count">views: {humanNumber(Number(details.viewCount), 1)}</div>
            <div title="video size">{formatsSize[videoFormat] ? `size: ${format(formatsSize[videoFormat], { unitSeparator: ' ' })}` : "size: ..."}</div>
          </div>

        </div>

      </div>

      <div className="video-config">

        <div className="video-quality-picker label-input-pair">

          <label htmlFor="video-quality-picker">Choose video quality</label>
          <select id="video-quality-picker" value={videoFormat} onChange={e => setVideoFormat(Number(e.target.value))}>

            {details.formats.map((format, i) => (
              <option key={i} value={i}>
                {format.qualityLabel}; {format.mimeType}; {format.fps}fps
              </option>
            ))}

          </select>
        </div>

        <div className="video-name">

          <div className="base-name label-input-pair">
            <label htmlFor="base-name">Video name</label>
            <input
              id="base-name"
              type="text"
              defaultValue={details.title}
              ref={videoFileNameInput} />
          </div>

          <div className="dot">
            <span>.</span>
          </div>

          <div className="extension">
            <input type="text" value={details.formats[videoFormat].extension} readOnly />
          </div>

        </div>

      </div>

      <div className="controll-buttons">

        <div className="button-container cancel">
          <button type="button" onClick={() => makePopup(null, '')}>Cancel</button>
        </div>

        <div className="button-container start">
          <button type="button" onClick={startDownload}>Download</button>
        </div>

      </div>

    </div>
  )
}
