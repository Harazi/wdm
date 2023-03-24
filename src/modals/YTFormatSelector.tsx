import React, { useMemo } from "react"
import prettyMS from "pretty-ms"
import { format } from "bytes"
import { useModal, create, register } from "@ebay/nice-modal-react"
import Modal from "../Modal"
import { humanNumber } from "../utils/humanNumber"

import type { YoutubeResponse, YTAdaptiveAudioFormat, YTAdaptiveVideoFormat } from "@backend/types"
import type { DownloadEntry } from "src/contexts/DownloadListContext"

export type YTFormatSelectorProps = {
  videoMetadata: YoutubeResponse
}

export type YTFormatSelectorRes = Omit<DownloadEntry, "ID" | "state" | "map" | "ac">

const YTFormatSelector = create(({ videoMetadata: { videoDetails, streamingData }}: YTFormatSelectorProps) => {

  const modal = useModal()
  const [videoItag, setVideoItag] = React.useState(streamingData.formats[0].itag)

  const videoFileNameInput = React.useRef<HTMLInputElement>(null)

  const selectedFormat = useMemo(() => [...streamingData.formats, ...streamingData.adaptiveFormats].find(format => format.itag === videoItag), [videoItag]) as YTAdaptiveAudioFormat | YTAdaptiveVideoFormat

  function startDownload() {

    const fileName = `${videoFileNameInput.current?.value}.${selectedFormat.mimeType.slice(selectedFormat.mimeType.indexOf('/') + 1, selectedFormat.mimeType.indexOf(';'))}` as const

    const res: YTFormatSelectorRes = {
      url: new URL(selectedFormat.url),
      fileName,
      size: Number(selectedFormat.contentLength) || undefined,
      resumable: true, // Assume all links are resumable
      parts: 1, // TODO: allow the user to specify how many parts
    }

    modal.resolve(res)
  }

  return (
    <Modal
      title="Youtube Format Selector"
      visible={modal.visible}
      onClose={modal.hide}
      afterClose={modal.remove} >
      <div className="youtube-file">

        <div className="video-details">

          <div className="thumbnail-wrapper w-40">
            <img
              srcSet={videoDetails.thumbnail.thumbnails.reduce((srcset, thumb) => srcset.concat(`${thumb.url} ${thumb.width}w,`), "").slice(0, -1)}
              alt="Video Thumbnail" />
          </div>

          <div className="text-container">

            <div className="title-author">
              <p className="title" title="video title">{videoDetails.title}</p>
              <span className="author">By <em>{videoDetails.author}</em></span>
            </div>

            <div className="meta-info">
              <div className="length" title="video length">{prettyMS(
                Number(Number(videoDetails.lengthSeconds).toFixed() + "000"),
                { colonNotation: true }
              )}</div>
              •
              <div className="views" title="views count">views: {humanNumber(Number(videoDetails.viewCount), 1)}</div>
              <div title="video size">size: {selectedFormat?.contentLength ? format(Number(selectedFormat.contentLength), { unitSeparator: ' ' }) : "unknown"}</div>
            </div>

          </div>

        </div>

        <div className="video-config">

          <div className="video-quality-picker label-input-pair">

            <label htmlFor="video-quality-picker">Choose video quality</label>
            <select id="video-quality-picker" defaultValue={videoItag} onChange={e => setVideoItag(Number(e.target.value))} autoFocus>

              <option disabled> Video + Audio </option>
              {streamingData.formats.map(f => (
                <option key={f.itag} value={f.itag}>{f.qualityLabel}</option>
              ))}

              <option disabled> Audio only </option>
              {streamingData.adaptiveFormats.filter((f): f is YTAdaptiveAudioFormat => !Object.hasOwn(f, "fps")).map(f => (
                <option key={f.itag} value={f.itag}>{format(f.averageBitrate)}/s; {f.mimeType}</option>
              ))}

              <option disabled> Video only </option>
              {streamingData.adaptiveFormats.filter((f): f is YTAdaptiveVideoFormat => Object.hasOwn(f, "fps")).map((f) => (
                <option key={f.itag} value={f.itag}>{f.qualityLabel}; {f.mimeType}; {f.fps}fps</option>
              ))}

            </select>
          </div>

          <div className="video-name">

            <div className="base-name label-input-pair">
              <label htmlFor="base-name">Video name</label>
              <input
                id="base-name"
                type="text"
                defaultValue={videoDetails.title}
                ref={videoFileNameInput} />
            </div>

            <div className="dot">
              <span>.</span>
            </div>

            <div className="extension">
              <input type="text" value={selectedFormat.mimeType.split(";").shift()?.split("/").pop()} readOnly />
            </div>

          </div>

        </div>

        <div className="controll-buttons">

          <div className="button-container cancel">
            <button type="button" onClick={modal.remove}>Cancel</button>
          </div>

          <div className="button-container start">
            <button type="button" onClick={startDownload}>Download</button>
          </div>

        </div>

      </div>
    </Modal>
  )
})

export default YTFormatSelector
export const YTFormatSelectorModalID = "YT_FORMAT_SELECTOR"
register(YTFormatSelectorModalID, YTFormatSelector)
