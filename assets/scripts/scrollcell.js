cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

    },

    // update: function (dt) {

    // },

    init: function (data) {
        this.bezierId = data.bezierId;
        this.label = this.node.getChildByName("Label").getComponent(cc.Label);
        this.label.string = this.bezierId;
    },

    getCellId: function () {
        return this.bezierId;
    },
});
