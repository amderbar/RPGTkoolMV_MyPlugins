// --------------------------------------------------------------------------
// 
// FlG_AutoMenuExitByItemUse
// 
// Copyright (c) amderbar
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// 
// 2016/10/13 ver0.0 製作開始
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc アイテムやスキルの使用と同時に自動的にメニュー画面を閉じるようにします。
 * @author amderbar
 * @version 0.01 2016/10/13 製作開始、一応動くものができた
 * 
 * @help
 * アイテムやスキルの使用と同時に自動的にメニュー画面を閉じるようにします。
 * 
*/

(function () {
    console.log('FlG_AutoMenuExitByItemUse loaded');

    // アイテム、スキル使用関数の改造
    var _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        _Game_Battler_useItem.call(this, item);
        // メニュー画面からの使用であることを判断したい
        SceneManager.pop();
        SceneManager.pop();
    }
})();