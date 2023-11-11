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

let texture = {
    background: [
        {
            key: "p9s",
            label: "p9s",
            path: "res/background/p9s.jpg"
        },
        {
            key: "p10s",
            label: "p10s",
            path: "res/background/p10s.jpg"
        },
        {
            key: "p11s",
            label: "p11s",
            path: "res/background/p11s.jpg"
        },
        {
            key: "p12s",
            label: "p12s",
            path: "res/background/p12s.jpg"
        }
    ],
    players: [
        {
            key: "warrior",
            label: "战士",
            path: "res/players/warrior.png"
        },
        {
            key: "paladin",
            label: "骑士",
            path: "res/players/paladin.png"
        },
        {
            key: "darkknight",
            label: "黑骑",
            path: "res/players/darkknight.png"
        },
        {
            key: "gunbreaker",
            label: "枪刃",
            path: "res/players/gunbreaker.png"
        },
        {
            key: "whitemage",
            label: "白魔",
            path: "res/players/whitemage.png"
        },
        {
            key: "scholar",
            label: "学者",
            path: "res/players/scholar.png"
        },
        {
            key: "astrologian",
            label: "占星",
            path: "res/players/astrologian.png"
        },
        {
            key: "sage",
            label: "贤者",
            path: "res/players/sage.png"
        },
        {
            key: "dragoon",
            label: "龙骑",
            path: "res/players/dragoon.png"
        },
        {
            key: "samurai",
            label: "武士",
            path: "res/players/samurai.png"
        },
        {
            key: "bard",
            label: "诗人",
            path: "res/players/bard.png"
        },
        {
            key: "dancer",
            label: "舞者",
            path: "res/players/dancer.png"
        },
        {
            key: "blackmage",
            label: "黑魔",
            path: "res/players/blackmage.png"
        },
        {
            key: "summoner",
            label: "召唤",
            path: "res/players/summoner.png"
        }
    ],
    waymark: [
        {
            key: "markA",
            label: "标点A",
            path: "res/waymark/waymarkA.png"
        },
        {
            key: "markB",
            label: "标点B",
            path: "res/waymark/waymarkB.png"
        },
        {
            key: "markC",
            label: "标点C",
            path: "res/waymark/waymarkC.png"
        },
        {
            key: "markD",
            label: "标点D",
            path: "res/waymark/waymarkD.png"
        },
        {
            key: "mark1",
            label: "标点1",
            path: "res/waymark/waymark1.png"
        },
        {
            key: "mark2",
            label: "标点2",
            path: "res/waymark/waymark2.png"
        },
        {
            key: "mark3",
            label: "标点3",
            path: "res/waymark/waymark3.png"
        },
        {
            key: "mark4",
            label: "标点4",
            path: "res/waymark/waymark4.png"
        }
    ]
}

let res = {
    background: {},
    players: {},
    waymark: {}
};

let g_resources = [];
for (const key in texture.background) {
    const item = texture.background[key];
    g_resources.push(item.path);
    res.background[item.key] = item.path
}
for (const key in texture.players) {
    const item = texture.players[key];
    g_resources.push(item.path);
    res.players[item.key] = item.path
}
for (const key in texture.waymark) {
    const item = texture.waymark[key];
    g_resources.push(item.path);
    res.waymark[item.key] = item.path
}

loadTexture(texture)
