import React, { useReducer, useContext } from "react"
import { DownloadSummary } from "./DownloadSummary"
import { DownloadListContext, DownloadState } from "../contexts/DownloadListContext"
import type { DownloadEntry } from "../contexts/DownloadListContext"

export default function DownloadEntry({ ID }: { ID: DownloadEntry["ID"] }) {

  const [, forceUpdate] = useReducer((p) => !p, false)
  const { get, remove, resume, pause } = useContext(DownloadListContext)
  const entry = get(ID)
  if (!entry) {
    console.error("Couldn't find entry with ID", ID)
    return null
  }
  const startTime = React.useRef(Date.now())
  const endTime = React.useRef<number | null>(null)
  const intervalID = React.useRef(0)
  const { map, state, size, url, fileName, resumable } = entry

  React.useEffect(() => {
    intervalID.current = setInterval(forceUpdate, 2000)
    return () => clearInterval(intervalID.current)
  }, [])


  React.useEffect(() => {
    // Initial run
    if (entry.state !== DownloadState.Finished) return

    endTime.current = Date.now()
    clearInterval(intervalID.current)
  }, [entry.state])


  return (
    <li className={state === DownloadState.Error ? "error" : undefined}>

      <div className={`download-progress ${state === DownloadState.Finished && "finished"}`} >
        {map.map(({ from, to, downloaded, finished }, index) => (
          <span
            key={index}
            className={`fragment ${finished && "finished"}`}
            style={{ "--fragment-download-progress": size ? `${downloaded / ((to ?? size) - (from ?? 0)) * 100}%` : "" } as React.CSSProperties}>
          </span>))}
      </div>

      <p className="filename">
        {fileName}
      </p>

      <span className="download-url" title={url.href}>
        {url.href}
      </span>

      {state === DownloadState.Finished
        ? <DownloadSummary time={((endTime.current ?? Date.now()) - startTime.current) / 1000} size={map.reduce((acc, { downloaded }) => acc + downloaded, 0)} />
        : state === DownloadState.Downloading
          ? (
            <div className="controll-buttons">

              {resumable && (
                <button type="button" className="pause" onClick={() => pause(ID)}>
                  <img src="icons/pause_24.svg" alt="Pause Icon" />
                  Pause
                </button>
              )}

              <button type="button" className="cancel" onClick={() => remove(ID)}>
                <img src="icons/delete-forever_white_hq_18dp.png" alt="Delete Icon" />
                Cancel
              </button>

            </div>
          )
          : state === DownloadState.Paused
            ? <div className="download-summary" onClick={() => resume(ID)}>Paused</div> 
            : <div className="download-summary">Failed</div>
      }
    </li>
  )
}


