export function getCurrentData() {
    let data = {}
    data.background = {
        texture: {
            type: "url",
            data: res.background
        }
    }
    data.playerList = []
    for (const tag in game.playerList) {
        const player = game.playerList[tag];
        data.playerList.push({
            tag: tag,
            userData: player.getUserData(),
            position: player.getPosition()
        })
    }
    return data;
}

export function syncScene(data) {

    let layer = game.layer
    layer.removeAllChildren();

    const size = cc.winSize;

    new Promise((resolve, reject) => {
        const backgroundInfo = data.background;
        let background = new cc.Sprite();
        background.attr({
            x: size.width / 2,
            y: size.height / 2
        })
        layer.addChild(background, -1)
        if (backgroundInfo.texture.type === "base64") {
            cc.loader.loadImg(backgroundInfo.texture.data, {isCrossOrigin: false}, function (err, img) {
                const texture = new cc.Texture2D();
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                background.setTexture(texture);
                let backgroundSize = background.getBoundingBox();
                let backgroundScale = Math.min(size.width / backgroundSize.width, size.height / backgroundSize.height);
                background.setScale(backgroundScale * 0.9)
                backgroundSize = background.getBoundingBox();
                window.game.iconSize = backgroundSize.width / 30;
                resolve()
            });
        } else {
            let url = backgroundInfo.texture.data;
            if (!url) {
                url = res.background;
            }
            background.setTexture(url);
            let backgroundSize = background.getBoundingBox();
            let backgroundScale = Math.min(size.width / backgroundSize.width, size.height / backgroundSize.height);
            background.setScale(backgroundScale * 0.9)
            backgroundSize = background.getBoundingBox();
            window.game.iconSize = backgroundSize.width / 30;
            resolve()
        }
    }).then(() => {
        window.panel.target = {};
        window.game.moveableList = {};
        window.game.mechanismList = {};
        window.game.playerList = {};

        const playerList = data.playerList;
        let scale;
        for (const playerInfo of playerList) {
            const tag = playerInfo.tag;
            const userData = playerInfo.userData;
            const position = playerInfo.position;
            let player = new cc.Sprite(userData.texture.data);
            player.attr({
                x: position.x,
                y: position.y
            })
            player.setTag(tag)
            player.setUserData(userData)
            if (!scale) {
                let playerSize = player.getBoundingBox();
                scale = game.iconSize / playerSize.width;
            }
            player.setScale(scale)
            layer.addChild(player, 0)
            game.playerList[tag] = player
        }
        game.calculateMechanism()
        updateSyncing()
    })
}
