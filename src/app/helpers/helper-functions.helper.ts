import { isArray, isDate, isEmpty, isObject, isString } from 'lodash';

export function IsNullOrUndefined(value: any): boolean {
    let isNullOrUndefined = false;
    if ((isObject(value) && !isDate(value)) || isArray(value)) {
        isNullOrUndefined = isEmpty(value);
    } else {
        isNullOrUndefined = value === null || value === undefined || typeof value === 'undefined';
    }
    return isNullOrUndefined;
}

export function IsNullOrUndefinedOrEmptyString(value: any): boolean {
    if (IsNullOrUndefined(value) || (isString(value) && !value.trim())) return true;
    return false;
}


export function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const r = (num >> 16) + amt;
    const g = (num >> 8 & 0x00FF) + amt;
    const b = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 + (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 + (b < 255 ? (b < 1 ? 0 : b) : 255)).toString(16).slice(1)}`;
}

export function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const r = (num >> 16) - amt;
    const g = (num >> 8 & 0x00FF) - amt;
    const b = (num & 0x0000FF) - amt;
    return `#${(0x1000000 + (r > 0 ? r : 0) * 0x10000 + (g > 0 ? g : 0) * 0x100 + (b > 0 ? b : 0)).toString(16).slice(1)}`;
}