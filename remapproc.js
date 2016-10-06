/*
(c) Copyright Shaun Osborne 2015/16
licence: https://github.com/ITWrangler/sedgwickDataProcessors/blob/master/LICENSE
*/
var fs = require("fs");
var program = require('commander');
var camelCase = require('camel-case');
//var filename = "type-utf8.txt";

program.version('1.0.0')
.option('-f --filename [filename]', 'filename')
.parse(process.argv);


var data = fs.readFileSync(program.filename, "utf8");

var jsondata = JSON.parse(data);
data='';

//console.log(jsondata);
console.log('{"records":[');
for(record in jsondata.records){

/* now process/remap the rest */
/*	if(jsondata.records[record]['physicalDescription']['measurements'] != undefined){
	  jsondata.records[record]['physicalDescription']['measurements'] = remapNumberedSubfields(jsondata.records[record]['physicalDescription']['measurements']);
    }*/
/*    if(jsondata.records[record]['identificationNumbers']['otherNumber'] != undefined){
	  jsondata.records[record]['identificationNumbers']['otherNumber'] = remapNumberedSubfields(jsondata.records[record]['identificationNumbers']['otherNumber']);
    }*/
/*    if(jsondata.records[record]['collectionRecord']['coordinates'] != undefined){
	  jsondata.records[record]['collectionRecord']['coordinates'] = remapNumberedSubfields(jsondata.records[record]['collectionRecord']['coordinates']);
    }*/
 /*   if(jsondata.records[record]['collectionRecord']['collectionDate'] != undefined){
	  jsondata.records[record]['collectionRecord']['collectionDate'] = remapNumberedSubfields(jsondata.records[record]['collectionRecord']['collectionDate']);
    }
*/
    if(jsondata.records[record]['geologicalDating'] != undefined){
	  jsondata.records[record]['geologicalDating'] = remapGeologicalDating(jsondata.records[record]['geologicalDating'],true);
    }
  if(jsondata.records[record]['collectionRecord'] != undefined && jsondata.records[record]['collectionRecord']['locality'] != undefined){
		jsondata.records[record]['collectionRecord']['locality'] = remapLocality(jsondata.records[record]['collectionRecord']['locality']);
  	}
	if(jsondata.records[record]['comments'] != undefined){
		jsondata.records[record]['comments'] = remapComments(jsondata.records[record]['comments']);
		}
	if(jsondata.records[record]['historicalAssociations'] != undefined){
		jsondata.records[record]['historicalAssociations'] = jsondata.records[record]['historicalAssociations']['_subfield'];
		}
	if(jsondata.records[record]['identificationType'] != undefined){
		jsondata.records[record]['identificationType'] = remapIdentification(jsondata.records[record]['identificationType']['_subfield']);
		}
	if(jsondata.records[record]['photography'] != undefined){
		jsondata.records[record]['photography'] = jsondata.records[record]['photography']['_subfield'];
		}
	if(jsondata.records[record]['bibliography'] != undefined){
		jsondata.records[record]['bibliography'] = remapBibliography(jsondata.records[record]['bibliography']);
		}
	if(jsondata.records[record]['archives'] != undefined){
		jsondata.records[record]['archives'] = jsondata.records[record]['archives']['_subfield'];
		}

	/* create summary fields */
		jsondata.records[record]['summaryFields']={};

  /* these get done for all records */
	if(jsondata.records[record]['identificationNumbers'].objectNumber){
		jsondata.records[record]['summaryFields'].objectNumber=jsondata.records[record]['identificationNumbers'].objectNumber;
	 }
	if(jsondata.records[record]['department'] !== undefined){
			 jsondata.records[record]['summaryFields'].department=jsondata.records[record]['department'].department;
		}
  /* now do object specific ones */
	summary = getObjectSummaryData(jsondata.records[record]);
	jsondata.records[record]['summaryFields']['objectType'] = summary.objectType;
  jsondata.records[record]['summaryFields']['formalName'] = summary.formalName;
  jsondata.records[record]['summaryFields']['simpleName'] = summary.simpleName;
	jsondata.records[record]['summaryFields']['otherNames'] =
	getObjectSummaryOtherNames(jsondata.records[record]);
	jsondata.records[record]['summaryFields']['locality'] =
	getObjectSummaryLocality(jsondata.records[record]);
	/* pretty print version */
	console.log(JSON.stringify(jsondata.records[record],null,"\t"));
	//console.log(JSON.stringify(jsondata.records[record]));
	if(record < jsondata.records.length-1){
		console.log(',');
	}
} /* end of for records */
console.log(']}');


/* end of main */

function getObjectSummaryLocality(indata){
var result;
	if(indata['collectionRecord'] !== undefined)
		{
			if(indata['collectionRecord']['locality'])
			{
				 //console.log(JSON.stringify(indata.records[record]['collectionRecord']['locality']));
				if(indata['collectionRecord']['locality'][0]['terms'] !== undefined)
					{
					 termcount = indata['collectionRecord']['locality'][0]['terms'].length-1;
					 result=
					 indata['collectionRecord']['locality'][0]['terms'][termcount].value;

					 if(indata['collectionRecord']['locality'][0]['terms'][termcount-1] != undefined){
						result = result + ', ' +
						indata['collectionRecord']['locality'][0]['terms'][termcount-1].value;
					 }
						if(indata['collectionRecord']['locality'][0]['terms'][termcount-2] != undefined){
							result=result + ', ' +
							indata['collectionRecord']['locality'][0]['terms'][termcount-2].value;
						}
				 }
			}
		}
return result;

}

function getObjectSummaryOtherNames(indata){
	var result={};
	if(indata['identificationType'] === undefined || indata['identificationType'][0] === undefined){
		return 'unknown other names (no identificationType[0])';
	}
	if(indata['identificationType'][0]['scientificName'] !== undefined) /* fossil */
		{
			result.scientificName = indata['identificationType'][0]['scientificName'].name;
		}
	if(indata['identificationType'][0]['meteorites'] !== undefined)
	  {
			/* sometimes meteorites is an array */
 		 if(indata['identificationType'][0]['meteorites'][0] != undefined){
			 result.meteorites=getLastTerm(indata['identificationType'][0]['meteorites'][0]);
		 }
		 else{
			 result.meteorites=getLastTerm(indata['identificationType'][0]['meteorites']);
		 }
		}
	if(indata['identificationType'][0]['petrology'] !== undefined)
	  {
		 result.petrology=getLastTerm(indata['identificationType'][0]['petrology']);
	  }
	if(indata['identificationType'][0]['mineral'] !== undefined)
		  {
			 result.mineral=getLastTerm(indata['identificationType'][0]['mineral']);
		  }
return result;
}


function getObjectSummaryData(indata){
var result={};
//console.log("\n\nin: ",JSON.stringify(indata['identificationType'][0]));
if(indata['identificationType'] === undefined || indata['identificationType'][0] === undefined){
	return 'unknown type (no identificationType[0])';
}
	if(indata['identificationType'][0]['scientificName'] !== undefined) /* fossil */
	  {
		result.objectType='fossil';
		result.formalName=indata['identificationType'][0]['scientificName'].name;
		result.simpleName = indata['identificationType'][0]['taxonomyType'];
	  }
	else if(indata['identificationType'][0]['meteorites'] !== undefined) /*meteorite */
	 {
		 /* sometimes meteorites is an array */
		 if(indata['identificationType'][0]['meteorites'][0] != undefined){
			 result.objectType='meteorite';
			 result.formalName=getLastTerm(indata['identificationType'][0]['meteorites'][0]);
			 result.formalName=result.formalName+', '+getLastTerm(indata['identificationType'][0]['meteorites'][0],1);
			 result.simpleName=getFirstTerm(indata['identificationType'][0]['meteorites'][0]);
		 }
		 else{
			 result.objectType='meteorite';
			 result.formalName=getLastTerm(indata['identificationType'][0]['meteorites']);
			 result.formalName=result.formalName+', '+getLastTerm(indata['identificationType'][0]['meteorites'],1);
			 result.simpleName=getFirstTerm(indata['identificationType'][0]['meteorites']);
		 }
	 }
	 else if(indata['identificationType'][0]['petrology'] !== undefined) /* rock */
	  {
			result.objectType='rock';
			result.formalName=getLastTerm(indata['identificationType'][0]['petrology']);
			result.simpleName=getFirstTerm(indata['identificationType'][0]['petrology']);
		}
	else if(indata['identificationType'][0]['mineral'] !== undefined)
	  {
			result.objectType='mineral';
			result.formalName=getLastTerm(indata['identificationType'][0]['mineral']);
			result.simpleName=getFirstTerm(indata['identificationType'][0]['mineral']);
		}
  else /* all others */
	  {
			result.objectType='unknown';
		}
/* fill in the blanks */
if(result.formalName === undefined){result.formalName = 'undef'}
if(result.simpleName === undefined){result.simpleName = 'undef'}
//console.log("\n\nres: ",JSON.stringify(result));
return result;
}

function doMeteoriteSummaryFields(indata){
	if(indata.records[record]['identificationType'][0]['meteorites'] !== undefined){
		if(indata.records[record]['identificationType'][0]['meteorites'][0] != undefined){
			indata.records[record]['summaryFields'].formalName
			=getLastTerm(indata.records[record]['identificationType'][0]['meteorites'][0]);
			indata.records[record]['summaryFields']['simpleNames']['meteorite']
			=getFirstTerm(indata.records[record]['identificationType'][0]['meteorites'][0]);
		}
		else{
		indata.records[record]['summaryFields'].formalName
		=getLastTerm(indata.records[record]['identificationType'][0]['meteorites'])
		+ ", " + getLastTerm(indata.records[record]['identificationType'][0]['meteorites'],1);
		indata.records[record]['summaryFields']['simpleNames']['meteorite']
		=getFirstTerm(indata.records[record]['identificationType'][0]['meteorites']);
	  }
	 }

	return indata;
}


function getLastTerm(interms,offset){
	if(offset === undefined){
		offset = 0;
	}
	if(interms['terms'] === undefined){
		return "getLastTerm: no terms";
	}
	termcount = interms['terms'].length-1;
	if(termcount > 0){
		if(interms['terms'][termcount-offset].value !== undefined){
		 return interms['terms'][termcount-offset].value;
	 }
	}
	else {
		return "getLastTerm: undefined";
	}
 return "getLastTerm: undefined"
}
function getFirstTerm(interms,offset){
	//console.log("interms: ",JSON.stringify(interms));
	if(interms['terms'] === undefined){
		return "getFirstTerm: no terms";
	}
	termcount = interms['terms'].length-1;
	if(termcount >= 0){
		return interms['terms'][0].value;
	}
	else {
		return "no term value";
	}
}

function doPaleoSummaryFields(indata){
	if(indata.records[record]['identificationType'][0]['scientificName'] !== undefined){
		indata.records[record]['summaryFields'].formalName=indata.records[record]['identificationType'][0]['scientificName'].name;
	 }

	if(indata.records[record]['identificationType'][0]['taxonomicHierarchy'] !== undefined){
		indata.records[record]['summaryFields']['simpleNames']['taxonomicHierarchy']
		  =getLastTerm(indata.records[record]['identificationType'][0]['taxonomicHierarchy']);
		}
	if(indata.records[record]['identificationType'][0]['anatomicDetails'] !== undefined)
				{
					if(indata.records[record]['identificationType'][0]['anatomicDetails']['terms'] != undefined)
					{
					 indata.records[record]['summaryFields']['simpleNames']['anatomicDetails']
					 =getLastTerm(indata.records[record]['identificationType'][0]['anatomicDetails']);
					 }
				}
	if(indata.records[record]['identificationType'][0]['developmentalStage'] !== undefined)
		{
			 indata.records[record]['summaryFields']['simpleNames']['developmentalStage']
			 =getLastTerm(indata.records[record]['identificationType'][0]['developmentalStage']);
		}

	if(indata.records[record]['geologicalDating'] !== undefined)
		{
			if(indata.records[record]['geologicalDating']['chronostratigraphy'] !== undefined)
				{
			 indata.records[record]['summaryFields']['simpleNames']['geologicalDating']
			 =getLastTerm(indata.records[record]['geologicalDating']['chronostratigraphy']);
		 }
		}
	if(indata.records[record]['geologicalDating'] !== undefined)
			{
				if(indata.records[record]['geologicalDating']['lithostratigraphy'] !== undefined)
					{
				 	 indata.records[record]['summaryFields']['simpleNames']['lithostratigraphy']
					 =getLastTerm(indata.records[record]['geologicalDating']['lithostratigraphy']);
			 }
			}
			if(indata.records[record]['collectionRecord'] !== undefined)
				{
					if(indata.records[record]['collectionRecord']['locality'])
					{
						 //console.log(JSON.stringify(indata.records[record]['collectionRecord']['locality']));
						if(indata.records[record]['collectionRecord']['locality'][0]['terms'] !== undefined)
							{
							 termcount = indata.records[record]['collectionRecord']['locality'][0]['terms'].length-1;
							 indata.records[record]['summaryFields'].locality=
							 indata.records[record]['collectionRecord']['locality'][0]['terms'][termcount].value;

							 if(indata.records[record]['collectionRecord']['locality'][0]['terms'][termcount-1] != undefined){
								indata.records[record]['summaryFields'].locality=indata.records[record]['summaryFields'].locality + ', ' +
								indata.records[record]['collectionRecord']['locality'][0]['terms'][termcount-1].value;
							 }
								if(indata.records[record]['collectionRecord']['locality'][0]['terms'][termcount-2] != undefined){
									indata.records[record]['summaryFields'].locality=indata.records[record]['summaryFields'].locality + ', ' +
									indata.records[record]['collectionRecord']['locality'][0]['terms'][termcount-2].value;
								}
						 }
					}
				}

  return indata;
}
function remapIdentBiblio(biblio,author){
 //console.log("called"+JSON.stringify(author));
 //console.log(JSON.stringify(biblio));
 auth=[];
 if(Array.isArray(author)){
 for(idxa in author){
	  if(Array.isArray(author[idxa])){
			for(idxa2 in author[idxa]){
				auth.push(author[idxa][idxa2]);
			}
		}
		else {
			auth.push(author[idxa]);
		}
		}
	}
	else {
		auth.push(author);
	}
	bib=[]
	for(idxa in biblio){
		if(biblio[idxa].indexOf('Description') != -1)
		{
			//console.log("matched:"+biblio[idxa])
			bib.push(biblio[idxa]);
			cl = bib.length-1;
		}
		else {
			bib[cl]=bib[cl]+" "+biblio[idxa];
		}
	}
  //console.log("auth:"+JSON.stringify(auth));
	//console.log("bib:"+JSON.stringify(bib));
	retobj=[];
  for(idxa in auth){
		retobj[idxa]={};
		retobj[idxa]['author'] = auth[idxa];
		retobj[idxa]['description'] = bib[idxa].replace('Description : ','');
	}
		//console.log("retobj:"+JSON.stringify(retobj));
return retobj;
}

function remapIdentification(obj){
	var retobj = {};
	for (idx in obj){
		retobj[idx] = obj[idx];
		if(obj[idx]['scientificName'] != undefined){
			//console.log("\n'' : "+obj[idx]['']);
			if(obj[idx][''] != undefined){
				nvalue = obj[idx][''].toString();
				cvalues = nvalue.split(':');
			}
			else {
				cvalues=["author","n/a"];
			}
				retobj[idx]['scientifName']={};
				retobj[idx]['scientifName']['name']=obj[idx]['scientificName'];
				retobj[idx]['scientifName']['author'] = cvalues[1].trim();
				delete retobj[idx][''];
				retobj[idx]['scientificName'] = retobj[idx]['scientifName'];
				delete retobj[idx]['scientifName'];
			}

		if(obj[idx]['taxonomy'] != undefined){
			retobj[idx]['taxonomy'] = processForwardTree(obj[idx]['taxonomy'],true);
			}
		if(obj[idx]['artefact'] != undefined){
				//retobj[idx]['artefact'] = processReverseTree(obj[idx]['artefact']);
				retobj[idx]['artefact'] = obj[idx]['artefact'];

				}
		if(obj[idx]['bibliographicReference'] != undefined){
			retobj[idx]['bibliographicReference'] = remapIdentBiblio(obj[idx]['bibliographicReference'],obj[idx]['searchKey']);
			delete(retobj[idx]['searchKey']); // if all has gone well searchKey (author) is now in bib refs
		  }

		if(obj[idx]['specimenStatus'] != undefined){
			  //retobj[idx]['specimenStatus']=[];
				//console.log("\nSSc :" + JSON.stringify(obj[idx]['specimenStatus']));
			  for(sidx in obj[idx]['specimenStatus']){
					//console.log("\nSS :" + obj[idx]['specimenStatus'][sidx]);
					retobj[idx]['specimenStatus'][sidx]=processForwardTree(obj[idx]['specimenStatus'][sidx],true);
			   }
				}
		if(obj[idx]['taxonomicHierarchy'] != undefined){
			retobj[idx]['taxonomicHierarchy'] = processReverseTree(obj[idx]['taxonomicHierarchy'],true);
			}
		if(obj[idx]['developmentalStage'] != undefined){
				retobj[idx]['developmentalStage'] = processReverseTree(obj[idx]['developmentalStage'],true);
			}
		if(obj[idx]['petrology'] != undefined){
			if(obj[idx]['petrology'].length > 1 && typeof obj[idx]['petrology'] != 'string'){
				for(var entry = 0; entry < obj[idx]['petrology'].length; ++entry)
				{
					if(obj[idx]['petrology'][entry].length > 1 && typeof obj[idx]['petrology'][entry] != 'string'){
						for(entry2 in obj[idx]['petrology'][entry])
							{
								retobj[idx]['petrology'][entry][entry2] = processReverseTree(obj[idx]['petrology'][entry][entry2],true);
							}
					}
					else
					{
					retobj[idx]['petrology'][entry] = processReverseTree(obj[idx]['petrology'][entry],true);
					}
				}
			}
			else
			{
			retobj[idx]['petrology'] = processReverseTree(obj[idx]['petrology'],true);
			}
		}
		if(obj[idx]['meteorites'] != undefined){
			if(obj[idx]['meteorites'].length > 1 && typeof obj[idx]['meteorites'] != 'string')
			{
				//console.log("array?\n");
				for(var entry = 0; entry < obj[idx]['meteorites'].length; ++entry)
				 {
					retobj[idx]['meteorites'][entry] = processReverseTree(obj[idx]['meteorites'][entry],true);
					}
			}
			else
			{
			retobj[idx]['meteorites'] = processReverseTree(obj[idx]['meteorites'],true);
			}
		}
		//console.log("meteorites: ",JSON.stringify(retobj[idx]['meteorites']));
		if(obj[idx]['anatomicDetails'] != undefined){
			if(obj[idx]['anatomicDetails'].length > 1 && typeof obj[idx]['anatomicDetails'] != 'string'){
				for(var entry = 0; entry < obj[idx]['anatomicDetails'].length; ++entry)
				{
					if(obj[idx]['anatomicDetails'][entry].length > 1 && typeof obj[idx]['anatomicDetails'][entry] != 'string'){
						for(entry2 in obj[idx]['anatomicDetails'][entry])
							{
								retobj[idx]['anatomicDetails'][entry][entry2] = processReverseTree(obj[idx]['anatomicDetails'][entry][entry2],true);
							}
					}
					else
					{
					retobj[idx]['anatomicDetails'][entry] = processReverseTree(obj[idx]['anatomicDetails'][entry],true);
					}
				}
			}
			else
			{
			retobj[idx]['anatomicDetails'] = processReverseTree(obj[idx]['anatomicDetails'],true);
			}

		}
  if(obj[idx]['_flushed'] != undefined){
		if(obj[idx]['notes'] != undefined){
			retobj[idx]['notes'] = obj[idx]['notes']+' '+obj[idx]['_flushed'];
			delete retobj[idx]['_flushed'];
		}
	}
	}

	/* remove idx's into a clean unnumbered array */
	var retobj2 = [];

	for(idx in retobj){
	 retobj2.push(retobj[idx]);
	}
	return retobj2;
}



function remapNumberedSubfields(obj){
	//console.log(obj);
	var retobj={};
	for(entry in obj){
		//console.log(obj[entry]);
		sepvalues = obj[entry].split(':');
		if(sepvalues.length >= 2){
			retobj[sepvalues[0]] = sepvalues[1].trim();
		}

	}
			//console.log(retobj);
  return retobj;
}

function remapComments(obj){
	//console.log(obj);
	var retobj=[];
	for(entry in obj._subfield){
		for(prop in obj._subfield[entry]){
				if(prop === '_flushed'){ // the only two things we know in comments, flush anything else out
					//retobj.push(obj._subfield[entry]);
					retobj.push(obj._subfield[entry][prop][0]);
			}
			else{
				retobj.push(obj._subfield[entry][prop]);
			}

		}
	}

  return retobj;
}

function remapBibliography(obj){
	//console.log(obj);
	var retobj=[];
	for(entry in obj._subfield){
		retobj.push(obj._subfield[entry]);
		if(retobj[entry]._flushed != undefined){
			for(value in retobj[entry]._flushed){
				//console.log(value);
				retobj[entry].description = retobj[entry].description + ' ' + retobj[entry]._flushed[value];
			}
			delete retobj[entry]._flushed;
		}
			/* rename searchKey to author */
			retobj[entry]['author']=retobj[entry]['searchKey'];
			delete retobj[entry]['searchKey'];
	}

  return retobj;
}

function remapGeologicalDating(obj,reverse){
	var retobj={};
	var revised = 0;
	retobj[revised]={};
	//console.log(obj);
	for(entry in obj._subfield){
		//console.log(obj._subfield[entry]);
		values = obj._subfield[entry].split(':');
		if(values.length >= 2){

			field = camelCase(values[0].trim());
			value = values[1].trim();
			//console.log("field value: ", field, value);
			if(field === 'revisedStratigraphicDetermination'){
			   revised = Number(value);
			   retobj[revised]={};
			}

			if(retobj[revised][field] === undefined){
				//console.log('if');
				if(field != 'revisedStratigraphicDetermination'){
					retobj[revised][field] = processReverseTree(value,reverse);
				}
			}
			else {
				//console.log('else');
					//console.log(retobj[field]);
				if(field != 'revisedStratigraphicDetermination'){
				    if(retobj[revised][field].orig != undefined){
					if(retobj[revised][field].orig.length <= value.length){
						retobj[revised][field] = processReverseTree(value,reverse);
						}
					}
				}
		    }

		}
	}
	//console.log(retobj);
	return retobj;
}



function remapLocality(obj){
	retobj={};
  //console.log(JSON.stringify(retobj));
 for(idx in obj){
	  //console.log("o(i): "+JSON.stringify(obj[idx])+"["+Object.prototype.toString(obj[idx])+"]["+obj[idx].length+"]");
		if(obj[idx][0] !== '.'){
        for(entry in obj[idx]){
					if(retobj[idx] === undefined){retobj[idx]={};}
					if(entry === '0'){
						//console.log("o(e=.): "+JSON.stringify(obj[idx][entry])+"["+Object.prototype.toString(obj[idx])+"]["+obj[idx].length+"]");

					   retobj[idx]=processForwardTree(obj[idx]['0'],true);
				  }
	        else{
						//console.log("o(e!=.): "+obj[idx][entry]+"["+entry+"]["+obj[idx][entry].length+"]");

						retobj[idx][entry]=obj[idx][entry];
					}
			 }
		}
		else {
					retobj[idx] = processForwardTree(obj[idx],true);
		}
 }

 keys=Object.keys(retobj);
 dels=[];
 //console.log("length:"+keys.length);
 //console.log("retobj:"+JSON.stringify(retobj));
 for (x=1; x <=keys.length-1; x++ ){
	 px=x-1;
	 //console.log("\nx:"+x+" px:"+px);
     //console.log("\no(x):"+JSON.stringify(retobj[keys[x]]));
	 if(retobj[keys[x]]["orig"] !== undefined){
		 cur=retobj[keys[x]]["orig"].replace(/\s+/g,"");
		 prev=retobj[keys[px]]["orig"].replace(/\s+/g,"");
         //console.log("\nprev n(x):"+JSON.stringify(prev));
         //console.log("\ncur  n(x):"+JSON.stringify(cur));
		 //console.log("io:"+cur.indexOf(prev));
		 if(cur.indexOf(prev) !== -1){
			 //console.log("matched: "+x +"del:" + x+"= to:"+px);
			 dels.push(x);
			 //delete(retobj[keys[x]]);
		 } //enf of if matches next
  }
 }
//remove matched&deleted elements
//console.log("dels: "+JSON.stringify(dels));
	for(del in dels){
		//console.log("delete:del="+dels[del]);
		delete(retobj[dels[del]]);
	}
//console.log("retobj: "+JSON.stringify(retobj));
// convert to an array
	retarr = [];
	for(obj in retobj){
		retarr.push(retobj[obj]);
	}

return retarr;
}


function processReverseTree(invalue,reversefieldvalue,ignorerootmarker){

	if(ignorerootmarker === undefined) {
		ignorerootmarker = false;
	}
	 if(reversefieldvalue === undefined){
		reversefieldvalue = false;
	}
	var obj={};
	var tree=[];
	var terms=[];
	var current = tree;

  //console.log("in",JSON.stringify(invalue));
	if(invalue === undefined){
		return  {"orig": invalue};
	}
  if(Array.isArray(invalue)){ /* if per chance we end up with an array here, take 1st one*/
    	temp = invalue[0];
    	invalue = temp;
    }
	if(!invalue.match(/\.\.\/\.\./)){
		return  {"orig": invalue};
	}
	if(invalue.match(/~/)){         // had to add this for belt and braces checks on input
		   values = invalue.split('~');   // so if there's nothing to split just return what we received (below)
	   if(values.filter(function(invalue) { return invalue !== undefined }).length <= 1){     // or if split only yields one element just return what we got
	   		return values.filter(function(invalue) { return invalue !== undefined });
	   	}
	}
	else
	{
		return {"orig": invalue};				// nothing to split just return
	}

 	var lastfieldnumber = 0;

	for(i=values.length-1; i >= 0 ; i--){
		cvalue = values[i].trim();
		/*console.log(i);
		console.log(tree);
		console.log(current);
		console.log(values);
		console.log("cv:",cvalue);*/

    /*catch all*/
		if(cvalue === ''){
			break;
		}
		/* get values for sfield and svalue */
				if(cvalue.match(/\:/)){
						subcvalues = cvalue.split(':');
				}
				else if(cvalue === '../..'){
					if(i >= 1){
						nvalue = values[i-1].trim();

					}
					else {
						nvalue="n/a : n/a";
					}
					subcvalues = nvalue.split(':');
					if(subcvalues.length <= 1){
						subcvalues[1] = 'undefined';
						subcvalues[0] = nvalue;
					}
				}
				else {
					subcvalues[1] = 'undefined';
					if(cvalue !== ''){
					subcvalues[0] = cvalue;
				  }
					else {
						subcvalues[0] = 'undefined';
					}
				}

				if(reversefieldvalue === true){
					sfield = subcvalues[1].trim();
					svalue = subcvalues[0].trim();
				}
				else {
					sfield = subcvalues[0].trim();
					svalue = subcvalues[1].trim();
				}
				//console.log("scv",JSON.stringify(subcvalues));
			  /* end of get values for sfield and svalue */

		if( (ignorerootmarker === true && i === values.length-1)){
			//console.log('irm-init');
			tree = {root: 'yes', leaf: 'false', orig: invalue, value: svalue, type: sfield, children:[]};
			current = tree.children;
			lastfieldnumber = 1;
			terms.push({value: svalue, type: sfield});
			//current = current[current.length - 1].children;
		}
		if(cvalue === '../..' && ignorerootmarker === false){
			//console.log('dd-init');
			tree = {root: 'yes', leaf: 'false', orig: invalue, value: svalue, type: sfield, children:[]};
			current = tree.children;
			terms.push({value: svalue, type: sfield});
			i--;
		}
		else {
			if(cvalue === '../..' && ignorerootmarker === true){
				// do no processing, but throw us out of next up level 'else'
				break;
			}
			else if(i === lastfieldnumber){
					current.push({value: svalue, type: sfield, leaf: 'true'});
				  terms.push({value: svalue, type: sfield});
			}
			else {
				  current.push({value: svalue, type: sfield, leaf: 'false', children: []});
					terms.push({value: svalue, type: sfield});
			}
			current = current[current.length - 1].children;
		}

	}
	//console.log('Tree : '+JSON.stringify(tree));
  tree['terms'] = terms;
	return tree;

}


function processForwardTree(invalue,reversefieldvalue,ignorerootmarker){
	if(ignorerootmarker === undefined) {
		ignorerootmarker = false;
	}
	 if(reversefieldvalue === undefined){
		reversefieldvalue = false;
	}
	var obj={};
	var tree=[];
	var terms=[];
	var current = tree;
	var lastfieldnumber = 0;

 //console.log("Value : " + JSON.stringify(value));

	if(invalue === undefined){
		return  {"orig": value};
	}
	if(Array.isArray(invalue)){ /* if per chance we end up with an array here, take 1st one*/
    	temp = invalue[0];
    	invalue = temp;
    }
	if(!invalue.match(/\.\.\/\.\./)){
		return  {"orig": invalue};
	}
	if(invalue.match(/~/)){         // had to add this for belt and braces checks on input
	   values = invalue.split('~');   // so if there's nothing to split just return what we received (below)
	   if(values.filter(function(invalue) { return invalue !== undefined }).length <= 1){     // or if split only yields one element just return what we got
	   		return values.filter(function(invalue) { return invalue !== undefined });
	   	}
	}
	else
	{
		return {"orig": invalue};			// nothing to split just return
	}

	lastfieldnumber = values.length-1;

	for(i=0; i <= values.length-1 ; i++){
		cvalue = values[i].trim();
		/*console.log(i);
		console.log(tree);
		console.log(current);
		console.log(values);
		console.log(cvalue);*/

		/*catch all*/
		if(cvalue === ''){
			break;
		}

		if( (ignorerootmarker === true && i === 0)){
			tree = {root: 'yes', leaf: 'false', orig: invalue, value: nvalue, children:[] };
			current = tree.children;
			terms.push({value: svalue, type: sfield});
			lastfieldnumber = values.length-2;

		}

		/* get values for sfield and svalue */
		if(cvalue.match(/\:/)){
				subcvalues = cvalue.split(':');
		}
		else if(cvalue === '../..'){
			if(i <= values.length-2){
				nvalue = values[i+1].trim();
			}
			else {
				nvalue="n/a : n/a";
			}
			subcvalues = nvalue.split(':');
			if(subcvalues.length <= 1){
				subcvalues[1] = 'undefined';
				subcvalues[0] = nvalue;
			}
		}
		else {
			subcvalues[1] = 'undefined';
			if(cvalue !== ''){
			subcvalues[0] = cvalue;
			}
			else {
				subcvalues[0] = 'undefined';
			}
		}

		if(reversefieldvalue === true){
			sfield = subcvalues[1].trim();
			svalue = subcvalues[0].trim();
		}
		else {
			sfield = subcvalues[0].trim();
			svalue = subcvalues[1].trim();
		}
	  /* end of get values for sfield and svalue */

		if(cvalue === '../..' && ignorerootmarker === false){
			//console.log('dd-init');
			tree = {root: 'yes', leaf: 'false', orig: invalue, value: svalue, type: sfield, children:[]};
			current = tree.children;
			terms.push({value: svalue, type: sfield});
			i++;
		}
		else {
			if(cvalue === '../..' && ignorerootmarker === true){
					// do no processing, but throw us out of next up level 'else'
					break;
				}
			else if(i === lastfieldnumber){
					current.push({value: svalue, type: sfield, leaf: 'true'});
					terms.push({value: svalue, type: sfield});
				}
			else{
					current.push({value: svalue, type: sfield, leaf: 'false', children: []});
					terms.push({value: svalue, type: sfield});
				}
			current = current[current.length - 1].children;
		} /* end of else */
	} /* end of for */
	//console.log(JSON.stringify(tree));
	  tree['terms'] = terms;
	return tree;
}
