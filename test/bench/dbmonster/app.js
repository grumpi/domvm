// naive implementation
function DBMon() {
	return function(vm, dbs) {
		return ["div",
			["table.table.table-striped.latest-data",
				["tbody",
					dbs.map(function(db) {
						return ["tr",
							["td.dbname", db.dbname],
							["td.query-count",
								["span", { class: db.lastSample.countClassName }, db.lastSample.nbQueries]
							],
							db.lastSample.topFiveQueries.map(function(query) {
								return ["td.Query", { class: query.elapsedClassName },
									["span", query.formatElapsed],
									[".popover.left",
										[".popover-content", query.query],
										[".arrow"],
									]
								];
							})
						];
					})
				]
			]
		];
	};
}

/*
// split sub-views implementation. uncomment the immutable
// opimizations inside the sub-views below for even more speed
function DBMon() {
	return function(vm, dbs) {
		return ["div",
			["table.table.table-striped.latest-data",
				["tbody",
					dbs.map(function(db) {
						return [DB, db, false]
					})
				]
			]
		];
	};
}

function DB() {
//	var lastMutationId = null;

	return function(vm, db) {
//		if (db.lastMutationId == lastMutationId)
//			return false;

//		lastMutationId = db.lastMutationId;

		return ["tr",
			["td.dbname", db.dbname],
			["td.query-count",
				["span", { class: db.lastSample.countClassName }, db.lastSample.nbQueries]
			],
			db.lastSample.topFiveQueries.map(function(query) {
				return [Query, query, false]
			}),
		];
	};
}

function Query() {
//	var oldQuery = null;

	return function(vm, query) {
//		if (oldQuery == query && oldQuery.elapsed == query.elapsed)
//			return false;

//		oldQuery = query;

		return ["td.Query", { class: query.elapsedClassName },
			["span", query.formatElapsed],
			[".popover.left",
				[".popover-content", query.query],
				[".arrow"],
			]
		];
	}
}
*/

var rAF;

function update(loop) {
	perfMonitor.startProfile('data update');
	var data = ENV.generateData().toArray();
	perfMonitor.endProfile('data update');

	perfMonitor.startProfile('view update');
	dbmon.update(data);
	perfMonitor.endProfile('view update');

	if (loop !== false)
		rAF = requestAnimationFrame(update);
}

function step() {
	var instr = new DOMInstr(true);
	instr.start(true);
	update(false);
	console.log(instr.end());
}

perfMonitor.startFPSMonitor();
perfMonitor.startMemMonitor();
perfMonitor.initProfiler('data update');
perfMonitor.initProfiler('view update');

var data = ENV.generateData().toArray();

var dbmon = domvm.view(DBMon, data, false);

dbmon.mount(document.getElementById("app"));

/*
// isomorphic test
var data = genData();

var vw0 = domvm.view(DBMon, data, false);
var html = domvm.html(vw0.node);
var appEl = document.getElementById("app");
appEl.innerHTML = html;

var dbmon = domvm.view(DBMon, data, false);
dbmon.attach(appEl.firstChild);
*/