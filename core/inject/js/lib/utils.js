define(['logger'], function(Logger) {
	function buildTimestamp(inStamp) {
		var i, x, stamp, tmp, tz, d, dq;
		var dt = {};
		var today = new Date();
		dt.day = today.getDay();
		stamp = inStamp.replace(/,/,'').split(" ");
		for (i=0; i<stamp.length; i++) {
		 if (/^\d{4}$/.test(stamp[i])) {
			dt.year = parseInt(stamp[i], 10);
		 }
		 else if (/\d{1,2}:\d{2}$/.test(stamp[i])) {
			tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
			dt.hours = parseInt(tmp[1], 10);
			dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
		 }
		 else if (/\d{1,2}:\d{2}(am|pm)/i.test(stamp[i])) {
			tmp = stamp[i].match(/(\d{1,2}):(\d{2})/);
			if (/pm$/i.test(stamp[i])) {
				 dt.hours = parseInt(tmp[1], 10)+12;
				 if (dt.hours === 24) { dt.hours = 12; }
			}
			else {
				 dt.hours = parseInt(tmp[1], 10);
				 if (dt.hours === 12) { dt.hours = 0; }
			}
			dt.minutes = parseInt(tmp[2].replace(/^0/,''), 10);
		 }
		 else if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(stamp[i])) {
			tmp = stamp[i].match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
			dt.date = parseInt(tmp[1], 10);
			dt.month = parseInt(tmp[2], 10);
			dt.year = parseInt(tmp[3], 10);
		 }
		 else if (/\d{1,2}(st|nd|rd|th)$/.test(stamp[i])) {
			tmp = stamp[i].match(/(\d{1,2})/);
			dt.date = parseInt(tmp[1], 10);
		 }
		 else if (/^[A-Za-z]+$/.test(stamp[i])) {
			var found = false;
			for (x=0; !found && x < module.getLocale("en")
										 .monthsLong.length; x++) {
				 if ((new RegExp(module.getLocale("en").monthsLong[x],"i"))
					 .test(stamp[i]) ||
					 (new RegExp(module.getLocale("en").monthsShort[x],"i"))
					 .test(stamp[i])) {
					dt.month = x+1;
					found = true;
				 }
			}
			for (x=0; !found && x < module.getLocale("en")
										 .daysLong.length; x++) {
				 if ((new RegExp(module.getLocale("en").daysLong[x],"i"))
					 .test(stamp[i]) ||
					 (new RegExp(module.getLocale("en").daysShort[x], "i"))
					 .test(stamp[i])) {
					dt.date = (x - dt.day - 7) % 7;
					found = true;
				 }
			}
		 }
		}
		if (dt.year) {
		 d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
						 dt.hours + ":" + dt.minutes + ":00");
		 return Math.round(d.getTime()/1000);
		}
		if (!dt.year) {
		 if (dt.month) {
			dq = new Date(dt.month + "/" + dt.date + "/" +
								today.getFullYear() + " " + dt.hours +
								":" + dt.minutes + ":00");
			/* If more than a day ahead, month is in previous year */
			if (dq > today + 86400000) {
				 dt.year = today.getFullYear() - 1;
			}
			else {
				 dt.year = today.getFullYear();
			}
			d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
							 " " + dt.hours + ":" + dt.minutes + ":00");
			return Math.round(d.getTime()/1000);
		 }
		 else if (dt.date < 0) {
			dq = new Date((today.getMonth()+1) + "/" +
								today.getDate() + "/" +
								today.getFullYear() + " " + dt.hours +
								":" + dt.minutes + ":00 UTC");
			/* If more than a month ahead, wrapped backwards across year */
			if (dq > today + 2764800000) {
				 today.setFullYear(dt.year);
			}
			/* If more than a day ahead, wrapped backwards across month */
			if (dq > today + 86400000) {
				 today.setMonth(today.getMonth()-1);
			}
			today = new Date(today.valueOf()+86400000*dt.date);
			dt.date = today.getDate();
			dt.month = today.getMonth()+1;
			dt.year = today.getFullYear();
			d = new Date(dt.month + "/" + dt.date + "/" + dt.year +
							 " " + dt.hours + ":" + dt.minutes + ":00");
			return Math.round(d.getTime()/1000);
		 }
		 else if (!dt.date) {
			dt.year = today.getFullYear();
			dt.month = today.getMonth()+1;
			dt.date = today.getDate();
			d = new Date(dt.month + "/" + dt.date + "/" + dt.year + " " +
							 dt.hours + ":" + dt.minutes + ":00");
			return Math.round(d.getTime()/1000);
		 }
		}
		return null;
	 }

	function getLocale(lang) {
		if (typeof lang !== "string") {
		 lang = "en";
		}
		lang = lang.toLowerCase();
		if (module.locale.hasOwnProperty(lang) && module.locale[lang] !== false) {
		return module.locale[lang];
		}
		else {
		 if (!module.locale.hasOwnProperty(lang)) {
			module.locale[lang] = false;
			Logger.warn("Warning: Localization not found for language '" + lang + "'");
		 }
		 return module.locale.en;
		}
	 }

	var locale = {
		"en": {
			"daysLong": [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			"daysShort": [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			"monthsLong": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			"monthsShort": [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			]
		},
		"de": {
			"daysLong": [
				"Sonntag",
				"Montag",
				"Dienstag",
				"Mittwoch",
				"Donnerstag",
				"Freitag",
				"Samstag"
			],
			"daysShort": [
				"So",
				"Mo",
				"Di",
				"Mi",
				"Do",
				"Fr",
				"Sa"
			],
			"monthsLong": [
				"Januar",
				"Februar",
				"März",
				"April",
				"Mai",
				"Juni",
				"Juli",
				"August",
				"September",
				"Oktober",
				"November",
				"Dezember"
			],
			"monthsShort": [
				"Jan",
				"Feb",
				"Mär",
				"Apr",
				"Mai",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Okt",
				"Nov",
				"Dez"
			]
		},
		"es": {
			"daysLong": [
				"Domingo",
				"Lunes",
				"Martes",
				"Miércoles",
				"Jueves",
				"Viernes",
				"Sábado"
			],
			"daysShort": [
				"Dom",
				"Lun",
				"Mar",
				"Mié",
				"Jue",
				"Vie",
				"Sáb"
			],
			"monthsLong": [
				"Enero",
				"Febrero",
				"Marzo",
				"Abril",
				"Mayo",
				"Junio",
				"Julio",
				"Agosto",
				"Septiembre",
				"Octubre",
				"Noviembre",
				"Diciembre"
			],
			"monthsShort": [
				"Ene",
				"Feb",
				"Mar",
				"Abr",
				"May",
				"Jun",
				"Jul",
				"Ago",
				"Sep",
				"Oct",
				"Nov",
				"Dic"
			]
		},
		"fr": {
			"daysLong": [
				"Dimanche",
				"Lundi",
				"Mardi",
				"Mercredi",
				"Jeudi",
				"Vendredi",
				"Samedi"
			],
			"daysShort": [
				"Dim",
				"Lun",
				"Mar",
				"Mer",
				"Jeu",
				"Ven",
				"Sam"
			],
			"monthsLong": [
				"Janvier",
				"Février",
				"Mars",
				"Avril",
				"Mai",
				"Juin",
				"Juillet",
				"Août",
				"Septembre",
				"Octobre",
				"Novembre",
				"Décembre"
			],
			"monthsShort": [
				"Janv",
				"Févr",
				"Mars",
				"Avr",
				"Mai",
				"Juin",
				"Juil",
				"Août",
				"Sept",
				"Oct",
				"Nov",
				"Déc"
			]
		},
		"it": {
			"daysLong": [
				"Domenica",
				"Lunedi",
				"Martedì",
				"Mercoledì",
				"Giovedi",
				"Venerdì",
				"Sabato"
			],
			"daysShort": [
				"Dom",
				"Lun",
				"Mar",
				"Mer",
				"Gio",
				"Ven",
				"Sab"
			],
			"monthsLong": [
				"Gennaio",
				"Febbraio",
				"Marzo",
				"Aprile",
				"Maggio",
				"Giugno",
				"Luglio",
				"Agosto",
				"Settembre",
				"Ottobre",
				"Novembre",
				"Dicembre"
			],
			"monthsShort": [
				"Gen",
				"Feb",
				"Mar",
				"Apr",
				"Mag",
				"Giu",
				"Lug",
				"Ago",
				"Set",
				"Ott",
				"Nov",
				"Dic"
			]
		},
		"ja": {
			"daysLong": [
				"日",
				"月",
				"火",
				"水",
				"木",
				"金",
				"土"
			],
			"daysShort": [
				"日",
				"月",
				"火",
				"水",
				"木",
				"金",
				"土"
			],
			"monthsLong": [
				"1月",
				"2月",
				"3月",
				"4月",
				"5月",
				"6月",
				"7月",
				"8月",
				"9月",
				"10月",
				"11月",
				"12月"
			],
			"monthsShort": [
				"1月",
				"2月",
				"3月",
				"4月",
				"5月",
				"6月",
				"7月",
				"8月",
				"9月",
				"10月",
				"11月",
				"12月"
			]
		},
		"nl": {
			"daysLong": [
				"Zondag",
				"Maandag",
				"Dinsdag",
				"Woensdag",
				"Donderdag",
				"Vrijdag",
				"Zaterdag"
			],
			"daysShort": [
				"Zo",
				"Ma",
				"Di",
				"Wo",
				"Do",
				"Vr",
				"Za"
			],
			"monthsLong": [
				"Januari",
				"Februari",
				"Maart",
				"April",
				"Mei",
				"Juni",
				"Juli",
				"Augustus",
				"September",
				"Oktober",
				"November",
				"December"
			],
			"monthsShort": [
				"Jan",
				"Feb",
				"Mrt",
				"Apr",
				"Mei",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Okt",
				"Nov",
				"Dec"
			]
		},
		"pl": {
			"daysLong": [
				"niedziela",
				"poniedziałek",
				"wtorek",
				"środa",
				"czwartek",
				"piątek",
				"sobota"
			],
			"daysShort": [
				"niedz",
				"pon",
				"wt",
				"śr",
				"czw",
				"pt",
				"sob"
			],
			"monthsLong": [
				"styczeń",
				"luty",
				"marzec",
				"kwiecień",
				"maj",
				"czerwiec",
				"lipiec",
				"sierpień",
				"wrzesień",
				"październik",
				"listopad",
				"grudzień"
			],
			"monthsShort": [
				"sty",
				"lut",
				"mar",
				"kwi",
				"maj",
				"cze",
				"lip",
				"sie",
				"wrz",
				"paź",
				"lis",
				"gru"
			]
		},
		"pt": {
			"daysLong": [
				"Domingo",
				"Segunda-feira",
				"Terça-feira",
				"Quarta-feira",
				"Quinta-feira",
				"Sexta-feira",
				"Sábado"
			],
			"daysShort": [
				"Dom",
				"Seg",
				"Ter",
				"Qua",
				"Qui",
				"Sex",
				"Sáb"
			],
			"monthsLong": [
				"Janeiro",
				"Fevereiro",
				"Março",
				"Abril",
				"Maio",
				"Junho",
				"Julho",
				"Agosto",
				"Setembro",
				"Outubro",
				"Novembro",
				"Dezembro"
			],
			"monthsShort": [
				"Jan",
				"Fev",
				"Mar",
				"Abr",
				"Mai",
				"Jun",
				"Jul",
				"Ago",
				"Set",
				"Out",
				"Nov",
				"Dez"
			]
		},
		"ru": {
			"daysLong": [
				"воскресенье",
				"понедельник",
				"вторник",
				"среда",
				"четверг",
				"пятница",
				"суббота"
			],
			"daysShort": [
				"вс",
				"пн",
				"вт",
				"ср",
				"чт",
				"пт",
				"сб"
			],
			"monthsLong": [
				"Январь",
				"Февраль",
				"Март",
				"Апрель",
				"Май",
				"Июнь",
				"Июль",
				"Август",
				"Сентябрь",
				"Октябрь",
				"Ноябрь",
				"Декабрь"
			],
			"monthsShort": [
				"Янв",
				"Фев",
				"Мар",
				"Апр",
				"Май",
				"Июн",
				"Июл",
				"Авг",
				"Сент",
				"Окт",
				"Ноя",
				"Дек"
			]
		},
		"tr": {
			"daysLong": [
				"Pazar",
				"Pazartesi",
				"Salı",
				"Çarşamba",
				"Perşembe",
				"Cuma",
				"Cumartesi"
			],
			"daysShort": [
				"Paz",
				"Pzt",
				"Sal",
				"Çar",
				"Per",
				"Cum",
				"Cmt"
			],
			"monthsLong": [
				"Ocak",
				"Şubat",
				"Mart",
				"Nisan",
				"Mayıs",
				"Haziran",
				"Temmuz",
				"Ağustos",
				"Eylül",
				"Ekim",
				"Kasım",
				"Aralık"
			],
			"monthsShort": [
				"Oca",
				"Şub",
				"Mar",
				"Nis",
				"May",
				"Haz",
				"Tem",
				"Ağu",
				"Eyl",
				"Eki",
				"Kas",
				"Ara"
			]
		}
	};
	 
	var module = {
		/**
		 * Credit Missing e... Lifesaver!
		 */
		getTimestampFromTumblrsAnnoyingFormat: buildTimestamp,
		getLocale: getLocale,
		locale: locale
	};
	 
	 return module;
});