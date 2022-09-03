import React from "react"
import { divrem } from "divrem"
import { streamToFile } from "../utils/streamToFile"
import { DownloadSummary } from "./DownloadSummary"

import type {
  DownloadEntryProperties,
  RemoveDownloadEntryFunction
} from "../types"

interface DownloadEntryProps extends DownloadEntryProperties {
  removeDownloadEntry: RemoveDownloadEntryFunction
  downloadDirHandle: FileSystemDirectoryHandle
}

export default function DownloadEntry({ id, url, fileName, parts, resumable, size, removeDownloadEntry, downloadDirHandle }: DownloadEntryProps) {

  const startTime = React.useRef(Date.now())
  const endTime = React.useRef<number | null>(null)
  const totalDownloadSize = React.useRef(0)

  const [finishedDownloading, setFinishedDownloading] = React.useState(false)

  const fragmentsSizeMap = React.useMemo(() => {

    if (!resumable || !size) // Size is unknown, or server doesn't support range requests
      return [{ fragmentSize: 0 }]

    const { count, rem } = divrem(size, parts)

    const map = Array(parts).fill(0).map(() => ({
      fragmentSize: count,
    }))

    map[map.length - 1].fragmentSize += rem

    return map
  }, [])

  const [partsState, setPartsState] = React.useState(Array(parts).fill(null).map(function fragmentMapFunction(v, i) {
    return {
      finished: false,
      fragmentSize: fragmentsSizeMap[i].fragmentSize - 1,
      startOffset: (fragmentsSizeMap[0].fragmentSize) * i,
      downloadedBytes: 0,
      index: i,
    }
  }))

  React.useEffect(() => {

    const abortController = new AbortController()

    for (const fragment of partsState) {

      (async () => {

        const fileWritable = await downloadDirHandle.getFileHandle(`${fileName}.part${fragment.index}`, { create: true })
          .then(handle => handle.createWritable({ keepExistingData: false }))

        const res = await fetch(`api/get?url=${encodeURIComponent(url.href)}`, {
          redirect: "manual",
          cache: "no-store",
          referrer: "",
          headers: {
            "range": resumable
              ? `bytes=${fragment.startOffset}-${fragment.startOffset + fragment.fragmentSize}`
              : "bytes=0-"
          }, //!! ????
          signal: abortController.signal,
        })

        if (!res.body)
          throw new Error("Response body is null!")

        const reader = res.body.getReader()

        streamToFile({ reader, writable: fileWritable,
          on: {
            progress: length => {
              totalDownloadSize.current += length
              setPartsState(parts => parts.map(fragmentObj => {

                if (fragmentObj.index === fragment.index) {
                  fragmentObj.downloadedBytes += length
                }

                return fragmentObj
              }))
            },
            finish: async () => {
              await fileWritable.close()
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

      const fileWritable = await downloadDirHandle.getFileHandle(fileName, { create: true })
        .then(handle => handle.createWritable({ keepExistingData: false }))

      const promisesArray = partsState.map( async fragment => new Promise(async (resolve, reject) => {

        const fragmentReader = await downloadDirHandle.getFileHandle(`${fileName}.part${fragment.index}`, { create: false })
          .then(handle => handle.getFile())
          .then(file => file.stream())
          .then(stream => stream.getReader())

          streamToFile({ reader: fragmentReader, writable: fileWritable,
            on: {
              finish: () => {
                endTime.current = Date.now()
                downloadDirHandle.removeEntry(`${fileName}.part${fragment.index}`) // Delete temporary part file
                  .then(resolve)
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
            style={{"--fragment-download-progress": `${fragment.downloadedBytes / fragment.fragmentSize * 100}%` } as React.CSSProperties}
            key={fragment.index}>
          </span>))}
      </div>

      <p className="filename">
        {fileName}
      </p>

      <span className="download-url" title={url.href}>
        {url.href}
      </span>

      {finishedDownloading &&
        (
          <DownloadSummary time={((endTime.current ?? Date.now()) - startTime.current) / 1000} size={totalDownloadSize.current} />
        ) ||
        (
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
        )
      }
    </li>
  )
}


