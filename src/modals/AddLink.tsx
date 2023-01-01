import React from "react"
import NewFileDialog from "./NewFileDialog"

import type {
  MakeModalFunction,
  AddNewDownloadEntry
} from "../types"

interface AddLinkProps {
  makeModal: MakeModalFunction
  addNewDownload: AddNewDownloadEntry
}

interface ReducerState {
  isLoading: boolean
  errorMessage: string | null
}

type ReducerActionTypes = "LOADING" | "INVALID_URL" | "FAILED_FETCHING" | "UNEXPECTED_STATUS_CODE"

interface ReducerActionObject {
  type: ReducerActionTypes
  error?: any
  status?: number
}

const initialState = {
  isLoading: false,
  errorMessage: null
}

export default function AddLink({ makeModal, addNewDownload }: AddLinkProps) {

  const [state, dispatch] = React.useReducer(reducer, initialState)
  const URLInput = React.useRef<HTMLInputElement>(null)

  async function connect() {

    dispatch({ type: "LOADING" })

    let url = URLInput.current?.value ?? ''

    if (!url.match(/https?:\/\/i/))
      url = "http://".concat(url)

    try {

      var { href } = new URL(url)

    } catch (error) {

      return dispatch({ type: "INVALID_URL" })

    }

    const abortController = new AbortController()

    try {

      var res = await fetch(`api/get?url=${encodeURIComponent(href)}`, {
        redirect: "manual",
        cache: "no-store",
        referrer: "",
        headers: {
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

    const fileSize = Number(res.headers.get("content-length"))
    const contentDisposition = res.headers.get("content-disposition")
    const fileDefaultName = contentDisposition ? contentDisposition.split("filename=")[1] : href.split("/").pop() || ''
    const resumable = Boolean(res.status === 206 && res.headers.has("accept-ranges") && Number(fileSize) > 0)

    makeModal(
      <NewFileDialog
        url={new URL(res.headers.get("x-wdm-finalurl") ?? '')}
        makeModal={makeModal}
        addNewDownload={addNewDownload}
        size={fileSize}
        defaultName={fileDefaultName}
        resumable={resumable} />,
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
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && connect()} />
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

function reducer(state: ReducerState, action: ReducerActionObject): ReducerState {
  switch (action.type) {

    case "LOADING":
      return {
        isLoading: true,
        errorMessage: null
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
