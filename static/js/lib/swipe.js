var Swipe = function () {

  /* 保存常用DOM的全局变量（变量名可以被压缩） */
  var DOC = document,
    WIN = window,
    IsTouch = 'ontouchstart' in WIN,

    UA = WIN.navigator.userAgent,

    $ = WIN.Zepto,

    IsAndroid = (/Android|HTC/i.test(UA) || !!(WIN.navigator['platform'] + '').match(/Linux/i)), /* HTC Flyer平板的UA字符串中不包含Android关键词 */

    /* 设备屏幕象素密度 */
    PixelRatio = parseFloat(WIN.devicePixelRatio) || 1,

    /* 如果手指在屏幕上按下后再继续移动的偏移超过这个值，则取消touchend中click事件的触发，Android和iOS下的值不同 */
    MAX_TOUCHMOVE_DISTANCE_FOR_CLICK = IsAndroid ? 10 : 6,

    START_EVENT = IsTouch ? 'touchstart' : 'mousedown',
    MOVE_EVENT = IsTouch ? 'touchmove' : 'mousemove',
    END_EVENT = IsTouch ? 'touchend' : 'mouseup',

    Event = function(e) {
      if (e instanceof Event) {
        return e;
      }
      var changedTouches = e.changedTouches || ( e.originalEvent && e.originalEvent.changedTouches );

      this.event = e;
      this.originalEvent = (changedTouches && changedTouches.length > 0) ? changedTouches[0] : e;

      this.target = e.target || e.srcElement;
      this.type = e.type;
      return this;
    },

    ScreenSizeCorrect = function() {
      var ScreenSizeCorrect = 1;
      
      /* Android下window.screen的尺寸可能是物理尺寸，和窗口尺寸不同，用ScreenSizeCorrect转化一下 */
      if (IsAndroid) {
        if ((WIN['screen']['width'] / WIN['innerWidth']).toFixed(2) == PixelRatio.toFixed(2)) {
          ScreenSizeCorrect = 1 / PixelRatio;
        }
      }

      return ScreenSizeCorrect;
    }(),

    /**
     * 滑动手势
     * @class Swipe
     * @requires xn.mobile.lib.base.js
     * @author qiang.hu
     */

    Swipe = {

    /**
     * 手指开始移动前滑动对象的相对位置（相对于原始位置） 
     */
    startX: 0,

    /**
     * 手指开始移动时在屏幕上的位置
     */
    startPoint: [0, 0],
    
    /**
     * 手指移动过程中滑动对象当前的相对位置（相对于原始位置）
     */
    lastX: 0,

    /**
     * 滑动的页码标记
     */ 
    page: 1,
    
    /**
     * 滑动容器的总页数
     */ 
    pageCount: 1,


    /**
     * 滑动容器的宽度
     */ 
    scrollerWidth: 0,

    /**
     * 窗口的innerWidth，用来缓存
     */ 
    windowWidth:0,

    initiated: false,

    events: {
      onTouchStart: START_EVENT,
      onTouchMove: MOVE_EVENT,
      onTouchEnd: END_EVENT
    },

    init: function() {

      Swipe.initScroller();

      $(DOC)
        .on(Swipe.events.onTouchEnd, Swipe.onTouchEnd)
        .on(Swipe.events.onTouchMove, Swipe.onTouchMove)
        .on('touchcancel', Swipe.onTouchCancel)
        .on('click', Swipe.onTouchCancel);
    },

    initScroller: function(elWrap) {
      elWrap = elWrap || DOC;
      $('.scroll_wrap', elWrap).css({
          '-webkit-backface-visibility': 'hidden',
          'overflowX': 'hidden',
          '-webkit-transform': 'translate3d(0,0,0)'
        });

      $('.scroller', elWrap).css({
          '-webkit-backface-visibility': 'hidden',
          '-webkit-transform': 'translate3d(0,0,0)',
          '-webkit-transition': '-webkit-transform 0'
        }).on(Swipe.events.onTouchStart, Swipe.onTouchStart);
    },

    /**
     * 滚动使传入的el在窗口中可见
     */ 
    scrollToElement: function(el, animation) {
      var 
        elScroller = el.parent(),
        elScrollerTag = elScroller.get(0),
        paddingLeft = elScrollerTag.offsetLeft, 
        paddingRight = elScrollerTag.offsetLeft, /* TODO: */
        toX = -(el.offset().left - paddingLeft),
        lastCell = elScrollerTag['lastElementChild'],
        scrollerWidth = lastCell.offsetLeft + lastCell.offsetWidth + paddingLeft + paddingRight,
        windowWidth = elScroller.parent().width(),
        maxX = scrollerWidth - windowWidth;

      /* 如果滚动区域的子条目已经完全显示在屏幕上则不需要滚动 */
      if (-toX < windowWidth && (-toX + el.width()) <  windowWidth) {
        return;
      }

      if (toX < -maxX) {
        toX = -maxX;
      }

      if (toX > 0) {
        toX = 0;
      } else 
      
      elScroller.attr('startX', toX)
        .css({
          '-webkit-transform': 'translate3d(' + toX + 'px,0,0)',
          '-webkit-transition-duration': (animation ? '200ms' : 0)
        });
    },

    onTouchStart: function(e) {
      var elTag = this,
        el = $(this),
        cellCount = elTag['childElementCount'];

      if (cellCount > 0) {

        /* 计算滚动容器的宽度 */
        Swipe.scrollerWidth = 0;
        Swipe.leftPadding = elTag.offsetLeft;
        Swipe.rightPadding = elTag.offsetLeft; /* TODO: */

        var lastCell = elTag['lastElementChild'];

        if (lastCell) {
          Swipe.scrollerWidth = lastCell.offsetLeft + lastCell.offsetWidth + Swipe.leftPadding+ Swipe.rightPadding;
        }
        /* 如果内容区域小于滚动区域尺寸，则不滚动 */

        if (Swipe.scrollerWidth <= elTag.parentNode.offsetWidth) {
          return;
        }

        Swipe.touchElement = el;
        Swipe.initiated = true;
        
        el.css('-webkit-transition-duration', '0');
        
        /* 手指开始移动前滑动对象的相对位置（相对于原始位置） */ 
        Swipe.startX = parseInt(el.attr('startX') || 0, 10);
        /* 分页滚动的边界对象 */
        Swipe.paginationElLeft = null;
        Swipe.paginationElRight = null;

        Swipe.windowWidth = el.parent().width();
        
        /* 找出第一个没有完全显示在屏幕上的对象，作为分页滚动的边界对象 */
        var elCell = elTag['firstElementChild'];
        do {
          var offsetLeft = $(elCell).get(0).offsetLeft;

          if (!Swipe.paginationElLeft && (offsetLeft + Swipe.startX >= 0)) {
            Swipe.paginationElLeft = elCell;
          }

          if (offsetLeft + elCell.offsetWidth + Swipe.startX > Swipe.windowWidth) {
            Swipe.paginationElRight = elCell;
            break;
          }
        } while (elCell = elCell.nextElementSibling);

        /* 滚动区域没有超出边界的滑动距离  */
        Swipe.deltaXInsetBound = 0;

        var event = (new Event(e)).originalEvent;

        Swipe.startPoint = [event.screenX * ScreenSizeCorrect, event.screenY * ScreenSizeCorrect];
      }
    },

    onTouchMove: function(e) {
      if (false === Swipe.initiated) return;
      
      var event = (new Event(e)).originalEvent;

        /* 手指移动过程中滑动对象当前的相对位置（相对于原始位置） */
        deltaX = event.screenX * ScreenSizeCorrect - Swipe.startPoint[0],
        deltaY = event.screenY * ScreenSizeCorrect - Swipe.startPoint[1];

      /* 当滑动到左右边界的时候做滑动距离的衰减 */

      if (deltaX > 0 && Swipe.startX >= 0 ) {
        /* 向右滑动 */
        Swipe.lastX = Swipe.startX + deltaX / 2;
      } else if (deltaX < 0 && (-Swipe.startX - deltaX >= Swipe.scrollerWidth - Swipe.windowWidth)) {
        /* 向左滑动越过右边界 */
        Swipe.lastX = -(Swipe.scrollerWidth - Swipe.windowWidth) + (deltaX - Swipe.deltaXInsetBound) / 2;
      } else {
        /* 在滑动中间部分，距离无衰减 */
        Swipe.lastX = Swipe.startX + deltaX;
        Swipe.deltaXInsetBound = deltaX;
      }
    
      if (!Swipe.isSwiping) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          Swipe.initiated = false;
          return;
        }
      }

      e.preventDefault();
      Swipe.isSwiping = true;
      Swipe.setPos(Swipe.lastX);
    },
    
    onTouchEnd: function(e) {
      if (Swipe.isSwiping) {

        var  toX = 0;
          
        if (Swipe.lastX < Swipe.startX) {
          /* 向左滑动*/
          if (Swipe.paginationElRight) {
            toX = Swipe.paginationElRight.offsetLeft * -1;
            Swipe.page++;
          } else {
            toX = Swipe.paginationElLeft.offsetLeft * -1;
          }

          var maxX = Swipe.scrollerWidth - Swipe.windowWidth;
          if (toX < -maxX) {
            toX = -maxX;
          }

        } else if (Swipe.lastX > Swipe.startX) {
          /* 向右滑动*/
          if (Swipe.paginationElLeft) {
            var elCell = Swipe.paginationElLeft,
              maxOffsetX = Swipe.windowWidth - elCell.offsetWidth - elCell.offsetLeft;
            
            /* 计算滑动距离，使滑动后的位置，让左边的分页边界对象位于右边的不超过窗口的区域 */
            do {
              toX = elCell.offsetLeft * -1;
              if ( toX > maxOffsetX) {
                Swipe.page--;
                break;
              }
            } while (elCell = elCell.previousElementSibling)
          }
        }
        
        if (toX > 0) {
          toX = 0;
        }
        
        Swipe.touchElement.attr('startX', toX);
        Swipe.touchElement.css('-webkit-transition-duration', '200ms');
        Swipe.setPos(toX);

        e.preventDefault();

        /* 清除工作 */
        Swipe.onTouchCancel();
      }
    },

    onTouchCancel: function() {
      Swipe.isSwiping = false;
      Swipe.initiated = false;
      Swipe.touchElement = null;
    },
    
    /*
     * 设置滑动位置
     */
    setPos: function(x) {
      Swipe.touchElement.css('-webkit-transform', 'translate3d(' + x + 'px,0,0)');
    } 

  };

  $().ready(function() {
    Swipe.init();

    
  });

  /* 在web浏览器中拖动链接或图片的时候不会中断 */
  if (!IsTouch) {
    $('.scroller').on('mousedown', function(e) {

      e = new Event(e);
      elCur = e.target;

      while(elCur) {
        nodeName = elCur.nodeName;
        if ('A' == nodeName || 'IMG' == nodeName) {
          e.preventDefault();
          break;
        }
        elCur = elCur.parentNode;
      }

    }, false);
  }

  return Swipe;

}();