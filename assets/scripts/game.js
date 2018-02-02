var Fish = require("fish");

cc.Class({
    extends: cc.Component,

    properties: {
        fishNodePrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad: function () {
        var fish = cc.instantiate(this.fishNodePrefab);
        fish.parent = this.node;
        fish.position = cc.v2(0,0);
    },

    // update: function (dt) {

    // },
});
