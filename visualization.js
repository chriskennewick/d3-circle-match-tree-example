/* Wimbledon 2012 - Match Tree */
/* Copyright 2013 Peter Cook (@prcweb); Licensed MIT */

var radius = 350,
	numRounds = 4,
	segmentWidth = radius / (numRounds + 1);

var partition = d3.layout.partition()
	.sort(null)
	.size([2 * Math.PI, radius]) // x maps to angle, y to radius
.value(function(d) {
	return 1;
}); //Important!

var arc = d3.svg.arc()
	.startAngle(function(d) {
		return d.x;
	})
	.endAngle(function(d) {
		return d.x + d.dx;
	})
	.innerRadius(function(d) {
		return d.y;
	})
	.outerRadius(function(d) {
		return d.y + d.dy;
	});

function translateSVG(x, y) {
	return 'translate(' + x + ',' + y + ')';
}

function rotateSVG(a, x, y) {
	a = a * 180 / Math.PI;
	return 'rotate(' + a + ')';
	return 'rotate(' + a + ',' + x + ',' + y + ')';
}

function arcSVG(mx0, my0, rx, ry, xrot, larc, sweep, mx1, my1) {
	return 'M' + mx0 + ',' + my0 + ' A' + rx + ',' + ry + ' ' + xrot + ' ' + larc + ',' + sweep + ' ' + mx1 + ',' + my1;
}

var label = function(d) {
	if (d.x === 0 && d.y === 0)
		return '';
	var t = rotateSVG(d.x + 0.5 * d.dx - Math.PI * 0.5, 0, 0);
	t += translateSVG(d.y + 0.5 * d.dy, 0);
	t += d.x >= Math.PI ? rotateSVG(Math.PI) : '';
	return t;
}

	function surname(d) {
		return d.name.split(' ')[0];
	}

	function fullname(d) {
		return d.name;
	}

	function result(d) {
		var m = d.match;
		var res = '';
		if (m !== undefined) {
			for (var i = 1; i <= 5; i++) {
				if (m['w' + i] !== 0 && m['l' + i] !== 0 && m['w' + i] !== undefined && m['l' + i] !== undefined)
					res += m['w' + i] + '-' + m['l' + i] + ' ';
			}
		}
		return res;
	}

	function playerHover(d) {
		var c = surname(d);
		d3.selectAll('g#player-labels text')
			.style('fill', 'white');

		// Highlight this player + children
		d3.select('g#player-labels text.' + c + '.round-' + d.round)
			.style('fill', 'yellow');

		if (d.round != 1) {
			c = surname(d.children[0]);
			d3.select('g#player-labels text.' + c + '.round-' + +(d.round - 1))
				.style('fill', 'yellow');

			c = surname(d.children[1]);
			d3.select('g#player-labels text.' + c + '.round-' + +(d.round - 1))
				.style('fill', 'yellow');
		}

		// var l = surname(d.children[1]);
		// d3.selectAll('g#player-labels text.'+l)
		//   .style('fill', 'gray');


		var m = d.match;
		if (m !== undefined) {
			d3.select('#result').text('The ' + fullname(d.children[0]) + ' beat The ' + fullname(d.children[1]));
			d3.select('#score').text(result(d));
		}
	}

var xCenter = radius,
	yCenter = radius;
var svg = d3.select('svg').append('g').attr('transform', translateSVG(xCenter, yCenter));

d3.json('data/2013nflplayoffs.json', function(err, root) {
	// console.log(root);
	var chart = svg.append('g');
	chart.datum(root).selectAll('g')
		.data(partition.nodes)
		.enter()
		.append('g');

	// We use three groups: segments, round labels & player labels. This is to achieve a layering effect.

	// Segments
	chart.selectAll('g')
		.append('path')
		.attr('d', arc)
		.on('mouseover', playerHover);

	// Round labels
	var rounds = ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'];
	var roundLabels = svg.append('g').attr('id', 'round-labels');
	roundLabels.selectAll('path')
		.data(rounds)
		.enter()
		.append('path')
		.attr('d', function(d, i) {
			var offset = (numRounds - i + 0.5) * segmentWidth - 10;
			return arcSVG(-offset, 0, offset, offset, 0, 1, 1, offset, 0);
		})
		.style({
			'fill': 'none',
			'stroke': 'none'
		})
		.attr('id', function(d, i) {
			return 'round-label-' + +(i + 1);
		});

	roundLabels.selectAll('text')
		.data(rounds)
		.enter()
		.append('text')
		.append('textPath')
		.attr('xlink:href', function(d, i) {
			return '#round-label-' + +(i + 1);
		})
		.attr('startOffset', '50%')
		.text(function(d) {
			return d;
		});


	// Player labels
	var playerLabels = svg.append('g').attr('id', 'player-labels');
	playerLabels.datum(root).selectAll('g')
		.data(partition.nodes)
		.enter()
		.append('text')
		.text(function(d, i) {
			return i === 0 ? surname(d) : d.name.slice(0, 3);
		})
		.attr('transform', label)
		.attr('dy', '0.4em')
		.attr('class', function(d) {
			return surname(d) + ' round-' + +(d.round);
		});

});