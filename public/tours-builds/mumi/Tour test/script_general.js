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
var script = {"children":["this.MainViewer","this.Container_20BC40C9_2CA9_D2FC_41BA_D5F85FC793BB"],"watermark":false,"scrollBarMargin":2,"scripts":{"setDirectionalPanoramaAudio":TDV.Tour.Script.setDirectionalPanoramaAudio,"visibleComponentsIfPlayerFlagEnabled":TDV.Tour.Script.visibleComponentsIfPlayerFlagEnabled,"initAnalytics":TDV.Tour.Script.initAnalytics,"historyGoForward":TDV.Tour.Script.historyGoForward,"initOverlayGroupRotationOnClick":TDV.Tour.Script.initOverlayGroupRotationOnClick,"copyObjRecursively":TDV.Tour.Script.copyObjRecursively,"initQuiz":TDV.Tour.Script.initQuiz,"clone":TDV.Tour.Script.clone,"_initSplitViewer":TDV.Tour.Script._initSplitViewer,"copyToClipboard":TDV.Tour.Script.copyToClipboard,"registerKey":TDV.Tour.Script.registerKey,"openLink":TDV.Tour.Script.openLink,"_initTwinsViewer":TDV.Tour.Script._initTwinsViewer,"setModel3DCameraWithCurrentSpot":TDV.Tour.Script.setModel3DCameraWithCurrentSpot,"setModel3DCameraSequence":TDV.Tour.Script.setModel3DCameraSequence,"isPanorama":TDV.Tour.Script.isPanorama,"executeAudioAction":TDV.Tour.Script.executeAudioAction,"unregisterKey":TDV.Tour.Script.unregisterKey,"createTweenModel3D":TDV.Tour.Script.createTweenModel3D,"isCardboardViewMode":TDV.Tour.Script.isCardboardViewMode,"setObjectsVisibilityByID":TDV.Tour.Script.setObjectsVisibilityByID,"existsKey":TDV.Tour.Script.existsKey,"setObjectsVisibility":TDV.Tour.Script.setObjectsVisibility,"keepCompVisible":TDV.Tour.Script.keepCompVisible,"executeAudioActionByTags":TDV.Tour.Script.executeAudioActionByTags,"restartTourWithoutInteraction":TDV.Tour.Script.restartTourWithoutInteraction,"downloadFile":TDV.Tour.Script.downloadFile,"_initItemWithComps":TDV.Tour.Script._initItemWithComps,"textToSpeech":TDV.Tour.Script.textToSpeech,"setObjectsVisibilityByTags":TDV.Tour.Script.setObjectsVisibilityByTags,"getMainViewer":TDV.Tour.Script.getMainViewer,"executeJS":TDV.Tour.Script.executeJS,"setValue":TDV.Tour.Script.setValue,"setOverlayBehaviour":TDV.Tour.Script.setOverlayBehaviour,"loadFromCurrentMediaPlayList":TDV.Tour.Script.loadFromCurrentMediaPlayList,"executeFunctionWhenChange":TDV.Tour.Script.executeFunctionWhenChange,"_initTTSTooltips":TDV.Tour.Script._initTTSTooltips,"getPixels":TDV.Tour.Script.getPixels,"setPanoramaCameraWithCurrentSpot":TDV.Tour.Script.setPanoramaCameraWithCurrentSpot,"setOverlaysVisibilityByTags":TDV.Tour.Script.setOverlaysVisibilityByTags,"getActiveMediaWithViewer":TDV.Tour.Script.getActiveMediaWithViewer,"setOverlaysVisibility":TDV.Tour.Script.setOverlaysVisibility,"pauseCurrentPlayers":TDV.Tour.Script.pauseCurrentPlayers,"getActivePlayerWithViewer":TDV.Tour.Script.getActivePlayerWithViewer,"setPanoramaCameraWithSpot":TDV.Tour.Script.setPanoramaCameraWithSpot,"openEmbeddedPDF":TDV.Tour.Script.openEmbeddedPDF,"setSurfaceSelectionHotspotMode":TDV.Tour.Script.setSurfaceSelectionHotspotMode,"setPlayListSelectedIndex":TDV.Tour.Script.setPlayListSelectedIndex,"pauseGlobalAudiosWhilePlayItem":TDV.Tour.Script.pauseGlobalAudiosWhilePlayItem,"getActivePlayersWithViewer":TDV.Tour.Script.getActivePlayersWithViewer,"pauseGlobalAudio":TDV.Tour.Script.pauseGlobalAudio,"setStartTimeVideo":TDV.Tour.Script.setStartTimeVideo,"pauseGlobalAudios":TDV.Tour.Script.pauseGlobalAudios,"getCurrentPlayerWithMedia":TDV.Tour.Script.getCurrentPlayerWithMedia,"getAudioByTags":TDV.Tour.Script.getAudioByTags,"playAudioList":TDV.Tour.Script.playAudioList,"init":TDV.Tour.Script.init,"skip3DTransitionOnce":TDV.Tour.Script.skip3DTransitionOnce,"playGlobalAudioWhilePlayActiveMedia":TDV.Tour.Script.playGlobalAudioWhilePlayActiveMedia,"getCurrentPlayers":TDV.Tour.Script.getCurrentPlayers,"setStartTimeVideoSync":TDV.Tour.Script.setStartTimeVideoSync,"playGlobalAudioWhilePlay":TDV.Tour.Script.playGlobalAudioWhilePlay,"getGlobalAudio":TDV.Tour.Script.getGlobalAudio,"shareSocial":TDV.Tour.Script.shareSocial,"playGlobalAudio":TDV.Tour.Script.playGlobalAudio,"showComponentsWhileMouseOver":TDV.Tour.Script.showComponentsWhileMouseOver,"showPopupMedia":TDV.Tour.Script.showPopupMedia,"getMediaByName":TDV.Tour.Script.getMediaByName,"getKey":TDV.Tour.Script.getKey,"getComponentByName":TDV.Tour.Script.getComponentByName,"showPopupPanoramaOverlay":TDV.Tour.Script.showPopupPanoramaOverlay,"showPopupImage":TDV.Tour.Script.showPopupImage,"quizShowQuestion":TDV.Tour.Script.quizShowQuestion,"getMediaByTags":TDV.Tour.Script.getMediaByTags,"quizSetItemFound":TDV.Tour.Script.quizSetItemFound,"getComponentsByTags":TDV.Tour.Script.getComponentsByTags,"showPopupPanoramaVideoOverlay":TDV.Tour.Script.showPopupPanoramaVideoOverlay,"getPlayListsWithMedia":TDV.Tour.Script.getPlayListsWithMedia,"getMediaFromPlayer":TDV.Tour.Script.getMediaFromPlayer,"showWindow":TDV.Tour.Script.showWindow,"quizPauseTimer":TDV.Tour.Script.quizPauseTimer,"getMediaHeight":TDV.Tour.Script.getMediaHeight,"startModel3DWithCameraSpot":TDV.Tour.Script.startModel3DWithCameraSpot,"getMediaWidth":TDV.Tour.Script.getMediaWidth,"startPanoramaWithCamera":TDV.Tour.Script.startPanoramaWithCamera,"getModel3DInnerObject":TDV.Tour.Script.getModel3DInnerObject,"startPanoramaWithModel":TDV.Tour.Script.startPanoramaWithModel,"quizResumeTimer":TDV.Tour.Script.quizResumeTimer,"_getObjectsByTags":TDV.Tour.Script._getObjectsByTags,"startMeasurement":TDV.Tour.Script.startMeasurement,"getOverlaysByTags":TDV.Tour.Script.getOverlaysByTags,"setMapLocation":TDV.Tour.Script.setMapLocation,"enableVR":TDV.Tour.Script.enableVR,"resumePlayers":TDV.Tour.Script.resumePlayers,"getOverlays":TDV.Tour.Script.getOverlays,"disableVR":TDV.Tour.Script.disableVR,"getOverlaysByGroupname":TDV.Tour.Script.getOverlaysByGroupname,"stopMeasurement":TDV.Tour.Script.stopMeasurement,"cleanAllMeasurements":TDV.Tour.Script.cleanAllMeasurements,"resumeGlobalAudios":TDV.Tour.Script.resumeGlobalAudios,"getPanoramaOverlayByName":TDV.Tour.Script.getPanoramaOverlayByName,"toggleMeasurement":TDV.Tour.Script.toggleMeasurement,"toggleVR":TDV.Tour.Script.toggleVR,"stopGlobalAudios":TDV.Tour.Script.stopGlobalAudios,"getPanoramaOverlaysByTags":TDV.Tour.Script.getPanoramaOverlaysByTags,"createTween":TDV.Tour.Script.createTween,"stopGlobalAudio":TDV.Tour.Script.stopGlobalAudio,"toggleMeasurementsVisibility":TDV.Tour.Script.toggleMeasurementsVisibility,"cleanSelectedMeasurements":TDV.Tour.Script.cleanSelectedMeasurements,"setMeasurementUnits":TDV.Tour.Script.setMeasurementUnits,"autotriggerAtStart":TDV.Tour.Script.autotriggerAtStart,"fixTogglePlayPauseButton":TDV.Tour.Script.fixTogglePlayPauseButton,"setMeasurementsVisibility":TDV.Tour.Script.setMeasurementsVisibility,"sendAnalyticsData":TDV.Tour.Script.sendAnalyticsData,"_getPlayListsWithViewer":TDV.Tour.Script._getPlayListsWithViewer,"quizShowScore":TDV.Tour.Script.quizShowScore,"stopAndGoCamera":TDV.Tour.Script.stopAndGoCamera,"changeBackgroundWhilePlay":TDV.Tour.Script.changeBackgroundWhilePlay,"getPlayListWithItem":TDV.Tour.Script.getPlayListWithItem,"syncPlaylists":TDV.Tour.Script.syncPlaylists,"changeOpacityWhilePlay":TDV.Tour.Script.changeOpacityWhilePlay,"getFirstPlayListWithMedia":TDV.Tour.Script.getFirstPlayListWithMedia,"stopTextToSpeech":TDV.Tour.Script.stopTextToSpeech,"setCameraSameSpotAsMedia":TDV.Tour.Script.setCameraSameSpotAsMedia,"changePlayListWithSameSpot":TDV.Tour.Script.changePlayListWithSameSpot,"getPlayListItemByMedia":TDV.Tour.Script.getPlayListItemByMedia,"setComponentVisibility":TDV.Tour.Script.setComponentVisibility,"takeScreenshot":TDV.Tour.Script.takeScreenshot,"quizStart":TDV.Tour.Script.quizStart,"getPlayListItems":TDV.Tour.Script.getPlayListItems,"quizShowTimeout":TDV.Tour.Script.quizShowTimeout,"setComponentsVisibilityByTags":TDV.Tour.Script.setComponentsVisibilityByTags,"mixObject":TDV.Tour.Script.mixObject,"getPlayListItemIndexByMedia":TDV.Tour.Script.getPlayListItemIndexByMedia,"textToSpeechComponent":TDV.Tour.Script.textToSpeechComponent,"cloneGeneric":TDV.Tour.Script.cloneGeneric,"getQuizTotalObjectiveProperty":TDV.Tour.Script.getQuizTotalObjectiveProperty,"toggleTextToSpeechComponent":TDV.Tour.Script.toggleTextToSpeechComponent,"triggerOverlay":TDV.Tour.Script.triggerOverlay,"assignObjRecursively":TDV.Tour.Script.assignObjRecursively,"updateDeepLink":TDV.Tour.Script.updateDeepLink,"setEndToItemIndex":TDV.Tour.Script.setEndToItemIndex,"translate":TDV.Tour.Script.translate,"clonePanoramaCamera":TDV.Tour.Script.clonePanoramaCamera,"getRootOverlay":TDV.Tour.Script.getRootOverlay,"cloneBindings":TDV.Tour.Script.cloneBindings,"getStateTextToSpeech":TDV.Tour.Script.getStateTextToSpeech,"setMainMediaByName":TDV.Tour.Script.setMainMediaByName,"historyGoBack":TDV.Tour.Script.historyGoBack,"setMainMediaByIndex":TDV.Tour.Script.setMainMediaByIndex,"updateIndexGlobalZoomImage":TDV.Tour.Script.updateIndexGlobalZoomImage,"setModel3DCameraSpot":TDV.Tour.Script.setModel3DCameraSpot,"updateVideoCues":TDV.Tour.Script.updateVideoCues,"updateMediaLabelFromPlayList":TDV.Tour.Script.updateMediaLabelFromPlayList,"setMediaBehaviour":TDV.Tour.Script.setMediaBehaviour,"htmlToPlainText":TDV.Tour.Script.htmlToPlainText,"quizFinish":TDV.Tour.Script.quizFinish,"setLocale":TDV.Tour.Script.setLocale},"propagateClick":false,"buttonToggleMute":"this.IconButton_5266705B_5F07_7DC4_41D3_24192DF36080","defaultMenu":["fullscreen","mute","rotation"],"id":"rootPlayer","data":{"locales":{"es":"locale/es.txt"},"displayTooltipInTouchScreens":true,"history":{},"name":"Player43899","defaultLocale":"es","textToSpeechConfig":{"pitch":1,"volume":1,"rate":1,"stopBackgroundAudio":false,"speechOnTooltip":false,"speechOnQuizQuestion":false,"speechOnInfoWindow":false}},"backgroundColor":["#FFFFFF"],"scrollBarColor":"#000000","start":"this.init()","layout":"absolute","class":"Player","gap":10,"minHeight":20,"minWidth":20,"hash": "d4d68ebc15e47bd4b9e7139da89026db74e1fe233fc490e1fabb726e9ac14138", "definitions": [{"rollOverOpacity":0.8,"distance":2,"class":"Menu","selectedBackgroundColor":"#202020","backgroundColor":"#404040","children":["this.MenuItem_20E401F0_2CA9_D2AC_41B3_6F4A83C44D58","this.MenuItem_3E38DCFE_2CB9_5297_41B8_CA721E02E3C1","this.MenuItem_3E38DCFE_2CB9_5294_41B7_038793EA8F26"],"rollOverBackgroundColor":"#000000","fontColor":"#FFFFFF","rollOverFontColor":"#FFFFFF","label":trans('Menu_209811C4_2CA9_D2EB_41A4_BF6D9D464AB5.label'),"opacity":0.4,"id":"Menu_209811C4_2CA9_D2EB_41A4_BF6D9D464AB5","fontFamily":"Arial","selectedFontColor":"#FFFFFF"},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8","tabIndex":0,"data":{"name":"Button49921"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5","tabIndex":0,"data":{"name":"Button49922"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41D3_24192DF36080","tabIndex":0,"data":{"name":"Button49930"},"mode":"toggle","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41D3_24192DF36080_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41D3_24192DF36080.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41C7_A597F5CD8E3C","tabIndex":0,"data":{"name":"Button49926"},"mode":"toggle","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41C7_A597F5CD8E3C_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41C7_A597F5CD8E3C.png","height":40,"width":40,"backgroundOpacity":0},{"initialPosition":{"pitch":0,"class":"PanoramaCameraPosition","yaw":0},"enterPointingToHorizon":true,"class":"PanoramaCamera","id":"panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_camera","initialSequence":"this.sequence_3DE5C974_2CB9_D3AB_41A7_7F594E418AEA"},{"scrollBarMargin":2,"overflow":"hidden","propagateClick":false,"horizontalAlign":"center","id":"Container_5266705B_5F07_7DC4_4164_13C497C5A794","layout":"horizontal","scrollBarColor":"#000000","data":{"name":"Container49919"},"class":"Container","gap":4,"minHeight":20,"minWidth":392,"verticalAlign":"middle","height":"100%","width":392,"children":["this.IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877","this.IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8","this.IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5","this.IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46","this.Container_5266705B_5F07_7DC4_41D1_DB7A4AB3DA6C","this.IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA","this.IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68","this.IconButton_5266705B_5F07_7DC4_41D3_24192DF36080","this.IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0"],"backgroundOpacity":0},{"scrollBarMargin":2,"overflow":"scroll","propagateClick":false,"horizontalAlign":"center","id":"Container_20BC40C9_2CA9_D2FC_41BA_D5F85FC793BB","left":"0%","layout":"horizontal","scrollBarColor":"#000000","class":"Container","data":{"name":"Container44746"},"gap":10,"minHeight":1,"minWidth":1,"verticalAlign":"middle","bottom":"0%","height":142,"children":["this.Container_5266705B_5F07_7DC4_4164_13C497C5A794"],"width":"100%","backgroundOpacity":0},{"frames":[{"thumbnailUrl":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_t.webp","class":"CubicPanoramaFrame","cube":{"class":"ImageResource","levels":[{"colCount":42,"height":3584,"url":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_0/{face}/0/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":7,"tags":"ondemand","width":21504},{"colCount":24,"height":2048,"url":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_0/{face}/1/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":4,"tags":"ondemand","width":12288},{"colCount":12,"height":1024,"url":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_0/{face}/2/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":2,"tags":"ondemand","width":6144},{"colCount":6,"height":512,"url":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_0/{face}/3/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":1,"tags":["ondemand","preload"],"width":3072}]}}],"cardboardMenu":"this.Menu_209811C4_2CA9_D2EB_41A4_BF6D9D464AB5","class":"Panorama","thumbnailUrl":"media/panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_t.webp","id":"panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4","data":{"label":"aerial-drone-panorama-view-nature-moldova-sunset-village-wide-fields-valleys"},"hfovMax":130,"hfovMin":"120%","label":trans('panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4.label'),"hfov":360,"vfov":134.03},{"scrollBarMargin":2,"overflow":"hidden","propagateClick":false,"horizontalAlign":"center","id":"Container_5266705B_5F07_7DC4_41D1_DB7A4AB3DA6C","layout":"vertical","scrollBarColor":"#000000","data":{"name":"Container49924"},"class":"Container","gap":4,"minHeight":20,"minWidth":20,"verticalAlign":"middle","height":"100%","width":40,"children":["this.IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF","this.IconButton_5266705B_5F07_7DC4_41C7_A597F5CD8E3C","this.IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69"],"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF","tabIndex":0,"data":{"name":"Button49925"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF.png","height":40,"width":40,"backgroundOpacity":0},{"width":"100%","progressBackgroundColorRatios":[0,1],"progressRight":10,"playbackBarProgressBorderColor":"#000000","subtitlesFontFamily":"Arial","playbackBarHeadBorderRadius":0,"toolTipPaddingTop":4,"left":0,"progressBarBorderColor":"#000000","playbackBarHeadBorderColor":"#000000","progressBarBackgroundColorRatios":[0,1],"toolTipPaddingBottom":4,"vrPointerSelectionTime":2000,"playbackBarBorderSize":2,"progressBarBackgroundColor":["#222222","#444444"],"surfaceReticleColor":"#FFFFFF","subtitlesBackgroundColor":"#000000","vrThumbstickRotationStep":20,"subtitlesGap":0,"progressBackgroundColor":["#EEEEEE","#CCCCCC"],"progressBorderColor":"#AAAAAA","playbackBarHeadShadowBlurRadius":3,"playbackBarLeft":0,"playbackBarBackgroundOpacity":1,"surfaceReticleSelectionColor":"#FFFFFF","progressBottom":1,"data":{"name":"Main Viewer"},"progressHeight":20,"playbackBarHeadHeight":30,"playbackBarHeadBackgroundColorRatios":[0,1],"playbackBarHeadShadowColor":"#000000","subtitlesTextShadowOpacity":1,"progressBarBorderSize":0,"firstTransitionDuration":0,"progressBarBorderRadius":4,"propagateClick":false,"progressBorderSize":2,"playbackBarHeadShadow":true,"toolTipShadowColor":"#333333","playbackBarHeadBorderSize":0,"toolTipPaddingLeft":6,"playbackBarHeadBackgroundColor":["#111111","#666666"],"subtitlesTop":0,"progressBorderRadius":4,"toolTipTextShadowColor":"#000000","id":"MainViewer","playbackBarBottom":10,"subtitlesTextShadowHorizontalLength":1,"subtitlesFontColor":"#FFFFFF","progressLeft":10,"playbackBarBackgroundColor":["#EEEEEE","#CCCCCC"],"playbackBarHeight":20,"toolTipFontColor":"#606060","subtitlesTextShadowColor":"#000000","playbackBarHeadWidth":6,"playbackBarProgressBorderSize":0,"playbackBarBackgroundColorDirection":"vertical","playbackBarRight":0,"class":"ViewerArea","minHeight":50,"subtitlesBottom":50,"minWidth":100,"vrPointerSelectionColor":"#FF6600","top":0,"playbackBarProgressBackgroundColor":["#222222","#444444"],"playbackBarProgressBorderRadius":0,"subtitlesBackgroundOpacity":0.2,"toolTipPaddingRight":6,"playbackBarHeadShadowOpacity":0.7,"vrPointerColor":"#FFFFFF","subtitlesBorderColor":"#FFFFFF","toolTipBorderColor":"#767676","subtitlesFontSize":"3vmin","subtitlesTextShadowVerticalLength":1,"height":"100%","playbackBarProgressBackgroundColorRatios":[0,1],"toolTipFontFamily":"Arial","playbackBarBorderColor":"#AAAAAA","toolTipBackgroundColor":"#F6F6F6","playbackBarBorderRadius":4},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69","tabIndex":0,"data":{"name":"Button49927"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69.png","height":40,"width":40,"backgroundOpacity":0},{"initialPosition":{"pitch":0,"class":"PanoramaCameraPosition","yaw":0},"enterPointingToHorizon":true,"class":"PanoramaCamera","id":"panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_camera","initialSequence":"this.sequence_27B31435_2CA9_5195_41B4_104EF0267E0B"},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877","tabIndex":0,"data":{"name":"Button49920"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877.png","height":40,"width":40,"backgroundOpacity":0},{"initialPosition":{"pitch":0,"class":"PanoramaCameraPosition","yaw":0},"enterPointingToHorizon":true,"class":"PanoramaCamera","id":"panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_camera","initialSequence":"this.sequence_3DFD1159_2CB9_539C_41C3_6C3C94E2FE6E"},{"frames":[{"thumbnailUrl":"media/panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_t.webp","class":"CubicPanoramaFrame","cube":{"class":"ImageResource","levels":[{"colCount":24,"height":2048,"url":"media/panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_0/{face}/0/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":4,"tags":"ondemand","width":12288},{"colCount":12,"height":1024,"url":"media/panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_0/{face}/1/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":2,"tags":"ondemand","width":6144},{"colCount":6,"height":512,"url":"media/panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_0/{face}/2/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":1,"tags":["ondemand","preload"],"width":3072}]}}],"cardboardMenu":"this.Menu_209811C4_2CA9_D2EB_41A4_BF6D9D464AB5","class":"Panorama","thumbnailUrl":"media/panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_t.webp","id":"panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC","data":{"label":"timothy-oldfield-luufnHoChRU-unsplash"},"hfovMax":130,"hfovMin":"150%","label":trans('panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC.label'),"hfov":360,"vfov":180},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68","tabIndex":0,"data":{"name":"Button49929"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68.png","height":40,"width":40,"backgroundOpacity":0},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46","tabIndex":0,"data":{"name":"Button49923"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46.png","height":40,"width":40,"backgroundOpacity":0},{"frames":[{"thumbnailUrl":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_t.webp","class":"CubicPanoramaFrame","cube":{"class":"ImageResource","levels":[{"colCount":30,"height":2560,"url":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_0/{face}/0/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":5,"tags":"ondemand","width":15360},{"colCount":18,"height":1536,"url":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_0/{face}/1/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":3,"tags":"ondemand","width":9216},{"colCount":12,"height":1024,"url":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_0/{face}/2/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":2,"tags":"ondemand","width":6144},{"colCount":6,"height":512,"url":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_0/{face}/3/{row}_{column}.webp","class":"TiledImageResourceLevel","rowCount":1,"tags":["ondemand","preload"],"width":3072}]}}],"cardboardMenu":"this.Menu_209811C4_2CA9_D2EB_41A4_BF6D9D464AB5","class":"Panorama","thumbnailUrl":"media/panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_t.webp","id":"panorama_3D583843_2CB9_71ED_41B3_18E965D1C638","data":{"label":"alex-bdnr-GNNoZa8zVwY-unsplash"},"hfovMax":130,"hfovMin":"135%","label":trans('panorama_3D583843_2CB9_71ED_41B3_18E965D1C638.label'),"hfov":360,"vfov":128.07},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0","tabIndex":0,"data":{"name":"Button49931"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0.png","height":40,"width":40,"backgroundOpacity":0},{"buttonMoveLeft":"this.IconButton_5266705B_5F07_7DC4_41D5_17832A26EB46","class":"PanoramaPlayer","mouseControlMode":"drag_rotation","buttonMoveDown":"this.IconButton_5266705B_5F07_7DC4_41A9_D1B8058C1D69","buttonMoveUp":"this.IconButton_5266705B_5F07_7DC4_4166_35648BCE8FCF","keepModel3DLoadedWithoutLocation":true,"id":"MainViewerPanoramaPlayer","buttonZoomIn":"this.IconButton_5266705B_5F07_7DC4_41CA_4047298C87B0","buttonMoveRight":"this.IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA","buttonPlayLeft":"this.IconButton_5266705B_5F07_7DC4_41C4_C06EEB3DBFC5","touchControlMode":"drag_rotation","buttonPause":"this.IconButton_5266705B_5F07_7DC4_41C7_A597F5CD8E3C","buttonZoomOut":"this.IconButton_5266705B_5F07_7DC4_41CE_F9B2B5401877","aaEnabled":true,"viewerArea":"this.MainViewer","arrowKeysAction":"translate","gyroscopeEnabled":true,"buttonPlayRight":"this.IconButton_5266705B_5F07_7DC4_41B2_33DE428A6E68","buttonRestart":"this.IconButton_5266705B_5F07_7DC4_41BA_9DC5EC13F0B8","displayPlaybackBar":true},{"id":"mainPlayList","items":[{"camera":"this.panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4_camera","media":"this.panorama_20BD08C7_2CA9_72F4_41BA_2CBE0FE1E9F4","class":"PanoramaPlayListItem","player":"this.MainViewerPanoramaPlayer","begin":"this.setEndToItemIndex(this.mainPlayList, 0, 1)"},{"camera":"this.panorama_3D583843_2CB9_71ED_41B3_18E965D1C638_camera","media":"this.panorama_3D583843_2CB9_71ED_41B3_18E965D1C638","class":"PanoramaPlayListItem","player":"this.MainViewerPanoramaPlayer","begin":"this.setEndToItemIndex(this.mainPlayList, 1, 2)"},{"camera":"this.panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC_camera","media":"this.panorama_3D3C619E_2CB9_D297_41C3_0845E1D2BDFC","class":"PanoramaPlayListItem","end":"this.trigger('tourEnded')","player":"this.MainViewerPanoramaPlayer","begin":"this.setEndToItemIndex(this.mainPlayList, 2, 0)"}],"class":"PlayList"},{"horizontalAlign":"center","transparencyActive":true,"propagateClick":false,"id":"IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA","tabIndex":0,"data":{"name":"Button49928"},"rollOverIconURL":"skin/IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA_rollover.png","class":"IconButton","verticalAlign":"middle","minHeight":0,"minWidth":0,"pressedIconURL":"skin/IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA_pressed.png","iconURL":"skin/IconButton_5266705B_5F07_7DC4_41D1_2478984C07CA.png","height":40,"width":40,"backgroundOpacity":0},{"id":"MenuItem_20E401F0_2CA9_D2AC_41B3_6F4A83C44D58","click":"this.setPlayListSelectedIndex(this.mainPlayList, 0)","class":"MenuItem","label":trans('MenuItem_20E401F0_2CA9_D2AC_41B3_6F4A83C44D58.label')},{"id":"MenuItem_3E38DCFE_2CB9_5297_41B8_CA721E02E3C1","click":"this.setPlayListSelectedIndex(this.mainPlayList, 1)","class":"MenuItem","label":trans('MenuItem_3E38DCFE_2CB9_5297_41B8_CA721E02E3C1.label')},{"id":"MenuItem_3E38DCFE_2CB9_5294_41B7_038793EA8F26","click":"this.setPlayListSelectedIndex(this.mainPlayList, 2)","class":"MenuItem","label":trans('MenuItem_3E38DCFE_2CB9_5294_41B7_038793EA8F26.label')},{"class":"PanoramaCameraSequence","id":"sequence_3DE5C974_2CB9_D3AB_41A7_7F594E418AEA","movements":[{"yawDelta":18.5,"easing":"cubic_in","class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":323,"class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":18.5,"easing":"cubic_out","class":"DistancePanoramaCameraMovement","yawSpeed":7.96}]},{"class":"PanoramaCameraSequence","id":"sequence_27B31435_2CA9_5195_41B4_104EF0267E0B","movements":[{"yawDelta":18.5,"easing":"cubic_in","class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":323,"class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":18.5,"easing":"cubic_out","class":"DistancePanoramaCameraMovement","yawSpeed":7.96}]},{"class":"PanoramaCameraSequence","id":"sequence_3DFD1159_2CB9_539C_41C3_6C3C94E2FE6E","movements":[{"yawDelta":18.5,"easing":"cubic_in","class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":323,"class":"DistancePanoramaCameraMovement","yawSpeed":7.96},{"yawDelta":18.5,"easing":"cubic_out","class":"DistancePanoramaCameraMovement","yawSpeed":7.96}]}],"height":"100%","width":"100%","backgroundColorRatios":[0]};
if (script['data'] == undefined)
    script['data'] = {};
script['data']['translateObjs'] = translateObjs, script['data']['createQuizConfig'] = function () {
    var a = {};
    return this['get']('data')['translateObjs'] = translateObjs, a;
}, TDV['PlayerAPI']['defineScript'](script);
//# sourceMappingURL=script_device.js.map
})();
//Generated with v2025.2.10, Thu Feb 5 2026