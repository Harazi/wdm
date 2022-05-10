import React from "react"

function reducer(state, action) {
  switch (action.type) {

    case "SET_CONTENT_LENGTH": {
      console.log("File size: ", action.size)

      const size = Number(action.size)

      if (size && size > 0)
        return {
          ...state,
          fileSize: size,
        }
    }

    case "START":
      return {
        ...state,
        startTime: Date.now()
      }

    case "INCOMING_CHUNK":
      return {
        ...state,
        downloadedBytes: state.downloadedBytes + action.chunkSize,
        // If `fileSize` is `false`, `progress` will be infinity
        progress: (state.downloadedBytes + action.chunkSize) / state.fileSize * 100
      }

    case "FINISHED_DOWNLOADING": {
      console.log("Finished Downloading ", state.downloadedBytes, "Bytes")
      return {
        ...state,
        finished: true,
        endTime: Date.now()
      }
    }

    case "COMPONENT_WILL_UNMOUNT": {
      console.log("Component will unmount")
      console.dir(state)
      if (!state.finished) {
        console.log("inside if, before aborting")
        action.aborter()
        console.log("after aborting")
      }
    }

    default:
      throw new TypeError(`Unkonwn action type: ${action.type}`)
  }
}

const initialState = {
  fileSize: false,
  finished: false,
  downloadedBytes: 0,
  progress: 0
}

export default function DownloadEntry({ id, url, name, removeDownloadEntry, downloadDirHandle }) {

  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {

    if (state.finished)
      return  // Not sure if it's doing anything, since this function only run once in mounting

    const abortController = new AbortController()

    window.aborter = abortController

    ;(async () => {

      const fileHandle = await downloadDirHandle.getFileHandle(name, { create: true })

      // Currently Chrome will ignore `keepExistingData` option
      const fileWriteable = await fileHandle.createWritable({ keepExistingData: true })


      const res = await fetch("api/get", {
        redirect: "manual",
        cache: "no-store",
        referrer: "",
        headers: {
          'x-wdm': url,
        },
        signal: abortController.signal,
      })

      dispatch({ type: "SET_CONTENT_LENGTH", size: res.headers.get("content-length") })

      const reader = res.body.getReader()

      dispatch({ type: "START" })

      while(true) {

        const { done, value } = await reader.read()

        if (done) {
          await fileWriteable.close()
          dispatch({ type: "FINISHED_DOWNLOADING" })
          break
        }

        await fileWriteable.write(value)

        dispatch({ type: "INCOMING_CHUNK", chunkSize: value.length })

      }

    })()

    //? Doesn't work, idont know why
    // return () => dispatch({ type: "COMPONENT_WILL_UNMOUNT", aborter: abortController.abort })

    return () => {
      console.log("aborting right now")
      abortController.abort()
    }

  }, [])

  return (
    <li>

      <p className="filename">
        {name}
      </p>

      <span className="download-url" title={url}>
        {url}
      </span>

      <div className="download-prog">
        {/* replace it with a div container and n span children
        the n is relative to the download parts. e.g. 8 spans */}

        {
          state.finished && <DownloadSummary time={(state.endTime - state.startTime) / 1000} size={state.downloadedBytes} />
          || state.fileSize && <progress max="100" value={state.progress}></progress>
          || <progress></progress>
        }
      </div>

      {/* TODO: add a pause/resume button */}
      {/* <div className="controll-button">
        <button type="button" className="play"></button>
      </div> */}

      {
        !state.finished &&
        <div className="controll-button">
          <button type="button" className="cancel" onClick={() => removeDownloadEntry(id)}>
            <img src="icons/delete-forever_white_hq_18dp.png" alt="Delete Icon" />
            Cancel
          </button>
        </div>
      }
    </li>
  )
}

function DownloadSummary({ time, size }) {
  return (
    <div className="download-summary">
      <span className="check-mark">
        <img src="icons/check-mark_24.png" alt="Check Mark" />
      </span>
      Downloaded {size}Bytes in {time}s
    </div>
  )
}