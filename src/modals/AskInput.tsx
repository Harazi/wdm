import React, { useState, useRef } from "react"
import { useModal, register, create } from "@ebay/nice-modal-react"
import Modal from "../Modal"
import type { HTMLInputTypeAttribute } from "react"

interface AskInputProps {
  title: string,
  errorMsg: string,
  label: string,
  inputType: HTMLInputTypeAttribute,
  inputPlaceHolder: string,
  submitBtnText: string,
}
const AskInput = create(({
  title,
  errorMsg,
  label = "Insert text",
  inputType = "text",
  inputPlaceHolder = "",
  submitBtnText = "Submit",
}: AskInputProps) => {

  const modal = useModal()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  function giveOutput() {
    if (!inputRef.current) return
    if (inputRef.current.value.length < 1) return
    setIsLoading(true)
    modal.resolve(inputRef.current.value)
  }

  return (
    <Modal
      title={title}
      visible={modal.visible}
      onClose={modal.hide}
      afterClose={modal.remove}>

      <div className="connect-to-url">

        <div className="main-inputs">

          <div className="label-input-pair">
            <label htmlFor="URL-input">{label}</label>
            <input
              type={inputType}
              id="URL-input"
              ref={inputRef}
              disabled={isLoading}
              placeholder={inputPlaceHolder}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && giveOutput()} />
          </div>

          <div className="confirm">
            <button type="button" onClick={giveOutput} disabled={isLoading}>{submitBtnText}</button>
          </div>

        </div>

        {errorMsg &&
          <div className="error-displayer">
            <p>{errorMsg}</p>
          </div>}

      </div>
    </Modal>
  )
})

export default AskInput
export const AskInputModalID = "ASK_INPUT"

register(AskInputModalID, AskInput)
