import React from "react"
import YoutubeFile from "./YoutubeFile"
import { isValidYoutubeURL } from "../utils/isValidYoutubeURL"

import type {
  MakePopupFunction,
  AddNewDownloadEntry
} from "../types"

interface YoutubeLinkProps {
  makePopup: MakePopupFunction
  addNewDownload: AddNewDownloadEntry
}

interface ReducerState {
  isLoading: boolean
  errorMessage: string | null
}

type ReducerActionTypes = "LOADING" | "INVALID_LINK" | "FAILED_FETCHING" | "UNEXPECTED_STATUS_CODE"

interface ReducerActionObject {
  type: ReducerActionTypes
  error?: any
  status?: number
}

const initialState: ReducerState = {
  isLoading: false,
  errorMessage: null
}

export default function YoutubeLink({ makePopup, addNewDownload }: YoutubeLinkProps) {

  const [state, dispatch] = React.useReducer(reducer, initialState)

  const URLInput = React.useRef<HTMLInputElement>(null)

  async function connect() {

    dispatch({ type: "LOADING" })

    const id = isValidYoutubeURL(URLInput.current?.value)

    if (!id)
      return dispatch({ type: "INVALID_LINK" })

    try {

      var res = await fetch(`api/youtubeInfo?id=${id}`, {
        redirect: "manual",
        cache: "no-store",
        referrer: "",
      })

      var details = await res.json()

    } catch (error) {

      return dispatch({ type: "FAILED_FETCHING", error })

    }

    if (!(res.status === 200 || res.status === 206))
      return dispatch({ type: "UNEXPECTED_STATUS_CODE", status: res.status })

    makePopup(
      <YoutubeFile
        details={details}
        makePopup={makePopup}
        addNewDownload={addNewDownload} />,
      "Video information"
    )

  }

  return (
    <div className="connect-to-url">

      <div className="main-inputs">
        <div className="label-input-pair">
          <label htmlFor="URL-input">Youtube link or video ID</label>
          <input
            type="text"
            id="URL-input"
            ref={URLInput}
            disabled={state.isLoading}
            placeholder={"youtu.be/Sklc_fQBmcs"}
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

    case "INVALID_LINK":
      return {
        isLoading: false,
        errorMessage: "That's invalid youtube link. Try inserting only the Identifier"
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
