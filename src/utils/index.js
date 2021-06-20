export const getDataOnEvent = (func, delay) => {
    let timer;
    return function(event) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(event);
        }, delay)
    }
}
