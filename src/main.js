const {createApp} = Vue;
window.connectionList= {}

const vm = createApp({
    data() {
        return {
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
                this.ws = new WebSocket("wss://www.buaa-jj.cn/websocket")
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
                                if(channel) {
                                    channel.onmessage = this.handleReceive
                                    connectionList[callFrom].channel = channel
                                }
                            }
                            connectionList[callFrom] = {peer: connection};
                            
                            let candidate = new Promise((resolve,reject)=>{
                                let candidateList = []
                                connection.onicecandidate = (event) => {
                                    if (event.candidate) {
                                        candidateList.push(event.candidate)
                                    }else{
                                        resolve(candidateList)
                                    }
                                }
                            })
                            let answer = new Promise((resolve,reject)=>{
                                connection.setRemoteDescription(data.sdp).then(() => {
                                    connection.createAnswer().then((desc) => {
                                        connection.setLocalDescription(desc).then(() => {
                                            resolve(desc)
                                        })
                                    })
                                })
                            })

                            Promise.all([answer,candidate]).then(result=>{
                                this.ws.send(JSON.stringify({
                                    type: 'answer',
                                    data: {
                                        from: this.selfNum,
                                        to: callFrom,
                                        sdp: result[0]
                                    }
                                }))
                                this.ws.send(JSON.stringify({
                                    type: 'ice',
                                    data: {
                                        from: this.selfNum,
                                        to: callFrom,
                                        candidate: result[1]
                                    }
                                }))
                            })
                            break;
                        case "answer":
                            const answerFrom = data.from;
                            if (connectionList[answerFrom]) {
                                const connection = connectionList[answerFrom].peer;
                                connection.setRemoteDescription(data.sdp)
                            }
                            break;
                        case "ice":
                            const iceFrom = data.from;
                            console.log(1);
                            if (connectionList[iceFrom]) {
                                console.log(2)
                                console.log(data)
                                const connection = connectionList[iceFrom].peer;
                                const candidateList = data.sdp;
                                for (const candidate of candidateList) {
                                    connection.addIceCandidate(candidate)
                                }
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
            const channel = peer.createDataChannel("channel");
            channel.onmessage = this.handleReceive
            let offer = new Promise((resolve,reject)=>{
                peer.createOffer().then((desc) => {
                    peer.setLocalDescription(desc).then(() => {
                        resolve(desc)
                    })
                })
            })
            let candidate = new Promise((resolve,reject)=>{
                let candidateList = []
                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        candidateList.push(event.candidate)
                    }else{
                        resolve(candidateList)
                    }
                }
            })

            Promise.all([offer,candidate]).then((result)=>{
                this.ws.send(JSON.stringify({
                    type: 'call',
                    data: {
                        from: this.selfNum,
                        to: roomNum,
                        sdp: result[0]
                    }
                }))
                this.ws.send(JSON.stringify({
                    type: 'ice',
                    data: {
                        from: this.selfNum,
                        to: this.roomNum,
                        candidate: result[1]
                    }
                }))
            })

            connectionList[roomNum] = {
                peer: peer,
                channel: channel
            };
        },
        closeAllPeer() {
            for (const key in connectionList) {
                const connection = connectionList[key];
                connection.channel.close();
                connection.peer.close();
            }
            connectionList = {};
        },
        sendMessage() {
            debugger
            for (const key in connectionList) {
                const connection = connectionList[key];
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
