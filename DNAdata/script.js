// import * as d3 from 'd3';
// import * as d3Chromatic from 'd3-scale-chromatic';

var width = 960 ;
var height = 700 ;
var radius = Math.min(width/1.25,height/1.25)/2 ;
var color = d3.scale.category20c();
// var color = d3.scale.cubehelix() ;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var canvas = d3.select(	"body").append("svg")
			.attr("class", "myCanvas")
    		.attr("width", width) 
    		.attr("height", height)
    		.append("g")
    		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// $("canvas").css({top: 200, left: 500, position:'absolute'});

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
  	if(d.children == null) {
  		if(d.chromosome != null && d.gene != null) {
    		return "<strong>Gene: </strong> <span style='color:red'>" + d.name + "</span>" + 
    		"<p></p>" + "<strong>Chromosome: </strong><span style='color:red'>" + d.chromosome + "</span>" ;
    	} else if (d.chromosome != null && d.gene == null) {
    		return "<strong>SNP: </strong> <span style='color:red'>" + d.name + "</span>" + 
    		"<p></p>" + "<strong>Chromosome: </strong><span style='color:red'>" + d.chromosome + "</span>" ;
    	} else if (d.chromosome == null && d.gene != null) {
    		return "<strong>Gene:</strong> <span style='color:red'>" + d.gene + "</span>";
    	}else {
    		// console.log(d.chromosome) ;
    		return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
    	}
	} else {
		if(d.gene == null && d.topic != null) {
			console.log("running") ;
			return "<strong>Category:</strong> <span style='color:red'>" + d.topic + "</span>";
		} else if (d.gene == null && d.dataViz != null) {
			return " <span style='color:white'>" + d.dataViz + "</span>";
		}else if (d.gene == null) {
			return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
		} else {
			// console.log("running") ;
			return "<strong>Gene:</strong> <span style='color:red'>" + d.gene + "</span>";
		}
	}
  })

canvas.call(tip) ;

 // var partition = d3.layout.partition()
 //    .sort(null)
 //    .size([2 * Math.PI, radius * radius])
 //    .value(function(d) { return 1; });

 var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

// var arc = d3.svg.arc()
//     .startAngle(function(d) { return d.x; })
//     .endAngle(function(d) { return d.x + d.dx; })
//     .innerRadius(function(d) { return Math.sqrt(d.y); })
//     .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

d3.json("../ex.json", function(root) {
	console.log(root) ;

   //  var path = canvas.datum(root).selectAll("path")
   //    			.data(partition.nodes)
   //  			.enter().append("path")
   //    			.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
   //    			.attr("d", arc)
   //    			.style("stroke", "#fff")
   //    			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
   //    			.style("fill-rule", "evenodd")
   //    			.each(stash);

  	// d3.selectAll("input").on("change", function change() {
   //  	var value = this.value === "count"
   //      	? function() { return 1; }
   //      	: function(d) { return d.size; };

   //  	path
   //      	.data(partition.value(value).nodes)
   //    	.transition()
   //      	.duration(1500)
   //      	.attrTween("d", arcTween);
   // 	});
   canvas.selectAll("path")
      .data(partition.nodes(root))
    .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .on("click", click)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
    // .append("title")
    // 		.style("font-size", "16px") 
    //  		.style("text-decoration", "underline") 
    //   		.text(function(d) { 
    //   			if(d.children == null) {
    //   				console.log("this ran") ;
    //   				return d.name + "\n" + "Chromosome " + formatNumber(d.chromosome); 
    //   			} else {
    //   				console.log("running") ;
    //   				return d.name ; 
    //   			}
    //   		})
}) ;

// function stash(d) {
//   d.x0 = d.x;
//   d.dx0 = d.dx;
//   // console.log("hi") ;
// }

// // Interpolate the arcs in data space.
// function arcTween(a) {
//   var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
//   return function(t) {
//     var b = i(t);
//     a.x0 = b.x;
//     a.dx0 = b.dx;
//     return arc(b);
//   };
// }

function click(d) {
  canvas.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}


d3.select(self.frameElement).style("height", height + "px");

console.log(d3) ;