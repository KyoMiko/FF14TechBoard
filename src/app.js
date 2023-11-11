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
window.panel.target = {}

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

        window.panel.target = {};
        window.game.layer = this;
        window.game.targetList = {};
        window.game.mechanismList = {};
        window.game.playerList = {};


        window.game.iconSize = backgroundSize.width / 30;

        //初始化玩家
        let tag = Math.floor(Math.random() * 100000);
        let mt = new cc.Sprite(res.players.warrior);
        mt.attr({
            x: size.width / 2 - game.iconSize * 1.5 - 10,
            y: size.height / 3
        })
        mt.setTag(tag)
        mt.setUserData({
            type: "tank",
            texture: {
                type: "url",
                data: res.players.warrior
            },
            size: 2
        })

        let mtSize = mt.getBoundingBox();
        let scale = game.iconSize / mtSize.width;
        mt.setScale(scale)

        this.addChild(mt, 0)
        game.playerList[tag] = mt

        tag = Math.floor(Math.random() * 100000)
        let st = new cc.Sprite(res.players.paladin);
        st.attr({
            x: size.width / 2 - 5 - game.iconSize / 2,
            y: size.height / 3
        })
        st.setTag(tag)
        st.setUserData({
            type: "tank",
            texture: {
                type: "url",
                data: res.players.paladin
            },
            size: 2
        })
        st.setScale(scale)
        this.addChild(st, 0)
        game.playerList[tag] = st

        tag = Math.floor(Math.random() * 100000)
        let h1 = new cc.Sprite(res.players.whitemage);
        h1.attr({
            x: size.width / 2 + game.iconSize / 2 + 5,
            y: size.height / 3
        })
        h1.setTag(tag)
        h1.setUserData({
            type: "healer",
            texture: {
                type: "url",
                data: res.players.whitemage
            },
            size: 2
        })
        h1.setScale(scale)
        this.addChild(h1, 0)
        game.playerList[tag] = h1

        tag = Math.floor(Math.random() * 100000)
        let h2 = new cc.Sprite(res.players.scholar);
        h2.attr({
            x: size.width / 2 + game.iconSize * 1.5 + 10,
            y: size.height / 3
        })
        h2.setTag(tag)
        h2.setUserData({
            type: "healer",
            texture: {
                type: "url",
                data: res.players.scholar
            },
            size: 2
        })
        h2.setScale(scale)
        this.addChild(h2, 0)
        game.playerList[tag] = h2

        tag = Math.floor(Math.random() * 100000)
        let d1 = new cc.Sprite(res.players.dragoon);
        d1.attr({
            x: size.width / 2 - game.iconSize * 1.5 - 10,
            y: size.height / 3 - game.iconSize - 5
        })
        d1.setTag(tag)
        d1.setUserData({
            type: "dps",
            texture: {
                type: "url",
                data: res.players.dragoon
            },
            size: 2
        })
        d1.setScale(scale)
        this.addChild(d1, 0)
        game.playerList[tag] = d1

        tag = Math.floor(Math.random() * 100000)
        let d2 = new cc.Sprite(res.players.samurai);
        d2.attr({
            x: size.width / 2 - 5 - game.iconSize / 2,
            y: size.height / 3 - game.iconSize - 5
        })
        d2.setTag(tag)
        d2.setUserData({
            type: "dps",
            texture: {
                type: "url",
                data: res.players.samurai
            },
            size: 2
        })
        d2.setScale(scale)
        this.addChild(d2, 0)
        game.playerList[tag] = d2

        tag = Math.floor(Math.random() * 100000)
        let d3 = new cc.Sprite(res.players.bard);
        d3.attr({
            x: size.width / 2 + game.iconSize / 2 + 5,
            y: size.height / 3 - game.iconSize - 5
        })
        d3.setTag(tag)
        d3.setUserData({
            type: "dps",
            texture: {
                type: "url",
                data: res.players.bard
            },
            size: 2
        })
        d3.setScale(scale)
        this.addChild(d3, 0)
        game.playerList[tag] = d3

        tag = Math.floor(Math.random() * 100000)
        let d4 = new cc.Sprite();
        d4.setTexture(res.players.summoner)
        d4.attr({
            x: size.width / 2 + game.iconSize * 1.5 + 10,
            y: size.height / 3 - game.iconSize - 5
        })
        d4.setTag(tag)
        d4.setUserData({
            type: "dps",
            texture: {
                type: "url",
                data: res.players.summoner
            },
            size: 2
        })
        d4.setScale(scale)
        this.addChild(d4, 0)
        game.playerList[tag] = d4

        //初始化事件
        window.listener.touchEmptyListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                if (host === 0) {
                    return false
                }
                if (panel.target.type === "new_target") {
                    const data = panel.target;
                    const touchLocation = touch.getLocation();

                    const tag = Math.floor(Math.random() * 100000)
                    let target = new cc.Sprite();
                    target.attr({
                        x: touchLocation.x,
                        y: touchLocation.y
                    })
                    target.setTag(tag)
                    game.layer.addChild(target, 0)
                    cc.eventManager.addListener(listener.moveItemListener.clone(), target)
                    game.targetList[tag] = target

                    const icon = data.icon;
                    if (icon) {
                        cc.loader.loadImg(icon, {isCrossOrigin: false}, function (err, img) {
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
                                texture: {
                                    type: "base64",
                                    data: Base64String.compress(icon)
                                },
                                size: size ? size : 2
                            })
                            game.calculateMechanism()
                            updateNeedUpdate()
                        });
                    } else {
                        target.setTexture(res.mechanism);
                        const size = data.size;
                        if (size) {
                            target.setScale(game.iconSize * size / 2 / target.getBoundingBox().width)
                        } else {
                            target.setScale(game.iconSize / target.getBoundingBox().width)
                        }
                        target.setUserData({
                            texture: {
                                type: "url",
                                data: res.mechanism
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

                game.calculateMechanism()
                updateNeedUpdate()
            },
            onTouchEnded: function (touch, event) {
                if (listener.movingDistance < 2) {
                    if (panel.target.type === "mechanism") {
                        const target = event.getCurrentTarget();
                        const tag = Math.floor(Math.random() * 100000)
                        let mechanism = new cc.Sprite();
                        mechanism.attr({
                            x: 0,
                            y: 0
                        })
                        mechanism.setTag(tag)
                        mechanism.setUserData(panel.target.userData)
                        target.addChild(mechanism, -1)
                        game.mechanismList[tag] = mechanism;
                        updateNeedUpdate()
                    }
                }
            }
        })

        cc.eventManager.addListener(listener.touchEmptyListener.clone(), background)
        cc.eventManager.addListener(listener.moveItemListener.clone(), mt)
        cc.eventManager.addListener(listener.moveItemListener.clone(), st)
        cc.eventManager.addListener(listener.moveItemListener.clone(), h1)
        cc.eventManager.addListener(listener.moveItemListener.clone(), h2)
        cc.eventManager.addListener(listener.moveItemListener.clone(), d1)
        cc.eventManager.addListener(listener.moveItemListener.clone(), d2)
        cc.eventManager.addListener(listener.moveItemListener.clone(), d3)
        cc.eventManager.addListener(listener.moveItemListener.clone(), d4)

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

