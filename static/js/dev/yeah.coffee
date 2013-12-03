WIN = window
$ = WIN.$

API_PATH = '/h5/avt/'

API = 
	detail: "#{API_PATH}detail"
	join: "#{API_PATH}join"
	exists: "#{API_PATH}exists"
	uids: "#{API_PATH}uids"
	update:
		status: "#{API_PATH}update/status"
		address: "#{API_PATH}update/address"


elSucs = $('#success')
elFail = $('#fail')
elAll = $('#all')
elProb = $('#prob')

sucs = fail = all = 0

Yeah = (N = 5, I = 200) ->

	step = () ->
		UID = (+new Date)*1000+Math.round(Math.random()*1000)

		$.ajax {
			url: API.join
			dataType: 'json'
			async: true
			type: 'POST'
			data: 
				plat: 1
				h5: 1
				app: 2
				uid: UID
			success: (res) ->
				elAll.html ++all

				#console.log res

				if res - 0 is 1
					elSucs.html ++sucs
				else 
					elFail.html ++fail

				prob = Math.floor sucs / all * 100

				elProb.html prob

				if all >= N
					return no
				else
					setTimeout step, I


			}

	step()
	#step i for i in [0...N]
	

WIN.Yeah = Yeah