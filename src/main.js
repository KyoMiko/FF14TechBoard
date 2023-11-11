import WebrtcClient from './webrtc.js'
import { getCurrentData, syncScene } from "./sync.js";

const { createApp } = Vue;

const vm = createApp({
    data() {
        return {
            selfNum: "",
            roomNum: "",
            ws: null,
            webrtc: null,
            imgCompressorConfig: {},
            host: -1,
            people: 0,
            needUpdate: false,
            updating: false,
            syncing: false,
            init: false,
            texture: {},
            mapSelected: {},
            action: "",
            addTargetPlane: false,
            addWaymarkPlane: false,
            target: {
                size: null,
                texture: null
            },
            waymark: {
                texture: null
            }
        }
    },
    computed: {
        mode() {
            let mode = {}
            if (this.webrtc) {
                if (this.host === -1) {
                    mode.text = "未加入";
                    mode.type = "warning"
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
        target: {
            handler() {
                this.addTargetPlane = false
            },
            deep: true
        },
        waymark: {
            handler() {
                this.addWaymarkPlane = false
            },
            deep: true
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
            if (this.roomNum === "") {
                this.$message({ message: "房间号不能为空", type: "error" })
                return
            }
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
        handleReceive(msg) {
            const type = msg.type
            if (type === "sync" && this.syncing === false) {
                this.syncing = true
                syncScene(msg.data)
            }
        },
        uploadMap(file) {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法上传地图", type: "error" })
            } else {
                const config = {
                    ...this.imgCompressorConfig,
                    file: file.raw,
                    success: (result) => {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(result);
                        fileReader.onload = () => {
                            this.$message({ message: "上传地图成功", type: "success" })
                            const background = game.layer.getChildren()[0];
                            cc.loader.loadImg(fileReader.result, { isCrossOrigin: false }, function (err, img) {
                                const texture = new cc.Texture2D();
                                texture.initWithElement(img);
                                texture.handleLoadedTexture();
                                background.setTexture(texture);
                                background.setUserData({
                                    texture: {
                                        type: "base64",
                                        data: fileReader.result
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
                }
                new ImageCompressor(config)
            }
        },
        changeMap() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法更换地图", type: "error" })
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
        },
        addWaymarkHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法添加场地标记", type: "error" })
                return
            }
            if (this.waymark.texture === null) {
                this.$message({ message: "请先选择场地标记", type: "error" })
                return
            }
            const size = 4
            const texture = {
                type: "url",
                data: this.waymark.texture
            }
            panel.action = {}
            panel.action.type = "add_waymark"
            panel.action.data = {
                size: size,
                texture: texture
            }
            this.action = "addWaymark"
            this.addWaymarkPlane = true
            this.$message({ message: "请点击场地选择目标位置", type: "info" })
        },
        deleteWaymarkHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法删除场地标记", type: "error" })
                return
            }
            this.action = "deleteWaymark"
            panel.action = {}
            panel.action.type = "delete_waymark"
        },
        addTargetHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法添加目标", type: "error" })
                return
            }
            if (this.target.texture === null) {
                this.$message({ message: "请先选择素材", type: "error" })
                return
            }
            const size = this.target.size ? this.target.size : 2
            const texture = {
                type: "url",
                data: this.target.texture
            }
            panel.action = {}
            panel.action.type = "add_target"
            panel.action.data = {
                size: size,
                texture: texture
            }
            this.action = "addTarget"
            this.addTargetPlane = true
            this.$message({ message: "请点击场地选择目标位置", type: "info" })
        },
        deleteTargetHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法删除目标", type: "error" })
                return
            }
            this.action = "deleteTarget"
            panel.action = {}
            panel.action.type = "delete_target"
        }
    },
    mounted() {
        this.imgCompressorConfig = {
            quality: 0.6,
            maxWidth: 800,
            maxHeight: 800,
            convertSize: 5000000
        };
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
