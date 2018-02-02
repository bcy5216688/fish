var Bezier = require("bezier")

cc.Class({
    extends: cc.Component,

    properties: {
        controlPointPrefab: {
            default: null,
            type: cc.Prefab
        },
        pointPrefab: {
            default: null,
            type: cc.Prefab
        },
        scrollView: {
            default: null,
            type: cc.ScrollView
        },
        scrollViewContent: {
            default: null,
            type: cc.Node
        },
        scrollViewCellPrefab:{
            default: null,
            type: cc.Prefab
        },
        editorCanvas:{
            default: null,
            type: cc.Node
        }
    },

    onLoad: function () {
        this.controlPointList = [];
        this.linePointList = [];
        this.linePointPool = new cc.NodePool();
        this.controlPointPool = new cc.NodePool();
        this.bezierConfig = new Object();  //this.bezierConfig = {};
        var touchPoint = undefined;
        this.editorCanvas.on(cc.Node.EventType.TOUCH_START, function (event){
            // console.log("touchstart" + event.getLocationX() + "," + event.getLocationY());
            var touchPos = this.editorCanvas.convertTouchToNodeSpaceAR(event);
            // console.log("convert" + touchPos.x + "," + touchPos.y);
            this.addPoint(touchPos);
            // for(var i = 0; i < this.controlPointList.length; i++) {
            //     var point = this.controlPointList[i];
            //     var dis = cc.pDistance(point.position,this.editorCanvas.parent.convertTouchToNodeSpace(event));
            //     if (dis < 10) {
            //         touchPoint = point;
            //     }
            // }
        },this);
        // this.editorCanvas.on(cc.Node.EventType.TOUCH_MOVE, function (event){
        //     if (touchPoint) {
        //         touchPoint.position = this.editorCanvas.parent.convertTouchToNodeSpace(event);
        //     }
        // });
        // this.editorCanvas.on(cc.Node.EventType.TOUCH_END, function (event){
        //     if (touchPoint === undefined) {
        //         var touchPos = this.editorCanvas.parent.convertTouchToNodeSpace(event);
        //         this.addPoint(touchPos);
        //     } else {
        //         touchPoint = undefined;
        //     }
        // });
    },

    addPoint: function (pos) {
        // console.log('addPoint pos:' + JSON.stringify(pos));
        var pointNode = null;
        if (this.controlPointPool.size() > 0) {
            pointNode = this.controlPointPool.get();
        } else {
            pointNode = cc.instantiate(this.controlPointPrefab);
        }
        pointNode.parent = this.editorCanvas;
        pointNode.position = pos;
        this.controlPointList.push(pointNode);
        this.showLinePoint();
    },

    showLinePoint: function () {
        if (this.controlPointList.length !== 0) {
            var bezier = Bezier(this.controlPointList, 200, 10);
            var pointList = bezier.getPoints();

            for (var i = 0; i < this.linePointList.length; i++) {
                this.linePointPool.put(this.linePointList[i]);
            }
            // console.log("point pool size:" + this.linePointPool.size());
            this.linePointList = [];
            for (var i = 0; i < pointList.length; i++) {
                var pointNode = null;
                if (this.linePointPool.size() > 0) {
                    pointNode = this.linePointPool.get();
                } else {
                    pointNode = cc.instantiate(this.pointPrefab);
                }
                pointNode.parent = this.editorCanvas;
                pointNode.position = pointList[i];
                this.linePointList.push(pointNode);
            }
        }
    },

    update: function (dt) {

    },

    buildBtn: function () {
        console.log("保存");
        if (cc.sys.isBrowser){
            console.log("浏览器");
            this.saveBezier();
            var textToWrite = JSON.stringify(this.bezierConfig);
            var textFileAsBlob = new Blob([textToWrite], {type:'application/json'});
            var fileNameToSaveAs = 'bezier-config.json';
            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null)
            {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else
            {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    },

    removePoint: function () {
        for (var i = 0; i < this.controlPointList.length; i++) {
            this.controlPointPool.put(this.controlPointList[i]);
        }

        for (var i = 0; i < this.linePointList.length; i++) {
            this.linePointPool.put(this.linePointList[i]);
        }
        console.log("point pool size:" + this.linePointPool.size());
        this.controlPointList = [];
    },

    showBezier: function (id) {
        console.log("show bezier id:" + id);
        this.curBezierId = id;
        var posList = this.bezierConfig[this.curBezierId];
        this.removePoint();
        for (var i = 0; i < posList.length; i++) {
            this.addPoint(posList[i]);
        }
    },

    initScrollView: function (datas) {
        for (let i in data){
            this.addScrollViewCell(i);
        }
    },

    addScrollViewCell: function (id) {
        console.log(' i = ' + id);
        let node = cc.instantiate(this.scrollViewCellPrefab);
        this.scrollViewContent.addChild(node);
        node.position = cc.p(0, - this.scrollViewContent.children.length * 40);
        node.getComponent("scrollcell").init({bezierId: id});
    },

    removeScrollViewCell: function (id) {
        //删掉一个cell
        for (let i = 0 ; i < this.scrollViewContent.children.length ; i ++){
            let cell = this.scrollViewContent.children[i];
            if (cell.getComponent('scrollcell').getCellId() === id){
                //id 相等
                this.scrollViewContent.removeChild(cell);
            }
        }

        for (let i = 0 ; i < this.scrollViewContent.children.length ; i ++){
            let cell = this.scrollViewContent.children[i];
            cell.position = cc.p(0, - (i + 1) * 40)
        }
    },

    getDeletedCell: function (map) {
        var keys = Object.keys(map);
        keys.sort(function(a,b) {
            var n1 = parseInt(a.substring(10,a.length));
            var n2 = parseInt(b.substring(10,b.length));
            if (n1 > n2) {
                return true;
            }
            return false;
        });

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = parseInt(key.substring(10,key.length));
            if (i !== value) {
                return i;
            }
        }
        return keys.length;
    },

    newBezier: function () {
        var str = "bezier_id_";
        var num = this.getDeletedCell(this.bezierConfig);
        console.log("cell max index:" + num);
        var newBezierId = str + num;
        console.log('new bezier id = ' + newBezierId);
        this.addScrollViewCell(newBezierId);
        this.removePoint();
        this.curBezierId = newBezierId;
    },

    saveBezier: function () {
        console.log("saveBezier");
        if (this.curBezierId === undefined) {
            return;
        }
        console.log("save bezier:" + this.curBezierId);
        var config = new Array(); // var config = [];
        for (var i = 0; i < this.controlPointList.length; i++) {
            config.push({
                x: this.controlPointList[i].position.x,
                y: this.controlPointList[i].position.y
            });
        }
        this.bezierConfig[this.curBezierId] = config;
    },

    deleteCurBezier: function () {
        this.removePoint();
        this.removeScrollViewCell(this.curBezierId);
        var bezierConfigTemp = new Object();
        for (var id in this.bezierConfig) {
            if (id !== this.curBezierId) {
                bezierConfigTemp[id] = this.bezierConfig[id];
            }
        }
        this.bezierConfig = bezierConfigTemp;
        this.curBezierId = undefined;
    },
});
