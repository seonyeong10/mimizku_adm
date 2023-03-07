export function nvl(value) {
    if(typeof value === 'undefined' || value === null || value === '')
        return true;
    else 
        return false;
}