var p = new Promise(
	function(resolve, reject) {
		setTimeout(function() {
			resolve('result');
		}, 500);
	}
);

async function abc() {
	console.log(2);
	let result = await p;
	console.log(3);
	return '5';
}

(async function() {
	function* delayedFibonacci() {
		let [prev, curr] = [0, 1];
		while(1) {
			[prev, curr] = [curr, prev + curr];
			yield curr;
		}
	}

	for (let n of await delayedFibonacci()) {
		if (n > 1000) break;
		console.log(n);
	}


})();
