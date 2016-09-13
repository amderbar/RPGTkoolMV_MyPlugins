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

    if(typeof $recoder === "undefined") {
        // 情報格納用オブジェクトの定義
        var ActionRecoder = function () {
            this.initialize.apply(this, arguments);
        };

        ActionRecoder.prototype.initialize = function() {
            this._charNum = charNum;
        };

        ActionRecoder.prototype.charNum = function() {
            return this._charNum;
        };

        ActionRecoder.prototype.increment = function() {
            this._charNum++;
        };

        $recoder = new ActionRecoder();
    }

    // プラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        console.log('command called');
        var command = (command || '').toUpperCase();
        if (command === 'FLG_DEQUEUE') {
            console.log('flg_dequeue called');
            $gameMessage.add("ただし……１か月の場合魔法は尻から出る！");
            $gameMessage.add("人数は" + $recoder.charNum() + "じゃな。");
            $gameMessage.setFaceImage("People3", 0);
        } else if (command === 'FLG_ENQUEUE') {
            console.log('flg_enqueue called');
            $recoder.increment();
        }
    };
})();