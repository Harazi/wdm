import React from "react"
// import Header from "./header.jsx"
import Aside from "./aside.jsx"
import Main from "./main.jsx"
import Popup from "./popup.jsx"

export default function Interface() {

  // const [isDesktop, useIsDesktop] = React.useState(window.outerWidth > 1000)

  // React.useEffect(() => addEventListener("resize", () => useIsDesktop(window.outerWidth > 1000)), [])

  const [displayPopup, setDisplayPopup] = React.useState(false)

  function closePopup() {
    setDisplayPopup(false)
  }

  const [downloadList, setDownloadList] = React.useState([])

  function addNewDownlaod(url, name, stream) {
    setDownloadList([
      ...downloadList,
      {
        url,
        name
      }
    ])
  }

  return (
    <div className="main-container">
    
      {/* {isDesktop
      ? <Aside> <Nav /> </Aside>
      : <Header> <Nav /> </Header>} */}

      <Aside makePopup={setDisplayPopup} addNewDownlaod={addNewDownlaod} />

      <Main downloadList={downloadList} />
      
      {displayPopup &&
      <Popup
        closeFn={closePopup}
        title="Paste the link you want to download from"
        children={[displayPopup]} />}

    </div>
  )

}