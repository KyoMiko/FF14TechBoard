export function getCurrentData() {
    let data = {}
    data.background = game.layer.getChildren()[0].getUserData()
    data.playerList = []
    for (const tag in game.playerList) {
        const player = game.playerList[tag];
        data.playerList.push({
            tag: tag,
            userData: player.getUserData(),
            position: player.getPosition()
        })
    }
    data.targetList = []
    for (const tag in game.targetList) {
        const target = game.targetList[tag];
        data.targetList.push({
            tag: tag,
            userData: target.getUserData(),
            position: target.getPosition()
        })
    }
    data.rangeList = []
    for (const tag in game.rangeList) {
        const range = game.rangeList[tag];
        data.rangeList.push({
            tag: tag,
            userData: range.getUserData()
        })
    }
    data.parentList = {}
    for (const tag in game.childrenList) {
        const list = game.childrenList[tag];
        for (const item of list) {
            data.parentList[item.getTag()] = tag
        }
    }
    data.mapSize = game.mapWidth
    console.log(data)
    return data;
}

export function syncScene(data) {

    console.log(data)

    let layer = game.layer
    layer.removeAllChildren();

    const size = cc.winSize;

    window.panel.action = {};
    window.game.playerList = {};
    window.game.targetList = {};
    window.game.rangeList = {};
    window.game.mechanismList = {};
    window.game.childrenList = {};
    window.game.mapSize = data.mapSize;
    const parentList = data.parentList;

    new Promise((resolve, reject) => {
        const backgroundInfo = data.background;
        let background = new cc.Sprite();
        background.attr({
            x: size.width / 2,
            y: size.height / 2
        })
        layer.addChild(background, -1)
        cc.eventManager.addListener(listener.touchEmptyListener.clone(), background)
        if (backgroundInfo.texture.type === "base64") {
            cc.loader.loadImg(backgroundInfo.texture.data, { isCrossOrigin: false }, function (err, img) {
                const texture = new cc.Texture2D();
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                background.setTexture(texture);
                background.setUserData({
                    texture: {
                        type: "base64",
                        data: backgroundInfo.texture.data
                    }
                })
                let backgroundSize = background.getBoundingBox();
                let backgroundScale = Math.min(size.width / backgroundSize.width, size.height / backgroundSize.height);
                background.setScale(backgroundScale * 0.9)
                backgroundSize = background.getBoundingBox();
                window.game.iconSize = backgroundSize.width * 2 / game.mapWidth;
                resolve()
            });
        } else {
            let url = backgroundInfo.texture.data;
            if (!url) {
                url = res.background.p12s;
            }
            background.setTexture(url);
            background.setUserData({
                texture: {
                    type: "url",
                    data: url
                }
            })
            let backgroundSize = background.getBoundingBox();
            let backgroundScale = Math.min(size.width / backgroundSize.width, size.height / backgroundSize.height);
            background.setScale(backgroundScale * 0.9)
            backgroundSize = background.getBoundingBox();
            window.game.iconSize = backgroundSize.width * 2 / game.mapWidth;
            resolve()
        }
    }).then(() => {
        const playerList = data.playerList;
        for (const playerInfo of playerList) {
            const tag = playerInfo.tag;
            const userData = playerInfo.userData;
            const position = playerInfo.position;
            let player = new cc.Sprite();
            player.attr({
                x: position.x,
                y: position.y
            })
            player.setTag(tag)
            player.setUserData(userData)
            layer.addChild(player, 0)
            game.playerList[tag] = player
            cc.eventManager.addListener(listener.moveItemListener.clone(), player)
            loadTexture(player);
            game.childrenList[tag] = [];
        }

        const targetList = data.targetList;
        for (const targetInfo of targetList) {
            const tag = targetInfo.tag;
            const userData = targetInfo.userData;
            const position = targetInfo.position;
            let target = new cc.Sprite(userData.texture.data);
            target.attr({
                x: position.x,
                y: position.y
            })
            target.setTag(tag)
            target.setUserData(userData)
            layer.addChild(target, 0)
            game.targetList[tag] = target
            cc.eventManager.addListener(listener.moveItemListener.clone(), target)
            loadTexture(target);
            game.childrenList[tag] = [];
        }

        const rangeList = data.rangeList;
        for (const rangeInfo of rangeList) {
            let draw = new cc.DrawNode();
            const tag = rangeInfo.tag;
            const size = rangeInfo.userData.size;
            const radius = size / 2 * game.iconSize;
            const count = size * 2 * 10;
            const parentTag = parentList[tag];
            let parent = game.playerList[parentTag];
            if (!parent) {
                parent = game.targetList[parentTag];
            }

            draw.drawCircle(parent.getPosition(), radius, 360, count, false, 3, cc.color(255, 255, 255, 255));
            draw.setTag(tag)
            draw.setUserData({
                type: "range",
                size: size
            })
            game.layer.addChild(draw, 0);
            game.childrenList[parentTag].push(draw);
            game.rangeList[tag] = draw;
        }
        game.calculateMechanism()
        updateSyncing()
        updateNeedUpdate()
    })
}

function loadTexture(sprite) {
    const userData = sprite.getUserData()
    const type = userData.type;
    const texture = userData.texture;
    const size = userData.size;
    let iconSize = game.iconSize;
    if(type === 'player'){
        iconSize = iconSize / 60 * game.mapWidth;
    }
    if (texture.type === 'url') {
        sprite.setTexture(texture.data);
        if (size) {
            sprite.setScale(iconSize * size / 2 / sprite.getBoundingBox().width)
        } else {
            sprite.setScale(iconSize / sprite.getBoundingBox().width)
        }
    } else if (texture.type === 'base64') {
        cc.loader.loadImg(texture.data, { isCrossOrigin: false }, function (err, img) {
            const texture = new cc.Texture2D();
            texture.initWithElement(img);
            texture.handleLoadedTexture();
            sprite.setTexture(texture);
            if (size) {
                sprite.setScale(iconSize * size / 2 / sprite.getBoundingBox().width)
            } else {
                sprite.setScale(iconSize / sprite.getBoundingBox().width)
            }
        });
    }
}
