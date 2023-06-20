import { ElMessage } from 'element-plus'
//通过高度计算时间戳
export const getTimestamp = (start_at, block_delay_secs, height) => {
    return formatDate(start_at + (block_delay_secs * height))
}
export const getHeight = (start_at, block_delay_secs, curr_time) => {
    console.log(start_at, block_delay_secs, curr_time)
    let duration = curr_time - start_at;
    if (duration < 0) {
        ElMessage.warning('illegal time')
        return
    }
    let height = parseInt(duration / block_delay_secs)
    return {
        "height": height,
        "revision_time": getTimestamp(start_at, block_delay_secs, height)
    }
}
//时间戳转化日期
const formatDate = (str) => {
    //Date.now()        //时间戳
    str = str * 1000        //时间戳化成毫秒单位
    let date = new Date(str);        //获取系统时间
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    let day = date.getDate();
    day = day < 10 ? ('0' + day) : day;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let m = date.getMinutes();
    m = m < 10 ? ('0' + m) : m;
    let s = date.getSeconds();
    s = s < 10 ? ('0' + s) : s;
    //let w = date.getDay();        //获取星期几
    return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
}