/* (c) Copyright Shaun Osborne 2015
licence: https://github.com/ITWrangler/sedgwickDataProcessors/blob/master/LICENSE
*/
var fs = require("fs");
var program = require('commander');

program.version('1.0.0')
.option('-f --filename [filename]', 'filename')
.parse(process.argv);

if(program.filename === undefined ){
	console.log('ERROR: no file specified');
	process.exit(1);
}

var data = fs.readFileSync(program.filename, 'utf8', function(err, data){
		if(err) {throw error;}
		return data;
	});

var esidxname = program.filename.split('-');

var jsondata = JSON.parse(data);
data='';
var idx = 0;

for(record in jsondata.records){
	console.log('{"index": {"_index":"sedgwick","_type":"'+esidxname[0]+'","_id":"'+record+'"}}');
	console.log(JSON.stringify(jsondata.records[record]));
}
