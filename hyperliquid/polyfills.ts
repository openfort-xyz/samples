import "event-target-polyfill";

if (!globalThis.CustomEvent) {
    globalThis.CustomEvent = function (type, params) {
        params = params || {};
        const event = new Event(type, params);
        event.detail = params.detail || null;
        return event;
    };
}

if (!AbortSignal.timeout) {
    AbortSignal.timeout = function (delay) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), delay);
        return controller.signal;
    };
}

if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}