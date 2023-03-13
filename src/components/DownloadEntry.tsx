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

enum EntryStatus {
  Downloading,
  Finished,
  Error,
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
  const startTime = React.useRef(Date.now())
  const endTime = React.useRef<number | null>(null)
  const map = useMemo(() => setupMap({ size, resumable, parts }), [size, resumable, parts])
  const [status, setStatus] = React.useState<EntryStatus>(EntryStatus.Downloading)
  const { remove } = useContext(DownloadListContext)
  const dlDirP = useMemo(dlDir, [])
  const intervalID = React.useRef(0)

  React.useEffect(() => {
    intervalID.current = setInterval(forceUpdate, 2000)
    return () => clearInterval(intervalID.current)
  }, [])


  React.useEffect(() => {

    const abortController = new AbortController()

    map.forEach(async ({ from, to }, i) => {
      if (abortController.signal.aborted || status === EntryStatus.Error) {
        return
      }

      let res: Response
      try {
        res = await fetch(`api/get?url=${encodeURIComponent(url.href)}`, {
          signal: abortController.signal,
          headers: from === undefined || to === undefined ? {} : {
            range: `bytes=${from}-${to}`
          }
        })
      } catch (err) {
        setStatus(EntryStatus.Error)
        return
      }

      //TODO: Add a way to show errors to the user
      if (!res.body) throw new Error("Response body is null!")

      setStatus(EntryStatus.Downloading)
      const reader = res.body.getReader()

      const dirHandle = await dlDirP
      const fileHandle = await dirHandle.getFileHandle(`${fileName}.part_${i}`, { create: true })
      const writable = await fileHandle.createWritable({ keepExistingData: false })
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
          },
          error: async () => {
            setStatus(EntryStatus.Error)
            await writable.close()
            // Save the parts for resuming?
            await dirHandle.removeEntry(`${fileName}.part_${i}`)
            clearInterval(intervalID.current)
          },
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
      setStatus(EntryStatus.Finished)
      clearInterval(intervalID.current)
    })()

  }, [map.every(({ finished }) => finished)])


  return (
    <li className={status === EntryStatus.Error ? "error" : undefined}>

      <div className={`download-progress ${status === EntryStatus.Finished && "finished"}`} >
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

      {status === EntryStatus.Finished
        ? <DownloadSummary time={((endTime.current ?? Date.now()) - startTime.current) / 1000} size={map.reduce((acc, { downloaded }) => acc + downloaded, 0)} />
        : status === EntryStatus.Downloading
          ? (
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
          : (
            <div className="download-summary">Failed</div>
          )}
    </li>
  )
}


