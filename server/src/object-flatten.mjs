Object.flatten = (obj, roots = [], separator = '.') => Object.keys(obj)
    .reduce((memo, prop) => Object.assign(
        {},
        memo,
        Object.prototype.toString.call(obj[prop]) === '[object Object]'
            ? Object.flatten(obj[prop], roots.concat([prop]))
            : Array.isArray(obj[prop])
            ? Object.flatten(obj[prop].reduce((acc, e, i) => (acc[i] = e, acc), {}), roots.concat([prop]))
            : {[roots.concat([prop]).join(separator)]: obj[prop]}
    ), {});

export default Object;
