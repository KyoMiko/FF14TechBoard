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
            mapWidth: null,
            action: "",
            addTargetPlane: false,
            addWaymarkPlane: false,
            addRangePlane: false,
            target: {
                size: null,
                texture: null
            },
            waymark: {
                texture: null
            },
            range: {
                size: null
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
        },
        range: {
            handler() {
                this.addRangePlane = false
            },
            deep: true
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
            if(this.host !== 1) { 
                this.needUpdate = false
                this.updating = false
                return;
            }
            this.needUpdate = false
            this.updating = true
            let data = getCurrentData();
            this.webrtc.sendMessage(JSON.stringify({
                type: "sync",
                data: data
            }))
            this.updating = false
            if (this.needUpdate) {
                this.syncState();
            }
        },
        handleReceive(msg) {
            const type = msg.type
            if (type === "sync" && this.syncing === false) {
                this.syncing = true
                syncScene(msg.data)
            }
        },
        clearAction() {
            this.action = ""
            panel.action = {}
            this.$message({ message: "已清除点击行为", type: "success" })
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
        changeMapWidth() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法更改场地宽度", type: "error" })
            } else {
                game.mapWidth = this.mapWidth
                syncScene(getCurrentData())
                this.$message({ message: "更改场地宽度成功", type: "success" })
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
            this.$message({ message: "请点击场地标记删除", type: "info" })
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
            this.$message({ message: "请点击目标删除", type: "info" })
        },
        addRangeHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法添加范围", type: "error" })
                return
            }
            if (this.range.size === null) {
                this.$message({ message: "请先输入半径", type: "error" })
                return
            }
            const size = this.range.size
            panel.action = {}
            panel.action.type = "add_range"
            panel.action.data = {
                size: size
            }
            this.action = "addRange"
            this.addRangePlane = true
            this.$message({ message: "请点击单位选择范围中心", type: "info" })
        },
        clearRangeHandler() {
            if (host === 0) {
                this.$message({ message: "您不是主持人，无法删除范围", type: "error" })
                return
            }
            this.action = "clearRange"
            panel.action = {}
            panel.action.type = "clear_range"
            this.$message({ message: "请点击单位清除范围", type: "info" })
        },
        importFile(file) {
            let fileReader = new FileReader();
            fileReader.readAsText(file.raw);
            fileReader.onload = () => {
                let data = JSON.parse(fileReader.result);
                if (data.type === "sync") {
                    syncScene(data.data)
                    this.$message({ message: "导入成功", type: "success" })
                } else {
                    this.$message({ message: "文件格式错误", type: "error" })
                }
            }
        },
        exportFile() {
            let data = getCurrentData();
            const a = document.createElement("a");
            const date = new Date();
            const time = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0') + date.getHours().toString().padStart(2, '0') + date.getMinutes().toString().padStart(2, '0') + date.getSeconds().toString().padStart(2, '0');
            a.href = URL.createObjectURL(new Blob([JSON.stringify({
                type: "sync",
                data: data
            })]));
            a.download = "export-" + time + ".json";
            document.body.appendChild(a);
            a.click();
            a.remove();
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
            if (this.needUpdate && !this.updating) {
                this.syncState();
            }
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
