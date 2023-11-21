function isJSON(str: string): boolean {
  try {
    return JSON.parse(str) && !!str
  } catch (e) {
    return false
  }
}

function keyCount(json: JSON): number {
  return Object.keys(json).length
}

function parseJSON(str: string): { [key: string]: string | number } {
  try {
    const data = JSON.parse(str ?? '')
    const count = keyCount(data)
    if (count > 1) {
      const mappedObj: { [key: string]: number | string } = {}
      for (const [key, valueJson] of Object.entries(data)) {
        const parsedValue = parseFloat(valueJson as string)
        mappedObj[key] = isNaN(parsedValue) ? (valueJson as string) : parsedValue
      }
      return mappedObj
    } else {
      return { 0: 0 }
    }
  } catch (e) {
    return { 0: 0 }
  }
}

export function stringToFloatJson(value: string | null | undefined): number | { [key: string]: string | number } {
  try {
    const numFloat = parseFloat(value ?? '0')
    const json = isJSON(value ?? '')
    if (json && isNaN(numFloat)) {
      const data = JSON.parse(value ?? '')
      const count = keyCount(data)
      if (count > 1) {
        return parseJSON(value ?? '')
      } else {
        return 0
      }
    }
    if (isNaN(numFloat)) {
      return 0
    } else {
      return numFloat
    }
  } catch (e) {
    return 0
  }
}

export function intToString(value: string | null | undefined): number | { [key: string]: string | number } | string {
  try {
    if (value === null || value === undefined) {
      return ''
    } else {
      const intValue = parseInt(value)
      if (!isNaN(intValue)) {
        return intValue.toString()
      } else {
        return value
      }
    }
  } catch (e) {
    return ''
  }
}

export function toObject(value: string | null | undefined): unknown {
  try {
    if (value === null || value === undefined) {
      return {}
    } else {
      return value
    }
  } catch (e) {
    return {}
  }
}
