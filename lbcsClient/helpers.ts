import * as R from "ramda"


const toRGBArray = (rgbString: string): number[] => {
    return R.splitEvery(2, rgbString.slice(1)).map(x => Number.parseInt(x, 16))
}


export {
    toRGBArray
}