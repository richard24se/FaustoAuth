import { ENQUEUE_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR } from "../constants";

export const enqueueSnackbar = (notification) => {
    const key = notification.options && notification.options.key;
    const variant = notification.options && notification.options.variant;
    const message = notification && notification.message;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || variant + message // new Date().getTime() + Math.random()
        }
    };
};

export const notiWarn = (notification) => {
    console.log(notification);
    const key = notification.options && notification.options.key;
    const message = notification && notification.message;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            options: { ...notification.options, variant: "warning" },
            key: key || "warning" + message // new Date().getTime() + Math.random()
        }
    };
};
export const notiError = (notification) => {
    console.log(notification);
    const key = notification.options && notification.options.key;
    const message = notification && notification.message;
    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            options: { ...notification.options, variant: "error" },
            key: key || "error" + message // new Date().getTime() + Math.random()
        }
    };
};
export const notiSuccess = (notification) => {
    console.log(notification);
    const key = notification.options && notification.options.key;
    const message = notification && notification.message;
    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            options: { ...notification.options, variant: "success" },
            key: key || "success" + message // new Date().getTime() + Math.random()
        }
    };
};
export const notiInfo = (notification) => {
    console.log(notification);
    const key = notification.options && notification.options.key;
    const message = notification && notification.message;
    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            options: { ...notification.options, variant: "info" },
            key: key || "info" + message // new Date().getTime() + Math.random()
        }
    };
};
export const notiLoading = (notification) => {
    console.log(notification);
    const key = notification.options && notification.options.key;
    const message = notification && notification.message;
    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            options: { ...notification.options, variant: "default" },
            key: key || "default" + message // new Date().getTime() + Math.random()
        }
    };
};

export const closeSnackbar = (key) => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key
});

export const removeSnackbar = (key) => ({
    type: REMOVE_SNACKBAR,
    key
});
