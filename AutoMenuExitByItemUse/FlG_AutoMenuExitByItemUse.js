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
    console.log('FlG_AutoMenuExitByItemUse loaded');
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

/* 以下メモ書き/メニュー画面を閉じる際の処理について
 * メニューに限らずゲームの進行をつかさどるのはSceneManegerというクラス。
 * SceneManager._stackという配列に蓄えられたSceneオブジェクトが順次実行される。
 * メニュー画面はSceneオブジェクトの一つ(Scene_Menu)。
 * Sceneオブジェクトはそれぞれ作成時にcreateCommandWindow()というメソッドでイベントハンドラを設定され、イベントに応じたハンドラ関数が紐づけられている。
 * キャンセルボタンを押したときに発生するイベントは'cancel'で、紐づけられたハンドラ関数はそのSceneオブジェクトのpopSecen()。
 * この関数自体はSceneオブジェクトのスーパークラスであるScene_Baseで定義されていて関数内ではSceneManager.pop()を実行する。
 * SceneManager.pop()はSceneManager._stackから次のSceneオブジェクトを取って(pop)きて、次のSceneに以降するという働きを持つ。
 * これは推測になるが、メニュー系のSceneは次のSceneとして直前と同じSceneが設定されているようだ。
 * というのもSceneManager.pop()を挟むことでスキル選択画面からはメニュー画面トップに、メニュー画面トップからはフィールドマップに戻ることができる。
 */