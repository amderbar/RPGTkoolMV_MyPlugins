// --------------------------------------------------------------------------
// 
// FlG_InfluentialEvent
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/10/16 version 0.01 製作開始
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc イベント同士の接触で「プレイヤー接触」のイベントを起動できるようにします。
 * @author amderbar
 * @version 0.01 2016/10/16 製作開始
 * 
 * @help
 * プラグインの詳細説明です。
 * 
 * # コマンド一覧
 * FLG_PLUGIN_COMMAND:
 *     プラグインコマンドの説明です。
 * 
 * @param pligin_param
 * @desc プラグインパラメーターの説明です。
 * @default 0
 * 
*/
(function () {
    // console.log('FlG_InfluentialEvent');
    // プラグイン引数の取得
    // var parameters = PluginManager.parameters('FlG_InfluentialEvent');
    // var pliginParam = Number(parameters['pligin_param']);

    // --------------------
    // 独自クラスの定義
    // 接触した相手のイベントを起動できるGame_Eventのラッパークラス
    // --------------------
    function FlG_InfluentialEvent() {
        this.initialize.apply(this, arguments);
    }

    // 継承とコンストラクタの定義
    FlG_InfluentialEvent.prototype = Object.create(Game_Event.prototype);
    FlG_InfluentialEvent.prototype.constructor = FlG_InfluentialEvent;

    // 初期化関数
    FlG_InfluentialEvent.prototype.initialize = function(mapeve) {
        this._anima = new Game_Player();
        // Object.assain(this, mapeve);
    }

    // イベントに接触した際にプレイヤーに成りすます関数
    var _Game_Event_checkEventTriggerTouch = FlG_InfluentialEvent.prototype.checkEventTriggerTouch;
    FlG_InfluentialEvent.prototype.checkEventTriggerTouch = function(x, y) {
        _Game_Event_checkEventTriggerTouch.call(this, x, y);
        this._anima.checkEventTriggerTouch.call(this, x, y);
    }

    // 自分はイベントを起動させる権限があるぞと主張する関数
    FlG_InfluentialEvent.prototype.canStartLocalEvents = function () {
        return true;
    }

    // プレイヤーに成りすましてイベントを起動させる関数
    FlG_InfluentialEvent.prototype.startMapEvent = function(x, y, triggers, normal) {
        this._anima.startMapEvent.call(this, x, y, triggers, normal);
    };

    // 自分が他のイベントと衝突してるかどうかを調べる関数
    FlG_InfluentialEvent.prototype.isCollidedWithEvents = function(x, y) {
        return $gameMap.eventsXyNt(x, y).some(function(event) {
            return event.isNormalPriority();
        });
    };

// Game_Player.prototype.checkEventTriggerHere = function(triggers) {
//     if (this.canStartLocalEvents()) {
//         this.startMapEvent(this.x, this.y, triggers, false);
//     }
// };

    // --------------------
    // マップイベント初期化関数の改造
    // メモ欄に<actor:XXXXX>のNoteTagが指定されているイベントを上記ラッパークラスオブジェクトに置換する。
    // --------------------
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function () {
        _Game_Map_setupEvents.call(this);
        for (eveNo in $gameMap._events) {
            var mapeve = $gameMap._events[eveNo];
            var eveData = $dataMap.events[mapeve.eventId()];
            if(typeof eveData.meta.actor !== "undefined") {
                var influEve = new FlG_InfluentialEvent(mapeve);
                $gameMap._events[eveNo] = Object.assign(influEve, mapeve);
            }
        }
    }

})();