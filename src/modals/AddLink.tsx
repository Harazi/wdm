import React from "react"
import Modal from "../Modal"
import { useModal, register, create } from "@ebay/nice-modal-react"

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


const AddLink = create(() => {

  const modal = useModal()
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const URLInput = React.useRef<HTMLInputElement>(null)

  async function connect() {

    dispatch({ type: "LOADING" })

    let url = URLInput.current?.value ?? ''

    if (!url.match(/https?:\/\//i))
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

    const contentDisposition = res.headers.get("content-disposition")
    const fileSize = Number(res.headers.get("content-length"))

    modal.resolve({
      fileSize,
      contentDisposition,
      fileDefaultName: contentDisposition ? contentDisposition.split("filename=")[1] : href.split("/").pop() || '',
      resumable: Boolean(res.status === 206 && res.headers.has("accept-ranges") && Number(fileSize) > 0),
      url: new URL(res.headers.get("x-wdm-finalurl") ?? ''),
    })


  }

  return (
    <Modal
      title="Download anything from the web"
      visible={modal.visible}
      onClose={modal.hide}
      afterClose={modal.remove}>
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
    </Modal>
  )
})

export default AddLink
export const AddLinkModalID = 'ADD_LINK'

register(AddLinkModalID, AddLink)

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
