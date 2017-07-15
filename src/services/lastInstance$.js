import instances$ from './instances$'

/**
 * Select in the last frame (with pixi) the last detected pixi instance.
 * @var {Observable}
 */
export default instances$.map(frames => {
  if (frames.length === 0) {
    return null
  }
  const frame = frames[frames.length - 1]
  if (frame.data.length === 0) {
    return null
  }
  const instance = frame.data[frame.data.length - 1]
  return {
    version: instance.version,
    status: instance.status,
    connection: frame.from,
    frameURL: frame.frameURL,
    index: (frame.data.length - 1)
  }
})
