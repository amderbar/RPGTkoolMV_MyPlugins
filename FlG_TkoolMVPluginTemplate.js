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
(function () {
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

})();
