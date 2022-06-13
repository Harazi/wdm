import React from "react"
import { format } from "bytes"
import prettyMS from "pretty-ms"

import { streamToFile } from "../utils/streamToFile"


export default function DownloadEntry({ id, url, name, parts, resumable, size, removeDownloadEntry, downloadDirHandle }) {

  const startTime = React.useRef(Date.now())
  const endTime = React.useRef(null)
  const totalDownloadSize = React.useRef(0)

  const [finishedDownloading, setFinishedDownloading] = React.useState(false)

  const [partsState, setPartsState] = React.useState(Array(Number(parts)).fill(null).map(function fragmentMapFunction(v, i) {
    return {
      finished: false,
      fragmentSize: size / parts, //! need to round it (no float)
      startOffset: (size / parts) * i,
      downloadedBytes: 0,
      index: i,
    }
  }))

  React.useEffect(() => {

    const abortController = new AbortController()

    for (const fragment of partsState) {

      (async () => {

        const fileWritable = await downloadDirHandle.getFileHandle(`${name}.part${fragment.index}`, { create: true })
          .then(handle => handle.createWritable({ keepExistingData: false }))

        const res = await fetch("api/get", {
          redirect: "manual",
          cache: "no-store",
          referrer: "",
          headers: {
            'x-wdm': url,
            "range": `bytes=${fragment.startOffset}-${fragment.startOffset + fragment.fragmentSize}` //!! ????
          },
          signal: abortController.signal,
        })

        const reader = res.body.getReader()

        streamToFile({ reader, writable: fileWritable,
          on: {
            progress: length => {
              totalDownloadSize += length
              setPartsState(parts => parts.map(fragmentObj => {

                if (fragmentObj.index === fragment.index) {
                  fragmentObj.downloadedBytes += length
                }

                return fragmentObj
              }))
            },
            finish: () => {
              setPartsState(parts => parts.map(fragmentObj => {

                if (fragmentObj.index === fragment.index) {
                  fragmentObj.finished = true
                }

                return fragmentObj
              }))
            }
          }
        })

      })()

    }

    return () => {
      console.log("aborting right now")
      abortController.abort()
    }
  }, [])

  React.useEffect(() => {

    console.log("partsState changed: inside useEffect")

    const allFinishedDownloading = partsState.reduce((finished, fragment) => {
      if (!finished) // At least one part did not finish
      return false
      else
      return fragment.finished
    }, true)

    if (!allFinishedDownloading)
    return

    console.log("passed allFinishedDownloading test: inside useEffect")

    ;(async () => {

      const fileWritable = await downloadDirHandle.getFileHandle(name, { create: true })
        .then(handle => handle.createWritable({ keepExistingData: false }))

      const promisesArray = partsState.map( async fragment => new Promise(async (resolve, reject) => {

        const fragmentReader = await downloadDirHandle.getFileHandle(`${name}.part${fragment.index}`, { create: false })
          .then(handle => handle.getFile())
          .then(file => file.stream())
          .then(stream => stream.getReader())

          streamToFile({ reader: fragmentReader, writable: fileWritable,
            on: {
              finish: () => {
                await downloadDirHandle.removeEntry(`${name}.part${fragment.index}`) // Delete temporary part file
                endTime.current = Date.now()
                resolve()
              }
            }
          })

      }))

      for (const fragmentWritePromise of promisesArray) {
        await fragmentWritePromise
      }

      fileWritable.close()

      setFinishedDownloading(true)

    })()

  }, [partsState])


  return (
    <li>

      <div className={`download-progress ${finishedDownloading && "finished"}`}>
        {partsState.map(fragment => (
          <span
            className={`fragment ${fragment.finished && "finished"}`}
            style={{"--fragment-download-progress": `${fragment.downloadedBytes / fragment.fragmentSize * 100}%` }}
            key={fragment.index}>
          </span>))}
      </div>

      <p className="filename">
        {name}
      </p>

      <span className="download-url" title={url}>
        {url}
      </span>

      {!finishedDownloading && (

        <div className="controll-buttons">

          {resumable && (
            <button type="button" className="pause" disabled>
              <img src="icons/pause_24.svg" alt="Pause Icon" />
              Pause
            </button>
          )}

          <button type="button" className="cancel" onClick={() => removeDownloadEntry(id)}>
            <img src="icons/delete-forever_white_hq_18dp.png" alt="Delete Icon" />
            Cancel
          </button>

        </div>
      ) || (
        <DownloadSummary time={(endTime.current - startTime.current) / 1000} size={totalDownloadSize.current} />
      )}
    </li>
  )
}

function DownloadSummary({ time, size }) {
  return (
    <div className="download-summary">
      <span className="check-mark">
        <img src="icons/check-mark_24.png" alt="Check Mark" />
      </span>
      Downloaded {format(size, { unitSeparator: ' ' })} in {prettyMS(Number(time.toFixed() + "000"))}
    </div>
  )
}