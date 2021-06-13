export const detachArrayBuffer = (arrayBuffer) => {
    const { port1, port2 } = new MessageChannel();
    return new Promise((resolve) => {
        port2.onmessage = () => {
            port1.close();
            port2.close();
            resolve();
        };
        port1.postMessage(arrayBuffer, [arrayBuffer]);
    });
};
//# sourceMappingURL=detach-array-buffer.js.map