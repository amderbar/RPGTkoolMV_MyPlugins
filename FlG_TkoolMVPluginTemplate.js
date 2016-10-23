// --------------------------------------------------------------------------
// 
// FlG_TkoolMVPluginTemplate
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// YYYY/MM/dd version 0.01 製作開始
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc プラグインの説明です。
 * @author amderbar
 * @version 0.01 YYYY/MM/dd 製作開始
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

// 追加するセーブデータの変数
// セーブデータ類はグローバルスコープに定義されているので、クロージャ[function(){...}();]の外に出す
// 他のプラグインとかぶらないように名前を決める必要がある
// if (typeof $gameFlgPluginsData === "undefined") {
//     var $gameFlgPluginsData = null;
// } else {
//     throw new Error("The global valiable '$gameFlgPluginsData' has been already defined.");
// }
(function () {
    'use strict';
    // console.log('FlG_TkoolMVPluginTemplate');
    // プラグイン引数の取得
    var parameters = PluginManager.parameters('FlG_TkoolMVPluginTemplate');
    var pliginParam = Number(parameters['pligin_param']);

    // --------------------
    // 独自クラスの定義
    // --------------------
    var FlG_TkoolMVPluginTemplate = function () {
        this.initialize.apply(this, arguments);
    };

    // 初期化関数
    FlG_TkoolMVPluginTemplate.prototype.initialize = function(args) {
        // 初期化処理
    };

    // メソッド定義
    FlG_TkoolMVPluginTemplate.prototype.method = function(args) {
        // メソッドの処理
    }

    // --------------------
    // インスタンス生成
    // --------------------
    if(typeof $flg === "undefined") {
        $flg = new FlG_TkoolMVPluginTemplate(args);
    }

    // --------------------
    // プラグインコマンドの実装
    // --------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        var command = (command || '').toUpperCase();
        switch (command) {
            case 'FLG_PLUGIN_COMMAND':
                // プラグインコマンドの引数
                var arg = Number(args[0]);
                // プラグインコマンドの処理

                break;
            default:
                break;
        }
        return true;
    };

    // --------------------
    // 既存ランタイム関数の改造
    //
    // --------------------
    var _GameClass_method = GameClass.prototype.method;
    GameClass.prototype.method = function(arg) {
        // 前処理

        // 本来の関数処理呼び出し
        _GameClass_method.call(this, arg);
        // 後処理

    }

    // --------------------
    // 既存ランタイム関数の改造
    // 初期値の設定。ゲーム開始時に呼ばれる。
    // --------------------
    // var createGameObjects = DataManager.createGameObjects;
    // DataManager.createGameObjects = function() {
    //     createGameObjects.call(this);
    //     $gameFlgPluginsData = {};
    // };

    // --------------------
    // 既存ランタイム関数の改造
    // セーブデータを作る静的メソッドに、登録されたプラグインのデータを注入。
    // --------------------
    var _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        // 本来の関数処理呼び出し
        var contents = _DataManager_makeSaveContents.call(this, arg);
        // 自身のデータを追加
        contents.flgPluginsData = $flg;
        // createGameObjectsでグローバル変数としてnewしている場合。
        // contents.flgPluginsData = $gameFlgPluginsData;
        return contents;
    }

    // --------------------
    // 既存ランタイム関数の改造
    // セーブデータのロードメソッドに、登録されたプラグインのデータロードを追加。
    // --------------------
    var _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        // 本来の関数処理呼び出し
        _DataManager_extractSaveContents.call(this, contents);
        // 独自クラスはプロトタイプ以上のデータが反映されないので、別途作成したオブジェクトにデータをアサイン。
        $flg = Object.assign($flg, contents.flgPluginsData);
        // createGameObjectsでグローバル変数としてnewしている場合はそのまま代入でも可。
        // $gameFlgPluginsData = contents.flgPluginsData;
    }

})();
