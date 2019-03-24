/*
 * VEditable JQuery Plugin
 * Plugin for checkbox groups
 *
 * Author: 		Wojciech Zielinski
 * 				voyteck0@gmail.com
 * 				http://www.inperitia.com
 * 				https://github.com/Voyteck0/veditable
 * Created:		13.06.2017
 * Version:		0.2.0
 *
 * Description:
 * This is plugin for VEditable that supports using checkbox groups for bitwise options.
 * The group consists set of checkboxes, while each of them has different bytewise
 * value. The total value of the field is calculated by summing these values together.
 * To get the option status if is need to check which byte is on in a total value.
 *
 */

(function($) {

	var pluginSettings = {
		checkgroupViewTag:			"span",
		checkgroupViewClass:		"",
		checkgroupViewAttribs:		{},
		checkgroupEditPanelID:		{},
	};

	var viewControlCallback = function(object, settings) {

		var viewControl		= $("<" + object.fieldSettings.ViewTag + ">", $.extend({
		}, settings.checkgroupViewAttribs));

		var editPanelCheckboxes = $("#" + object.fieldSettings.EditPanelID + " input[type=\"checkbox\"]");

		$(viewControl).bind("updateViewControl", function(event) {
			var textValue = "";
			editPanelCheckboxes.each(function() {
				if ($(this).prop("checked"))
					textValue += " " + $(this).attr("id");
			});
			$(this).html(textValue);
		});

		$(viewControl).bind("updateEditControl", function(event) {
			editPanelCheckboxes.each(function() {
				$(this).prop("checked", ((parseInt($(event.viewElement).val(), 10) & parseInt($(this).val(), 10)) === parseInt($(this).val(), 10)));
			});
		});

		viewControl.getValue = function(editElement) {
			var intValue = 0;
			editPanelCheckboxes.each(function() {
				if ($(this).prop("checked")) { intValue += parseInt($(this).val(), 10); }
			});
			return intValue ;
		};

		return viewControl;

	};

	$.veditable.addPlugin("checkgroup", pluginSettings, viewControlCallback);

}(jQuery));