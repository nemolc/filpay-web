export const convert_fil = (value) => {
    var fil = (value / (10 ** 18)).toFixed(4);
    if (fil > 0.0001) {
        return fil + " FIL"
    }
    var nanoFil = (value / (10 ** 9)).toFixed(4);
    return nanoFil + " nanoFIL"
}
export const FilStrToAttoStr = (value) => {
    if (typeof value !== "string") {
        throw new Error("illegal parameter type:" + (typeof value))
    }

    let values = value.split(".");
    if (values.length === 0 || values.length > 2) {
        throw new Error("illegal value: " + value)
    }

    let intPart = BigInt(values[0]) * BigInt(10 ** 18);
    let fractionalPart = BigInt(0);
    if (values.length > 1) {
        let b = values[1];
        if (b.length === 0) {
            b = 0
        } else if (b.length > 18) {
            b = b.substring(0, 18)
        } else {
            while (b.length < 18) {
                b = b + "0"
            }
        }

        fractionalPart = BigInt(b);
    }

    let result = intPart + fractionalPart;
    return result.toString()
}


export const ratioToInt = (value) => {
    if (typeof value !== "string") {
        throw new Error("illegal parameter type:" + typeof value);
    }

    let values = value.split(".");
    if (values.length === 0 || values.length > 2) {
        throw new Error("illegal value: " + value);
    }

    let intPart = BigInt(values[0]) * BigInt(10 ** 4);
    let fractionalPart = BigInt(0);
    if (values.length > 1) {
        let b = values[1];
        if (b.length === 0) {
            b = 0;
        } else if (b.length > 4) {
            b = b.substring(0, 4);
        } else {
            while (b.length < 4) {
                b = b + "0";
            }
        }

        fractionalPart = BigInt(b);
    }

    let result = intPart + fractionalPart;
    return parseInt(result);
}