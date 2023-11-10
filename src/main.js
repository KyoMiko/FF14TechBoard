import WebrtcClient from './webrtc.js'

const {createApp} = Vue;

const vm = createApp({
    data() {
        return {
            selfNum: "",
            roomNum: "",
            ws: null,
            data: "",
            webrtc: null,
            host: -1,
            people: 0
        }
    },
    computed: {
        mode() {
            let mode = {}
            if (this.webrtc) {
                if (this.host === -1) {
                    mode.text = "未连接";
                    mode.type = "info"
                } else if (this.host === 0) {
                    mode.text = "参与者";
                    mode.type = ""
                } else if (this.host === 1) {
                    mode.text = "主持人";
                    mode.type = "success"
                }
            } else {
                mode.text = "离线"
                mode.type = "info"
            }
            return mode
        },
        hostTip() {
            return this.people + "人已加入"
        }
    },
    methods: {
        createConnection() {
            this.webrtc = new WebrtcClient([{
                urls: "turn:39.104.26.107:3478",
                username: "admin",
                credential: "admin"
            }], "wss://www.buaa-jj.cn/websocket");
            this.webrtc.onReady = () => {
                this.selfNum = this.webrtc.uid
            }
        },
        joinConnection() {
            this.webrtc.onReceive = this.handleReceive
            ElNotification({
                title: '尝试加入',
                message: '您正在尝试建立与' + this.roomNum + '的连接',
                type: 'info',
                duration: 1000
            })
            this.webrtc.join(this.roomNum)
        },
        leaveConnection() {
            this.webrtc.leave()
        },
        handleReceive(event) {
            this.data = event.data;
        }
    },
    mounted() {
        debugger
        window.ElNotification = this.$notify
        window.host = -1
        window.updateHost = (val) => {
            window.host = val;
            this.host = val;
        };
        window.updatePeople = (val) => {
            if (val === 1) {
                this.people += 1;
            } else if (val === -1) {
                this.people -= 1;
            } else if (val === 0) {
                this.people = 0;
            }
        }
    }
})

vm.use(ElementPlus)
vm.mount('#app')
