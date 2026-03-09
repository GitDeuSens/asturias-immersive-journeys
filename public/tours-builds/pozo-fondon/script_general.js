(function(){
var translateObjs = {};
function trans(a, b) {
    var c = arguments['length'] === 0x1 ? [arguments[0x0]] : Array['apply'](null, arguments);
    return translateObjs[c[0x0]] = c, '';
}
function regTextVar(a, b) {
    var c = ![];
    return d(b);
    function d(k, l) {
        switch (k['toLowerCase']()) {
        case 'title':
        case 'subtitle':
        case 'photo.title':
        case 'photo.description':
            var m = (function () {
                switch (k['toLowerCase']()) {
                case 'title':
                case 'photo.title':
                    return 'media.label';
                case 'subtitle':
                    return 'media.data.subtitle';
                case 'photo.description':
                    return 'media.data.description';
                }
            }());
            if (m)
                return function () {
                    var r, s, t = (l && l['viewerName'] ? this['getComponentByName'](l['viewerName']) : undefined) || this['getMainViewer']();
                    if (k['toLowerCase']()['startsWith']('photo'))
                        r = this['getByClassName']('PhotoAlbumPlayListItem')['filter'](function (v) {
                            var w = v['get']('player');
                            return w && w['get']('viewerArea') == t;
                        })['map'](function (v) {
                            return v['get']('media')['get']('playList');
                        });
                    else
                        r = this['_getPlayListsWithViewer'](t), s = j['bind'](this, t);
                    if (!c) {
                        for (var u = 0x0; u < r['length']; ++u) {
                            r[u]['bind']('changing', f, this);
                        }
                        c = !![];
                    }
                    return i['call'](this, r, m, s);
                };
            break;
        case 'tour.name':
        case 'tour.description':
            return function () {
                return this['get']('data')['tour']['locManager']['trans'](k);
            };
        default:
            if (k['toLowerCase']()['startsWith']('viewer.')) {
                var n = k['split']('.'), o = n[0x1];
                if (o) {
                    var p = n['slice'](0x2)['join']('.');
                    return d(p, { 'viewerName': o });
                }
            } else {
                if (k['toLowerCase']()['startsWith']('quiz.') && 'Quiz' in TDV) {
                    var q = undefined, m = (function () {
                            switch (k['toLowerCase']()) {
                            case 'quiz.questions.answered':
                                return TDV['Quiz']['PROPERTY']['QUESTIONS_ANSWERED'];
                            case 'quiz.question.count':
                                return TDV['Quiz']['PROPERTY']['QUESTION_COUNT'];
                            case 'quiz.items.found':
                                return TDV['Quiz']['PROPERTY']['ITEMS_FOUND'];
                            case 'quiz.item.count':
                                return TDV['Quiz']['PROPERTY']['ITEM_COUNT'];
                            case 'quiz.score':
                                return TDV['Quiz']['PROPERTY']['SCORE'];
                            case 'quiz.score.total':
                                return TDV['Quiz']['PROPERTY']['TOTAL_SCORE'];
                            case 'quiz.time.remaining':
                                return TDV['Quiz']['PROPERTY']['REMAINING_TIME'];
                            case 'quiz.time.elapsed':
                                return TDV['Quiz']['PROPERTY']['ELAPSED_TIME'];
                            case 'quiz.time.limit':
                                return TDV['Quiz']['PROPERTY']['TIME_LIMIT'];
                            case 'quiz.media.items.found':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_ITEMS_FOUND'];
                            case 'quiz.media.item.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_ITEM_COUNT'];
                            case 'quiz.media.questions.answered':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_QUESTIONS_ANSWERED'];
                            case 'quiz.media.question.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_QUESTION_COUNT'];
                            case 'quiz.media.score':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_SCORE'];
                            case 'quiz.media.score.total':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_TOTAL_SCORE'];
                            case 'quiz.media.index':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_INDEX'];
                            case 'quiz.media.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_COUNT'];
                            case 'quiz.media.visited':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_VISITED_COUNT'];
                            default:
                                var s = /quiz\.([\w_]+)\.(.+)/['exec'](k);
                                if (s) {
                                    q = s[0x1];
                                    switch ('quiz.' + s[0x2]) {
                                    case 'quiz.score':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['SCORE'];
                                    case 'quiz.score.total':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['TOTAL_SCORE'];
                                    case 'quiz.media.items.found':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_ITEMS_FOUND'];
                                    case 'quiz.media.item.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_ITEM_COUNT'];
                                    case 'quiz.media.questions.answered':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_QUESTIONS_ANSWERED'];
                                    case 'quiz.media.question.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_QUESTION_COUNT'];
                                    case 'quiz.questions.answered':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['QUESTIONS_ANSWERED'];
                                    case 'quiz.question.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['QUESTION_COUNT'];
                                    case 'quiz.items.found':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['ITEMS_FOUND'];
                                    case 'quiz.item.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['ITEM_COUNT'];
                                    case 'quiz.media.score':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_SCORE'];
                                    case 'quiz.media.score.total':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_TOTAL_SCORE'];
                                    }
                                }
                            }
                        }());
                    if (m)
                        return function () {
                            var r = this['get']('data')['quiz'];
                            if (r) {
                                if (!c) {
                                    if (q != undefined) {
                                        if (q == 'global') {
                                            var s = this['get']('data')['quizConfig'], t = s['objectives'];
                                            for (var u = 0x0, v = t['length']; u < v; ++u) {
                                                r['bind'](TDV['Quiz']['EVENT_OBJECTIVE_PROPERTIES_CHANGE'], h['call'](this, t[u]['id'], m), this);
                                            }
                                        } else
                                            r['bind'](TDV['Quiz']['EVENT_OBJECTIVE_PROPERTIES_CHANGE'], h['call'](this, q, m), this);
                                    } else
                                        r['bind'](TDV['Quiz']['EVENT_PROPERTIES_CHANGE'], g['call'](this, m), this);
                                    c = !![];
                                }
                                try {
                                    var w = 0x0;
                                    if (q != undefined) {
                                        if (q == 'global') {
                                            var s = this['get']('data')['quizConfig'], t = s['objectives'];
                                            for (var u = 0x0, v = t['length']; u < v; ++u) {
                                                w += r['getObjective'](t[u]['id'], m);
                                            }
                                        } else
                                            w = r['getObjective'](q, m);
                                    } else {
                                        w = r['get'](m);
                                        if (m == TDV['Quiz']['PROPERTY']['PANORAMA_INDEX'])
                                            w += 0x1;
                                    }
                                    return w;
                                } catch (x) {
                                    return undefined;
                                }
                            }
                        };
                }
            }
            break;
        }
        return function () {
            return '';
        };
    }
    function e() {
        var k = this['get']('data');
        k['updateText'](k['translateObjs'][a]);
    }
    function f(k) {
        var l = k['data']['nextSelectedIndex'];
        if (l >= 0x0) {
            var m = k['source']['get']('items')[l], n = function () {
                    m['unbind']('begin', n, this), e['call'](this);
                };
            m['bind']('begin', n, this);
        }
    }
    function g(k) {
        return function (l) {
            k in l && e['call'](this);
        }['bind'](this);
    }
    function h(k, l) {
        return function (m, n) {
            k == m && l in n && e['call'](this);
        }['bind'](this);
    }
    function i(k, l, m) {
        for (var n = 0x0; n < k['length']; ++n) {
            var o = k[n], p = o['get']('selectedIndex');
            if (p >= 0x0) {
                var q = l['split']('.'), r = o['get']('items')[p];
                if (m !== undefined && !m['call'](this, r))
                    continue;
                for (var s = 0x0; s < q['length']; ++s) {
                    if (r == undefined)
                        return '';
                    r = 'get' in r ? r['get'](q[s]) : r[q[s]];
                }
                return r;
            }
        }
        return '';
    }
    function j(k, l) {
        var m = l['get']('player');
        return m !== undefined && m['get']('viewerArea') == k;
    }
}
var script = {"children":["this.MainViewer","this.Container_38F96381_3363_E9D1_41C6_2802033D91D2"],"watermark":false,"scrollBarMargin":2,"scripts":{"initQuiz":TDV.Tour.Script.initQuiz,"setPanoramaCameraWithCurrentSpot":TDV.Tour.Script.setPanoramaCameraWithCurrentSpot,"getPanoramaOverlaysByTags":TDV.Tour.Script.getPanoramaOverlaysByTags,"loadFromCurrentMediaPlayList":TDV.Tour.Script.loadFromCurrentMediaPlayList,"quizStart":TDV.Tour.Script.quizStart,"cloneGeneric":TDV.Tour.Script.cloneGeneric,"stopGlobalAudios":TDV.Tour.Script.stopGlobalAudios,"resumeGlobalAudios":TDV.Tour.Script.resumeGlobalAudios,"setSurfaceSelectionHotspotMode":TDV.Tour.Script.setSurfaceSelectionHotspotMode,"textToSpeechComponent":TDV.Tour.Script.textToSpeechComponent,"getPlayListsWithMedia":TDV.Tour.Script.getPlayListsWithMedia,"getOverlaysByGroupname":TDV.Tour.Script.getOverlaysByGroupname,"_initSplitViewer":TDV.Tour.Script._initSplitViewer,"clone":TDV.Tour.Script.clone,"setValue":TDV.Tour.Script.setValue,"getOverlaysByTags":TDV.Tour.Script.getOverlaysByTags,"initAnalytics":TDV.Tour.Script.initAnalytics,"setPlayListSelectedIndex":TDV.Tour.Script.setPlayListSelectedIndex,"changeOpacityWhilePlay":TDV.Tour.Script.changeOpacityWhilePlay,"toggleTextToSpeechComponent":TDV.Tour.Script.toggleTextToSpeechComponent,"initOverlayGroupRotationOnClick":TDV.Tour.Script.initOverlayGroupRotationOnClick,"openLink":TDV.Tour.Script.openLink,"quizPauseTimer":TDV.Tour.Script.quizPauseTimer,"_initItemWithComps":TDV.Tour.Script._initItemWithComps,"stopGlobalAudio":TDV.Tour.Script.stopGlobalAudio,"getMainViewer":TDV.Tour.Script.getMainViewer,"getPixels":TDV.Tour.Script.getPixels,"changePlayListWithSameSpot":TDV.Tour.Script.changePlayListWithSameSpot,"resumePlayers":TDV.Tour.Script.resumePlayers,"stopTextToSpeech":TDV.Tour.Script.stopTextToSpeech,"cleanAllMeasurements":TDV.Tour.Script.cleanAllMeasurements,"quizFinish":TDV.Tour.Script.quizFinish,"updateIndexGlobalZoomImage":TDV.Tour.Script.updateIndexGlobalZoomImage,"setDirectionalPanoramaAudio":TDV.Tour.Script.setDirectionalPanoramaAudio,"setComponentVisibility":TDV.Tour.Script.setComponentVisibility,"restartTourWithoutInteraction":TDV.Tour.Script.restartTourWithoutInteraction,"htmlToPlainText":TDV.Tour.Script.htmlToPlainText,"getActiveMediaWithViewer":TDV.Tour.Script.getActiveMediaWithViewer,"triggerOverlay":TDV.Tour.Script.triggerOverlay,"autotriggerAtStart":TDV.Tour.Script.autotriggerAtStart,"setCameraSameSpotAsMedia":TDV.Tour.Script.setCameraSameSpotAsMedia,"updateDeepLink":TDV.Tour.Script.updateDeepLink,"isPanorama":TDV.Tour.Script.isPanorama,"setStartTimeVideo":TDV.Tour.Script.setStartTimeVideo,"sendAnalyticsData":TDV.Tour.Script.sendAnalyticsData,"updateMediaLabelFromPlayList":TDV.Tour.Script.updateMediaLabelFromPlayList,"changeBackgroundWhilePlay":TDV.Tour.Script.changeBackgroundWhilePlay,"executeFunctionWhenChange":TDV.Tour.Script.executeFunctionWhenChange,"setStartTimeVideoSync":TDV.Tour.Script.setStartTimeVideoSync,"getPanoramaOverlayByName":TDV.Tour.Script.getPanoramaOverlayByName,"textToSpeech":TDV.Tour.Script.textToSpeech,"skip3DTransitionOnce":TDV.Tour.Script.skip3DTransitionOnce,"getActivePlayerWithViewer":TDV.Tour.Script.getActivePlayerWithViewer,"getKey":TDV.Tour.Script.getKey,"historyGoForward":TDV.Tour.Script.historyGoForward,"init":TDV.Tour.Script.init,"_initTTSTooltips":TDV.Tour.Script._initTTSTooltips,"historyGoBack":TDV.Tour.Script.historyGoBack,"getRootOverlay":TDV.Tour.Script.getRootOverlay,"getOverlays":TDV.Tour.Script.getOverlays,"setComponentsVisibilityByTags":TDV.Tour.Script.setComponentsVisibilityByTags,"cloneBindings":TDV.Tour.Script.cloneBindings,"quizResumeTimer":TDV.Tour.Script.quizResumeTimer,"toggleMeasurement":TDV.Tour.Script.toggleMeasurement,"setEndToItemIndex":TDV.Tour.Script.setEndToItemIndex,"getStateTextToSpeech":TDV.Tour.Script.getStateTextToSpeech,"_getObjectsByTags":TDV.Tour.Script._getObjectsByTags,"cleanSelectedMeasurements":TDV.Tour.Script.cleanSelectedMeasurements,"updateVideoCues":TDV.Tour.Script.updateVideoCues,"toggleVR":TDV.Tour.Script.toggleVR,"getModel3DInnerObject":TDV.Tour.Script.getModel3DInnerObject,"getPlayListItemIndexByMedia":TDV.Tour.Script.getPlayListItemIndexByMedia,"shareSocial":TDV.Tour.Script.shareSocial,"stopAndGoCamera":TDV.Tour.Script.stopAndGoCamera,"executeJS":TDV.Tour.Script.executeJS,"executeAudioActionByTags":TDV.Tour.Script.executeAudioActionByTags,"keepCompVisible":TDV.Tour.Script.keepCompVisible,"enableVR":TDV.Tour.Script.enableVR,"getComponentByName":TDV.Tour.Script.getComponentByName,"quizSetItemFound":TDV.Tour.Script.quizSetItemFound,"playGlobalAudio":TDV.Tour.Script.playGlobalAudio,"disableVR":TDV.Tour.Script.disableVR,"visibleComponentsIfPlayerFlagEnabled":TDV.Tour.Script.visibleComponentsIfPlayerFlagEnabled,"getMediaHeight":TDV.Tour.Script.getMediaHeight,"executeAudioAction":TDV.Tour.Script.executeAudioAction,"createTweenModel3D":TDV.Tour.Script.createTweenModel3D,"getMediaFromPlayer":TDV.Tour.Script.getMediaFromPlayer,"isCardboardViewMode":TDV.Tour.Script.isCardboardViewMode,"startMeasurement":TDV.Tour.Script.startMeasurement,"getQuizTotalObjectiveProperty":TDV.Tour.Script.getQuizTotalObjectiveProperty,"stopMeasurement":TDV.Tour.Script.stopMeasurement,"startPanoramaWithModel":TDV.Tour.Script.startPanoramaWithModel,"getPlayListItems":TDV.Tour.Script.getPlayListItems,"playGlobalAudioWhilePlay":TDV.Tour.Script.playGlobalAudioWhilePlay,"getActivePlayersWithViewer":TDV.Tour.Script.getActivePlayersWithViewer,"setMediaBehaviour":TDV.Tour.Script.setMediaBehaviour,"showComponentsWhileMouseOver":TDV.Tour.Script.showComponentsWhileMouseOver,"playGlobalAudioWhilePlayActiveMedia":TDV.Tour.Script.playGlobalAudioWhilePlayActiveMedia,"getComponentsByTags":TDV.Tour.Script.getComponentsByTags,"copyToClipboard":TDV.Tour.Script.copyToClipboard,"setMainMediaByIndex":TDV.Tour.Script.setMainMediaByIndex,"getPlayListItemByMedia":TDV.Tour.Script.getPlayListItemByMedia,"quizShowQuestion":TDV.Tour.Script.quizShowQuestion,"setMainMediaByName":TDV.Tour.Script.setMainMediaByName,"showPopupMedia":TDV.Tour.Script.showPopupMedia,"getFirstPlayListWithMedia":TDV.Tour.Script.getFirstPlayListWithMedia,"downloadFile":TDV.Tour.Script.downloadFile,"copyObjRecursively":TDV.Tour.Script.copyObjRecursively,"showPopupImage":TDV.Tour.Script.showPopupImage,"getPlayListWithItem":TDV.Tour.Script.getPlayListWithItem,"pauseGlobalAudios":TDV.Tour.Script.pauseGlobalAudios,"getMediaByTags":TDV.Tour.Script.getMediaByTags,"_getPlayListsWithViewer":TDV.Tour.Script._getPlayListsWithViewer,"setMapLocation":TDV.Tour.Script.setMapLocation,"createTween":TDV.Tour.Script.createTween,"pauseGlobalAudiosWhilePlayItem":TDV.Tour.Script.pauseGlobalAudiosWhilePlayItem,"registerKey":TDV.Tour.Script.registerKey,"clonePanoramaCamera":TDV.Tour.Script.clonePanoramaCamera,"showPopupPanoramaOverlay":TDV.Tour.Script.showPopupPanoramaOverlay,"setObjectsVisibility":TDV.Tour.Script.setObjectsVisibility,"setModel3DCameraWithCurrentSpot":TDV.Tour.Script.setModel3DCameraWithCurrentSpot,"playAudioList":TDV.Tour.Script.playAudioList,"getMediaByName":TDV.Tour.Script.getMediaByName,"getMediaWidth":TDV.Tour.Script.getMediaWidth,"pauseGlobalAudio":TDV.Tour.Script.pauseGlobalAudio,"getGlobalAudio":TDV.Tour.Script.getGlobalAudio,"setModel3DCameraSequence":TDV.Tour.Script.setModel3DCameraSequence,"pauseCurrentPlayers":TDV.Tour.Script.pauseCurrentPlayers,"startModel3DWithCameraSpot":TDV.Tour.Script.startModel3DWithCameraSpot,"takeScreenshot":TDV.Tour.Script.takeScreenshot,"showPopupPanoramaVideoOverlay":TDV.Tour.Script.showPopupPanoramaVideoOverlay,"getCurrentPlayers":TDV.Tour.Script.getCurrentPlayers,"mixObject":TDV.Tour.Script.mixObject,"unregisterKey":TDV.Tour.Script.unregisterKey,"startPanoramaWithCamera":TDV.Tour.Script.startPanoramaWithCamera,"setModel3DCameraSpot":TDV.Tour.Script.setModel3DCameraSpot,"showWindow":TDV.Tour.Script.showWindow,"existsKey":TDV.Tour.Script.existsKey,"setObjectsVisibilityByID":TDV.Tour.Script.setObjectsVisibilityByID,"openEmbeddedPDF":TDV.Tour.Script.openEmbeddedPDF,"setObjectsVisibilityByTags":TDV.Tour.Script.setObjectsVisibilityByTags,"assignObjRecursively":TDV.Tour.Script.assignObjRecursively,"syncPlaylists":TDV.Tour.Script.syncPlaylists,"toggleMeasurementsVisibility":TDV.Tour.Script.toggleMeasurementsVisibility,"_initTwinsViewer":TDV.Tour.Script._initTwinsViewer,"setOverlayBehaviour":TDV.Tour.Script.setOverlayBehaviour,"setMeasurementUnits":TDV.Tour.Script.setMeasurementUnits,"translate":TDV.Tour.Script.translate,"setOverlaysVisibility":TDV.Tour.Script.setOverlaysVisibility,"quizShowScore":TDV.Tour.Script.quizShowScore,"setOverlaysVisibilityByTags":TDV.Tour.Script.setOverlaysVisibilityByTags,"fixTogglePlayPauseButton":TDV.Tour.Script.fixTogglePlayPauseButton,"quizShowTimeout":TDV.Tour.Script.quizShowTimeout,"setMeasurementsVisibility":TDV.Tour.Script.setMeasurementsVisibility,"getAudioByTags":TDV.Tour.Script.getAudioByTags,"setPanoramaCameraWithSpot":TDV.Tour.Script.setPanoramaCameraWithSpot,"getCurrentPlayerWithMedia":TDV.Tour.Script.getCurrentPlayerWithMedia,"setLocale":TDV.Tour.Script.setLocale},"propagateClick":false,"buttonToggleMute":"this.IconButton_52A1B269_5EE9_0F41_41A6_E54F5EB147A3","defaultMenu":["fullscreen","mute","rotation"],"id":"rootPlayer","data":{"locales":{"es":"locale/es.txt"},"displayTooltipInTouchScreens":true,"name":"Player14994","defaultLocale":"es","textToSpeechConfig":{"pitch":1,"volume":1,"rate":1,"stopBackgroundAudio":false,"speechOnTooltip":false,"speechOnQuizQuestion":false,"speechOnInfoWindow":false},"history":{}},"backgroundColor":["#FFFFFF"],"scrollBarColor":"#000000","start":"this.init()","layout":"absolute","class":"Player","gap":10,"minHeight":20,"minWidth":20,"hash": "0d3277d8731de339c329a52fdc4344edad2c107de5648137c378ec6c678595fc", "definitions": [{"frames":[{"thumbnailUrl":"media/panorama_389460B3_3363_2731_41A2_CD0863E6B168_t.webp","class":"CubicPanoramaFrame","cube":{"class":"ImageResource","levels":[{"colCount":24,"rowCount":4,"height":2048,"url":"media/panorama_389460B3_3363_2731_41A2_CD0863E6B168_0/{face}/0/{row}_{column}.webp","class":"TiledImageResourceLevel","tags":"ondemand","width":12288},{"colCount":12,"rowCount":2,"height":1024,"url":"media/panorama_389460B3_3363_2731_41A2_CD0863E6B168_0/{face}/1/{row}_{column}.webp","class":"TiledImageResourceLevel","tags":"ondemand","width":6144},{"colCount":6,"rowCount":1,"height":512,"url":"media/panorama_389460B3_3363_2731_41A2_CD0863E6B168_0/{face}/2/{row}_{column}.webp","class":"TiledImageResourceLevel","tags":["ondemand","preload"],"width":3072}]}}],"class":"Panorama","thumbnailUrl":"media/panorama_389460B3_3363_2731_41A2_CD0863E6B168_t.webp","id":"panorama_389460B3_3363_2731_41A2_CD0863E6B168","data":{"label":"timothy-oldfield-luufnHoChRU-unsplash"},"hfovMax":130,"hfovMin":"150%","label":trans('panorama_389460B3_3363_2731_41A2_CD0863E6B168.label'),"hfov":360,"vfov":180},{"buttonMoveLeft":"this.IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8","class":"PanoramaPlayer","buttonMoveDown":"this.IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB","buttonMoveUp":"this.IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5","keepModel3DLoadedWithoutLocation":true,"buttonMoveRight":"this.IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A","buttonZoomIn":"this.IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6","mouseControlMode":"drag_rotation","id":"MainViewerPanoramaPlayer","buttonPlayLeft":"this.IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE","buttonPause":"this.IconButton_52A1B269_5EE9_0F41_41BD_DBB259E36C46","viewerArea":"this.MainViewer","aaEnabled":true,"arrowKeysAction":"translate","buttonPlayRight":"this.IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1","touchControlMode":"drag_rotation","buttonZoomOut":"this.IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21","buttonRestart":"this.IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5","displayPlaybackBar":true},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41BD_DBB259E36C46","tabIndex":0,"data":{"name":"Button2427"},"mode":"toggle","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41BD_DBB259E36C46_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41BD_DBB259E36C46.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8","tabIndex":0,"data":{"name":"Button2424"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21","tabIndex":0,"data":{"name":"Button2421"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE","tabIndex":0,"data":{"name":"Button2423"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB","tabIndex":0,"data":{"name":"Button2428"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A","tabIndex":0,"data":{"name":"Button2429"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A.png","height":40,"width":40,"backgroundOpacity":0},{"scrollBarMargin":2,"overflow":"hidden","propagateClick":false,"horizontalAlign":"center","id":"Container_52A1B269_5EE9_0F41_41D1_88386173F35D","layout":"vertical","scrollBarColor":"#000000","data":{"name":"Container2425"},"class":"Container","gap":4,"minHeight":20,"minWidth":20,"verticalAlign":"middle","height":"100%","width":40,"children":["this.IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5","this.IconButton_52A1B269_5EE9_0F41_41BD_DBB259E36C46","this.IconButton_52A1B269_5EE9_0F41_41D6_CDBE2F3D66AB"],"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5","tabIndex":0,"data":{"name":"Button2422"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41A6_E54F5EB147A3","tabIndex":0,"data":{"name":"Button2431"},"mode":"toggle","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41A6_E54F5EB147A3_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41A6_E54F5EB147A3.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6","tabIndex":0,"data":{"name":"Button2432"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6.png","height":40,"width":40,"backgroundOpacity":0},{"scrollBarMargin":2,"overflow":"scroll","propagateClick":false,"horizontalAlign":"center","id":"Container_38F96381_3363_E9D1_41C6_2802033D91D2","left":"0%","layout":"horizontal","scrollBarColor":"#000000","class":"Container","data":{"name":"Container16156"},"gap":1,"minHeight":1,"minWidth":1,"bottom":"0%","height":185,"children":["this.Container_52A1B269_5EE9_0F41_41B5_25EA76FD6038"],"width":"100%","backgroundOpacity":0},{"width":"100%","progressBackgroundColorRatios":[0,1],"progressRight":10,"playbackBarProgressBorderColor":"#000000","subtitlesFontFamily":"Arial","playbackBarHeadBorderRadius":0,"toolTipPaddingTop":4,"left":0,"progressBarBorderColor":"#000000","playbackBarHeadBorderColor":"#000000","progressBarBackgroundColorRatios":[0,1],"toolTipPaddingBottom":4,"vrPointerSelectionTime":2000,"playbackBarBorderSize":2,"progressBarBackgroundColor":["#222222","#444444"],"surfaceReticleColor":"#FFFFFF","subtitlesBackgroundColor":"#000000","vrThumbstickRotationStep":20,"subtitlesGap":0,"progressBackgroundColor":["#EEEEEE","#CCCCCC"],"progressBorderColor":"#AAAAAA","playbackBarHeadShadowBlurRadius":3,"playbackBarLeft":0,"playbackBarBackgroundOpacity":1,"surfaceReticleSelectionColor":"#FFFFFF","progressBottom":1,"data":{"name":"Main Viewer"},"progressHeight":20,"playbackBarHeadHeight":30,"playbackBarHeadBackgroundColorRatios":[0,1],"playbackBarHeadShadowColor":"#000000","subtitlesTextShadowOpacity":1,"progressBarBorderSize":0,"firstTransitionDuration":0,"progressBarBorderRadius":4,"propagateClick":false,"progressBorderSize":2,"playbackBarHeadShadow":true,"toolTipShadowColor":"#333333","playbackBarHeadBorderSize":0,"toolTipPaddingLeft":6,"playbackBarHeadBackgroundColor":["#111111","#666666"],"subtitlesTop":0,"progressBorderRadius":4,"toolTipTextShadowColor":"#000000","id":"MainViewer","playbackBarBottom":10,"subtitlesTextShadowHorizontalLength":1,"subtitlesFontColor":"#FFFFFF","progressLeft":10,"playbackBarBackgroundColor":["#EEEEEE","#CCCCCC"],"playbackBarHeight":20,"toolTipFontColor":"#606060","subtitlesTextShadowColor":"#000000","playbackBarHeadWidth":6,"playbackBarProgressBorderSize":0,"playbackBarBackgroundColorDirection":"vertical","playbackBarRight":0,"class":"ViewerArea","minHeight":50,"subtitlesBottom":50,"minWidth":100,"vrPointerSelectionColor":"#FF6600","top":0,"playbackBarProgressBackgroundColor":["#222222","#444444"],"playbackBarProgressBorderRadius":0,"subtitlesBackgroundOpacity":0.2,"toolTipPaddingRight":6,"playbackBarHeadShadowOpacity":0.7,"vrPointerColor":"#FFFFFF","subtitlesBorderColor":"#FFFFFF","toolTipBorderColor":"#767676","subtitlesFontSize":"3vmin","subtitlesTextShadowVerticalLength":1,"height":"100%","playbackBarProgressBackgroundColorRatios":[0,1],"toolTipFontFamily":"Arial","playbackBarBorderColor":"#AAAAAA","toolTipBackgroundColor":"#F6F6F6","playbackBarBorderRadius":4},{"scrollBarMargin":2,"overflow":"hidden","propagateClick":false,"horizontalAlign":"center","id":"Container_52A1B269_5EE9_0F41_41B5_25EA76FD6038","layout":"horizontal","scrollBarColor":"#000000","data":{"name":"Container2420"},"class":"Container","gap":4,"minHeight":20,"minWidth":392,"verticalAlign":"middle","height":"100%","children":["this.IconButton_52A1B269_5EE9_0F41_41D3_569FA7656E21","this.IconButton_52A1B269_5EE9_0F41_41D3_935C0A72A2B5","this.IconButton_52A1B269_5EE9_0F41_41C2_06F386847CFE","this.IconButton_52A1B269_5EE9_0F41_41D2_1E928572CCF8","this.Container_52A1B269_5EE9_0F41_41D1_88386173F35D","this.IconButton_52A1B269_5EE9_0F41_41A8_66B7AAAD648A","this.IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1","this.IconButton_52A1B269_5EE9_0F41_41A6_E54F5EB147A3","this.IconButton_52A1B269_5EE9_0F41_41B5_A1A1F547F9B6"],"width":"23.76%","backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5","tabIndex":0,"data":{"name":"Button2426"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41D3_A09190CC98B5.png","height":40,"width":40,"backgroundOpacity":0},{"initialPosition":{"pitch":0,"class":"PanoramaCameraPosition","yaw":0},"enterPointingToHorizon":true,"class":"PanoramaCamera","id":"panorama_389460B3_3363_2731_41A2_CD0863E6B168_camera","initialSequence":"this.sequence_38601901_3363_26D1_41AB_C3CD183C6BE8"},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1","tabIndex":0,"data":{"name":"Button2430"},"rollOverIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1_pressed.png","iconURL":"skin/IconButton_52A1B269_5EE9_0F41_41B6_7BA2E806A7E1.png","height":40,"width":40,"backgroundOpacity":0},{"id":"mainPlayList","items":[{"camera":"this.panorama_389460B3_3363_2731_41A2_CD0863E6B168_camera","media":"this.panorama_389460B3_3363_2731_41A2_CD0863E6B168","class":"PanoramaPlayListItem","end":"this.trigger('tourEnded')","player":"this.MainViewerPanoramaPlayer"}],"class":"PlayList"},{"class":"PanoramaCameraSequence","id":"sequence_38601901_3363_26D1_41AB_C3CD183C6BE8","movements":[{"yawDelta":18.5,"easing":"cubic_in","class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":323,"class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":18.5,"easing":"cubic_out","class":"DistancePanoramaCameraMovement","yawSpeed":7.96}]}],"height":"100%","width":"100%","backgroundColorRatios":[0]};
if (script['data'] == undefined)
    script['data'] = {};
script['data']['translateObjs'] = translateObjs, script['data']['createQuizConfig'] = function () {
    var a = {};
    return this['get']('data')['translateObjs'] = translateObjs, a;
}, TDV['PlayerAPI']['defineScript'](script);
//# sourceMappingURL=script_device.js.map
})();
//Generated with v2025.2.10, Fri Feb 6 2026