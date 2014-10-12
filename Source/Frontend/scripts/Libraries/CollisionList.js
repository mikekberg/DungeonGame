/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="Events.js" />

var CollisionList = function (valueFunc) {
    ListNode = function (value, left, right) {
        this.Value = value;
        this.Left = left;
        this.Right = right;

        this.setLeft = function (node) {
            if (node == null) return;
            this.Left = node;
            node.Right = this;
        };
        this.setRight = function (node) {
            if (node == null) return;
            this.Right = node;
            node.Left = this;
        };
    };

    this.Head = null;
    this.Tail = null;
    this.Nodes = [];
    this.ValFunc = valueFunc || (function (d) { return d; });

    this.Update = function () {
        for (var curNode in this.Nodes) {
            this.Reorder(this.Nodes[curNode]);
        }
    };

    this.Reorder = function (node) {
        var swap;

        while (node.Left != null && this.ValFunc(node.Value) < this.ValFunc(node.Left.Value)) {
            swap = node.Left;
            var swapL = swap.Left;

            if (swap == node.Right) {
                debugger;
            }
            
            swap.Right = node.Right;

            if (swap == swap.Right) {
                debugger;
            }

            if (node.Right != null)
                node.Right.Left = swap;

            swap.Left = node;
            node.Left = swapL;

            if (swapL != null)
                swapL.Right = node;
            node.Right = swap;

            if (node == node.Right) {
                debugger;
            }

            if (swap == this.Head)
                this.Head = node;
            if (node == this.Tail)
                this.Tail = swap;
        }

        /*
        if (swap != null && swap != node && GameUtils.Collide({ x: (node.Value.LocX + node.Value.CurrentState.clipX), y: (node.Value.LocY + node.Value.CurrentState.clipY), width: node.Value.CurrentState.clipWidth, height: node.Value.CurrentState.clipHeight },
            { x: (swap.Value.LocX + swap.Value.CurrentState.clipX), y: (swap.Value.LocY + swap.Value.CurrentState.clipY), width: swap.Value.CurrentState.clipWidth, height: swap.Value.CurrentState.clipHeight })) {
            QEvent.fire(swap.Value, Events.Sprites.Collision, { source: swap.Value, target: node.Value });
            QEvent.fire(node.Value, Events.Sprites.Collision, { source: node.Value, target: swap.Value });
        }*/
    };

    this.CollideTest = function (value, getWidthFunc, getHeightFunc) {
        var node = this.Find(value);
        var nNode = node.Left;

        while (nNode != null && (nNode.Value.LocX + getWidthFunc(nNode.Value)) >= node.Value.LocX && (nNode.Value.LocY + getHeightFunc(nNode.Value)) >= node.Value.LocY) {
            if (GameUtils.Collide(
                { x: (node.Value.LocX + node.Value.CurrentState.clipX), y: (node.Value.LocY + node.Value.CurrentState.clipY), width: node.Value.CurrentState.clipWidth, height: node.Value.CurrentState.clipHeight },
                { x: (nNode.Value.LocX + nNode.Value.CurrentState.clipX), y: (nNode.Value.LocY + nNode.Value.CurrentState.clipY), width: getWidthFunc(nNode.Value), height: getHeightFunc(nNode.Value) })) {
                QEvent.fire(nNode.Value, Events.Sprites.Collision, { source: nNode.Value, target: node.Value });
                QEvent.fire(node.Value, Events.Sprites.Collision, { source: node.Value, target: nNode.Value });
            }
            nNode = nNode.Left;
        }

        nNode = node.Right;

        while (nNode != null && nNode.Value.LocX >= (node.Value.LocX + getWidthFunc(node.Value)) && (nNode.Value.LocY + getHeightFunc(nNode.Value)) >= node.Value.LocY) {
            if (GameUtils.Collide(
                { x: (node.Value.LocX + node.Value.CurrentState.clipX), y: (node.Value.LocY + node.Value.CurrentState.clipY), width: node.Value.CurrentState.clipWidth, height: node.Value.CurrentState.clipHeight },
                { x: (nNode.Value.LocX + nNode.Value.CurrentState.clipX), y: (nNode.Value.LocY + nNode.Value.CurrentState.clipY), width: getWidthFunc(nNode.Value), height: getHeightFunc(nNode.Value) })) {
                QEvent.fire(nNode.Value, Events.Sprites.Collision, { source: nNode.Value, target: node.Value });
                QEvent.fire(node.Value, Events.Sprites.Collision, { source: node.Value, target: nNode.Value });
            }
            nNode = nNode.Right;
        }
    }

    this._IntrCheck = function () {
        var n = this.Head;
        var i = 0;

        while (this.Tail != n) {
            i++;
            n = n.Right;

            if (i > this.Nodes.length) {
                debugger;
                return;
            }
        }

        if (i != this.Nodes.length - 1) {
            debugger;
        }
    };

    this._Dump = function () {
        var n = this.Head;
        var last = n.id;

        while (this.Tail != n) {
            console.log(n.Value._id + " - " + this.ValFunc(n.Value));
            n = n.Right;

            if (last == n.Value._id) {
                console.log("ERROR! Loop");
                return;
            }

            last = n.Value._id;
        }

        console.log(n.Value._id + " - " + this.ValFunc(n.Value));
    }

    this.Add = function (value) {
        var newNode = new ListNode(value);
        var nodeVal = this.ValFunc(value);

        newNode._lastSortVal = nodeVal;

        if (this.Head == null) {
            this.Head = newNode;
            this.Tail = newNode;
        }
        else {
            var curNode = this.Head;

            while (curNode != this.Tail && this.ValFunc(curNode.Value) < nodeVal) {
                curNode = curNode.Right;
            }

            if (nodeVal < this.ValFunc(curNode.Value)) {
                var ol = curNode.Left;
                curNode.setLeft(newNode);
                if (ol != null)
                    ol.setRight(newNode);
            }
            else {
                var or = curNode.Right;
                curNode.setRight(newNode);
                if (or != null)
                    or.setLeft(newNode);
            }

            if (curNode == this.Head && curNode.Left == newNode)
                this.Head = newNode;
            if (curNode == this.Tail && curNode.Right == newNode)
                this.Tail = newNode;
        }


        this.Nodes.push(newNode);

        return newNode;
    };

    this.Remove = function (value) {
        var pNode = this.Find(value);

        if (pNode.Left != null && pNode.Right != null) {
            pNode.Left.Right = pNode.Right;
            pNode.Right.Left = pNode.Left;
        }

        if (pNode == this.Head) {
            this.Head = pNode.Right;
            pNode.Right.Left = null;
        }

        if (pNode == this.Tail) {
            this.Tail = pNode.Left;
            pNode.Left.Right = null;
        }

        pNode.Left = null;
        pNode.Right = null;
    };

    this.Find = function (value) {
        var n = this.Head;

        while (n != null && n.Value != value) {
            n = n.Right;
        }

        return n;
    };

}


