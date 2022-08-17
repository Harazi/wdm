import React from "react"

export default function Nav({ children }) {
  return (
    <nav>
      <ol>
        {children}
      </ol>
    </nav>
  )
}