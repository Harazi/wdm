import React from "react"
import YoutubeFile from "./youtube-file.jsx"

function reducer(state, action) {
  switch (action.type) {

    case "LOADING":
      return {
        isLoading: true,
        errorMessage: false
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

const initialState = {
  isLoading: false,
  errorMessage: false
}

/**
 * @param {string} url
 * @returns {boolean|string}
 */
function isValidYoutubeURL(url) {
  const regexResult = url.match(/(:?\/|\?|v=|^)(?<id>[a-zA-Z0-9_-]{11})(?:&|\/|$)/)
  return regexResult && regexResult.groups.id
}


export default function YoutubeLink({ makePopup, addNewDownlaod }) {

  const [state, dispatch] = React.useReducer(reducer, initialState)

  const youtubeURL = React.useRef()

  async function connect() {

    dispatch({ type: "LOADING" })

    const id = isValidYoutubeURL(youtubeURL.current.value)

    if (!id)
      return dispatch({ type: "INVALID_LINK" })

    try {

      var res = await fetch(`api/youtube?id=${id}`, {
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
        addNewDownload={addNewDownlaod} />,
      "Video information"
    )

  }

  return (
    <div className="youtube-link">

      <div className="label-input-pair">
        <label htmlFor="youtube-link">Youtube link or video ID</label>
        <input type="text" id="youtube-link" ref={youtubeURL} disabled={state.isLoading} />
      </div>

      <div className="confirm">
        <button type="button" onClick={connect} disabled={state.isLoading}>Connect</button>
      </div>

      {state.errorMessage &&
        <div className="error-displayer">
          <p>{state.errorMessage}</p>
        </div>}

    </div>
  )

}