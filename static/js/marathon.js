(function() {
  var $, API, API_PATH, ApkURL, AwardComb, AwardStatusComb, Bonus, Boo, CLICK, ClickTrace, Client, ClientType, Cookie, CurAwardType, DOC, Ele, Fn, HOST, HREF, IsAndroid, IsFormLowerAndroid, IsFromClient, IsFromOldClient, IsTouch, LOC, Pinner, Plat, Query, SEARCH, Storage, Swipe, SysVersion, UA, UI, UID, URL, User, UserInfo, WIN, Week, isJoined, isJustJoin, isPinnerClosed;

  WIN = window;

  DOC = document;

  LOC = location;

  HREF = LOC.href;

  HOST = LOC.host;

  SEARCH = LOC.search;

  UA = WIN.navigator.userAgent;

  Cookie = WIN['Cookie'];

  Storage = WIN['Storage'];

  URL = WIN['URL'];

  Swipe = WIN['Swipe'];

  ClickTrace = WIN['ClickTrace'];

  $ = WIN['Zepto'];

  IsTouch = 'ontouchstart' in WIN;

  IsAndroid = /Android|HTC/i.test(UA) || !!(WIN.navigator['platform'] + '').match(/Linux/i);

  CLICK = IsTouch ? 'touchstart' : 'mousedown';

  API_PATH = (HOST.match(/10.2/) ? '' : 'http://m.tv.sohu.com') + '/h5/avt/';

  ApkURL = 'http://upgrade.m.tv.sohu.com/channels/hdv/680/3.5/SohuTV_3.5_680_201311221739.apk?t=1';

  IsFromClient = false;

  IsFromOldClient = false;

  IsFormLowerAndroid = false;

  if (IsAndroid) {
    SysVersion = UA.match(/Android(?:[\/\s*]([0-9\._]+))?/i);
    SysVersion = SysVersion ? SysVersion[1].replace(/\./g, '') : 0;
    if (SysVersion < 240) {
      IsFormLowerAndroid = true;
    }
  }

  AwardComb = AwardStatusComb = "";

  Plat = 1;

  if (SEARCH) {
    Query = URL.getQueryData(SEARCH);
    if (Query.clientType) {
      ClientType = Query.clientType;
      if (-1 < ClientType.toLowerCase().indexOf('android')) {
        IsFromClient = true;
        Plat = 2;
      }
    }
    if (Query.uid) {
      UID = Query.uid;
    } else if (IsFromClient) {
      IsFromOldClient = true;
    }
  }

  if (!UID) {
    UID = Cookie.get('SUV') || '';
  }

  UserInfo = {};

  Week = (function() {
    var boo, date, day, month;
    date = new Date();
    day = date.getDate();
    month = date.getMonth();
    boo = 1;
    if (month === 10) {
      return boo;
    }
    if (day > 1) {
      boo = 2;
    }
    if (day > 8) {
      boo = 3;
    }
    if (day > 15) {
      boo = 4;
    }
    return boo;
  })();

  if (Query && Query.boo) {
    Week = Query.boo;
  }

  isJoined = false;

  isJustJoin = false;

  isJoined = !!Storage.get('marathon-joind');

  CurAwardType = 0;

  isPinnerClosed = false;

  if (!IsFromClient) {
    $('html').addClass('h5');
  }

  if (IsFormLowerAndroid) {
    $('html').addClass('lower-android');
  }

  if (IsFromOldClient) {
    $('html').addClass('old-client');
  }

  Fn = {
    shortCount: function(count) {
      count = parseInt(count);
      if (count >= 100000000) {
        count = Math.floor(count / 100000000) + '亿+';
      } else if (count >= 10000) {
        count = Math.floor(count / 10000) + '万+';
      }
      return count;
    }
  };

  API = {
    detail: "" + API_PATH + "detail",
    join: "" + API_PATH + "join",
    exists: "" + API_PATH + "exists",
    uids: "" + API_PATH + "uids",
    update: {
      status: "" + API_PATH + "update/status",
      address: "" + API_PATH + "update/address"
    }
  };

  Ele = {
    init: function() {
      return Ele = {
        body: $('body'),
        joinBtn: $('button.join'),
        award: $('.award'),
        awardBtns: $('.award button'),
        mask: $('.mask'),
        userInfo: $('.popup.user-info'),
        success: $('.popup.success'),
        userForm: $('.user-info form'),
        submit: $('.user-info .submit'),
        formInput: $('.user-info input'),
        boo: $('.boo'),
        tabli: $('.tabs li'),
        pinner: $('.pinner'),
        curBoo: '',
        curJoinBtn: '',
        recommend: $('.recommend')
      };
    }
  };

  UI = {
    mask: {
      show: function() {
        return Ele.mask.css('height', DOC.body.scrollHeight);
      },
      hide: function() {
        return Ele.mask.css('height', 0);
      }
    },
    userInfo: {
      show: function() {
        Ele.userInfo.show();
        return WIN.scrollTo(0, 0);
      },
      hide: function() {
        return Ele.userInfo.hide();
      }
    },
    success: {
      show: function() {
        return Ele.success.show();
      },
      hide: function() {
        return Ele.success.hide();
      }
    },
    cleanMaskAndPop: function() {
      UI.mask.hide();
      UI.userInfo.hide();
      UI.success.hide();
      return CurAwardType = 0;
    },
    pinner: {
      show: function() {
        var pinner;
        pinner = Ele.pinner;
        if (!pinner.hasClass('show')) {
          pinner.addClass('show');
        }
        if (IsFromOldClient) {
          return pinner.addClass('client');
        }
      },
      close: function() {
        return Ele.pinner.remove();
      }
    }
  };

  Boo = {
    init: function() {
      var index;
      index = Week - 1;
      Ele.curBoo = Ele.boo.eq(index);
      Ele.curJoinBtn = $('button.join', Ele.curBoo);
      Ele.curBoo.addClass('active current');
      Ele.tabli.eq(index).addClass('active');
      Ele.boo.each(function(i, boo) {
        var $boo, thisIndex, thisJoinBtn;
        $boo = $(boo);
        thisJoinBtn = $('button.join', boo);
        thisIndex = $boo.attr('boo') - 1;
        if (thisIndex < index) {
          thisJoinBtn.html('已经结束');
          $boo.addClass('before');
        }
        if (thisIndex > index) {
          thisJoinBtn.html('暂未开始');
          return $boo.addClass('after');
        }
      });
      if (IsFromOldClient) {
        return Ele.curJoinBtn.removeClass('active').html('请升级新版客户端');
      }
    },
    "switch": function() {
      var index;
      Ele.tabli.removeClass('active');
      Ele.boo.removeClass('active');
      index = $(this).addClass('active').index();
      return Ele.boo.eq(index).addClass('active');
    }
  };

  Pinner = {
    init: function() {
      var elClose, elDownload;
      if (!IsAndroid || (IsFromClient && !IsFromOldClient) || isPinnerClosed) {
        return UI.pinner.close();
      }
      elDownload = $('.app_download', Ele.pinner);
      elClose = $('em', Ele.pinner);
      isPinnerClosed = !!Storage.get('marathon-pinner');
      elDownload.attr('href', ApkURL);
      if (!isPinnerClosed) {
        UI.pinner.show();
      }
      elClose.on(CLICK, Pinner.onClose);
      elDownload.on(CLICK, Pinner.onDownload);
      if (!IsFromOldClient && IsFormLowerAndroid) {
        return Ele.pinner.on(CLICK, Pinner.onDownload);
      }
    },
    store: function() {
      return Storage.set("marathon-pinner", 1);
    },
    onClose: function() {
      UI.pinner.close();
      return Pinner.store();
    },
    onDownload: function(e) {
      if (e != null) {
        e.preventDefault();
      }
      if (e != null) {
        e.stopPropagation();
      }
      Pinner.store();
      setTimeout(function() {
        location.href = ApkURL;
        return ClickTrace.pingback(null, "appdownload_marathon", "");
      }, 50);
      return false;
    }
  };

  User = {
    init: function() {
      if (IsFromOldClient) {
        return User.unJoined();
      }
      if (isJoined === false) {
        return $.get(API.exists + ("?uid=" + UID + "&plat=" + Plat), function(res) {
          res = res - 0;
          if (res === 1) {
            return User.setJoin();
          } else {
            return User.unJoined();
          }
        });
      } else {
        return User.joined();
      }
    },
    joined: function() {
      Ele.curJoinBtn.html('您已参加').addClass('show').removeClass('active');
      Ele.body.addClass('joined');
      return User.count();
    },
    unJoined: function() {
      return Ele.curJoinBtn.addClass('active').html('立即参加');
    },
    setJoin: function() {
      Storage.set('marathon-joind', 1);
      isJoined = true;
      return User.joined();
    },
    onJoin: function(e) {
      if (IsFromOldClient) {
        return UI.pinner.show();
      }
      if (isJoined === false) {
        Ele.curJoinBtn.html('正在参加...');
        return $.post(API.join, {
          plat: Plat,
          h5: 1,
          app: 2,
          uid: UID
        }, function(res) {
          res = res - 0;
          if (res === 1) {
            isJustJoin = true;
            return User.setJoin();
          } else if (res === 0) {
            return Ele.curJoinBtn.html('参加失败T_T');
          } else {
            return Ele.curJoinBtn.html('已经参加');
          }
        });
      } else {
        return false;
      }
    },
    onGetAward: function() {
      var $this;
      $this = $(this);
      if (!$this.hasClass('active')) {
        return 0;
      }
      User.fillInfo();
      UI.userInfo.show();
      CurAwardType = $this.prev('.img').attr('type') - 0;
      if (AwardComb.indexOf(CurAwardType + ",") < 0 || AwardStatusComb.indexOf(CurAwardType + ",") > -1) {
        return CurAwardType = -1;
      }
    },
    onInput: function() {
      return Ele.submit.val('我要提交');
    },
    onGetAwardSuccess: function() {
      var cls, hideSucs;
      cls = '';
      hideSucs = function() {
        Ele.success.hide().removeClass(cls);
        return UI.mask.hide();
      };
      cls = CurAwardType === 1 ? 'short' : cls = 'long';
      return $.post(API.update.status, {
        plat: Plat,
        h5: 1,
        app: 2,
        uid: UID,
        type: Week,
        award_type: CurAwardType
      }, function(res) {
        if (res - 0 === 0) {
          return setTimeout(User.onGetAwardSuccess, 300);
        } else {
          Ele.success.addClass(cls).show();
          UI.userInfo.hide();
          Ele.submit.val('我要提交');
          AwardStatusComb += "" + CurAwardType + ",";
          Ele.awardBtns.each(function(i, el) {
            var $el;
            $el = $(el);
            if ($el.prev('.img').attr('type') - 0 === CurAwardType) {
              return $el.html('已经领奖').removeClass('active').off(CLICK, User.onGetAward);
            }
          });
          return setTimeout(hideSucs, 2000);
        }
      });
    },
    onGetAwardFail: function() {
      return Ele.submit.val('提交失败T_T');
    },
    onSubmitForm: function(e) {
      var address, elForm, email, formData, formSerialized, isCorrect, name, phone, postcode;
      if (e != null) {
        e.preventDefault();
      }
      if (CurAwardType < 1 || CurAwardType > 9) {
        return false;
      }
      isCorrect = true;
      elForm = Ele.userForm;
      formSerialized = elForm.serialize();
      formData = URL.getQueryData(formSerialized);
      name = formData.name;
      phone = formData.phone;
      email = formData.email;
      address = formData.address;
      postcode = formData.postcode;
      $('input', elForm).each(function(i, node) {
        var val;
        val = $(node).val() || '';
        if (!val) {
          isCorrect = false;
          Ele.submit.val('请您填写完整');
        }
        if (val.indexOf('<') > -1 || val.indexOf('>') > -1 || val.indexOf('%') > -1 || val.indexOf('\\') > -1 || val.indexOf('/') > -1) {
          isCorrect = false;
          return Ele.submit.val('请正确填写');
        }
      });
      if (phone && !(/^1[3|4|5|8][0-9]\d{4,8}$/.test(phone))) {
        Ele.submit.val('请正确填写手机号');
        isCorrect = false;
      }
      if (email && !(/\w@\w*\.\w/.test(email))) {
        Ele.submit.val('请正确填写邮箱');
        isCorrect = false;
      }
      if (postcode && !(/^[0-9]{6}$/.test(postcode))) {
        Ele.submit.val('请正确填写邮编');
        isCorrect = false;
      }
      if (isCorrect === true) {
        Ele.submit.val('正在提交...');
        $.post(API.update.address, "" + formSerialized + "&plat=" + Plat + "&h5=1&app=2&uid=" + UID, function(res) {
          if (res - 0 === 1) {
            return User.onGetAwardSuccess();
          } else {
            return User.onGetAwardFail();
          }
        });
      }
      return false;
    },
    count: function() {
      /*
      		数据取得之后的回调
      */

      var onSuccess, res;
      onSuccess = function(res) {
        var boo, step, _i;
        step = function(boo) {
          var apiIndex, elAward, elAwardBtns, elAwardBtnsFirst, elAwardBtnsLast, elBoo, order, totalOrder, totalVv, vv;
          apiIndex = boo + 1;
          elAward = Ele.award.eq(boo);
          elBoo = elAward.parent('.boo');
          elAwardBtns = $('button', elAward).addClass('active');
          elAwardBtnsFirst = elAwardBtns.first();
          elAwardBtnsLast = elAwardBtns.last();
          vv = res['vv' + apiIndex];
          order = res['order' + apiIndex];
          totalVv = res.total_vv;
          totalOrder = res.total_order;
          if (res.isdel === 1) {
            order = totalOrder = 10001;
          }
          if (boo + 1 < Week) {
            elAwardBtns.each(function(i, el) {
              if (i !== 0 && i !== (elAwardBtns.length - 1)) {
                return $(el).removeClass('active').html("已经结束");
              }
            });
          } else {
            if (order) {
              elAwardBtns.html("周排名" + (Fn.shortCount(order)) + "位");
            } else {
              elAwardBtns.removeClass('active').html("没有排名");
            }
          }
          if (totalVv < 100) {
            elAwardBtnsFirst.addClass('active').html("已观看" + totalVv + "次");
          } else if (AwardStatusComb.indexOf("1,") > -1) {
            elAwardBtnsFirst.html('已经领奖').removeClass('active');
          } else {
            elAwardBtnsFirst.addClass('can-award active').html("立即领奖");
            AwardComb += '1,';
          }
          if (totalOrder) {
            return elAwardBtnsLast.addClass('active').html("总排名" + (Fn.shortCount(totalOrder)) + "位");
          } else {
            return elAwardBtnsLast.removeClass('active').html("没有排名");
          }
        };
        for (boo = _i = 0; 0 <= Week ? _i < Week : _i > Week; boo = 0 <= Week ? ++_i : --_i) {
          step(boo);
        }
        User.award();
        return User.dataComplt();
      };
      if (isJustJoin) {
        res = {
          award: "",
          order1: 0,
          order2: 0,
          order3: 0,
          order4: 0,
          award_status: "",
          total_award: 0,
          total_order: 0,
          total_status: 0,
          total_vv: 0,
          vv1: 0,
          vv2: 0,
          vv3: 0,
          vv4: 0
        };
        return onSuccess(res);
      } else {
        return $.getJSON(API.detail + ("?plat=" + Plat + "&h5=1&app=2&uid=" + UID), function(res) {
          if (res && res.award !== void 0) {
            AwardComb = res.award + ",";
            AwardStatusComb = res.award_status + ",";
            UserInfo = res;
          } else {
            return User.count();
          }
          return onSuccess(res);
        });
      }
    },
    award: function() {
      Ele.awardBtns.each(function(i, el) {
        var $this, awardType;
        $this = $(this);
        awardType = $this.prev('.img').attr('type') - 0;
        if (AwardComb.indexOf(awardType + ",") > -1 && awardType !== 1) {
          if (AwardStatusComb.indexOf(awardType + ",") < 0) {
            return $this.html('立即领奖').addClass('can-award active');
          } else {
            return $this.html('已经领奖').removeClass('active');
          }
        }
      });
      return $('.can-award').on(CLICK, User.onGetAward);
    },
    fillInfo: function() {
      var elForm;
      elForm = Ele.userForm;
      return $('input', elForm).each(function(i, el) {
        var $el, name;
        $el = $(el);
        name = $el.attr('name');
        if (name) {
          return $el.val(UserInfo[name] || '');
        }
      });
    },
    dataComplt: function() {
      return Ele.body.addClass('data-complete');
    }
  };

  Client = {
    protocol: "sva://",
    init: function() {
      if (!IsFromClient) {
        return false;
      }
      $('a.box', Ele.recommend).each(function(i, el) {
        return Client.URLTrans($(el));
      });
      return $('.hd a', Ele.recommend).remove();
    },
    URLTrans: function(el) {
      var actionId, args, catecode, cid, href, sid, urls, vid;
      href = el.attr('href');
      /*
      		客户端协议
      		vid,cid,catecode,sid写全，如果一个为空会引起部分手机客户端崩溃
      */

      actionId = 1.1;
      vid = el.attr('vid') || "";
      cid = el.attr('cid') || "";
      catecode = el.attr('cateCode') || el.attr('catecode') || "";
      sid = el.attr('sid') || "";
      urls = HREF;
      args = "action=" + actionId + "&vid=" + vid + "&cid=" + cid + "&catecode=" + catecode + "&sid=" + sid + "&urls=" + urls;
      return el.attr('href', Client.protocol + 'action.cmd?' + args.replace(/index\.html%2C/, 'index.html,'));
    }
  };

  Bonus = function() {
    var stack;
    stack = 0;
    return $('.footer').on(CLICK, function() {
      stack++;
      if (stack % 5 === 0) {
        alert(UID);
      }
      if (stack % 8 === 0) {
        return alert(HREF);
      }
    });
  };

  $(function() {
    Ele.init();
    Boo.init();
    User.init();
    Pinner.init();
    Client.init();
    Ele.tabli.on(CLICK, Boo["switch"]);
    Ele.curJoinBtn.on(CLICK, User.onJoin);
    Ele.mask.on(CLICK, UI.cleanMaskAndPop);
    Ele.submit.on(CLICK, User.onSubmitForm);
    Ele.formInput.on('focus', User.onInput);
    return Bonus();
  });

}).call(this);
