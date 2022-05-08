import React from "react"
import NewFileDialog from "./new-file-dialog.jsx"
import modularContext from '../context/modularContext.jsx'

function reducer(state, action) {
  switch (action.type) {

    case "LOADING":
      return {
        className: "loading",
        errorMessage: false
      }

    case "INVALID_URL":
      return {
        className: "",
        errorMessage: "That's invalid url. Please check again"
      }

    case "FAILED_FETCHING": {
      console.error(action.error)
      return {
        className: "",
        errorMessage: "Failed connecting to the server"
      }
    }

    case "UNEXPECTED_STATUS_CODE":
      return {
        className: "",
        errorMessage: `Unexpected status code: ${action.status}`
      }

    default:
      throw new TypeError(`Unkonwn action type: ${action.type}`)
  }
}

const initialState = {
  className: "",
  errorMessage: false
}

export default function AddLink({ addNewDownload }) {

  const modularState = React.useContext(modularContext)

  const [state, dispatch] = React.useReducer(reducer, initialState)

  async function connect(e) {

    dispatch({ type: "LOADING" })

    try {

      var { href } = new URL(e.target.previousElementSibling.value)

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

    console.log(Object.fromEntries(res.headers.entries()))

    modularState.makeModular({
      title: "File information",
      render: (
        <NewFileDialog
          url={res.headers.get("x-wdm-finalurl")}
          addNewDownload={addNewDownload} />
      )
    })

  }

  return (
    <div className="add-link">

      <div className={`inputs ${state.className}`}>
        <input type="url" autoFocus placeholder="https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" disabled={state.className === "loading"} />
        <button type="button" onClick={connect} disabled={state.className === "loading"}>Connect</button>
      </div>

      {state.errorMessage &&
      <div className="error-displayer">
        <p>{state.errorMessage}</p>
      </div>}

    </div>
  )
}