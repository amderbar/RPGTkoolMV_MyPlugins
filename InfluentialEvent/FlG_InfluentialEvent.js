// --------------------------------------------------------------------------
// 
// FlG_InfluentialEvent
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/10/16 version 0.01 製作開始
// 2016/10/18 version 1.01 リリースの完成
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc イベント同士の接触で「プレイヤー接触」のイベントを起動できるようにします。
 * @author amderbar
 * @version 1.01 2016/10/18 リリース版
 * 
 * @help
 * 他のイベントに接触することで相手のイベントを起動できる特殊なイベントを作ります。
 * 
 * ## 使い方
 * 対象のイベントのメモ欄に「<actor:XXXXX>」という形式のNoteTagを記入します。
 * (角括弧を含めて書いてください。なお「XXXXX」部分は数値を想定していますが、
 *  本プラグインでは使用しません)
 * そのうえで、本プラグインを有効化してください。
 * 
 * ## その他
 * 対象のイベントはアクターに対応するキャラクターが存在するNPCを想定しています。
 * そのイベント自身に「プレイヤー接触」や「決定ボタン」をトリガーとするイベントが
 * 指定されていても正常に動くはずです。
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
          for (var prop in mapeve) {
            if (mapeve.hasOwnProperty(prop)) {
                this[prop] = mapeve[prop];
            }
        }
    }

    // イベントに接触した際にプレイヤーに成りすます関数
    var _Game_Event_checkEventTriggerTouch = FlG_InfluentialEvent.prototype.checkEventTriggerTouch;
    FlG_InfluentialEvent.prototype.checkEventTriggerTouch = function(x, y) {
        _Game_Event_checkEventTriggerTouch.call(this, x, y);
        Game_Player.prototype.checkEventTriggerTouch.call(this, x, y);
    }

    // 自分はイベントを起動させる権限があるぞと主張する関数
    FlG_InfluentialEvent.prototype.canStartLocalEvents = function () {
        return true;
    }

    // プレイヤーに成りすましてイベントを起動させる関数
    FlG_InfluentialEvent.prototype.startMapEvent = function(x, y, triggers, normal) {
        Game_Player.prototype.startMapEvent.call(this, x, y, triggers, normal);
    };

    // 自分が他のイベントと衝突してるかどうかを調べる関数
    FlG_InfluentialEvent.prototype.isCollidedWithEvents = function(x, y) {
        return $gameMap.eventsXyNt(x, y).some(function(event) {
            return event.isNormalPriority();
        });
    };

    // アップデート関数の書き換え
    var _Game_Event_update = FlG_InfluentialEvent.prototype.update;
    FlG_InfluentialEvent.prototype.update = function() {
        var wasMoving = this.isMoving();
        _Game_Event_update.call(this);
        if (!this.isMoving()) {
            this.updateNonmoving(wasMoving);
        }
    };

    // 移動終了時に呼ばれる関数。Game_Playerのものよりも簡素にした
    FlG_InfluentialEvent.prototype.updateNonmoving = function(wasMoving) {
        if (!$gameMap.isEventRunning()) {
            if (wasMoving) {
                this.checkEventTriggerHere([1,2]);
                if ($gameMap.setupStartingEvent()) {
                    return;
                }
            }
            // if (this.triggerAction()) {
            //     return;
            // }
            if (!wasMoving) {
                $gameTemp.clearDestination();
            }
        }
    };

    // イベントに乗った際にプレイヤーに成りすます関数
    FlG_InfluentialEvent.prototype.checkEventTriggerHere = function(triggers) {
        Game_Player.prototype.checkEventTriggerHere.call(this, triggers)
    };

    // --------------------
    // マップイベント初期化関数の改造
    // メモ欄に<actor:XXXXX>のNoteTagが指定されているイベントオブジェクトを上記のクラスオブジェクトで置換する。
    // --------------------
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function () {
        _Game_Map_setupEvents.call(this);
        for (eveNo in $gameMap._events) {
            var mapeve = $gameMap._events[eveNo];
            var eveData = $dataMap.events[mapeve.eventId()];
            if(typeof eveData.meta.actor !== "undefined") {
                $gameMap._events[eveNo] = new FlG_InfluentialEvent(mapeve);
            }
        }
    }

})();