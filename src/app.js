/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

window.game = {}
window.listener = {}
window.panel = {}
window.panel.action = {}

const localLayer = cc.Layer.extend({
    sprite: null,
    ctor: function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        const size = cc.winSize;

        let background = new cc.Sprite(res.background.p12s);
        background.attr({
            x: size.width / 2,
            y: size.height / 2
        })
        background.setUserData({
            texture: {
                type: "url",
                data: res.background.p12s
            }
        })
        let backgroundSize = background.getBoundingBox();
        let backgroundScale = Math.min(size.width / backgroundSize.width, size.height / backgroundSize.height);
        background.setScale(backgroundScale * 0.9)
        this.addChild(background, -1)
        backgroundSize = background.getBoundingBox();

        window.panel.action = {};
        window.game.layer = this;
        window.game.playerList = {};
        window.game.targetList = {};
        window.game.rangeList = {};
        window.game.mechanismList = {};
        window.game.childrenList = {};
        window.game.mapWidth = 60;


        window.game.iconSize = backgroundSize.width * 2 / game.mapWidth;

        const playerList = [{
            position: {
                x: size.width / 2 - game.iconSize * 1.5 - 10,
                y: size.height / 3
            },
            userData: {
                type: "player",
                data: {
                    type: "tank"
                },
                texture: {
                    type: "url",
                    data: res.players.warrior
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 - game.iconSize * 0.5 - 5,
                y: size.height / 3
            },
            userData: {
                type: "player",
                data: {
                    type: "tank"
                },
                texture: {
                    type: "url",
                    data: res.players.paladin
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 + game.iconSize / 2 + 5,
                y: size.height / 3
            },
            userData: {
                type: "player",
                data: {
                    type: "healer"
                },
                texture: {
                    type: "url",
                    data: res.players.whitemage
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 + game.iconSize * 1.5 + 10,
                y: size.height / 3
            },
            userData: {
                type: "player",
                data: {
                    type: "healer"
                },
                texture: {
                    type: "url",
                    data: res.players.scholar
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 - game.iconSize * 1.5 - 10,
                y: size.height / 3 - game.iconSize - 5
            },
            userData: {
                type: "player",
                data: {
                    type: "dps"
                },
                texture: {
                    type: "url",
                    data: res.players.dragoon
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 - game.iconSize * 0.5 - 5,
                y: size.height / 3 - game.iconSize - 5
            },
            userData: {
                type: "player",
                data: {
                    type: "dps"
                },
                texture: {
                    type: "url",
                    data: res.players.samurai
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 + game.iconSize / 2 + 5,
                y: size.height / 3 - game.iconSize - 5
            },
            userData: {
                type: "player",
                data: {
                    type: "dps"
                },
                texture: {
                    type: "url",
                    data: res.players.bard
                },
                size: 2
            }
        }, {
            position: {
                x: size.width / 2 + game.iconSize * 1.5 + 10,
                y: size.height / 3 - game.iconSize - 5
            },
            userData: {
                type: "player",
                data: {
                    type: "dps"
                },
                texture: {
                    type: "url",
                    data: res.players.summoner
                },
                size: 2
            }
        }]

        //初始化事件
        window.listener.touchEmptyListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                if (host === 0) {
                    return false
                }
                const type = panel.action.type;
                if (type === "add_waymark" || type === "add_target") {
                    const data = panel.action.data;
                    const touchLocation = touch.getLocation();

                    const tag = Math.floor(Math.random() * 100000)
                    let target = new cc.Sprite();
                    target.attr({
                        x: touchLocation.x,
                        y: touchLocation.y
                    })
                    target.setTag(tag)
                    game.layer.addChild(target, 1)
                    cc.eventManager.addListener(listener.moveItemListener.clone(), target)
                    game.targetList[tag] = target

                    const texture = data.texture;
                    const type = texture.type;
                    const temp = panel.action.type === "add_waymark" ? "waymark" : "target";
                    const userData = {
                        type: temp,
                    }
                    if (temp === "target") {
                        game.childrenList[tag] = []
                    }
                    if (type === "base64") {
                        cc.loader.loadImg(texture.data, { isCrossOrigin: false }, function (err, img) {
                            const texture = new cc.Texture2D();
                            texture.initWithElement(img);
                            texture.handleLoadedTexture();
                            target.setTexture(texture)
                            const size = data.size;
                            if (size) {
                                target.setScale(game.iconSize * size / 2 / target.getBoundingBox().width)
                            } else {
                                target.setScale(game.iconSize / target.getBoundingBox().width)
                            }
                            target.setUserData({
                                ...userData,
                                texture: {
                                    type: "base64",
                                    data: texture.data
                                },
                                size: size ? size : 2
                            })
                            game.calculateMechanism()
                            updateNeedUpdate()
                        });
                    } else if (type === "url") {
                        target.setTexture(texture.data);
                        const size = data.size;
                        if (size) {
                            target.setScale(game.iconSize * size / 2 / target.getBoundingBox().width)
                        } else {
                            target.setScale(game.iconSize / target.getBoundingBox().width)
                        }
                        target.setUserData({
                            ...userData,
                            texture: {
                                type: "url",
                                data: texture.data
                            },
                            size: size ? size : 2
                        })
                        game.calculateMechanism()
                        updateNeedUpdate()
                    }
                }
            }
        })

        window.listener.moveItemListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (host === 0) {
                    return false
                }
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(touch.getLocation());
                const s = target.getContentSize()
                const rect = cc.rect(0, 0, s.width, s.height)

                window.listener.movingDistance = 0;

                return cc.rectContainsPoint(rect, locationInNode);

            },
            onTouchMoved: function (touch, event) {
                const target = event.getCurrentTarget();
                const delta = touch.getDelta();
                target.x += delta.x;
                target.y += delta.y;

                listener.movingDistance += delta.x * delta.x + delta.y * delta.y;

                const children = game.childrenList[target.getTag()]
                for (const child of children) {
                    child.x += delta.x;
                    child.y += delta.y;
                }

                game.calculateMechanism()
                updateNeedUpdate()
            },
            onTouchEnded: function (touch, event) {
                if (listener.movingDistance < 2) {
                    const target = event.getCurrentTarget();
                    const userData = target.getUserData();
                    switch (panel.action.type) {
                        case "delete_waymark":
                            if (userData.type === "waymark") {
                                const tag = target.getTag();
                                target.removeFromParent()
                                delete game.targetList[tag]
                                updateNeedUpdate()
                            }
                            break;
                        case "delete_target":
                            if (userData.type === "target") {
                                const tag = target.getTag();
                                target.removeFromParent()
                                delete game.targetList[tag]
                                updateNeedUpdate()
                            }
                            break;
                        case "add_range":
                            if (userData.type === "player" || userData.type === "target") {
                                let draw = new cc.DrawNode();
                                const rangeTag = Math.floor(Math.random() * 100000)
                                const size = panel.action.data.size
                                const radius = panel.action.data.size / 2 * game.iconSize;
                                const count = size * 2 * 10;
                                draw.drawCircle(target.getPosition(), radius, 360, count, false, 3, cc.color(255, 255, 255, 255));
                                draw.setTag(rangeTag)
                                draw.setUserData({
                                    type: "range",
                                    size: size
                                })
                                game.layer.addChild(draw, 0);
                                game.childrenList[target.getTag()].push(draw);
                                game.rangeList[rangeTag] = draw;
                                updateNeedUpdate()
                            }
                            break;
                        case "clear_range":
                            if (userData.type === "player" || userData.type === "target") {
                                const children = game.childrenList[target.getTag()]
                                const length = children.length;
                                for (let i = 0; i < length; i++) {
                                    const child = children.pop();
                                    const tag = child.getTag();
                                    if (game.rangeList[tag]) {
                                        child.removeFromParent()
                                        delete game.rangeList[tag]
                                    } else {
                                        children.push(child)
                                    }
                                }
                                updateNeedUpdate()
                            }
                            break
                        case "add_mechanism":
                            const data = panel.action.data;
                            const tag = Math.floor(Math.random() * 100000)
                            let mechanism = new cc.Sprite();
                            mechanism.attr({
                                x: 0,
                                y: 0
                            })
                            mechanism.setTag(tag)
                            mechanism.setUserData(data.userData)
                            target.addChild(mechanism, -1)
                            game.mechanismList[tag] = mechanism;
                            updateNeedUpdate()
                            break;
                    }
                }
            }
        })

        //初始化玩家
        for (const player of playerList) {
            const tag = Math.floor(Math.random() * 100000)
            let playerSprite = new cc.Sprite(player.userData.texture.data);
            playerSprite.attr({
                x: player.position.x,
                y: player.position.y
            })
            playerSprite.setTag(tag)
            playerSprite.setUserData(player.userData)
            this.addChild(playerSprite, 2)
            game.playerList[tag] = playerSprite
            game.childrenList[tag] = [];
            const size = player.userData.size;
            playerSprite.setScale(game.iconSize * size / 2 / playerSprite.getBoundingBox().width)
            cc.eventManager.addListener(listener.moveItemListener.clone(), playerSprite)
        }

        cc.eventManager.addListener(listener.touchEmptyListener.clone(), background)
        return true;
    }
});

window.game.calculateMechanism = function () {
    const playerList = game.playerList;
    const mechanismList = game.mechanismList;
    for (const tag in mechanismList) {
        const mechanism = mechanismList[tag];
        const data = mechanism.getUserData()
        if (data.type === 1) {
            let mechanismLocation = mechanism.getPosition()
            let minLength = 1000000;
            let minTag = 0;
            for (const playerTag in playerList) {
                const player = playerList[playerTag];
                const playerLocation = player.getPosition();
                let x = playerLocation.x - mechanismLocation.x;
                let y = playerLocation.y - mechanismLocation.y;
                const dis = Math.sqrt(x * x + y * y)
                if (dis < minLength) {
                    minLength = dis;
                    minTag = playerTag;
                }
            }
            let draw = new cc.DrawNode();
            let p2 = mechanism.convertToNodeSpace(playerList[minTag].getPosition());
            draw.drawSegment(p2, cc.p(0, 0), 1, cc.color(255, 255, 255, 255));
            mechanism.removeAllChildren()
            mechanism.addChild(draw, 0)
        }
    }
}

const HelloWorldScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        const layer = new localLayer();
        this.addChild(layer);
    }
});

