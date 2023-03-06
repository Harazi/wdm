import React, { useReducer, useContext, useMemo } from "react"
import { divrem } from "divrem"
import { streamToFile } from "../utils/streamToFile"
import { dlDir } from "../utils/fs"
import { DownloadSummary } from "./DownloadSummary"
import { DownloadListContext } from "../contexts/DownloadListContext"
import type { DownloadEntry } from "../contexts/DownloadListContext"

type fragment = {
  readonly from?: number,
  readonly to?: number,
  downloaded: number
  finished: boolean
}

const setupMap = ({ size, resumable, parts }: { size?: number; resumable: boolean; parts: number }): fragment[] => {
  if (!size || !resumable || parts === 1) return [{ downloaded: 0, finished: false }]

  const { count, rem } = divrem(size, parts)
  let progress = 0

  const map = Array(parts).fill(null).map(() => ({
    from: progress,
    to: (progress += count) - 1,
    downloaded: 0,
    finished: false,
  }))

  map[map.length - 1].to += rem

  return map
}

export default function DownloadEntry({ ID, url, fileName, size, resumable, parts }: DownloadEntry) {

  const [, forceUpdate] = useReducer((p) => !p, false)
  const startTime = useMemo(Date.now, [])
  const endTime = React.useRef<number | null>(null)
  const map = useMemo(() => setupMap({ size, resumable, parts }), [size, resumable, parts])
  const [finished, setFinished] = React.useState(false)
  const { remove } = useContext(DownloadListContext)
  const dlDirP = useMemo(dlDir, [])
  const intervalID = useMemo(() => setInterval(forceUpdate, 2000), [])

  React.useEffect(() => () => clearInterval(intervalID), [])
  React.useEffect(() => {

    const abortController = new AbortController()

    map.forEach(async ({ from, to }, i) => {
      const dirHandle = await dlDirP
      const fileHandle = await dirHandle.getFileHandle(`${fileName}.part_${i}`, { create: true })
      const writable = await fileHandle.createWritable({ keepExistingData: false })

      const res = await fetch(`api/get?url=${encodeURIComponent(url.href)}`, {
        signal: abortController.signal,
        headers: from === undefined || to === undefined ? {} : {
          range: `bytes=${from}-${to}`
        }
      })

      //TODO: Add a way to show errors to the user
      if (!res.body) throw new Error("Response body is null!")

      const reader = res.body?.getReader()

      streamToFile({
        reader,
        writable,
        on: {
          progress: (length) => {
            map[i].downloaded += length
          },
          finish: async () => {
            await writable.close()
            map[i].finished = true
            forceUpdate()
          }
        }
      })
    })

    return () => {
      console.log("aborting right now")
      abortController.abort()
    }
  }, [])

  React.useEffect(() => {
    // Initial run
    if (!map.every(({ finished }) => finished)) return

    (async () => {
      const dirHandle = await dlDirP

      const writable = await dirHandle.getFileHandle(fileName, { create: true })
        .then(handle => handle.createWritable({ keepExistingData: false }))

      for (const index in map) {
        const stream = await dirHandle.getFileHandle(`${fileName}.part_${index}`, { create: false })
          .then(handle => handle.getFile())
          .then(file => file.stream())

        await stream.pipeTo(writable, { preventClose: true })
        await dirHandle.removeEntry(`${fileName}.part_${index}`)
      }

      await writable.close()
      endTime.current = Date.now()
      setFinished(true)
      clearInterval(intervalID)
    })()

  }, [map.every(({ finished }) => finished)])


  return (
    <li>

      <div className={`download-progress ${finished && "finished"}`}>
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

      {finished &&
        (
          <DownloadSummary time={((endTime.current ?? Date.now()) - startTime) / 1000} size={map.reduce((acc, { downloaded }) => acc + downloaded, 0)} />
        ) ||
        (
          <div className="controll-buttons">

            {resumable && (
              <button type="button" className="pause" disabled>
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
      }
    </li>
  )
}


