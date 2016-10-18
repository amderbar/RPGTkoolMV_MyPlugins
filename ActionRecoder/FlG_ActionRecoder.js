// --------------------------------------------------------------------------
// 
// FlG_ActionRecoder
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/09/13 version 0.01 製作開始
// 2016/10/16 version 1.01 リリース
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc プレイヤーの操作を記録し読み出すためのプラグインコマンドを提供します
 * @author amderbar
 * @version 1.01 2016/10/16 リリース版
 * 
 * @help
 * プレイヤーの操作をパーティ内先頭アクターの行動として記録し、
 * 読み出すためのプラグインコマンドを提供します。
 * 
 * アクターの行動は「アクションID」という数値として記録されます。
 * なおIDと行動の対応づけは各自で行ってください。
 * 
 * なおアイテムおよびスキルを使用した場合ついてはプラグインパラメーターに
 * 検出用スイッチ番号とウォッチ用の変数番号を指定することで
 * 「アイテムないしスキルを使用したかどうか」と
 * 「使用したアイテムないしスキルのID」を得ることができます。
 * ただし存在しないスイッチや変数の番号が指定された場合、この機能は無視されます。
 * 
 * # コマンド一覧
 * FLG_AR_READ actorID:
 *     記録されたアクターの行動を読み出し、プラグインパラメーターで指定された番号の
 *     ゲーム内変数に代入します。
 *     引数「actorID」では、どのアクターの行動を読み出すかをアクターIDで指定します。
 * FLG_AR_WRITE actionID: 
 *     アクターの行動をアクションIDの形で記録します。行動主体であるアクターはその時点で
 *     パーティの先頭にいるアクターが選ばれます。
 *     引数「actionID」で指定された数値が実際には記録されます。
 * FLG_AR_FORWARD:
 *     プラグインで保持してるデータテーブルの読み書きヘッダ位置を一つ進めます。
 * FLG_AR_REWIND:
 *     プラグインで保持してるデータテーブルの読み書きヘッダ位置を先頭に戻します。
 * 
 * @param returnValiable
 * @desc 読み出し時に値を受け渡すゲーム内変数の番号です。
 * @default 1
 * 
 * @param skill_probe
 * @desc そのタイミングでアクターがスキルを使用したかどうかを検出するために使用するスイッチの番号です。
 * @default 0
 * 
 * @param item_probe
 * @desc そのタイミングでアクターがアイテムを使用したかどうかを検出するために使用するスイッチの番号です。
 * @default 0
 * 
 * @param uesed_item_ID_valiable
 * @desc アクターがアイテムやスキルを使用していた場合、そのIDを読み出すためのゲーム内変数の番号です。
 * @default 0
*/

(function () {
    // console.log('FlG_ActionRecoder loaded');
    // プラグイン引数の取得
    var parameters = PluginManager.parameters('FlG_ActionRecoder');
    var returnValiable = Number(parameters['returnValiable']);
    var usedItemIdPan = Number(parameters['uesed_item_ID_valiable']);
    var itemProbe = Number(parameters['item_probe']);
    var skillProbe = Number(parameters['skill_probe']);

    // --------------------
    // 情報格納用クラスの定義
    // --------------------
    function FlG_ActionRecoder() {
        this.initialize.apply(this, arguments);
    };

    // 初期化関数
    FlG_ActionRecoder.prototype.initialize = function(pan, itemPan, itemProbe, skillProbe) {
        this._pan = {};
        this._pan.pan = pan;
        this._pan.itempan = itemPan;
        this._pan.itemProbe = itemProbe;
        this._pan.skillProbe = skillProbe;
        this._head = 0;
        this._actionData = [];
        this._usedItemData = [];
    };

    // 追加初期化用。指定アクターの記憶領域を作成
    FlG_ActionRecoder.prototype.registerActor = function(actorId) {
        this._actionData[actorId] = [];
        this._usedItemData[actorId] = [];
    }

    // データ受け渡し用ゲーム内変数番号のゲッター
    FlG_ActionRecoder.prototype.pan = function() {
        return this._pan;
    }

    // 内部読み書きヘッダを一つ進める関数
    FlG_ActionRecoder.prototype.forward = function() {
        this._head ++;
    };

    // 内部読み書きヘッダを最初に戻す関数
    FlG_ActionRecoder.prototype.rewind = function() {
        this._head = 0;
    };

    // データ記録関数
    FlG_ActionRecoder.prototype.write = function(actorId, actionId) {
        this._actionData[actorId][this._head] = actionId;
    };

    // アイテム、スキル使用データ記録関数
    FlG_ActionRecoder.prototype.writeItem = function(actorId, itemType, itemID) {
        this._usedItemData[actorId][this._head] = {'itemType': itemType, 'itemID': itemID};
    };

    // データ読み出し関数
    FlG_ActionRecoder.prototype.read = function(actorId) {
        var actionId = this._actionData[actorId][this._head];
        return actionId;
    };

    // アイテム、スキル使用データ読み出し関数
    FlG_ActionRecoder.prototype.readItem = function(actorId) {
        var usedItem = this._usedItemData[actorId][this._head];
        if (typeof usedItem === "undefined") {
            usedItem = {'itemType': null, 'itemID': null};
        }
        return usedItem;
    };

    // --------------------
    // インスタンス生成
    // --------------------
    if(typeof $recoder === "undefined") {
        $recoder = new FlG_ActionRecoder(returnValiable, usedItemIdPan, itemProbe, skillProbe);
    }

    // マップイベント初期化関数で追加の初期化処理を呼び出す
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function () {
        _Game_Map_setupEvents.call(this);
        for (var actor of $dataActors) {
            if (actor) {
                $recoder.registerActor(actor.id);
            }
        }
    }

    // --------------------
    // プラグインコマンドの実装
    // --------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        var command = (command || '').toUpperCase();
        switch (command) {
            case 'FLG_AR_READ':
                var actorId = Number(args[0]);
                var pan = $recoder.pan();
                var usedItem = $recoder.readItem(actorId);
                if (usedItem.itemType == 'skill') {
                    $gameSwitches.setValue(pan.skillProbe, true);
                } else if (usedItem.itemType == 'item') {
                    $gameSwitches.setValue(pan.itemProbe, true);
                }
                $gameVariables.setValue(pan.itempan, usedItem.itemID);
                console.log($gameVariables.value(pan.itempan));
                $gameVariables.setValue(pan.pan, $recoder.read(actorId));
                break;
            case 'FLG_AR_WRITE':
                var actionId = Number(args[0]);
                $recoder.write($gameParty.members()[0]._actorId, actionId);
                break;
            case 'FLG_AR_FORWARD':
                $recoder.forward();
                break;
            case 'FLG_AR_REWIND':
                $recoder.rewind();
                break;
            default:
                break;
        }
        return true;
    };

    // --------------------
    // アイテム、スキル使用関数の改造
    // アイテム、スキルが使用されたらそれを記録
    // --------------------
    var _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        _Game_Battler_useItem.call(this, item);
        console.log(this);
        var itemType;
        if (DataManager.isSkill(item)) {
            itemType = 'skill';
        } else if (DataManager.isItem(item)) {
            itemType = 'item';
        }
        $recoder.writeItem(this._actorId, itemType, item.id);
    }

})();