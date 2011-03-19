﻿/* * Name: rtTych v1.0 * Author: Reimund Trost (c) 2011 * Email: reimund@lumens.se * Website: http://lumens.se/tychpanel/ * * Description: Creates di, tri and quaptychs of the topmost layers * with the specified padding. * * The script makes at least the following * assumptions: * *  - One image per layer. *  - Images are placed at (0,0). *  - There are at least two, three and four layers for diptychs, triptychs and *    quaptychs respectively. *///@include Tych%20Panel%20Options%20Only/constants.jsx//@include Tych%20Panel%20Options%20Only/PSSettings.jsx// XXX: Center pictures in y. Compute new_size before trans in other words...// XXX: More layouts: 3x2, 3x3, 3x4, 4x2, 4x3, 4x4 etc.//rtTych(1);//rtTych(Number(prompt("Tych variant?", 0, "Enter a number between 0 and 8")));function rtTych(tych_variant){	if(documents.length > 0) {		// Save current unit preferences.		var rulerUnits = preferences.rulerUnits;		// Change unit preferences.		preferences.rulerUnits = Units.PIXELS;				// Set active document as current.		var doc = activeDocument;		var width = Number(doc.width);		var height = Number(doc.height);		var new_size;		// Load settings.		var tpSettings = {};		var settings = new Settings();		settings.setUID("TychPanelSettingsUniqueId");		settings.setMSG("TychPanelSettings");		settings.setType(SettingsType.SINGLE);		settings.loadSettings();		if (settings.numEntries() > 0)			tpSettings = settings.getEntryAt(0);		else			for (setting in defaults)				tpSettings[setting] = defaults[setting];		var padding = tpSettings.padding;		var trans;		var l1 = doc.layers.length > 0 ? doc.layers[0] : null;		var l2 = doc.layers.length > 1 ? doc.layers[1] : null;		var l3 = doc.layers.length > 2 ? doc.layers[2] : null;		var l4 = doc.layers.length > 3 ? doc.layers[3] : null;		// Unlock the background layer, if it exists. We do this because since		// we need to move a layer underneath it later.		//if (doc.artLayers[doc.layers.length - 1].isBackgroundLayer) {		if (doc.artLayers[doc.layers.length - 1].isBackgroundLayer) {			doc.artLayers[doc.layers.length - 1].copy();			doc.artLayers[doc.layers.length - 1].remove();			var pasted = doc.paste();			pasted.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);		}		switch (tych_variant) {			case DIPTYCH_HORIZONTAL:				trans = new Array(					new Array(null, null),					new Array(null, new Array(l1.bounds[2] + padding, 0))				)				new_size = new Array(doc.layers[0].bounds[2] + doc.layers[1].bounds[2] + padding, height);				break;			case DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL:			case DIPTYCH_PORTRAIT_LANDSCAPE_HORIZONTAL: 				// Index of portrait layer.				var p = doc.layers[0].bounds[2] > doc.layers[1].bounds[2] ? 1 : 0; 								// Scale factor.				var s = doc.layers[1 - p].bounds[3] / doc.layers[p].bounds[3];				var resize = new Array(new Array(s * 100, s * 100, AnchorPosition.TOPLEFT), null);				var offset_x = tych_variant == DIPTYCH_LANDSCAPE_PORTRAIT_HORIZONTAL 					? new Array(width + padding, 0) : new Array(0, s * doc.layers[p].bounds[2] + padding);				trans = new Array(					new Array(resize[p], new Array(offset_x[p], 0)),					new Array(resize[1 - p], new Array(offset_x[1 - p], 0))				)				new_size = new Array(doc.layers[1 - p].bounds[2] + doc.layers[p].bounds[2] * s + padding, doc.layers[1 - p].bounds[3]);				break;			case TRIPTYCH_HORIZONTAL:				trans = new Array(					new Array(null, null),					new Array(null, new Array(sum_width(l1) + padding, 0)),					new Array(null, new Array(sum_width(l1, l2) + padding * 2, 0))				)				new_size = new Array(sum_width(l1, l2, l3) + padding * 2, min_height(l1, l2, l3));				break;			case TRIPTYCH_PORTRAIT_LANDSCAPE_GRID:			case TRIPTYCH_LANDSCAPE_PORTRAIT_GRID: 				// Index of portrait layer.				var p = doc.layers[0].bounds[3] > doc.layers[1].bounds[3] ? 0 : 2;				p = doc.layers[1].bounds[3] > doc.layers[2].bounds[3] ? 1 : p;				trans = new Array(					new Array(null, new Array(0, 0)),					new Array(null, new Array(0, 0)),					new Array(null, new Array(0, 0))				)				new_size = new Array(doc.layers[p].bounds[2] * 2 + padding, padding);				// Compute transformations for the landscape layers.				for (var i = 0, j = 0; i < trans.length; i++) {					if (i != p) {						// Scale to the width of the portrait image.						var s = doc.layers[p].bounds[2] / doc.layers[i].bounds[2];						trans[i][0] = new Array(100 * s, 100 * s, AnchorPosition.TOPLEFT);						trans[i][1][0] = tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID ? doc.layers[p].bounds[2] + padding : 0;						trans[i][1][1] = (doc.layers[i].bounds[3] * s + padding) * j++; // Translate only the second landscape image in y.						new_size[1] += Math.round(doc.layers[i].bounds[3] * s);					}				}				trans[p][1][0] = tych_variant == TRIPTYCH_PORTRAIT_LANDSCAPE_GRID ? 0 : doc.layers[p].bounds[2] + padding;				trans[p][1][1] = -(doc.layers[p].bounds[3] - new_size[1]) / 2;				break;			case QUAPTYCH_HORIZONTAL:				trans = new Array(					new Array(null, null),					new Array(null, new Array(sum_width(l1) + padding, 0)),					new Array(null, new Array(sum_width(l1, l2) + padding * 2, 0)),					new Array(null, new Array(sum_width(l1, l2, l3) + padding * 3, 0))				)				new_size = new Array(sum_width(l1, l2, l3, l4), min_height(l1, l2, l3, l4));				break;			case QUAPTYCH_GRID:				var col1_width = Math.max(l1.bounds[2], l3.bounds[2]);				var col2_width = Math.max(l2.bounds[2], l4.bounds[2]);				var row1_height = Math.max(l1.bounds[3], l2.bounds[3]);				var row2_height = Math.max(l3.bounds[3], l4.bounds[3]);				trans = new Array(					new Array(null, null),					new Array(null, new Array(col1_width + padding, 0)),					new Array(null, new Array(0, row1_height + padding)),					new Array(null, new Array(col1_width + padding, row1_height + padding))				)				new_size = new Array(col1_width + col2_width + padding, row1_height + row2_height + padding);				break;			default:				return -1;		}		// Transform each layer according to the transformations specified in		// the trans variable.		var t = trans;		for(i = 0; i < doc.layers.length; i++) {			if (i >= t.length) break;						// Check if the layer should be resized.			if (t[i][0] != null)				doc.layers[i].resize(t[i][0][0], t[i][0][1], t[i][0][2]);			// Check if the layer should be moved.			if (t[i][1] != null) {				doc.layers[i].translate(t[i][1][0], t[i][1][1]);			}		}		doc.resizeCanvas(new_size[0], new_size[1], AnchorPosition.TOPLEFT);		// Make the background white.		var fill_layer = doc.artLayers.add();		var border_color = new SolidColor();		border_color.rgb.red = 255;		border_color.rgb.green = 255;		border_color.rgb.blue = 255;		fill_layer.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);		fill_layer.move(doc.layers[doc.layers.length - 1], ElementPlacement.PLACEAFTER);		doc.selection.fill(border_color)		if (tpSettings.resize) {			var resampleMethod = tpSettings.resample_method == 'bicubic' ? ResampleMethod.BICUBIC : ResampleMethod.BICUBICSHARPER;			doc.resizeImage(tpSettings.resize_width, tpSettings.resize_width * new_size[1] / new_size[0], 1, resampleMethod);		}		if (tpSettings.autosave) {			jpgFile = new File(tpSettings.save_directory + '/' + tpSettings.filename);			jpgSaveOptions = new JPEGSaveOptions();			jpgSaveOptions.embedColorProfile = true;			jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;			jpgSaveOptions.matte = MatteType.NONE;			jpgSaveOptions.quality = tpSettings.jpeg_quality;			app.activeDocument.saveAs(jpgFile, jpgSaveOptions, true, Extension.LOWERCASE);		}		if (tpSettings.autoclose)			doc.close(SaveOptions.DONOTSAVECHANGES);				// Revert settings.		preferences.rulerUnits = rulerUnits;		return 1;	} else {		alert("You have to open a document to use this script.");		return -1;	}}function sum_width(l1, l2, l3, l4){	if (l2 == null)		return l1.bounds[2];	if (l3 == null)		return l1.bounds[2] + l2.bounds[2];	if (l4 == null)		return l1.bounds[2] + l2.bounds[2] + l3.bounds[2];	else		return l1.bounds[2] + l2.bounds[2] + l3.bounds[2] + l4.bounds[2];}function min_height(l1, l2, l3, l4){	if (l2 == null)		return l1.bounds[3]	if (l3 == null)		return Math.min(l1.bounds[3], l2.bounds[3])	if (l4 == null)		return Math.min(Math.min(l1.bounds[3], l2.bounds[3]), l3.bounds[3])	else		return Math.min(Math.min(l1.bounds[3], l2.bounds[3]), Math.min(l3.bounds[3], l4.bounds[3]));}