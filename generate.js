// Simple art generator by HashLips <->

#include "./lib/json2.js";

function main() {
  var continueConfirmation = confirm(
    "You are about to use the HashLips art generator. Are you sure you want to continue?"
  );

  if (!continueConfirmation) return;

  var supply = prompt("How many images do you want to generate per group?", "10");

  var name = prompt("What is the name of your collection?", "");

  var description = prompt("What is the description for your collection?", "");

  var superGroups = app.activeDocument.layerSets;

  alert(
    parseInt(supply) * superGroups.length +
      " images will be generated, so sit back relax and enjoy the art being generated."
  );

	for(var i = 0; i < superGroups.length; i++){
		resetLayers(superGroups[i].layerSets);
	}
  
  function getRWeights(_str) {
    var weight = Number(_str.split("#").pop());
    if(isNaN(weight)){
      weight = 1;
    }
    return weight;
  }

  function cleanName(_str) {
    return _str.split("#").shift();
  }
  
  function shuffledIndexes(length) {
	var array = [];
	for(var i = 1; i <= length; i++){
		array.push(i);
	} 
	
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	return array;
}
	
  var totalPerGroup = parseInt(supply);
  var shuffledIndexes = shuffledIndexes(totalPerGroup * superGroups.length);

  for (var groupIndex = 0; groupIndex < superGroups.length; groupIndex++){
	  for (var h = groupIndex * totalPerGroup; h < groupIndex * totalPerGroup + totalPerGroup; h++) {
		var obj = {};
		obj.name = name + " #" + (h + 1);
		obj.description = description;
		obj.image = "To be replaced";
		obj.edition = shuffledIndexes[h];
		obj.attributes = [];
		
		var groups = superGroups[groupIndex].layerSets;
		
		for (var i = 0; i < groups.length; i++) {
		  var totalWeight = 0;
		  var layerMap = [];

		  for(var j = 0; j < groups[i].layers.length; j++){
			totalWeight += getRWeights(groups[i].layers[j].name);
			layerMap.push({
			  index: j,
			  name: cleanName(groups[i].layers[j].name),
			  weight: getRWeights(groups[i].layers[j].name)
			});
		  }

		  var ran = Math.floor(Math.random() * totalWeight);

		  (function() {
			for(var j = 0; j < groups[i].layers.length; j++){
			  ran -= layerMap[j].weight;
			  if(ran < 0) {
				groups[i].layers[j].visible = true;
				obj.attributes.push({
				  trait_type: groups[i].name, 
				  value: layerMap[j].name
				})
				return;
			  }
			}
		  })();
		}
		saveImage(obj.edition);
		saveMetadata(obj);
		resetLayers(groups);
	  }
  }
  alert("Generation process is complete.");
}

function resetLayers(_groups) {
  for (var i = 0; i < _groups.length; i++) {
    _groups[i].visible = true;
    for (var j = 0; j < _groups[i].layers.length; j++) {
      _groups[i].layers[j].visible = false;
    }
  }
}

function saveImage(_edition) {
  var saveFile = new File(toFolder("build/images") + "/" + _edition + ".png");
  exportOptions = new ExportOptionsSaveForWeb();
  exportOptions.format = SaveDocumentType.PNG;
  exportOptions.PNG24 = false;
  exportOptions.transparency = true;
  exportOptions.interlaced = false;
  app.activeDocument.exportDocument(
    saveFile,
    ExportType.SAVEFORWEB,
    exportOptions
  );
}

function saveMetadata(_data) {
  var file = new File(toFolder("build/metadata") + "/" + _data.edition + ".json");
  file.open("w");
  file.write(JSON.stringify(_data));
  file.close();
}

function toFolder(_name) {
  var path = app.activeDocument.path;
  var folder = new Folder(path + "/" + _name);
  if (!folder.exists) {
    folder.create();
  }
  return folder;
}


main();
