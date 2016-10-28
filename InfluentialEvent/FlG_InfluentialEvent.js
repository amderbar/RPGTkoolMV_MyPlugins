// --------------------------------------------------------------------------
// 
// FlG_InfluentialEvent
// 
// Copyright (c) @amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/10/23 version 1.10 セーブデータをロードする際にエラー落ちする不具合に対応
// 2016/10/23 version 1.01 リファクタリングとバージョン番号規則の変更
// 2016/10/18 version 1.00 初版の完成
// 2016/10/16 version 0.00 製作開始
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc イベント同士の接触で「プレイヤー接触」のイベントを起動できるようにします。
 * @author amderbar
 * @version 1.10
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
    'use strict';
    // console.log('FlG_InfluentialEvent');
    // プラグイン引数の取得
    // var parameters = PluginManager.parameters('FlG_InfluentialEvent');
    // var pliginParam = Number(parameters['pligin_param']);

    // --------------------
    // 独自クラスの定義
    // Game_Eventを継承しつつ接触した相手のイベントを起動できる特殊クラス
    // --------------------
    function FlG_InfluentialEvent() {
        this.initialize.apply(this, arguments);
    }

    // 継承とコンストラクタの定義
    FlG_InfluentialEvent.prototype = Object.create(Game_Event.prototype);
    // あくまでマップイベントとしてセーブされるためにコンストラクタは親クラスと同じにしておく
    // FlG_InfluentialEvent.prototype.constructor = FlG_InfluentialEvent;

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
    FlG_InfluentialEvent.prototype.update = function() {
        var wasMoving = this.isMoving();
        Game_Event.prototype.update.call(this);
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
            // 後々使うかもしれない部分
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

    // マップイベントリストのうち特定のイベントを上記クラスにすり替える静的関数
    FlG_InfluentialEvent.impersonate = function() {
        for (var eveNo in $gameMap._events) {
            var mapeve = $gameMap._events[eveNo];
            if (!mapeve) { continue;}
            var eveData = $dataMap.events[mapeve.eventId()];
            if(typeof eveData.meta.actor !== "undefined") {
                $gameMap._events[eveNo] = new FlG_InfluentialEvent(mapeve);
            }
        }
    };

    // --------------------
    // マップイベント初期化関数の改造
    // メモ欄に<actor:XXXXX>のNoteTagが指定されているイベントオブジェクトを上記のクラスオブジェクトで置換する。
    // --------------------
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function () {
        _Game_Map_setupEvents.call(this);
        FlG_InfluentialEvent.impersonate();
        this.refreshTileEvents();
    }

    // // --------------------
    // // 既存ランタイム関数の改造/セーブデータの追加用
    // // セーブデータのロード時に、イベントの整合性を取る。
    // // --------------------
    var _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        // 本来の関数処理呼び出し
        _DataManager_extractSaveContents.call(this, contents);
        // 後処理
        FlG_InfluentialEvent.impersonate();
    }

})();
