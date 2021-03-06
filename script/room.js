/**
 * Module that registers the simple room functionality
 */
var Room = {
	// times in (minutes * seconds * milliseconds)
	_FIRE_COOL_DELAY: 5 * 60 * 1000, // time after a stoke before the fire cools
	_ROOM_WARM_DELAY: 30 * 1000, // time between room temperature updates
	_BUILDER_STATE_DELAY: 0.5 * 60 * 1000, // time between builder state updates
	_STOKE_COOLDOWN: 4, // cooldown to stoke the fire
	_NEED_WOOD_DELAY: 15 * 1000, // from when the stranger shows up, to when you need wood
	_DESERTED_LAND_DELAY: 5 * 1000,
	_GATHER_DELAY: 7,
	_FIRST_HOT: 0,
	
	buttons:{},
	
	Craftables: {
		'trap': {
			name: _('trap'),
			button: null,
			maximum: 10,
			availableMsg: _('builder says she can make traps to catch any creatures might still be alive out there'),
			buildMsg: _('more traps to catch more creatures'),
			maxMsg: _("more traps won't help now"),
			type: 'building',
			cost: function() {
				var n = $SM.get('game.buildings["trap"]', true);
				return {
					'wood': 10 + (n*10)
				};
			}
		},
		'cart': {
			name: _('cart'),
			button: null,
			maximum: 1,
			availableMsg: _('builder says she can make a cart for carrying wood'),
			buildMsg: _('the rickety cart will carry more wood from the forest'),
			type: 'building',
			cost: function() {
				return {
					'wood': 30
				};
			}
		},
		'hut': {
			name: _('hut'),
			button: null,
			maximum: 20,
			availableMsg: _("builder says there are more wanderers. says they'll work, too."),
			buildMsg: _('builder puts up a hut, out in the forest. says word will get around.'),
			maxMsg: _('no more room for huts.'),
			type: 'building',
			cost: function() {
				var n = $SM.get('game.buildings["hut"]', true);
				return {
					'wood': 100 + (n*50)
				};
			}
		},
		'lodge': {
			name: _('lodge'),
			button: null,
			maximum: 1,
			availableMsg: _('villagers could help hunt, given the means'),
			buildMsg: _('the hunting lodge stands in the forest, a ways out of town'),
			type: 'building',
			cost: function() {
				return {
					wood: 200,
					fur: 10,
					meat: 5
				};
			}
		},
		'trading post': {
			name: _('trading post'),
			button: null,
			maximum: 1,
			availableMsg: _("a trading post would make commerce easier"),
			buildMsg: _("now the nomads have a place to set up shop, they might stick around a while"),
			type: 'building',
			cost: function() {
				return {
					'wood': 400,
					'fur': 100
				};
			}
		},
		'tannery': {
			name: _('tannery'),
			button: null,
			maximum: 1,
			availableMsg: _("builder says leather could be useful. says the villagers could make it."),
			buildMsg: _('tannery goes up quick, on the edge of the village'),
			type: 'building',
			cost: function() {
				return {
					'wood': 500,
					'fur': 50
				};
			}
		},
		'smokehouse': {
			name: _('smokehouse'),
			button: null,
			maximum: 1,
			availableMsg: _("should cure the meat, or it'll spoil. builder says she can fix something up."),
			buildMsg: _('builder finishes the smokehouse. she looks hungry.'),
			type: 'building',
			cost: function() {
				return {
					'wood': 600,
					'meat': 50
				};
			}
		},
		'workshop': {
			name: _('workshop'),
			button: null,
			maximum: 1,
			availableMsg: _("builder says she could make finer things, if she had the tools"),
			buildMsg: _("workshop's finally ready. builder's excited to get to it"),
			type: 'building',
			cost: function() {
				return {
					'wood': 800,
					'leather': 100,
					'scales': 10
				};
			}
		},
		'steelworks': {
			name: _('steelworks'),
			button: null,
			maximum: 1,
			availableMsg: _("builder says the villagers could make steel, given the tools"),
			buildMsg: _("a haze falls over the village as the steelworks fires up"),
			type: 'building',
			cost: function() {
				return {
					'wood': 1500,
					'iron': 100,
					'coal': 100
				};
			}
		},
		'armoury': {
			name: _('armoury'),
			button: null,
			maximum: 1,
			availableMsg: _("builder says it'd be useful to have a steady source of bullets"),
			buildMsg: _("armoury's done, welcoming back the weapons of the past."),
			type: 'building',
			cost: function() {
				return {
					'wood': 3000,
					'steel': 100,
					'sulphur': 50
				};
			}
		},
		'torch': {
			name: _('torch'),
			button: null,
			type: 'tool',
			buildMsg: _('a torch to keep the dark away'),
			cost: function() {
				return {
					'wood': 1,
					'cloth': 1
				};
			}
		},
		'waterskin': {
			name: _('waterskin'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('this waterskin\'ll hold a bit of water, at least'),
			cost: function() {
				return {
					'leather': 50
				};
			}
		},
		'cask': {
			name: _('cask'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('the cask holds enough water for longer expeditions'),
			cost: function() {
				return {
					'leather': 100,
					'iron': 20
				};
			}
		},
		'water tank': {
			name: _('water tank'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('never go thirsty again'),
			cost: function() {
				return {
					'iron': 100,
					'steel': 50
				};
			}
		},
		'bone spear': {
			name: _('bone spear'),
			button: null,
			type: 'weapon',
			buildMsg: _("this spear's not elegant, but it's pretty good at stabbing"),
			cost: function() {
				return {
					'wood': 100,
					'teeth': 5
				};
			}
		},
		'rucksack': {
			name: _('rucksack'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('carrying more means longer expeditions to the wilds'),
			cost: function() {
				return {
					'leather': 200
				};
			}
		},
		'wagon': {
			name: _('wagon'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('the wagon can carry a lot of supplies'),
			cost: function() {
				return {
					'wood': 500,
					'iron': 100
				};
			}
		},
		'convoy': {
			name: _('convoy'),
			button: null,
			type: 'upgrade',
			maximum: 1,
			buildMsg: _('the convoy can haul mostly everything'),
			cost: function() {
				return {
					'wood': 1000,
					'iron': 200,
					'steel': 100
				};
			}
		},
		'l armour': {
			name: _('l armour'),
			type: 'upgrade',
			maximum: 1,
			buildMsg: _("leather's not strong. better than rags, though."),
			cost: function() {
				return {
					'leather': 200,
					'scales': 20
				};
			}
		},
		'i armour': {
			name: _('i armour'),
			type: 'upgrade',
			maximum: 1,
			buildMsg: _("iron's stronger than leather"),
			cost: function() {
				return {
					'leather': 200,
					'iron': 100
				};
			}
		},
		's armour': {
			name: _('s armour'),
			type: 'upgrade',
			maximum: 1,
			buildMsg: _("steel's stronger than iron"),
			cost: function() {
				return {
					'leather': 200,
					'steel': 100
				};
			}
		},
		'iron sword': {
			name: _('iron sword'),
			button: null,
			type: 'weapon',
			buildMsg: _("sword is sharp. good protection out in the wilds."),
			cost: function() {
				return {
					'wood': 200,
					'leather': 50,
					'iron': 20
				};
			}
		},
		'steel sword': {
			name: _('steel sword'),
			button: null,
			type: 'weapon',
			buildMsg: _("the steel is strong, and the blade true."),
			cost: function() {
				return {
					'wood': 500,
					'leather': 100,
					'steel': 20
				};
			}
		},
		'rifle': {
			name: _('rifle'),
			type: 'weapon',
			buildMsg: _("black powder and bullets, like the old days."),
			cost: function() {
				return {
					'wood': 200,
					'steel': 50,
					'sulphur': 50
				};
			}
		}
	},
	
	TradeGoods: {
		'scales': {
			type: 'good',
			cost: function() {
				return { fur: 150 };
			}
		},
		'teeth': {
			type: 'good',
			cost: function() {
				return { fur: 300 };
			}
		},
		'iron': {
			type: 'good',
			cost: function() {
				return {
					'fur': 150,
					'scales': 50
				};
			}
		},
		'coal': {
			type: 'good',
			cost: function() {
				return {
					'fur': 200,
					'teeth': 50
				};
			}
		},
		'steel': {
			type: 'good',
			cost: function() {
				return {
					'fur': 300,
					'scales': 50,
					'teeth': 50
				};
			}
		},
		'medicine': {
			type: 'good',
			cost: function() {
				return {
					'scales': 50, 'teeth': 30
				};
			}
		},
		'bullets': {
			type: 'good',
			cost: function() {
				return {
					'scales': 10
				};
			}
		},
		'energy cell': {
			type: 'good',
			cost: function() {
				return {
					'scales': 10,
					'teeth': 10
				};
			}
		},
		'bolas': {
			type: 'weapon',
			cost: function() {
				return {
					'teeth': 10
				};
			}
		},
		'grenade': {
			type: 'weapon',
			cost: function() {
				return {
					'scales': 100,
					'teeth': 50
				};
			}
		},
		'bayonet': {
			type: 'weapon',
			cost: function() {
				return {
					'scales': 500,
					'teeth': 250
				};
			}
		},
		'alien alloy': {
			type: 'good',
			cost: function() {
				return {
					'fur': 1500,
					'scales': 750,
					'teeth': 300
				};
			}
		},
		'compass': {
			type: 'special',
			maximum: 1,
			cost: function() {
				return { 
					fur: 400, 
					scales: 20, 
					teeth: 10 
				};
			}
		}
	},
	
	MiscItems: {
		'laser rifle': {
			type: 'weapon'
		}
	},
	
	name: _("Room"),
	init: function(options) {
		this.options = $.extend(
			this.options,
			options
		);
		
		Room.pathDiscovery = Boolean($SM.get('stores["compass"]'));

		if(Engine._debug) {
			this._ROOM_WARM_DELAY = 5000;
			this._BUILDER_STATE_DELAY = 5000;
			this._STOKE_COOLDOWN = 0;
			this._NEED_WOOD_DELAY = 5000;
		}
		
		if(typeof $SM.get('features.location.room') == 'undefined') {
			$SM.set('features.location.room', true);
			//$SM.set('game.builder.level', -1);
		}
		
		// If this is the first time playing, the fire is dead and it's freezing. 
		// Otherwise grab past save state temp and fire level.
		$SM.set('game.temperature', $SM.get('game.temperature.value')===undefined?this.TempEnum.Freezing:$SM.get('game.temperature'));
		$SM.set('game.fire', $SM.get('game.fire.value')===undefined?this.FireEnum.Dead:$SM.get('game.fire'));
		
		// Create the room tab
		this.tab = Header.addLocation(_("A Dark Room"), "room", Room);
		
		// Create the Room panel
		this.panel = $('<div>')
			.attr('id', "roomPanel")
			.addClass('location')
			.appendTo('div#locationSlider');
		
		Engine.updateSlider();
		
		// Create the light button
		new Button.Button({
			id: 'lightButton',
			text: _('light fire'),
			click: Room.lightFire,
			cooldown: Room._STOKE_COOLDOWN,
			width: '80px',
			cost: {'wood': 5}
		}).appendTo('div#roomPanel');
		
		// Create the stoke button
		new Button.Button({
			id: 'stokeButton',
			text: _("stoke fire"),
			click: Room.stokeFire,
			cooldown: Room._STOKE_COOLDOWN,
			width: '80px',
			cost: {'wood': 1}
		}).appendTo('div#roomPanel');

		//moving gather wood to firelit room
		new Button.Button({
			id: 'gatherButton',
			text: _("gather wood"),
			click: Outside.gatherWood,
			cooldown: Room._GATHER_DELAY,
			width: '80px'
		}).appendTo('div#roomPanel');
		
		//adding openDoor button
		new Button.Button({
			id: 'openDoorButton',
			text: _("open door"),
			click: Room.openDoor,
			cooldown: Room._GATHER_DELAY,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'lookButton',
			text: _("look around"),
			click: Room.lookAround,
			cooldown: 2,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'walkRoomButton',
			text: _("walk around the room"),
			click: Room.walkAround,
			cooldown: 3,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'walkCornerButton',
			text: _("walk to the corner"),
			click: Room.walkCorner,
			cooldown: 2,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'paintingButton',
			text: _("pick up painting"),
			click: Room.pickupPainting,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'blowDustButton',
			text: _("blow away dust"),
			click: Room.blowDust,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'papyrusButton',
			text: _("pick up parchment"),
			click: Room.pickupPapyrus,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'studyButton',
			text: _("study the symbols"),
			click: Room.studySymbols,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'notebookButton',
			text: _("pick up notebook"),
			click: Room.pickupNotebook,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'diaryButton',
			text: _("read the diary"),
			click: Room.readDiary,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'windowButton',
			text: _("move toward window"),
			click: Room.moveWindow,
			width: '80px'
		}).appendTo('div#roomPanel');

		new Button.Button({
			id: 'sitButton',
			text: _("go back"),
			click: Room.sitBack,
			cooldown: 3,
			width: '80px'
		}).appendTo('div#roomPanel');


		// Create the stores container
		$('<div>').attr('id', 'storesContainer').prependTo('div#roomPanel');
		
		//subscribe to stateUpdates
		$.Dispatch('stateUpdate').subscribe(Room.handleStateUpdates);
		
		Room.updateButton();
		Room.updateStoresView();
		Room.updateIncomeView();
		//Room.updateBuildButtons();
		
		Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
		//Room._tempTimer = Engine.setTimeout(Room.adjustTemp, Room._ROOM_WARM_DELAY);
		
		/*
		 * Builder states:
		 * 0 - Approaching
		 * 1 - Collapsed
		 * 2 - Shivering
		 * 3 - Sleeping
		 * 4 - Helping
		 */
		/*if($SM.get('game.builder.level') >= 0 && $SM.get('game.builder.level') < 3) {
			Room._builderTimer = Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
		}
		if($SM.get('game.builder.level') == 1 && $SM.get('stores.wood', true) < 0) {
			Engine.setTimeout(Room.unlockForest, Room._NEED_WOOD_DELAY);
		}*/
		Notifications.notify(Room,_("It's midnight"));
		Notifications.notify(Room,_("{0} wakes up in a dark room.", Engine.x_name));
		Notifications.notify(Room, _("the room is {0}. {1} is curled up on the ground", Room.TempEnum.fromInt($SM.get('game.temperature.value')).text, Engine.x_name));
		Notifications.notify(Room,_("{0} knows nothing about the world",Engine.x_name));
		switch(Engine.res[4]){
			case "N":
				Notifications.notify(Room,_('{0} gets really upset. {0}\'s mood is very unstable, going up and down easily',Engine.x_name));
				break;
			case "*N":
				Notifications.notify(Room,_('Yet {0} keeps it under control.',Engine.x_name));
				break;
			case "=N":
				Notifications.notify(Room,_('{0} gets upset a little bit, but can still keep the emotions under control',Engine.x_name));
				break;
			default:
				break;
		}
	},
	
	options: {}, // Nothing for now
	
	onArrival: function(transition_diff) {
		Room.setTitle();
		if(Room.changed) {
			Notifications.notify(Room, _("the fire is {0}", Room.FireEnum.fromInt($SM.get('game.fire.value')).text));
			Notifications.notify(Room, _("the room is {0}", Room.TempEnum.fromInt($SM.get('game.temperature.value')).text));
			Room.changed = false;
		}
		/*if($SM.get('game.builder.level') == 3) {
			$SM.add('game.builder.level', 1);
			$SM.setIncome('builder', {
				delay: 10,
				stores: {'wood' : 2 }
			});
			Room.updateIncomeView();
			//Notifications.notify(Room, _("the stranger is standing by the fire. she says she can help. says she builds things."));
		}*/

		Engine.moveStoresView(null, transition_diff);
	},
	
	TempEnum: {
		fromInt: function(value) {
			for(var k in this) {
				if(typeof this[k].value != 'undefined' && this[k].value == value) {
					return this[k];
				}
			}
			return null;
		},
		Freezing: { value: 0, text: _('freezing') },
		Cold: { value: 1, text: _('cold') },
		Mild: { value: 2, text: _('mild') },
		Warm: { value: 3, text: _('warm') },
		Hot: { value: 4, text: _('hot') }
	},
	
	FireEnum: {
		fromInt: function(value) {
			for(var k in this) {
				if(typeof this[k].value != 'undefined' && this[k].value == value) {
					return this[k];
				}
			}
			return null;
		},
		Dead: { value: 0, text: _('dead') },
		Smoldering: { value: 1, text: _('smoldering') },
		Flickering: { value: 2, text: _('flickering') },
		Burning: { value: 3, text: _('burning') },
		Roaring: { value: 4, text: _('roaring') }
	},
	
	setTitle: function() {
		var title = $SM.get('game.fire.value') < 2 ? _("A Dark Room") : _("A Firelit Room");
		if(Engine.activeModule == this) {
			document.title = title;
		}
		$('div#location_room').text(title);
	},
	
	updateButton: function() {
		var light = $('#lightButton.button');
		var stoke = $('#stokeButton.button');
		var door = $('#openDoorButton.button');
		var look = $('#lookButton.button');
		var walk = $('#walkRoomButton.button');
		var walkc = $('#walkCornerButton.button');
		var painting = $('#paintingButton.button');
		var papyrus = $('#papyrusButton.button');
		var notebook = $('#notebookButton.button');
		var blowDust = $('#blowDustButton.button');
		var study = $('#studyButton.button');
		var diary = $('#diaryButton.button');
		var moveWin = $('#windowButton.button');
		var sit = $('#sitButton.button');
		if($SM.get('game.fire.value') == Room.FireEnum.Dead.value && stoke.css('display') != 'none') {
			stoke.hide();
			door.hide();
			light.show();
			look.hide();
			walk.hide();
			walkc.hide();
			painting.hide();
			papyrus.hide();
			notebook.hide();
			blowDust.hide();
			study.hide();
			diary.hide();
			moveWin.hide();
			sit.hide();
			if(stoke.hasClass('disabled')) {
				Button.cooldown(light);
			}
		} else if(light.css('display') != 'none') {
			stoke.show();
			light.hide();
			if(light.hasClass('disabled')) {
				Button.cooldown(stoke);
			}
		}
		
		if(!$SM.get('stores.wood')) {
			light.addClass('free');
			stoke.addClass('free');
		} else {
			light.removeClass('free');
			stoke.removeClass('free');
		}
	},
	
	_fireTimer: null,
	_tempTimer: null,
	_landTimer: null,
	_baseTimer: null,
	_currButton: "",
	_numWalk: 0,

	lightFire: function() {
		var wood = $SM.get('stores.wood');
		if(wood < 5) {
			Notifications.notify(Room, _("not enough wood to get the fire going"));
			//insert gather wood option?
			Button.clearCooldown($('#lightButton.button'));
			return;
		} else if(wood > 4) {
			$SM.set('stores.wood', wood - 5);
		}
		$SM.set('game.fire', Room.FireEnum.Smoldering);
		$SM.set('game.temperature',Room.TempEnum.Mild);
		Room.onFireChange();
	},
	
	stokeFire: function() {
		var wood = $SM.get('stores.wood');
		if(wood === 0) {
			Notifications.notify(Room, _("the wood has run out"));
			//insert gather wood option?
			Button.clearCooldown($('#stokeButton.button'));
			return;
		}
		if(wood > 0) {
			$SM.set('stores.wood', wood - 1);
		}
		if($SM.get('game.fire.value') < 4) {
			$SM.set('game.fire', Room.FireEnum.fromInt($SM.get('game.fire.value') + 1));
			if($SM.get('game.temperature.value') < 4){
				$SM.set('game.temperature',Room.TempEnum.fromInt($SM.get('game.temperature.value')+1));
				if($SM.get('game.temperature.value') == 4) Room._FIRST_HOT+=1;
			}
		}
		Notifications.notify(null,_("{0} picks up a log of wood and lights it.",Engine.x_name),true);
		Notifications.notify(null,_("The wood is {0}", Room.FireEnum.fromInt($SM.get('game.temperature.value')).text));
		Notifications.notify(null,_("The room is {0}",Room.TempEnum.fromInt($SM.get('game.temperature.value')).text),true);
		

		Room.onFireChange();
	},
	
	onFireChange: function() {
		if(Engine.activeModule != Room) {
			Room.changed = true;
		}
		Notifications.notify(Room, _("the fire is {0}", Room.FireEnum.fromInt($SM.get('game.fire.value')).text), true);
		/*if($SM.get('game.fire.value') > 1 && $SM.get('game.builder.level') < 0) {
			$SM.set('game.builder.level', 0);
			Notifications.notify(Room, _("the light from the fire spills from the windows, out into the dark"));
			Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
		}*/	
		if($SM.get('game.temperature.value') == 3){
			Notifications.notify(Room,_('{0} feels warm now. {0} begins to look around the environment',Engine.x_name));
			var look = $('#lookButton.button');
			look.show();

		}
		/*if($SM.get('game.temperature.value') == 4 && Room._FIRST_HOT == 1){
			Notifications.notify(Room,_("{0} now starts to look around the room.",Engine.x_name),true);
			Notifications.notify(Room,_("The room is empty."),true);
			Notifications.notify(Room,_("The night was long. The time passed slowly."),true);
			Notifications.notify(Room,_("{0} decides to explore the world in the morning.",Engine.x_name),true);
			Notifications.notify(Room,_("{0} has lots of leisure time to spend during the night.",Engine.x_name),true);
			//set up kill time
			Room.enableKillTime();
			Room._FIRST_HOT+=1;
		}*/
		window.clearTimeout(Room._fireTimer);
		Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
		Room.updateButton();
		Room.setTitle();
	},
	
	coolFire: function() {
		var wood = $SM.get('stores.wood');
		if($SM.get('game.fire.value') <= Room.FireEnum.Flickering.value &&
			/*$SM.get('game.builder.level') > 3 && */wood > 0) {
			Notifications.notify(Room, _("{0} stokes the fire",Engine.x_name), true);
			$SM.set('stores.wood', wood - 1);
			$SM.set('game.fire',Room.FireEnum.fromInt($SM.get('game.fire.value') + 1));
		}
		if($SM.get('game.fire.value') > 0) {
			$SM.set('game.fire',Room.FireEnum.fromInt($SM.get('game.fire.value') - 1));
			Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
			Room.onFireChange();
		}
	},
	
	adjustTemp: function() {
		var old = $SM.get('game.temperature.value');
		if($SM.get('game.temperature.value') > 0 && $SM.get('game.temperature.value') > $SM.get('game.fire.value')) {
			$SM.set('game.temperature',Room.TempEnum.fromInt($SM.get('game.temperature.value') - 1));
			Notifications.notify(Room, _("the room is {0}" , Room.TempEnum.fromInt($SM.get('game.temperature.value')).text), true);
		}
		if($SM.get('game.temperature.value') < 4 && $SM.get('game.temperature.value') < $SM.get('game.fire.value')) {
			$SM.set('game.temperature', Room.TempEnum.fromInt($SM.get('game.temperature.value') + 1));
			Notifications.notify(Room, _("the room is {0}" , Room.TempEnum.fromInt($SM.get('game.temperature.value')).text), true);
		}
		if($SM.get('game.temperature.value') != old) {
			Room.changed = true;
		}
		if($SM.get('game.temperature.value') == 4) Room._FIRST_HOT += 1;
		
		Room._tempTimer = Engine.setTimeout(Room.adjustTemp, Room._ROOM_WARM_DELAY);
	},
	
	unlockForest: function() {
		$SM.set('stores.wood', 4);
		var door = $('#openDoorButton.button');
		//remove door?
		door.hide();
		Outside.init();
		/*Notifications.notify(Room, _("the wind howls outside"));
		Notifications.notify(Room, _("the wood is running out"));*/
		Engine.travelTo(Outside);
		Notifications.notify(Outside,_("There is not much to see around."));
		Notifications.notify(Outside,_("There is no hint about what the new world is like. But there seems to be a small town at the horizon."));
		Path.init();
		Notifications.notify(Outside,_("{0} is thinking about going on an exploration.",Engine.x_name));
		Engine.event('progress', 'outside');
	},

	enableButton: function(id) {
		if(id == 'scary'){
			Room.scary();
			return;
		} 
		var butt = $(_('#{0}.button',id));
		butt.show();
		if(id == 'openDoorButton') Notifications.notify(Room,_('The day comes'));
		if(id == 'paintingButton'){
			var papyrus = $('#papyrusButton.button');
			var notebook = $('#notebookButton.button');
			var walk = $('#walkCornerButton.button');
			walk.hide();
			papyrus.show();
			notebook.show();
		}
		window.clearTimeout(Room._baseTimer);

	},

	lookAround: function(){
		Notifications.notify(Room,_("It is a little cabin that looks pretty old. There is not much in the cabin"));
		Notifications.notify(Room,_("{0} starts to examine the room.",Engine.x_name));
		var walk = $('#walkRoomButton.button');
		var look = $('#lookButton.button');
		walk.show();
		look.hide(); //or hide
	},

	walkAround: function(){
		Room._numWalk+=1;
		if(Room._numWalk == 1){
			Notifications.notify(Room,_("{0} finds a pile of stuff in the corner, covered by some kind of cloth",Engine.x_name));
			Room._baseTimer = Engine.setTimeout(Room.enableButton.bind(null,'walkCornerButton'), 3*1000);
		} else {
			Notifications.notify(Room,_("{0} finds nothing new in the room.",Engine.x_name));
		}
	},

	walkCorner: function(){
		Notifications.notify(Room,_("{0} removes the suede cover and finds underneath are a middle-scale oil painting, a scroll of parchment, an old thick notebook. ",Engine.x_name));
		Notifications.notify(Room,_("There are also some ropes, a compass, a pile of hay and some other stuff."));
		Room._baseTimer = Engine.setTimeout(Room.enableButton.bind(null,"paintingButton"),2*1000);
		
	},

	pickupPainting: function(){
		Notifications.notify(Room,_("The painting seems to be a view of the unknown world, but it is covered with thick dust and cannot be seen very clearly."));
		
		
		var dust = $('#blowDustButton.button');
		var painting = $('#paintingButton.button');
		dust.show();
		painting.hide();
	},

	pickupPapyrus: function(){
		var papyrus = $('#papyrusButton.button');
		papyrus.hide();
		var study = $('#studyButton.button');
		study.show();
		Notifications.notify(Room,_('{0} unrolls the scroll of parchment',Engine.x_name));
		Notifications.notify(Room,_('The parchment is full of strange and unrecognizable symbols and figures. Seems like an ancient language.'));
	},

	pickupNotebook: function(){
		Notifications.notify(Room,_('The notebook is gorgeous and is a classic. It appears to be a diary from a former traveler who spent several nights in this cabin.'));
		var notebook = $('#notebookButton.button');
		var diary = $('#diaryButton.button');
		notebook.hide();
		diary.show();
	},

	blowDust: function(){
		switch(Engine.res[0]){
			case "O":
				Notifications.notify(Room, _("{0} sees the forest, the river, and a beautiful sunset on the painting.",Engine.x_name));
				Notifications.notify(Room,_('{0} imagines how the new world becomes vivid with lots of details.',Engine.x_name));
				Notifications.notify(Room, _('{0} enjoys the beauty of the art and the beauty of nature.',Engine.x_name));
				Notifications.notify(Room,_('{0} always sees beauty in things that others might not notice.',Engine.x_name));
				break;
			case "*O":
				Notifications.notify(Room,_('{0} sees the forest, the river, and a beautiful sunset on the painting, but is not moved by it.',Engine.x_name));
				Notifications.notify(Room,_('{0} does not have a very good imagination to imagine the new world with lots of details.',Engine.x_name));
				break;
			case "=O":
				Notifications.notify(Room,_('{0} can see the forest, the river, and a beautiful sunset on the painting.',Engine.x_name));
				Notifications.notify(Room,_('{0} has normal imagination, so {0} sometimes gets immersed in the painting.',Engine.x_name));
				Notifications.notify(Room,_('{0} does not have strong feelings on the beauty of nature and art, but also does not feel repugnance.',Engine.x_name));
				break;
			default:
				break;
		}
		var blow = $('#blowDustButton.button');
		blow.hide();

	},

	studySymbols: function(){
		var study = $('#studyButton.button');
		study.hide();
		switch(Engine.res[0]){
			case "O":
				Notifications.notify(Room,_('{0} loves difficult and challenging materials, so {0} begins to scrutinize the symbols',Engine.x_name));
				Notifications.notify(Room,_('{0} is full of ideas, and is quick in understanding, so {0} soon finds something interesting from the symbols',Engine.x_name));
				break;
			case "*O":
				Notifications.notify(Room,_('After a very short time, {0} gives up studying the symbols',Engine.x_name));
				Notifications.notify(Room,_('{0} doesn’t like those abstract ideas at all, and never understand why things need to be this complex.',Engine.x_name));
				Notifications.notify(Room,_('{0} likes simple and straightforward materials.',Engine.x_name));
				break;
			case "=0":
				Notifications.notify(Room,_('After trying for some time, {0} gives up studying the symbols',Engine.x_name));
				Notifications.notify(Room,_('{0} does not try to avoid all the complex problems, but {0} also does not also have strongs interest in it.',Engine.x_name));
				break;
			default:
				break;
		}
	},

	readDiary: function(){
		Notifications.notify(Room,_('The diary describes the traveler’s family story. It narrates some emotional struggles.'));
		switch(Engine.res[3]){
			case "A":
				Notifications.notify(Room,_('{0} is not really interested in the traveler’s problems, and is indifferent to the traveler’s feeling.',Engine.x_name));
				Notifications.notify(Room,_('{0} normally takes no time for others.',Engine.x_name));
				break;
			case "*A":
				Notifications.notify(Room,_('{0} loves the traveler’s child.',Engine.x_name));
				Notifications.notify(Room,_('{0} sympathizes with the traveler’s feelings.',Engine.x_name));
				Notifications.notify(Room,_('{0} really wants to comfort the traveler and offers help to solve the problems.',Engine.x_name));
				Notifications.notify(Room,_('{0} likes to do things for others.',Engine.x_name));
				break;
			case "=A":
				Notifications.notify(Room,_('{0} can feel a little emotional, but is also not interested in other people’s problems.',Engine.x_name));
				break;
			default:
				break;
		}
		var diary = $('#diaryButton.button');
		diary.hide();
		//add timer here?
		Room._baseTimer = Engine.setTimeout(Room.enableButton.bind(null,'scary'),5*1000);
	},
	scary: function(){
		Notifications.notify(Room,_("Suddenly, {0} heard some cracking sounds outside the window.",Engine.x_name));
		switch(Engine.res[4]){
			case "N":
				Notifications.notify(Room,_('{0} feel threatened and starts to panic.',Engine.x_name));
				Notifications.notify(Room,_('But {0} still decides to examine what happened.',Engine.x_name));
				break;
			case "*N":
				Notifications.notify(Room,_('{0} stays calm.',Engine.x_name));
				Notifications.notify(Room,_('But {0} still decides to examine what happened.',Engine.x_name));
				break;
			case "=N":
				Notifications.notify(Room,_('{0} is little concerned, but still stays calm.',Engine.x_name));
				Notifications.notify(Room,_('But {0} still decides to examine what happened.',Engine.x_name));
				break;
			default:
				break;
		}
		var moveWin = $('#windowButton.button');
		moveWin.show();
	},

	moveWindow: function(){
		Notifications.notify(Room,_('{0} carefully moves toward the window',Engine.x_name));
		switch(Engine.res[4]){
			case "N":
				Notifications.notify(Room,_('{0} finds some branches that are on the ground in the snow.',Engine.x_name));
				Notifications.notify(Room,_('{0} worries a lot, and guesses that the sounds were from some fierce beasts or even someone else.',Engine.x_name));
				break;
			case "*N":
				Notifications.notify(Room,_('{0} finds some branches that are on the ground in the snow.',Engine.x_name));
				Notifications.notify(Room,_('{0} guesses that the sounds were from the branches which probably fell because of wind. {0} is not bothered by it.',Engine.x_name));
				break;
			case "=N":
				Notifications.notify(Room,_('{0} finds some branches that are on the ground in the snow.',Engine.x_name));
				Notifications.notify(Room,_('{0} still feels afraid a little bit, but tries to believe that the sounds and the fallen branches were only because of the wind, so {0} is not very worried.',Engine.x_name));
				break;
			default:
				break;		
		}
		var mw = $('#windowButton.button');
		var sit = $('#sitButton.button');
		mw.hide();
		sit.show();
	},

	sitBack: function(){
		Notifications.notify(Room,_('The night is long, and the wind blows strongly.'));
		Notifications.notify(Room,_('There is no one around, and nothing else to do.'));
		switch(Engine.res[2]){
			case "E":
				Notifications.notify(Room,_('{0} doesn’t like being alone. {0} misses people and parties.',Engine.x_name));
				Notifications.notify(Room,_('{0} expects to meet someone else in the new world.',Engine.x_name));
				Notifications.notify(Room,_('{0} feels more comfortable around people.',Engine.x_name));
				break;
			case "*E":
				Notifications.notify(Room,_('{0} feels comfortable alone. {0} doesn’t talk a lot.',Engine.x_name));
				Notifications.notify(Room,_('{0} doesn’t wish to meet anyone in the new world.',Engine.x_name));
				break;
			case "=E":
				Notifications.notify(Room,_('{0} feels comfortable alone, but feels ok to meet someone else.',Engine.x_name));
				break;
			default:
				break;
		}
		Room._baseTimer = Engine.setTimeout(Room.enableButton.bind(null,'openDoorButton'),3*1000);
		var sit = $('#sitButton.button');
		sit.hide();
	},

	openDoor: function(){
		Notifications.notify(Room,_('A deserted land unfolds in front of {0}. But there is not much to see in the sight.',Engine.x_name));
		var door = $('#openDoorButton.button');
		door.hide();
		Outside.init();
		var wc = $('#walkCabinButton.button');
		wc.show();
		Engine.travelTo(Outside);
	},

	updateBuilderState: function() {
		var lBuilder = $SM.get('game.builder.level');
		if(lBuilder === 0) {
			//Notifications.notify(Room, _("a ragged stranger stumbles through the door and collapses in the corner"));
			lBuilder = $SM.setget('game.builder.level', 1);
			Engine.setTimeout(Room.unlockForest, Room._NEED_WOOD_DELAY);
		} 
		else if(lBuilder < 3 && $SM.get('game.temperature.value') >= Room.TempEnum.Warm.value) {
			var msg = "";
			switch(lBuilder) {
			case 1:
				msg = _("the stranger shivers, and mumbles quietly. her words are unintelligible.");
				break;
			case 2:
				msg = _("the stranger in the corner stops shivering. her breathing calms.");
				break;
			}
			//Notifications.notify(Room, msg);
			if(lBuilder < 3) {
				lBuilder = $SM.setget('game.builder.level', lBuilder + 1);
			}
		}
		if(lBuilder < 3) {
			Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
		}
		Engine.saveGame();
	},
	

	updateStoresView: function() {
		var stores = $('div#stores');
		var resources = $('div#resources');
		var special = $('div#special');
		var weapons = $('div#weapons');
		var needsAppend = false, rNeedsAppend = false, sNeedsAppend = false, wNeedsAppend = false, newRow = false;
		if(stores.length === 0) {
			stores = $('<div>').attr({
				'id': 'stores',
				'data-legend': _('stores')
			}).css('opacity', 0);
			needsAppend = true;
		}
		if(resources.length === 0) {
			resources = $('<div>').attr({
				id: 'resources'
			}).css('opacity', 0);
			rNeedsAppend = true;
		}
		if(special.length === 0) {
			special = $('<div>').attr({
				id: 'special'
			}).css('opacity', 0);
			sNeedsAppend = true;
		}
		if(weapons.length === 0) {
			weapons = $('<div>').attr({
				'id': 'weapons',
				'data-legend': _('weapons')
			}).css('opacity', 0);
			wNeedsAppend = true;
		}
		for(var k in $SM.get('stores')) {
			
			var type = null;
			if(Room.Craftables[k]) {
				type = Room.Craftables[k].type;
			} else if(Room.TradeGoods[k]) {
				type = Room.TradeGoods[k].type;
			} else if (Room.MiscItems[k]) {
				type = Room.MiscItems[k].type;
			}
			
			var location;
			switch(type) {
			case 'upgrade':
				// Don't display upgrades on the Room screen
				continue;
			case 'building':
				// Don't display buildings either
				continue;
			case 'weapon':
				location = weapons;
				break;
			case 'special':
				location = special;
				break;
			default:
				location = resources;
				break;
			}
			
			var id = "row_" + k.replace(' ', '-');
			var row = $('div#' + id, location);
			var num = $SM.get('stores["'+k+'"]');
			
			if(typeof num != 'number' || isNaN(num)) {
				// No idea how counts get corrupted, but I have reason to believe that they occassionally do.
				// Build a little fence around it!
				num = 0;
				$SM.set('stores["'+k+'"]', 0);
			}
			
			var lk = _(k);
			
			// thieves?
			if(typeof $SM.get('game.thieves') == 'undefined' && num > 5000 && $SM.get('features.location.world')) {
				$SM.startThieves();
			}
			
			if(row.length === 0) {
				row = $('<div>').attr('id', id).addClass('storeRow');
				$('<div>').addClass('row_key').text(lk).appendTo(row);
				$('<div>').addClass('row_val').text(Math.floor(num)).appendTo(row);
				$('<div>').addClass('clear').appendTo(row);
				var curPrev = null;
				location.children().each(function(i) {
					var child = $(this);
					var cName = child.children('.row_key').text();
					if(cName < lk) {
						curPrev = child.attr('id');
					}
				});
				if(curPrev == null) {
					row.prependTo(location);
				} else {
					row.insertAfter(location.find('#' + curPrev));
				}
				newRow = true;
			} else {
				$('div#' + row.attr('id') + ' > div.row_val', location).text(Math.floor(num));
			}
		}
				
		if(rNeedsAppend && resources.children().length > 0) {
			resources.prependTo(stores);
			resources.animate({opacity: 1}, 300, 'linear');
		}
		
		if(sNeedsAppend && special.children().length > 0) {
			special.appendTo(stores);
			special.animate({opacity: 1}, 300, 'linear');
		}
		
		if(needsAppend && stores.find('div.storeRow').length > 0) {
			stores.appendTo('div#storesContainer');
			stores.animate({opacity: 1}, 300, 'linear');
		}
		
		if(wNeedsAppend && weapons.children().length > 0) {
			weapons.appendTo('div#storesContainer');
			weapons.animate({opacity: 1}, 300, 'linear');
		}
		
		if(newRow) {
			Room.updateIncomeView();
		}

		if($("div#outsidePanel").length) {
			Outside.updateVillage();
		}

		if($SM.get('stores.compass') && !Room.pathDiscovery){
			Room.pathDiscovery = true;
			Path.openPath();
		}
	},
	
	updateIncomeView: function() {
		var stores = $('div#resources');
		var totalIncome = {};
		if(stores.length === 0 || typeof $SM.get('income') == 'undefined') return;
		$('div.storeRow', stores).each(function(index, el) {
			el = $(el);
			$('div.tooltip', el).remove();
			var ttPos = index > 10 ? 'top right' : 'bottom right';
			var tt = $('<div>').addClass('tooltip ' + ttPos);
			var storeName = el.attr('id').substring(4).replace('-', ' ');
			for(var incomeSource in $SM.get('income')) {
				var income = $SM.get('income["'+incomeSource+'"]');
				for(var store in income.stores) {
					if(store == storeName && income.stores[store] !== 0) {
						$('<div>').addClass('row_key').text(_(incomeSource)).appendTo(tt);
						$('<div>')
							.addClass('row_val')
							.text(Engine.getIncomeMsg(income.stores[store], income.delay))
							.appendTo(tt);
						if (!totalIncome[store] || totalIncome[store].income === undefined) {
							totalIncome[store] = { income: 0 };
						}
						totalIncome[store].income += Number(income.stores[store]);
						totalIncome[store].delay = income.delay;
					}
				}
			}
			if(tt.children().length > 0) {
				var total = totalIncome[storeName].income;
				$('<div>').addClass('total row_key').text(_('total')).appendTo(tt);
				$('<div>').addClass('total row_val').text(Engine.getIncomeMsg(total, totalIncome[storeName].delay)).appendTo(tt);
				tt.appendTo(el);
			}
		});
	},
	
	buy: function(buyBtn) {
		var thing = $(buyBtn).attr('buildThing');
		var good = Room.TradeGoods[thing];
		var numThings = $SM.get('stores["'+thing+'"]', true);
		if(numThings < 0) numThings = 0;
		if(good.maximum <= numThings) {
			return;
		}
		
		var storeMod = {};
		var cost = good.cost();
		for(var k in cost) {
			var have = $SM.get('stores["'+k+'"]', true);
			if(have < cost[k]) {
				Notifications.notify(Room, _("not enough " + k));
				return false;
			} else {
				storeMod[k] = have - cost[k];
			}
		}
		$SM.setM('stores', storeMod);
		
		Notifications.notify(Room, good.buildMsg);
		
		$SM.add('stores["'+thing+'"]', 1);
	},
	
	build: function(buildBtn) {
		var thing = $(buildBtn).attr('buildThing');
		if($SM.get('game.temperature.value') <= Room.TempEnum.Cold.value) {
			Notifications.notify(Room, _("builder just shivers"));
			return false;
		}
		var craftable = Room.Craftables[thing];
		
		var numThings = 0; 
		switch(craftable.type) {
		case 'good':
		case 'weapon':
		case 'tool':
		case 'upgrade':
			numThings = $SM.get('stores["'+thing+'"]', true);
			break;
		case 'building':
			numThings = $SM.get('game.buildings["'+thing+'"]', true);
			break;
		}
		
		if(numThings < 0) numThings = 0;
		if(craftable.maximum <= numThings) {
			return;
		}
		
		var storeMod = {};
		var cost = craftable.cost();
		for(var k in cost) {
			var have = $SM.get('stores["'+k+'"]', true);
			if(have < cost[k]) {
				Notifications.notify(Room, _("not enough "+k));
				return false;
			} else {
				storeMod[k] = have - cost[k];
			}
		}
		$SM.setM('stores', storeMod);
		
		Notifications.notify(Room, craftable.buildMsg);
		
		switch(craftable.type) {
		case 'good':
		case 'weapon':
		case 'upgrade':
		case 'tool':
			$SM.add('stores["'+thing+'"]', 1);
			break;
		case 'building':
			$SM.add('game.buildings["'+thing+'"]', 1);
			break;
		}		
	},
	
	needsWorkshop: function(type) {
		return type == 'weapon' || type == 'upgrade' || type =='tool';
	},
	
	craftUnlocked: function(thing) {
		if(Room.buttons[thing]) {
			return true;
		}
		if($SM.get('game.builder.level') < 4) return false;
		var craftable = Room.Craftables[thing];
		if(Room.needsWorkshop(craftable.type) && $SM.get('game.buildings["'+'workshop'+'"]', true) === 0) return false;
		var cost = craftable.cost();
		
		//show button if one has already been built
		if($SM.get('game.buildings["'+thing+'"]') > 0){
			Room.buttons[thing] = true;
			return true;
		}
		// Show buttons if we have at least 1/2 the wood, and all other components have been seen.
		if($SM.get('stores.wood', true) < cost['wood'] * 0.5) {
			return false;
		}
		for(var c in cost) {
			if(!$SM.get('stores["'+c+'"]')) {
				return false;
			}
		}
		
		Room.buttons[thing] = true;
		//don't notify if it has already been built before
		if(!$SM.get('game.buildings["'+thing+'"]')){
			Notifications.notify(Room, craftable.availableMsg);
		}
		return true;
	},
	
	buyUnlocked: function(thing) {
		if(Room.buttons[thing]) {
			return true;
		} else if($SM.get('game.buildings["trading post"]', true) > 0) {
			if(thing == 'compass' || typeof $SM.get('stores["'+thing+'"]') != 'undefined') {
				// Allow the purchase of stuff once you've seen it
				return true;
			}
		}
		return false;
	},
	
	updateBuildButtons: function() {
		var buildSection = $('#buildBtns');
		var needsAppend = false;
		if(buildSection.length === 0) {
			buildSection = $('<div>').attr({'id': 'buildBtns', 'data-legend': _('build:')}).css('opacity', 0);
			needsAppend = true;
		}
		
		var craftSection = $('#craftBtns');
		var cNeedsAppend = false;
		if(craftSection.length === 0 && $SM.get('game.buildings["workshop"]', true) > 0) {
			craftSection = $('<div>').attr({'id': 'craftBtns', 'data-legend': _('craft:')}).css('opacity', 0);
			cNeedsAppend = true;
		}
		
		var buySection = $('#buyBtns');
		var bNeedsAppend = false;
		if(buySection.length === 0 && $SM.get('game.buildings["trading post"]', true) > 0) {
			buySection = $('<div>').attr({'id': 'buyBtns', 'data-legend': _('buy:')}).css('opacity', 0);
			bNeedsAppend = true;
		}
		
		for(var k in Room.Craftables) {
			craftable = Room.Craftables[k];
			var max = $SM.num(k, craftable) + 1 > craftable.maximum;
			if(craftable.button == null) {
				if(Room.craftUnlocked(k)) {
					var loc = Room.needsWorkshop(craftable.type) ? craftSection : buildSection;
					craftable.button = new Button.Button({
						id: 'build_' + k,
						cost: craftable.cost(),
						text: _(k),
						click: Room.build,
						width: '80px',
						ttPos: loc.children().length > 10 ? 'top right' : 'bottom right'
					}).css('opacity', 0).attr('buildThing', k).appendTo(loc).animate({opacity: 1}, 300, 'linear');
				}
			} else {
				// refresh the tooltip
				var costTooltip = $('.tooltip', craftable.button);
				costTooltip.empty();
				var cost = craftable.cost();
				for(var k in cost) {
					$("<div>").addClass('row_key').text(_(k)).appendTo(costTooltip);
					$("<div>").addClass('row_val').text(cost[k]).appendTo(costTooltip);
				}
				if(max && !craftable.button.hasClass('disabled')) {
					Notifications.notify(Room, craftable.maxMsg);
				}
			}
			if(max) {
				Button.setDisabled(craftable.button, true);
			} else {
				Button.setDisabled(craftable.button, false);
			}
		}
		
		for(var k in Room.TradeGoods) {
			good = Room.TradeGoods[k];
			var max = $SM.num(k, good) + 1 > good.maximum;
			if(good.button == null) {
				if(Room.buyUnlocked(k)) {
					good.button = new Button.Button({
						id: 'build_' + k,
						cost: good.cost(),
						text: _(k),
						click: Room.buy,
						width: '80px',
						ttPos: buySection.children().length > 10 ? 'top right' : 'bottom right'
					}).css('opacity', 0).attr('buildThing', k).appendTo(buySection).animate({opacity:1}, 300, 'linear');
				}
			} else {
				// refresh the tooltip
				var costTooltip = $('.tooltip', good.button);
				costTooltip.empty();
				var cost = good.cost();
				for(var k in cost) {
					$("<div>").addClass('row_key').text(_(k)).appendTo(costTooltip);
					$("<div>").addClass('row_val').text(cost[k]).appendTo(costTooltip);
				}
				if(max && !good.button.hasClass('disabled')) {
					Notifications.notify(Room, good.maxMsg);
				}
			}
			if(max) {
				Button.setDisabled(good.button, true);
			} else {
				Button.setDisabled(good.button, false);
			}
		}
		
		if(needsAppend && buildSection.children().length > 0) {
			buildSection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
		}
		if(cNeedsAppend && craftSection.children().length > 0) {
			craftSection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
		}
		if(bNeedsAppend && buildSection.children().length > 0) {
			buySection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
		}
	},
	
	compassTooltip: function(direction){
		var ttPos = $('div#resources').children().length > 10 ? 'top right' : 'bottom right';
		var tt = $('<div>').addClass('tooltip ' + ttPos);
		$('<div>').addClass('row_key').text(_('the compass points '+ direction)).appendTo(tt);
		tt.appendTo($('#row_compass'));
	},
	
	handleStateUpdates: function(e){
		if(e.category == 'stores'){
			Room.updateStoresView();
			//Room.updateBuildButtons();
		} else if(e.category == 'income'){
			Room.updateStoresView();
			Room.updateIncomeView();
		} else if(e.stateName.indexOf('game.buildings') === 0){
			//Room.updateBuildButtons();
		}
	}

};
