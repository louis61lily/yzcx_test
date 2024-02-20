function socketRequest(uid, origin, destination) {
    const socket = new WebSocket(`ws://1.94.66.195:9197/websocket/${uid}`)
    
    let sendInfo = JSON.stringify({
        id: uid,
        type: leading,
        origin: origin,
        destination: destination
    })
}