var fs = require("fs");
var program = require('commander');
var camelCase = require('camel-case');

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

var lineArr = data.trim().split("\n");

var record = null;
var field='';
var topfield='';
var subfield='';
var subsubfield='';
var ssfieldname='';
var ssvalue='';
var subvalue='';
var bracketvalue='';
var lastbracketvalue='';
var x=0;
var sx=0;
var debug = false;
var jsonsep = " ";

console.log('{ "records": [');
for(index in lineArr){
	if(lineArr[index].match(/\[new record\]/)){ /* write record we have and initialise to process the next record */
		if(record) console.log(JSON.stringify(record,null,jsonsep),',');
		record = {};
		field='';
		topfield='';
		subfield='';
	    subvalue='';
		bracketvalue='';
		x=0;
		sx=0;
	}
	if(values = lineArr[index].match(/\[new top field\] (.*) \:/gi)){
		topfield = camelCase(lineArr[index].split(':')[0].replace(/\[new top field\].§/g,'').trim());
		record[topfield] = {};
		subfield='';
		if(debug) console.log('topfield ', topfield);
		x=0;
	}
	if(values = lineArr[index].match(/\[new field\] (.*) \:/gi)){
		field = camelCase(lineArr[index].split(':')[0].replace(/\[new field\]/g,'').trim());
		if(topfield === ''){
		record[field] = lineArr[index].split(':')[1].trim();
		}else{
		record[topfield][field] = lineArr[index].split(':')[1].trim();
		}
	}
	if(values = lineArr[index].match(/\[new sub field\] (.*) \:/gi)){
		subfield = camelCase(lineArr[index].split(':')[0].replace(/\[new sub field\]/g,'').trim());
		subvalue = lineArr[index].split(':')[1].replace(/\[new sub field\]/g,'').trim();
		if(debug) console.log('new sub field: ', subfield, 'tf:', topfield);
		if(topfield === undefined){
			if(record[subfield] === undefined){
					sx=0;
					record[subfield]={};
					//record[subfield][sx] = {};
					}
				else
					{
						sx++;
						//record[subfield][sx] = {};
					}
		}
		else{
			if(record[topfield][subfield] === undefined){
					sx=0;
					record[topfield][subfield] = {};
					//record[topfield][subfield][sx] = {};
					}
				else
				{
					sx++;
					record[topfield][subfield][sx] = {};
				}
		}
		x=0;
	}
	if(values = lineArr[index].match(/\[new bracket value\] (.*)/gi)){
		bracketvalue = lineArr[index].replace(/\[new bracket value\]/g,'').trim();
		bracketvalue = bracketvalue.replace(/\‡/g,'').trim();
		bracketvalue = bracketvalue.replace(/\†/g,'').trim();
		/* fill in blanks in json herarchy if necessary */
		if(record[topfield] === undefined){
			topfield='_tf';
			record[topfield] = {};
		}
		if(record[topfield][subfield] === undefined){
			subfield='_subfield';
			sx=0;
			record[topfield][subfield] = [];
			}
		else
			{
			 sx++;
			}
	}
	if(bracketvalue.match(/.*:.*/g) && ! bracketvalue.match(/.*¢.*/g) && ! bracketvalue.match(/.*\~.*/g)) {
	    sepvalues = bracketvalue.split(':');
	    var sepfield = camelCase(sepvalues[0]);
	    if(sepvalues.length >= 2){
			record[topfield][subfield][sx] = sepfield+" : "+sepvalues[1].trim();
			if(sepvalues.length > 2){
			record[topfield][subfield][sx] = record[topfield][subfield][sx]+sepvalues[2].trim();
		    }
	    }
	    else{
	    	//if(debug) console.log('T:',topfield,' S:',subfield, 'LastBRV x BrV.length: ',lastbracketvalue, x, bracketvalue.length);
	    	sx--;
	    }
		
		//if(debug){console.log("BR[1] sepvalues.length sepfield record[topfield][subfield][sepfield] [",bracketvalue, "] ", sepvalues.length ,sepfield, record[topfield][subfield][sepfield],"\n");}

		
		lastbracketvalue = bracketvalue;
		bracketvalue ='';
	}
	else if(bracketvalue.match(/[a-zA-Z0-9].*/g))
	{
		if(debug){console.log("BR:",bracketvalue,"\n");}
		if(record[topfield] != undefined){
			if(record[topfield][subfield] != undefined){
				if(bracketvalue.match(/.*¢.*/g)){
          record[topfield][subfield][sx]=ProcessMultiFielded(topfield,bracketvalue);
				}
				else
				{
					record[topfield][subfield][sx] = bracketvalue;
				}
				lastbracketvalue = bracketvalue;
				bracketvalue='';
			}
		}
	}
	else {
		//console.log("else BR:",bracketvalue,"\n");
	}
	if(debug) console.log(index, sx);
	if(debug) console.log('T:',topfield,' S:',subfield, 'LastBRV x BrV.length: ',lastbracketvalue, x, bracketvalue.length);
}

console.log(JSON.stringify(record,null,jsonsep),']}');
/* end of main */


function ProcessMultiFielded (tf, input){
  var output={};
	var entries = input.split('¢');
	var stored ='';
	for(var entry in entries){
		//console.log(entries[entry],"\n");
		if(entries[entry].match(/^\.\.\/\.\./)){
			output[entry]=entries[entry];
			continue; /* drop into next for entry */
		}
	var values = entries[entry].split(/:/);
	if(values.length >= 2){
			if(values[0].trim(' ') === ''){
				var field = '_nofield';
			}
			else {
				var field = camelCase(values[0].trim(' '));
			}
			var value = entries[entry].replace(values[0].trim(' ')+' : ','').trim(' ');
			if(value == ''){
				stored = field;
			}
			else
			{
				/* this is the only field specific Sedgwick customisation in the code */
				if(tf === 'identificationType' && (field === 'author' || field === 'description' || field === 'vol')) // this deal specificcally will these fields in sequence for Identification Type->Bibliographic Reference
				{
					if(output[stored] === undefined){
					output[stored] = [];
				   }
					output[stored].push(entries[entry].trim(' '));
				}
				else if(output[field] != undefined)
				  {
				  	/* test if its an array */
				  	if(output[field].isArray){
				      	//	if(output[field].prop && output[field].prop.constructor === Array){
				  			//console.log('array', output[field], typeof output[field] );
				   		output[field].push(value);
				  	}
				  	else {
				  		  //console.log('not array',output[field], typeof output[field]);
				  		  var temp = output[field];
				  		  output[field] = [];
				   		  output[field].push(temp);
				   		  output[field].push(value);
				     }
				   }
				else {
				  output[field] = value;
			    }
			}
	    }
	    else{
		 	if(stored !== ''){
		 		if(output[stored] === undefined){
					output[stored] = [];
				   }
				output[stored].push(entries[entry].trim(' '));
			}
		else
		 {
	 		if(entries[entry].trim(' ') != ''){
		    if(output['_flushed'] === undefined){
			 	  output['_flushed'] = [];
	      }
	  	 	output['_flushed'].push(entries[entry].trim(' '));
  		}
		}
	}
}
 return output;
}
