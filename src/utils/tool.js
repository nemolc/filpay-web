export const convert_fil=(value)=> {
    var fil = (value / (10 ** 18)).toFixed(4);
    if (fil>0.0001){
        return fil+" FIL"
    }
    var nanoFil=(value / (10 ** 9)).toFixed(4);
    return nanoFil+" nanoFIL"
}