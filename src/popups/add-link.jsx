import React from "react"
import NewFileDialog from "./new-file-dialog.jsx"

export default function AddLink({ makePopup, addNewDownlaod }) {

  const [additionalClasses, useAdditionalClasses] = React.useState("")

  const [errorMessage, useErrorMessage] = React.useState(false)
  
  const errorsList = {
    invalidUrl: "That's invalid url. Please check again",
    unknown: "Something is wrong, Please try again"
  }

  // Doesn't work. race condition?
  // React.useEffect(() => useAdditionalClasses(""), [errorMessage])
  function changeState(errorState = false, classState = "") {
    useErrorMessage(errorState)
    useAdditionalClasses(classState)
  }

  async function connect(e) {

    // useErrorMessage(false)
    // useAdditionalClasses("loading")
    changeState(false, "loading")

    try {

      var { href } = new URL(e.target.previousElementSibling.value)

    } catch (error) {
      // useErrorMessage(errorsList[error instanceof TypeError ? "invalidUrl" : "unknown"])
      // useAdditionalClasses("")
      changeState(errorsList[error instanceof TypeError ? "invalidUrl" : "unknown"])
      return
    }

    try {

      var res = await fetch('http://localhost:5000/api/get', {
        headers: {
          'x-wdm': href,
          // range: "bytes=0-"
        }
      })
      
    } catch (error) {
      // useErrorMessage(error.toString())
      // useAdditionalClasses("")
      changeState(error.toString())
      return
    }

    console.dir(res)
    for (const [header, val] of res.headers.entries()) {
      console.log(header, ":", val)
    }


    if (!(res.status === 200 || res.status === 206))
      // return useErrorMessage(`Server Respond with status code ${res.status}`)
      return changeState(`Server Respond with status code ${res.status}`)

    makePopup(<NewFileDialog url={href} makePopup={makePopup} addNewDownlaod={addNewDownlaod} />)

  }

  return (
    <div className="add-link">

      <div className={"inputs " + additionalClasses}>
        <input type="url" placeholder="https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" disabled={additionalClasses.includes("loading")} />
        <button type="button" onClick={connect} disabled={additionalClasses.includes("loading")}>Connect</button>
      </div>

      {errorMessage &&
      <div className="error-displayer">
        <p>{errorMessage}</p>
      </div>}

    </div>
  )
}

// function verifyResponse(res) {
//   if (res)
// }

// function acceptRange(res) {
//   if (res.headers.get("range"))
// }