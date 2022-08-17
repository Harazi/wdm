import React from "react"
import NewFileDialog from "./NewFileDialog"

function reducer(state, action) {
  switch (action.type) {

    case "LOADING":
      return {
        isLoading: true,
        errorMessage: false
      }

    case "INVALID_URL":
      return {
        isLoading: false,
        errorMessage: "That's invalid url. Please check again"
      }

    case "FAILED_FETCHING": {
      console.error(action.error)
      return {
        isLoading: false,
        errorMessage: "Failed connecting to the server"
      }
    }

    case "UNEXPECTED_STATUS_CODE":
      return {
        isLoading: false,
        errorMessage: `Unexpected status code: ${action.status}`
      }

    default:
      throw new TypeError(`Unkonwn action type: ${action.type}`)
  }
}

const initialState = {
  isLoading: false,
  errorMessage: false
}

export default function AddLink({ makePopup, addNewDownload }) {

  const [state, dispatch] = React.useReducer(reducer, initialState)
  const URLInput = React.useRef(null)

  async function connect() {

    dispatch({ type: "LOADING" })

    try {

      var { href } = new URL(URLInput.current.value)

    } catch (error) {

      return dispatch({ type: "INVALID_URL" })

    }

    const abortController = new AbortController()

    try {

      var res = await fetch("api/get", {
        redirect: "manual",
        cache: "no-store",
        referrer: "",
        headers: {
          'x-wdm': href,
          range: "bytes=0-",
        },
        signal: abortController.signal,
      })

    } catch (error) {

      return dispatch({ type: "FAILED_FETCHING", error })

    }

    // Got the headers, no need for the body
    abortController.abort()

    if (!(res.status === 200 || res.status === 206))
      return dispatch({ type: "UNEXPECTED_STATUS_CODE", status: res.status })

    const fileSize = res.headers.get("content-length")
    const contentDisposition = res.headers.get("content-disposition")
    const fileDefaultName = contentDisposition ? contentDisposition.split("filename=")[1] : href.split("/").pop()

    makePopup(
      <NewFileDialog
        url={res.headers.get("x-wdm-finalurl")}
        makePopup={makePopup}
        addNewDownload={addNewDownload}
        size={fileSize}
        defaultName={fileDefaultName}
        resumable={res.status === 206 && Number(fileSize) > 0} />,
      "File information"
    )

  }

  return (
    <div className="connect-to-url">

      <div className="main-inputs">

        <div className="label-input-pair">
          <label htmlFor="URL-input">Downlaod link</label>
          <input
            type="url"
            id="URL-input"
            ref={URLInput}
            disabled={state.isLoading}
            placeholder={"https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"}
            autoFocus />
        </div>

        <div className="confirm">
          <button type="button" onClick={connect} disabled={state.isLoading}>Connect</button>
        </div>

      </div>

      {state.errorMessage &&
      <div className="error-displayer">
        <p>{state.errorMessage}</p>
      </div>}

    </div>
  )
}