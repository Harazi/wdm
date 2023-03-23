interface StreamToFileParams {
  reader: ReadableStreamDefaultReader
  writer: WritableStreamDefaultWriter
  on?: StreamToFileEvents
}

interface StreamToFileEvents {
  progress?: (bufferLength: number) => void
  finish?: (totalTimeMS: number) => void
  error?: (error: unknown) => void
}

export async function pipeTo({ reader, writer, on }: StreamToFileParams) {
  const startTime = Date.now()

  while (true) {
    let done, value

    try {
      ({ done, value } = await reader.read())
    } catch (err) {
      on?.error?.(err)
      break
    }

    if (done) {
      on?.finish?.(Date.now() - startTime)
      break
    }

    await writer.write(value)
    on?.progress?.(value.length)
  }
}
