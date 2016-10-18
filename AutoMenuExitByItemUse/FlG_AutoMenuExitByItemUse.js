// --------------------------------------------------------------------------
// 
// FlG_AutoMenuExitByItemUse
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/10/13 version 0.01 製作開始、一応動くものができた
// 2016/10/16 version 1.01 リリース
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc アイテムやスキルの使用と同時に自動的にメニュー画面を閉じるようにします。
 * @author amderbar
 * @version 1.01 2016/10/16 リリース
 * 
 * @help
 * アイテムやスキルの使用と同時に自動的にメニュー画面を閉じるようにします。
 * プラグインパラメーターに数値を指定すると、指定した番号のスイッチのON、OFFによって
 * メニューからアイテムやスキルを使用したかどうかを検出するできます。
 * 存在しないスイッチの番号が指定された場合は無視されます。
 * 
 * @param probeID
 * @desc メニューからアイテムやスキルを使用したかどうかを検出するために使用するスイッチの番号です。
 * @default 0
 * 
*/

(function () {
    // console.log('FlG_AutoMenuExitByItemUse loaded');
    // プラグイン引数の取得
    var parameters = PluginManager.parameters('FlG_AutoMenuExitByItemUse');
    var probeId = Number(parameters['probeID']);

    // アイテム、スキル使用関数の改造
    var _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        _Game_Battler_useItem.call(this, item);
        // メニュー画面からの使用であることを判断
        var _scene = SceneManager._scene;
        if ((_scene instanceof Scene_Skill) || (_scene instanceof Scene_Item))  {
            $gameSwitches.setValue(probeId, true);
            SceneManager.pop();
            SceneManager.pop();
        }
    }
})();
