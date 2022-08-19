const abbrMap = [
  'K',
  'M',
  'B',
]

export function humanNumber(number: number, decimalPlaces = 2) {

  let i = 0
  while (i++ < abbrMap.length && number > 999)
    number /= 1000
  return number.toFixed(decimalPlaces).concat(abbrMap[i - 2] || '')
}
