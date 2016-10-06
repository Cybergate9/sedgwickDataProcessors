/*
(c) Copyright Shaun Osborne 2015/16
licence: https://github.com/ITWrangler/sedgwickDataProcessors/blob/master/LICENSE
*/
var fs = require("fs");
var program = require('commander');

program.version('1.0.0')
.option('-f --filename [filename]', 'filename')
.parse(process.argv);

if(program.filename === undefined){
	console.log('ERROR: no file specified');
	process.exit(1);
}
var data = fs.readFileSync(program.filename, 'utf8', function(err, data){
		if(err) {throw error;}
		return data;
	});

var lineArr = data.trim().split("\r\n");
var newvalue='';
var newbrvalue='';
var brvaluecollect = false;

for(index in lineArr){
	if(lineArr[index].match(/^§ Identification numbers : .*/)){ // new record - gotta flush everything first..

		if(newvalue.trim()){console.log('[newvalue]', newvalue);};
		newvalue = '';
		newbrvalue = '';
		brvaluecollect = false;
		console.log('[new record]');
		console.log('[new top field]',lineArr[index]);
	}
	else if(lineArr[index].match(/^[§a-zA-Z\s].* : $/) && brvaluecollect === false){
		if(newvalue.trim()){console.log('[newvalue]', newvalue);};
		newvalue = '';
		if(lineArr[index].match(/^§.* : $/)){
			console.log('[new top field]',lineArr[index]);
		}
		else if (lineArr[index].match(/^†.* : $/)){
			console.log('[new bracket subset]',lineArr[index]);
		}
		else{
			console.log('[new sub field]',lineArr[index]);
		}
	}
	else if(lineArr[index].match(/.*‡$/) != null || lineArr[index].match(/^†.*/) != null){
		if(lineArr[index].match(/^†.*/) != null){ // if we're starting
			var newbrvalue = lineArr[index]
			brvaluecollect = true;
		}
		if(lineArr[index].match(/.*‡$/) != null){
			if(lineArr[index].match(/^†.*/) === null){ // if we're starting and ending, dont store value second time
				 newbrvalue = newbrvalue + " ¢ " + lineArr[index];
			}
			 console.log('[new bracket value]',newbrvalue);
			 brvaluecollect = false;
			}
	}
	else if(lineArr[index].match(/.*‡$/) != null){
		newvalue = newvalue + lineArr[index];
		console.log('[new bracket value]',newvalue);
	}
	else
	{

		    if(brvaluecollect && lineArr[index]!= ''){
		    		newbrvalue = newbrvalue + " ¢ " + lineArr[index];
		    }else{
		    	    if(lineArr[index].match(/^.*:.*$/g)){
		    	    	console.log('[new field]', lineArr[index]);
		    	     }
						  else {
				        newvalue = newvalue + ' ' + lineArr[index];
				       }
		    }
 	}
}
/* end of main */
