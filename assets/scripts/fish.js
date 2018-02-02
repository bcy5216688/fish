var Bezier = require("bezier");
var clipNameList = ["run","dead"];

cc.Class({
    extends: cc.Component,

    properties: {
        spriteAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
    },

    onLoad: function () {
        this.fishConfig = new Object();
        this.bezierConfig = new Object();
        this.pointList = new Array();
        this.animation = this.node.getComponent(cc.Animation);
        this.bezier  = undefined;
        this.runTime = 0;
        var fishConfigPath = "configs/fish-config";
        var bezierConfigPath = "configs/bezier-config";
        var self = this;
        cc.loader.loadRes(fishConfigPath, function(error, result) {
            // console.log(result.fish_red.animates.run.pre);
            self.fishConfig = result;
            self.initFishAnimation(self.fishConfig.fish_red.animates);
            self.animation.play("run");
        });
        cc.loader.loadRes(bezierConfigPath, function(error, result) {
            self.bezierConfig = result;
            console.log("bezier config:" + self.bezierConfig["bezier_id_0"]);
            self.bezier = Bezier(self.bezierConfig["bezier_id_0"], 200, 10);
            self.pointList = self.bezier.getPoints();
            // console.log("pointList length:" + self.pointList.length);
        });
    },

    getSpriteFrameList: function (animationConfig) {
        var spriteFrameList = new Array();
        for (var i = animationConfig.start; i <= animationConfig.end; i++) {
            var frameKey = animationConfig.pre + "_" + i;
            console.log("frameKey:" + frameKey);
            var spriteFrame = this.spriteAtlas.getSpriteFrame(frameKey);
            spriteFrameList.push(spriteFrame);
        }
        return spriteFrameList;
    },

    initFishAnimation: function (animationDatas) {
        for (var i = 0; i < clipNameList.length; i++) {
            var clipName = clipNameList[i];
            var spriteFrameList = this.getSpriteFrameList(animationDatas[clipName]);
            console.log("clipName:" + clipName + "clip frames:" + spriteFrameList.length);
            var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrameList,5);
            if (clipName === "run") {
                clip.wrapMode = cc.WrapMode.Loop;
                this.animation.defaultClip = clip;
            }
            this.animation.addClip(clip,clipName);
        }
    },

    update: function (dt) {
        if (this.runTime >= 200) {
            return;
        }
        this.runTime += 1;
        console.log("runTime:",this.runTime);
        // var position = this.bezier.getPoint(this.runTime);
        var position = this.pointList[this.runTime];
        this.node.position = position;
    },
});
