/**
 *
 * @param {Object} obj
 * @param {Object} obj.reader
 * @param {Object} obj.writable
 * @param {Object} obj.on
 * @param {Function} obj.on.progress
 * @param {Function} obj.on.finish
 *
 */
export async function streamToFile({ reader, writable, on }) {
  const startTime = Date.now()
  while (true) {

    const { done, value } = await reader.read()

    if (done) {
      typeof on?.finish === "function" && on.finish(Date.now() - startTime)
      break
    }

    await writable.write(value)
    typeof on?.progress === "function" && on.progress(value.length)
  }
}