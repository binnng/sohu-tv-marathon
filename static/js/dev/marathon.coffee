WIN = window
DOC = document
LOC = location
HREF = LOC.href
HOST = LOC.host
SEARCH = LOC.search

UA = WIN.navigator.userAgent

Cookie = WIN['Cookie']
Storage = WIN['Storage']
URL = WIN['URL']
Swipe = WIN['Swipe']
ClickTrace = WIN['ClickTrace']
$ = WIN['Zepto']

IsTouch = 'ontouchstart' of WIN
IsAndroid = /Android|HTC/i.test(UA) or !!(WIN.navigator['platform'] + '').match(/Linux/i)

CLICK = if IsTouch then 'touchstart' else 'mousedown'

API_PATH = (if HOST.match(/10.2/) then '' else 'http://m.tv.sohu.com') + '/h5/avt/'

#客户端缓存会出错
#API_PATH = "http://#{HOST}/h5/avt/"

ApkURL = 'http://upgrade.m.tv.sohu.com/channels/hdv/680/3.5/SohuTV_3.5_680_201311221739.apk?t=1'

IsFromClient = no

IsFromOldClient = no

#是否是低版本安卓(<2.3.4)
IsFormLowerAndroid = no


if IsAndroid
	SysVersion = UA.match(/Android(?:[\/\s*]([0-9\._]+))?/i)

	SysVersion = if SysVersion then SysVersion[1].replace(/\./g, '') else 0

	IsFormLowerAndroid = yes if SysVersion < 240


#”1,2,3,4,“，多一个逗号的字符串
AwardComb = AwardStatusComb = ""

Plat = 1


if SEARCH
	Query = URL.getQueryData SEARCH

	if Query.clientType
		ClientType = Query.clientType
		if -1 < ClientType.toLowerCase().indexOf 'android'
			IsFromClient = yes
			Plat = 2

	if Query.uid
		UID = Query.uid
	else if IsFromClient
		IsFromOldClient = yes

UID = Cookie.get('SUV') or '' unless UID

UserInfo = {}

##第几周，第几波
Week = (() ->
		date = new Date()
		day = date.getDate()
		month = date.getMonth()
		boo = 1

		return boo if month is 10

		boo = 2 if day > 1
		boo = 3 if day > 8
		boo = 4 if day > 15

		boo
	)()

##测试，四波全部打开
#Week = 4

Week = Query.boo if Query and Query.boo

isJoined = no

#是不是刚刚参与
isJustJoin = no




##本地是不是存储了参加信息，客户端内嵌这句会报错
isJoined = !!Storage.get 'marathon-joind'

#正在领奖的编号
CurAwardType = 0

isPinnerClosed = no

$('html').addClass 'h5' unless IsFromClient

#如果是低版本安卓系统
$('html').addClass 'lower-android' if IsFormLowerAndroid

#老版本客户端
$('html').addClass 'old-client' if IsFromOldClient

Fn =
	shortCount: (count) ->
		count = parseInt(count)

		if count >= 100000000
			count = Math.floor(count / 100000000)  + '亿+'
		else if count >= 10000
			count = Math.floor(count / 10000)  + '万+'

		count


API = 
	detail: "#{API_PATH}detail"
	join: "#{API_PATH}join"
	exists: "#{API_PATH}exists"
	uids: "#{API_PATH}uids"
	update:
		status: "#{API_PATH}update/status"
		address: "#{API_PATH}update/address"

Ele = 
	init: () ->
		Ele =
			body: $('body')
			joinBtn: $('button.join')
			#joinBtn: $('button.join').eq(Week - 1)
			award: $('.award')
			awardBtns: $('.award button')
			mask: $('.mask')
			userInfo: $('.popup.user-info')
			success: $('.popup.success')
			userForm: $('.user-info form')
			submit: $('.user-info .submit')
			formInput: $('.user-info input')
			boo: $('.boo')
			tabli: $('.tabs li')
			pinner: $('.pinner')
			curBoo: ''
			curJoinBtn: ''
			recommend: $('.recommend')

UI = 
	#遮罩
	mask: 
		show: () -> Ele.mask.css('height', DOC.body.scrollHeight);
		hide: () -> Ele.mask.css('height', 0);

	#用户信息弹框
	userInfo:
		show: () -> 
			Ele.userInfo.show()
			#UI.mask.show()
			WIN.scrollTo(0, 0)
		hide: () -> Ele.userInfo.hide()

	#提交信息成功显示
	success:
		show: () -> Ele.success.show()
		hide: () -> Ele.success.hide()

	#清除遮罩和弹窗
	cleanMaskAndPop: () ->
		UI.mask.hide()
		UI.userInfo.hide();
		UI.success.hide();

		CurAwardType = 0

	pinner: 
		show: () ->

			pinner = Ele.pinner
			pinner.addClass 'show' unless pinner.hasClass 'show'
			if IsFromOldClient
				pinner.addClass 'client'

			# if IsFormLowerAndroid
			# 	UI.mask.show()


		close: () -> Ele.pinner.remove()

Boo = 
	init: () ->
		index = Week - 1

		Ele.curBoo = Ele.boo.eq(index)
		Ele.curJoinBtn = $('button.join', Ele.curBoo)

		Ele.curBoo.addClass 'active current'

		Ele.tabli.eq(index).addClass 'active'

		Ele.boo.each (i, boo) ->

			$boo = $ boo
			thisJoinBtn = $ 'button.join', boo
			thisIndex = $boo.attr('boo') - 1

			if thisIndex < index
				thisJoinBtn.html '已经结束' 
				$boo.addClass 'before'

			if thisIndex > index
				thisJoinBtn.html '暂未开始'
				$boo.addClass 'after'

		Ele.curJoinBtn.removeClass('active').html('请升级新版客户端') if IsFromOldClient

	switch: () ->
		Ele.tabli.removeClass('active')
		Ele.boo.removeClass 'active'
		index = $(this).addClass('active').index()
		Ele.boo.eq(index).addClass 'active'

Pinner = 
	init: () ->

		return UI.pinner.close() if !IsAndroid or (IsFromClient and !IsFromOldClient) or isPinnerClosed

		#debug
		# $('html').addClass 'from-old-android-pinner'
		# UI.pinner.show()
 

		elDownload = $('.app_download', Ele.pinner)
		elClose = $('em', Ele.pinner)

		isPinnerClosed = !!Storage.get 'marathon-pinner'

		elDownload.attr 'href', ApkURL

		UI.pinner.show() unless isPinnerClosed

		elClose.on CLICK, Pinner.onClose
		elDownload.on CLICK, Pinner.onDownload

		if !IsFromOldClient and IsFormLowerAndroid
			Ele.pinner.on CLICK, Pinner.onDownload


	store: () ->
		Storage.set "marathon-pinner", 1 

	onClose: () ->
		UI.pinner.close()
		Pinner.store()

	onDownload: (e) ->
		e?.preventDefault()
		e?.stopPropagation()
		Pinner.store()
		setTimeout () -> 
			location.href = ApkURL
			ClickTrace.pingback(null, "appdownload_marathon", "")
		, 50
		return no



User = 
	init: () ->

		return User.unJoined() if IsFromOldClient

		#return alert 'UID为空，需要访问一次m.tv.sohu.com' unless UID

		if isJoined is no

			$.get API.exists + "?uid=#{UID}&plat=#{Plat}", (res) ->
				res = res - 0
				if res is 1
					User.setJoin()
				else
					User.unJoined()

		else
			User.joined()

	##已经参加的显示
	joined: () ->
		Ele.curJoinBtn.html('您已参加').addClass('show').removeClass('active')
		Ele.body.addClass 'joined'
		User.count()

	##没有参加
	unJoined: () ->
		Ele.curJoinBtn.addClass('active').html('立即参加')

	##设置已经参加
	setJoin: () ->
		Storage.set 'marathon-joind', 1
		isJoined = true
		User.joined()

	##参加
	onJoin: (e) ->

		if IsFromOldClient
			return UI.pinner.show()

		if isJoined is no
			Ele.curJoinBtn.html('正在参加...')
			$.post API.join, {
					plat: Plat
					h5: 1
					app: 2
					uid: UID
				}, (res) ->
						res = res - 0
						if res is 1
							isJustJoin = yes
							User.setJoin()
						else if res is 0
							Ele.curJoinBtn.html('参加失败T_T')
						else
							Ele.curJoinBtn.html('已经参加')
		else
			no
		
	##领奖
	onGetAward: () ->

		$this = $ @

		return 0 unless $this.hasClass 'active'

		User.fillInfo()

		#UI.mask.show()
		UI.userInfo.show()

		CurAwardType = $this.prev('.img').attr('type') - 0

		# 验证获奖和领奖状态
		CurAwardType = -1 if AwardComb.indexOf(CurAwardType + ",") < 0 or AwardStatusComb.indexOf(CurAwardType + ",") > -1

	#正在输入
	onInput: () ->
		Ele.submit.val '我要提交'


	#领奖成功
	onGetAwardSuccess: () ->

		cls = ''
		hideSucs = () ->
			Ele.success.hide().removeClass(cls)
			UI.mask.hide()

		cls = if CurAwardType is 1 then 'short' else cls = 'long'

		$.post API.update.status,  {
				plat: Plat
				h5: 1
				app: 2
				uid: UID
				type: Week,
				award_type: CurAwardType
			}, (res) ->
					if res - 0 is 0
						setTimeout User.onGetAwardSuccess, 300
					#成功
					else
						Ele.success.addClass(cls).show()
						UI.userInfo.hide();
						Ele.submit.val '我要提交'

						AwardStatusComb += "#{CurAwardType},"

						#置为已经领奖状态，并解绑事件，遍历
						Ele.awardBtns.each (i, el) ->
							$el = $ el
							if $el.prev('.img').attr('type') - 0 is CurAwardType
								$el.html('已经领奖').removeClass('active').off(CLICK, User.onGetAward)

						setTimeout hideSucs, 2000

	#领奖失败，提交个人信息失败
	onGetAwardFail: () ->
		Ele.submit.val '提交失败T_T'


	#提交个人信息
	onSubmitForm: (e) ->
		
		e?.preventDefault()

		return no if CurAwardType < 1 or CurAwardType > 9

		isCorrect = yes

		elForm = Ele.userForm
		formSerialized = elForm.serialize()
		formData = URL.getQueryData formSerialized

		name = formData.name
		phone = formData.phone
		email = formData.email
		address = formData.address
		postcode = formData.postcode

		$('input', elForm).each (i, node) ->
			val = $(node).val() or ''
			if !val
				isCorrect = no
				Ele.submit.val '请您填写完整'
			if val.indexOf('<') > -1 or val.indexOf('>') > -1 or val.indexOf('%') > -1 or val.indexOf('\\') > -1 or val.indexOf('/') > -1
				isCorrect = no
				Ele.submit.val '请正确填写'

		if phone and !(/^1[3|4|5|8][0-9]\d{4,8}$/.test(phone))
			Ele.submit.val '请正确填写手机号'
			isCorrect = no

		if email and !(/\w@\w*\.\w/.test(email)) #/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
			Ele.submit.val '请正确填写邮箱'
			isCorrect = no

		if postcode and !(/^[0-9]{6}$/.test(postcode))
			Ele.submit.val '请正确填写邮编'
			isCorrect = no

		if isCorrect is yes
			Ele.submit.val '正在提交...'
			$.post API.update.address, "#{formSerialized}&plat=#{Plat}&h5=1&app=2&uid=#{UID}", (res) ->
				if res - 0 is 1
					User.onGetAwardSuccess()
				else 
					User.onGetAwardFail()

		no

	
	## 观看次数
	count: () ->

		###
		数据取得之后的回调
		###
		onSuccess = (res) ->
			step = (boo) ->

				apiIndex = boo + 1
				elAward = Ele.award.eq(boo)
				elBoo = elAward.parent '.boo'
				elAwardBtns = $('button', elAward).addClass 'active'

				#两个全程的奖品
				elAwardBtnsFirst = elAwardBtns.first()
				elAwardBtnsLast = elAwardBtns.last()

				vv = res['vv' + apiIndex]
				order = res['order' + apiIndex] #周排名
				totalVv = res.total_vv
				totalOrder = res.total_order

				order = totalOrder = 10001 if res.isdel is 1

				# if Week - 5 is 0
				# 	vv = totalVv
				# 	order = totalOrder

				#已经结束的波数显示已经结束
				if boo + 1 < Week
					#除去全程的奖品，首位和末位
					elAwardBtns.each (i, el) ->
						$(el).removeClass('active').html "已经结束" if i isnt 0 and i isnt (elAwardBtns.length - 1)
				else
					if order
						elAwardBtns.html "周排名#{Fn.shortCount order}位"
					else
						elAwardBtns.removeClass('active').html "没有排名"



				#VIP卡设奖
				if totalVv < 100
					elAwardBtnsFirst.addClass('active').html "已观看#{totalVv}次"

				#已经领完VIP卡不能再领
				else if AwardStatusComb.indexOf("1,") > -1
					elAwardBtnsFirst.html('已经领奖').removeClass 'active'

				#还没领奖
				else
					elAwardBtnsFirst.addClass('can-award active').html "立即领奖"
					#获奖信息存进去
					AwardComb += '1,'


				#总排名，全程
				if totalOrder
					elAwardBtnsLast.addClass('active').html "总排名#{Fn.shortCount totalOrder}位"
				else
					elAwardBtnsLast.removeClass('active').html "没有排名"



			step boo for boo in [0...Week]

			User.award()

			User.dataComplt()

		#刚刚参加，不调用detail接口，模拟数据
		if isJustJoin
			res = 
				award: ""
				order1: 0
				order2: 0
				order3: 0
				order4: 0
				award_status: ""
				total_award: 0
				total_order: 0
				total_status: 0
				total_vv: 0
				vv1: 0
				vv2: 0
				vv3: 0
				vv4: 0
			onSuccess(res)
		else
			$.getJSON API.detail + "?plat=#{Plat}&h5=1&app=2&uid=#{UID}", (res) ->

				# 设置获奖领奖信息
				if res and res.award isnt undefined
					AwardComb = res.award + ","
					AwardStatusComb = res.award_status + ","

					UserInfo = res
				#接口没有返回
				else
					return User.count()

				onSuccess(res)

			

	award: () ->

		Ele.awardBtns.each (i, el) ->
			$this = $ @
			awardType = $this.prev('.img').attr('type') - 0

			#第一个奖品不通过接口判断领奖
			if AwardComb.indexOf(awardType + ",") > -1 and awardType isnt 1
				if AwardStatusComb.indexOf(awardType + ",") < 0
					$this.html('立即领奖').addClass('can-award active')
				else
					$this.html('已经领奖').removeClass 'active'

		$('.can-award').on CLICK, User.onGetAward

	fillInfo: () ->
		elForm = Ele.userForm

		$('input', elForm).each (i, el) ->
			$el = $(el)
			name = $el.attr 'name'

			$el.val(UserInfo[name] || '') if name

	dataComplt: () ->
		Ele.body.addClass 'data-complete'

Client = 
	protocol: "sva://"

	init: () ->
		return no unless IsFromClient

		$('a.box', Ele.recommend).each (i, el) ->
			Client.URLTrans($(el))

		$('.hd a', Ele.recommend).remove()


	URLTrans: (el) ->
		href = el.attr 'href'

		###
		客户端协议
		vid,cid,catecode,sid写全，如果一个为空会引起部分手机客户端崩溃
		###

		actionId = 1.1
		vid = el.attr('vid') or ""
		cid = el.attr('cid') or ""
		catecode = el.attr('cateCode') || el.attr('catecode') || ""
		sid = el.attr('sid') || ""
		urls = HREF

		args = "action=#{actionId}&vid=#{vid}&cid=#{cid}&catecode=#{catecode}&sid=#{sid}&urls=#{urls}"
		el.attr 'href', Client.protocol + 'action.cmd?' + args.replace(/index\.html%2C/, 'index.html,')


Bonus = () ->

	stack = 0

	$('.footer').on CLICK, () ->
		stack++
		alert UID if stack % 5 is 0
		alert HREF if stack % 8 is 0

	# elScroller.on MOVE_EVENT, (e) ->
	# 	startx = $(this).attr 'startx' if startx < 0

	# elScroller.on END_EVENT, (e) ->
	# 	endx = $(this).attr 'startx' if endx < 0

	# 	if endx is startx
	# 		stack++

	# 		console.log stack

		



$( () ->

	Ele.init()

	Boo.init()

	User.init()

	Pinner.init()

	Client.init()

	Ele.tabli.on CLICK, Boo.switch

	Ele.curJoinBtn.on CLICK, User.onJoin

	Ele.mask.on CLICK, UI.cleanMaskAndPop
		
	Ele.submit.on CLICK, User.onSubmitForm

	Ele.formInput.on 'focus', User.onInput

	Bonus()
)



