import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';
import { filter } from 'rxjs/internal/operators/filter';
if (typeof window !== 'undefined') {
    // 初始化 BOSSJOB_SHARED_DATA
    window.BOSSJOB_SHARED_DATA = window.BOSSJOB_SHARED_DATA || {};
    window.BOSSJOB_INITIAL_PROPS = window.BOSSJOB_INITIAL_PROPS || {};
    // 创建一个 BehaviorSubject，用于发布数据变化
    window.BOSSJOB_BASE_SUBJECT = window.BOSSJOB_BASE_SUBJECT || new BehaviorSubject(null);
    window.BOSSJOB_NOTE_SUBJECT = window.BOSSJOB_NOTE_SUBJECT || new Subject(null);

}

// 设置数据
const setCache = (id, data) => {
    const oldData = window.BOSSJOB_SHARED_DATA?.[id]
    // 如涉及到函数，则执行函数
    const newData = typeof data === 'function' ? data(oldData) : data;
    window.BOSSJOB_SHARED_DATA[id] = newData;
    // 发布数据变化
    if (!deepEqual(oldData, newData)) {
        window.BOSSJOB_BASE_SUBJECT.next({ type: 'SHARE_DATA_CHANGED', id, data: window.BOSSJOB_SHARED_DATA[id] });
    }
};

// 获取数据
export const getSharedData = id => {
    return window.BOSSJOB_SHARED_DATA[id];
};

export const getInitialProps = id => {
    return window.BOSSJOB_INITIAL_PROPS[id];
}

export const setInitialProps = (id, data) => {
    window.BOSSJOB_INITIAL_PROPS[id] = data
}

export const postNotification = (id, note) => {
    window.BOSSJOB_NOTE_SUBJECT.next({ id, note })
}

export const receiveNotification = (id, callback) => {
    const revoker = window.BOSSJOB_NOTE_SUBJECT
        .pipe(
            filter((data) => data?.id === id),
        )
        .subscribe(callback);
    return () => revoker.unsubscribe();
}

export const watchSharedData = (id, watcher) => {
    const revoker = window.BOSSJOB_BASE_SUBJECT
        .pipe(
            filter((note) => note?.type === 'SHARE_DATA_CHANGED'),
            filter(({ id: moduleId }) => moduleId === id)
        )
        .subscribe(watcher);
    return () => revoker.unsubscribe();
}
export const publishSharedData = (id, data) => {
    setCache(id, data)
}

export const observerRender = (render, id) => {
    console.log({ startRender: id })
    let rendered = false;
    let count = 0
    const renderFunc = () => {
        const element = document.getElementById(id);
        if (element) {
            // Your element is added, run your script here
            if (!rendered) {
                render()
                publishSharedData('MODULE_LOADED', modules => ({ ...modules, [id]: true }))
                rendered = true
            }
        }
    }
    const start = () => {
        renderFunc()
        count++
        if (!rendered && count < 100) {
            setTimeout(start, 200)
        } else {
            console.log({ endRender: id })
        }
    }
    start()
    // renderFunc()
    // if (!rendered) {
    //     return
    // }
    // const observer = new MutationObserver((mutationsList, observer) => {
    //     // Look through all mutations that just occured
    //     console.log({ mutationsList })
    //     for (const mutation of mutationsList) {
    //         // If the addedNodes property has one or more nodes
    //         if (mutation.addedNodes.length) {
    //             renderFunc()
    //             observer.disconnect(); // Stop observing
    //         }
    //     }
    // })
    // observer.observe(document.body, { childList: true, subtree: true });
}

if (typeof window !== 'undefined') {

    window.BOSSJOB_STORAGE_COMMANDS = {
        getSharedData,
        watchSharedData,
        getInitialProps,
        setInitialProps,
        publishSharedData
    }
}
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
        return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }

    if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2)) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}



