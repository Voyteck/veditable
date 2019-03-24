/*
 * VEditable JQuery Plugin
 * Plugin for text input fields
 *
 * Author: 		Wojciech Zielinski
 * 				voyteck0@gmail.com
 * 				http://www.inperitia.com
 * 				https://github.com/Voyteck0/veditable
 * Created:		13.06.2017
 * Version:		0.2.0
 *
 * Description:
 * This is plugin for VEditable that supports using text type fields.
 *
 */


(function($) {

	var pluginSettings = {
		textViewTag:				'span',
		textViewClass:				'',
		textViewAttribs:			{},
	};

	var viewControlCallback = function(object, settings) {
		var viewControl		= $('<' + object.fieldSettings.ViewTag + '>', $.extend({
		}, settings.textViewAttribs));

		$(viewControl).on('updateViewControl', function(event) {
			$(this).text(event.editElement.val());
		});
		
		return viewControl;
	};

	$.veditable.addPlugin('text', pluginSettings, viewControlCallback);

}(jQuery));