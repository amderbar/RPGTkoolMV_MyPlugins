// --------------------------------------------------------------------------
// 
// FlG_ActionRecoder
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/03/10 ver1.0 プラグイン公開
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc プレイヤーの行動を記録し読み出すためのプラグインコマンドを提供します
 * @author amderbar
 * @version 0.01 2016/9/13 製作開始
 * 
 * @help
 * プレイヤーの行動を記録し読み出すためのプラグインコマンドを提供します。
 * 
 * @param charNum
 * @desc 記録対象となるキャラクターの人数です。
 * @default 1
 * 
*/

(function () {
    console.log('FlG_ActionRecoder loaded');
    // プラグイン引数の取得
    var parameters = PluginManager.parameters('FlG_ActionRecoder');
    var charNum = Number(parameters['charNum']);

    // 情報格納用クラスの定義
    var FlG_ActionRecoder = function () {
        this.initialize.apply(this, arguments);
    };

    FlG_ActionRecoder.prototype.initialize = function() {
        this._isActive = false;
        this._target = null;
        this._data = [];
        this._NPC_events = [];
        this._whead = 0;
        this._rhead = 0;
    };

    FlG_ActionRecoder.prototype.mock = function() {
        return true;
    };

    FlG_ActionRecoder.prototype.registerChar = function(actorId, eve) {
        this._data[actorId] = [];
        this._NPC_events[actorId] = eve;
    };

    FlG_ActionRecoder.prototype.NPCs = function() {
        return this._NPC_events;
    };

    FlG_ActionRecoder.prototype.activeate = function(actorId) {
        this._isActive = true;
        if (actorId) {
            this.setTarget(actorId);
        }
    };

    FlG_ActionRecoder.prototype.deactiveate = function() {
        this._isActive = false;
        this._target = null;
    };

    FlG_ActionRecoder.prototype.isActive = function() {
        return this._isActive;
    };

    FlG_ActionRecoder.prototype.setTarget = function(actorId) {
        this._target = actorId;
    };

    FlG_ActionRecoder.prototype.target = function() {
        return this._target;
    };

    FlG_ActionRecoder.prototype.rewind = function() {
        this._whead = 0;
        this._rhead = 0;
        console.log(this._whead, this._rhead);
    };

    FlG_ActionRecoder.prototype.register = function(eve, args) {
        var tgt = this.target();
        if (this._data[tgt].length > this._whead) {
            this._data[tgt][this._whead] = [eve, args];
        } else {
            while (this._data[tgt].length < this._whead) {
                this._data[tgt].push([this.mock, []]);
            }
            this._data[tgt].push([eve, args]);
        }
        this._whead++;
        console.log(this._data);
    };

    FlG_ActionRecoder.prototype.play = function(actorId) {
        console.log(actorId);
        if (this._data[actorId].length > this._rhead) {
            var recode = this._data[actorId][this._rhead];
            console.log(recode[0].name);
            console.log(typeof this.NPCs[actorId][recode[0].name]);
            if (typeof this.NPCs[actorId][recode[0].name] === 'undefined') {
                recode[0].apply(this.NPCs[actorId], recode[1]);
            } else {
                this.NPCs[actorId].apply(this.NPCs[actorId],recode[1]);
            }
        }
        this._rhead++;
    };

    FlG_ActionRecoder.prototype.data = function() {
        return this._data;
    };

    // インスタンス生成
    if(typeof $recoder === "undefined") {
        $recoder = new FlG_ActionRecoder(charNum);
    }

    // プラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        var command = (command || '').toUpperCase();
        switch (command) {
            case 'FLG_DEQUEUE':
                console.log('flg_dequeue called');
                $recoder.play(Number(args[0]));
                break;
            case 'FLG_ENQUEUE':
                console.log('flg_enqueue called');
                console.log($gameParty.members()[0]._actorId);
                $recoder.activeate($gameParty.members()[0]._actorId);
                break;
            case 'FLG_CALMDOWN':
                console.log('flg_calmdown called');
                $recoder.deactiveate();
                break;
            case 'FLG_REWIND':
                console.log('flg_rewind called');
                $recoder.rewind();
                break;
            default:
                break;
        }
        return true;
    };

    // アイテム、スキル使用関数の改造
    var _Game_Battler_prototype_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        console.log(item);
        _Game_Battler_prototype_useItem.call(this, item);
        if ($recoder._isActive) {
            $recoder.register(_Game_Battler_prototype_useItem, [item]);
        }
    }

    // マップイベント初期化関数の改造
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function () {
        _Game_Map_setupEvents.call(this);
        this.events().forEach(function(eve) {
            var actorTag = $dataMap.events[eve._eventId].note.match(/<actor:(.+)>/);
            if (actorTag && actorTag[1]) {
                var actorId = Number(actorTag[1]);
                $recoder.registerChar(actorId, eve);
            }
        }, this);
        console.log($recoder.data());
    }

    //=========================================================================
    // Game_Player
    //  ・移動実行処理を再定義します。
    //
    //=========================================================================
    var _Game_Player_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function(direction) {
       _Game_Player_executeMove.call(this, direction);
       if ($recoder._isActive) {
           $recoder.register(_Game_Player_executeMove, [direction]);
       }
    };
   
    // イベントコマンド「移動ルートの設定」で設定された移動の実行関数再定義
    var _Game_Character_prototype_forceMoveRoute = Game_Character.prototype.forceMoveRoute;
    Game_Character.prototype.forceMoveRoute = function(moveRoute) {
        _Game_Character_prototype_forceMoveRoute.call(this, moveRoute);
        if ($recoder._isActive) {
            $recoder.register(_Game_Character_prototype_forceMoveRoute, [moveRoute]);
        }
    };

})();