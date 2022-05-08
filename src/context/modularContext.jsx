import React, { createContext, useState } from 'react'

const ModularContext = createContext()

export default ModularContext

export function ModularProvider({ children }) {

  const [Modular, setModular] = useState(false)

  function makeModular({ render, title }) {
    setModular({ render, title, closeMethod: () => setModular(false) })
  }

  return (
    <ModularContext.Provider value={{ Modular, makeModular }}>
      {children}
    </ModularContext.Provider>
  )

}