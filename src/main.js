const {createApp} = Vue;

const vm = createApp({
    data() {
        return {
            connectionList: {},
            host: true,
            selfNum: "",
            roomNum: "",
            ws: null,
            data: ""
        }
    },
    methods: {
        createWebSocket() {
            return new Promise((resolve, reject) => {
                this.ws = new WebSocket("wss://buaa-jj.cn/websocket")
                this.ws.onmessage = (event) => {
                    const body = JSON.parse(event.data)
                    const data = body.data;
                    switch (body.type) {
                        case "connect" :
                            this.selfNum = data.num
                            resolve()
                            break;
                        case "call":
                            const callFrom = data.from;
                            const connection = new RTCPeerConnection({
                                iceServers: [
                                    {
                                        urls: "stun:39.104.26.107:3478"
                                    }
                                ]
                            });
                            connection.ondatachannel = (event) => {
                                const channel = event.channel;
                                channel.onmessage = this.handleReceive
                                this.connectionList[callFrom].channel = channel;
                            }
                            connection.onicecandidate = (event) => {
                                if (event.candidate) {
                                    this.ws.send(JSON.stringify({
                                        type: 'ice',
                                        data: {
                                            from: this.selfNum,
                                            to: callFrom,
                                            candidate: event.candidate
                                        }
                                    }))
                                }
                            }
                            this.connectionList[callFrom] = {peer: connection};
                            connection.setRemoteDescription(data.sdp).then(() => {
                                connection.createAnswer().then((desc) => {
                                    connection.setLocalDescription(desc).then(() => {
                                        this.ws.send(JSON.stringify({
                                            type: 'answer',
                                            data: {
                                                from: this.selfNum,
                                                to: callFrom,
                                                sdp: desc
                                            }
                                        }))
                                    })
                                })
                            })
                            break;
                        case "answer":
                            const answerFrom = data.from;
                            if (this.connectionList[answerFrom]) {
                                const connection = this.connectionList[answerFrom].peer;
                                connection.setRemoteDescription(data.sdp)
                            }
                            break;
                        case "ice":
                            const iceFrom = data.from;
                            if (this.connectionList[iceFrom]) {
                                const connection = this.connectionList[iceFrom].peer;
                                connection.addIceCandidate(data.candidate)
                            }
                            break;
                    }
                }
                this.ws.onopen = () => {
                    this.ws.send(JSON.stringify({
                        type: 'connect'
                    }))
                }
            })
        },
        createConnection() {
            this.closeAllPeer()
            if (!this.ws) {
                this.createWebSocket()
            }
        },
        joinConnection() {
            this.closeAllPeer()
            if (!this.ws) {
                this.createWebSocket().then(() => {
                    this.initPeer()
                })
            } else {
                this.initPeer()
            }
        },
        initPeer() {
            const roomNum = this.roomNum
            const peer = new RTCPeerConnection(
                {
                    iceServers: [
                        {
                            urls: "stun:39.104.26.107:3478"
                        }
                    ]
                }
            )
            const channel = peer.createDataChannel("sendChannel");
            channel.onopen = () => {
                channel.send("Hello World!")
            }
            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    this.ws.send(JSON.stringify({
                        type: 'ice',
                        data: {
                            from: this.selfNum,
                            to: this.roomNum,
                            candidate: event.candidate
                        }
                    }))
                }
            }
            peer.createOffer().then((desc) => {
                peer.setLocalDescription(desc).then(() => {
                    this.ws.send(JSON.stringify({
                        type: 'call',
                        data: {
                            from: this.selfNum,
                            to: roomNum,
                            sdp: desc
                        }
                    }))
                })
            })
            this.connectionList[roomNum] = {
                peer: peer,
                channel: channel
            };
        },
        closeAllPeer() {
            for (const key in this.connectionList) {
                const connection = this.connectionList[key];
                connection.channel.close();
                connection.peer.close();
            }
            this.connectionList = {};
        },
        sendMessage() {
            for (const key in this.connectionList) {
                const connection = this.connectionList[key];
                connection.channel.send(this.data)
            }
        },
        handleReceive(event) {
            this.data = event.data;
        }
    }
})

vm.use(ElementPlus)
vm.mount('#app')
