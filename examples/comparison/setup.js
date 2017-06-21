// Install Plugin
Vue.use(VueBackbone, { proxies: false });

// Handy trick to modify the options - not intended for general use
function toggleProxies(setting) {
	VueBackbone.install({ mixin: function() {} }, { proxies: setting });
}

var $msgs, iterations = 20, timings = {}, currentMark = 0;

function addMsg(msg) {
	$msgs.append("<h5>" + msg + "</h5>");
}

// Returns a function that updates msg status and returns a new Promise
// Note: setTimeout use, to allow for the UI to update
function addTask(task) {
	return function() {
		return new Promise(function(resolve) {
			addMsg(task + "...");
			setTimeout(resolve);
		});
	};
}

// Update msg status before resolving promise
// Note: setTimeout use, to allow for the UI to update
function completeTask(resolve) {
	$msgs.children().last().append("Complete");
	setTimeout(resolve);
}

// Preset all the timings to zero for the actions and cycles
function initTimings(actions, cycles) {
	actions.forEach(function(action) {
		timings[action] = {};
		cycles.forEach(function(cycle) {
			timings[action][cycle] = [0,0,0];
		});
	});
}

// Convience for measuring mark to mark
function mark(action) {
	if (!action) {
		currentMark = 0;
		window.performance.mark("checkpoint" + currentMark);
	}
	else {
		currentMark++;
		window.performance.mark("checkpoint" + currentMark);
		window.performance.measure(action, "checkpoint" + (currentMark - 1), "checkpoint" + currentMark);
	}
}

// Take in a single test run function and key for this run, then
// it executes that single run for all the iterations required, then
// at the end it moves the performance measures into the "timings" variable
// that was previously initialized.
function cycle(singleRun, key) {
	return function() {
		window.performance.clearMeasures();

		var promise = new Promise(singleRun);
		for (var i = 1; i < iterations; i++) {
			promise = promise.then(function() {
				return new Promise(singleRun);
			});
		}

		return promise.then(function() {
			return new Promise(function(resolve) {
				window.performance.getEntriesByType("measure").forEach(function(item) {
					var t = timings[item.name][key];
					t[0] += item.duration;
					t[1] = t[1] ? Math.min(t[1], item.duration) : item.duration;
					t[2] = t[2] ? Math.max(t[2], item.duration) : item.duration;
				});

				completeTask(resolve);
			});
		});
	};
}

// Take the "timings" results and add them to the table.
function populateResults() {
	var $table = $("table");
	Object.keys(timings).forEach(function(key) {
		var $row = $("<tr></tr>").appendTo($table);
		$row.append("<td>" + key + "</td>");
		Object.keys(timings[key]).forEach(function(cycle) {
			var nums = timings[key][cycle],
				avg = Math.floor(nums[0] / iterations * 10) / 10,
				min = Math.floor(nums[1] * 10) / 10,
				max = Math.floor(nums[2] * 10) / 10;

			if ((avg + min + max) === 0) {
				$row.append('<td class="fail" colspan="3">X</td>');
			}
			else {
				$row.append('<td class="avg">' + avg + "</td><td>" + min + "</td><td>" + max + "</td>");
			}
		});
	});
}

window.addEventListener("load", function() {
	$msgs = $("#msgs");
	addMsg("Page loaded.");
});
