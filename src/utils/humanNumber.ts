const abbrMap = new Map([
  ["K", 1000],
  ["M", 1000 ** 2],
  ["T", 1000 ** 3],
])

/**
 *
 * @param {number} number
 * @param {number} decimalPlaces
 * @returns {string}
 */
export function humanNumber(number, decimalPlaces = 2) {
  if (number > abbrMap.get("T"))
    return (number / abbrMap.get("T")).toFixed(decimalPlaces) + "T"
  if (number > abbrMap.get("M"))
    return (number / abbrMap.get("M")).toFixed(decimalPlaces) + "M"
  if (number > abbrMap.get("K"))
    return (number / abbrMap.get("K")).toFixed(decimalPlaces) + "K"
  return number.toString()
}