export function isValidYoutubeURL(url: string = "") {
  const regexResult = url.match(/(:?\/|\?|v=|^)(?<id>[a-zA-Z0-9_-]{11})(?:&|\/|$)/);
  return regexResult?.groups ? regexResult.groups.id : null;
}
