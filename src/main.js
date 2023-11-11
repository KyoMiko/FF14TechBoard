import WebrtcClient from './webrtc.js'
import { getCurrentData, syncScene } from "./sync.js";

const {createApp} = Vue;

const vm = createApp({
    data() {
        return {
            selfNum: "",
            roomNum: "",
            ws: null,
            webrtc: null,
            host: -1,
            people: 0,
            needUpdate: false,
            updating: false,
            syncing: false,
            init: false,
            texture: {},
            mapSelected: {}
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
    watch: {
        needUpdate() {
            if (this.host === 1 && this.needUpdate && !this.updating) {
                this.syncState()
            }
        },
        updating() {
            if (this.host === 1 && this.needUpdate && !this.updating) {
                this.syncState()
            }
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
        releaseConnection() {
            if (host !== -1) {
                this.leaveConnection();
            }
            this.selfNum = ""
            this.webrtc.keepConnect = false;
            this.webrtc.ws.close()
            this.webrtc = null
        },
        joinConnection() {
            this.init = false
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
        syncState() {
            this.needUpdate = false
            this.updating = true
            let data = getCurrentData();
            this.updating = false
            debugger
            this.webrtc.sendMessage(JSON.stringify({
                type: "sync",
                data: data
            }))
        },
        handleReceive(event) {
            debugger
            const msg = JSON.parse(LZString.decompressFromEncodedURIComponent(event.data));
            const type = msg.type
            if (type === "sync" && this.syncing === false) {
                this.syncing = true
                syncScene(msg.data)
            }
        },
        uploadFile(file) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file.raw);
            fileReader.onload = () => {
                panel.target.icon = fileReader.result
                panel.target.type = "new_target"
                this.$message({message: "上传素材成功", type: "success"})
            }
        },
        uploadMap(file) {
            if (host === 0) {
                this.$message({message: "您不是主持人，无法上传地图", type: "error"})
            } else {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file.raw);
                fileReader.onload = () => {
                    this.$message({message: "上传地图成功", type: "success"})
                    const background = game.layer.getChildren()[0];
                    cc.loader.loadImg(fileReader.result, {isCrossOrigin: false}, function (err, img) {
                        const texture = new cc.Texture2D();
                        texture.initWithElement(img);
                        texture.handleLoadedTexture();
                        background.setTexture(texture);
                        background.setUserData({
                            texture: {
                                type: "base64",
                                data: Base64String.compress(fileReader.result)
                            }
                        })
                        background.setScale(1);
                        let backgroundSize = background.getBoundingBox();
                        let backgroundScale = (window.game.iconSize * 30) / backgroundSize.width;
                        background.setScale(backgroundScale)
                        updateNeedUpdate()
                    });
                }
            }
        },
        changeMap() {
            if (host === 0) {
                this.$message({message: "您不是主持人，无法更换地图", type: "error"})
            } else {
                const background = game.layer.getChildren()[0];
                background.setTexture(this.mapSelected);
                background.setUserData({
                    texture: {
                        type: "url",
                        data: this.mapSelected
                    }
                })
                background.setScale(1);
                let backgroundSize = background.getBoundingBox();
                let backgroundScale = (window.game.iconSize * 30) / backgroundSize.width;
                background.setScale(backgroundScale)
                this.needUpdate = true
            }
        }
    },
    mounted() {
        window.test = this
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
        };
        window.updateNeedUpdate = () => {
            this.needUpdate = true;
        }
        window.updateSyncing = () => {
            this.syncing = false;
        }
        window.loadTexture = (texture) => {
            this.texture = JSON.parse(JSON.stringify(texture))
        }
    }
})

vm.use(ElementPlus)
vm.mount('#app')
