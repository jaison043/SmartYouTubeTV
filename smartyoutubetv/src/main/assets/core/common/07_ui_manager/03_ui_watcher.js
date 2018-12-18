/**
 * Watches onto the controller's keys events.
 */

console.log("Scripts::Running script ui_watcher.js");

var UiWatcher = {
    TAG: 'UiWatcher',
    buttonsContainerSel: '#buttons-list',

    resetEvents: function(buttonArr) {
        if (!buttonArr) {
            return;
        }

        for (var i = 0; i < buttonArr.length; i++) {
            this.unsetListener(buttonArr[i]);
        }
    },

    unsetListener: function(btn) {
        if (btn.getElem() && btn.onKeyDown) {
            Log.d(this.TAG, "Resetting events to: " + EventUtils.toSelector(btn.getElem()));
            EventUtils.removeListener(btn.getElem(), DefaultEvents.KEY_DOWN, btn.onKeyDown);
            btn.onKeyDown = null;
        }
    },

    handleMovements: function(buttonArr) {
        if (this.buttonArr) {
            this.resetEvents(this.buttonArr);
        }

        this.firstBtn = buttonArr[0];
        this.centerBtn = buttonArr[1];
        this.lastBtn = buttonArr[2];

        this.buttonArr = buttonArr;
        this.disableButtonEvents();
    },

    disableButtonEvents: function() {
        var $this = this;

        Log.d(this.TAG, "add listeners to buttons: " +
            EventUtils.toSelector(this.firstBtn.getElem() || this.firstBtn.selector) + " "  +
            EventUtils.toSelector(this.centerBtn.getElem() || this.centerBtn.selector) + " " +
            EventUtils.toSelector(this.lastBtn.getElem() || this.lastBtn.selector));

        this.addKeyDownListener(this.firstBtn, function(e) {
            $this.onFirstButtonKey(e);
        });

        this.addKeyDownListener(this.centerBtn, function(e) {
            $this.onCenterButtonKey(e);
        });

        this.addKeyDownListener(this.lastBtn, function(e) {
            $this.onLastButtonKey(e);
        });
    },

    addKeyDownListener: function(btn, handler) {
        if (btn.onKeyDown) { // don't add listener twice
            Log.d(this.TAG, "Handler already added to: " + EventUtils.toSelector(btn.getElem()));
            return;
        }

        btn.onKeyDown = handler;
        EventUtils.addListener(btn.getElem() || btn.selector, DefaultEvents.KEY_DOWN, btn.onKeyDown);
    },

    onFirstButtonKey: function(e) {
        if (e.keyCode != DefaultKeys.RIGHT) {
            return;
        }

        this.direction = e.keyCode;
        this.ytButton = e.target;

        // override right key
        e.stopPropagation();
        Log.d(this.TAG, "move selection to the center button, from: " + EventUtils.toSelector(e.target));

        this.centerBtn.focus();
        Utils.ytUnfocus(e.target);
    },

    onCenterButtonKey: function(e) {
        e.stopPropagation();

        var sameDirection = e.keyCode == this.direction;
        var leftOrRight = e.keyCode == DefaultKeys.LEFT || e.keyCode == DefaultKeys.RIGHT;

        if (!leftOrRight) {
            return;
        }

        Log.d(this.TAG, "move selection to the youtube button");

        if (sameDirection) {
            EventUtils.triggerEvent(this.buttonsContainerSel, DefaultEvents.KEY_DOWN, e.keyCode);
        } else {
            Utils.ytFocus(this.ytButton);
        }

        this.centerBtn.unfocus();
    },

    onLastButtonKey: function(e) {
        if (e.keyCode != DefaultKeys.LEFT) {
            return;
        }

        this.direction = e.keyCode;
        this.ytButton = e.target;

        // override left key
        e.stopPropagation();
        Log.d(this.TAG, "move selection to the center button, from: " + EventUtils.toSelector(e.target));

        this.centerBtn.focus();
        Utils.ytUnfocus(e.target);
    },

    onUiUpdate: function(linstener) {
        this.listener = linstener;
        this.setupUiChangeListener();
        Log.d(this.TAG, "Ui change listener has been added");
    },

    setupUiChangeListener: function() {
        if (this.setupUiChangeIsDone) {
            return;
        }

        this.setupUiChangeIsDone = true;

        var $this = this;
        var onUiChange = function(e) {
            Log.d($this.TAG, "Running ui change listener");
            if ($this.listener) {
                $this.listener.onUiUpdate();
            }
        };

        EventUtils.addListener(YouTubeSelectors.PLAYER_EVENTS_RECEIVER, YouTubeEvents.MODEL_CHANGED_EVENT, onUiChange);
        EventUtils.addListener(YouTubeSelectors.PLAYER_MORE_BUTTON, DefaultEvents.KEY_DOWN, onUiChange);
    }
};
