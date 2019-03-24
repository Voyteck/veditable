/*
 * VEditable JQuery Plugin
 * Plugin for checkbox input fields
 *
 * Author: 		Wojciech Zielinski
 * 				voyteck0@gmail.com
 * 				http://www.inperitia.com
 * 				https://github.com/Voyteck0/veditable
 * Created:		13.06.2017
 * Version:		0.2.0
 *
 * Description:
 * This is plugin for VEditable that supports using checkbox type fields.
 *
 */

(function($) {

	var pluginSettings = {
		checkboxViewTag:			"input",
		checkboxViewClass:			"",
		checkboxViewAttribs:		{
										"type":		"checkbox",
										"disabled":	"true"
									},
	};

	var viewControlCallback = function(object, settings) {
		var viewControl		= $("<" + object.fieldSettings.ViewTag + ">", $.extend({
		}, settings.checkboxViewAttribs))
//			.attr("id", "veditable-viewControl-" + $(object).attr("id"));

		$(viewControl).bind("updateViewControl", function(event) {
			$(this).prop("checked", event.editElement.prop("checked"));
		});

		viewControl.getValue = function(editElement) { return $(editElement).prop("checked"); };

		return viewControl;
	};

	$.veditable.addPlugin("checkbox", pluginSettings, viewControlCallback);

}(jQuery));