/*
 * VEditable JQuery Plugin
 * Core library
 *
 * Author: 		Wojciech Zielinski
 * 				voyteck0@gmail.com
 * 				http://www.inperitia.com
 * 				https://github.com/Voyteck0/veditable
 * Created:		13.06.2017
 * Version:		0.2.0
 *
 * Description:
 * Plugin allows to convert inputs or form elements into inline editable elements.
 * It automatically creates both view and edit element, encapsulates them into
 * panels and controls showing/hiding these elements as well as their values.
 * Also uses $.ajax(..) for sending updates to backend.
 * High level of customization allows specyfing both custom classes for edit,
 * view and button elements, as well as includes multi-level configuration and
 * callbacks for generation various elements.
 *
 * Supports built-in plugin mechanism for extending with different standard and
 * custom edit fields.
 *
 * Events:
 * 		performAjaxCall(event)		performs ajax call
 * 									normally rather used to be triggered, however can be reprogrammed as needed
 * 			event.ajax				allows to set additional $.ajax() config options - will be merged
 * 									using $.extend(true, settings[ajax], event.ajax) with standard settings for field
 * 		updateViewControl(event)	event is called when view control should be updated with new value
 * 									this event should be programmed on the plugin level
 * 									if not programmed, it is automatically updating edit with value from getValue() function
 * 									TODO Event should be reprogrammed to editElement (this) - currently on viewElement
 * 			event.editElement		Full edit element is provided
 * 		updateEditControl(event)	event is called when edit control should be updated with new value
 * 									this event can be programmer on the plugin level
 * 									if not programmed, it is automatically updating edit with value from getValue() function
 * 									TODO Event should be reprogrammed to editElement (this) - currently on viewElement
 * 			event.viewElement		Full view element is provided
 *
 * Functions:
 * 		getValue()					used to get the value of element that is plugined
 * 									returns the value
 * 									default function returns the $(element).val()
 *
 *
 *
 */

(function($) {

	$.veditable = {

		plugins: {},
		addPlugin: 			function(pluginName, pluginSettings, viewControlCallback) {
			this['plugins'][pluginName] = {
				'pluginSettings': pluginSettings,
				'viewControlCallback': viewControlCallback,
			};
		},
		pluginExists: 		function(pluginName) {
			return (this['plugins'][pluginName] !== undefined && this['plugins'][pluginName] !== '');
		},
		getViewControl: 	function(pluginName) {
			if (this.pluginExists(pluginName))
				return this['plugins'][pluginName]['viewControlCallback'];
			else
				return false;
		},
		getPluginSettings:	function(pluginName) {
			if (this.pluginExists(pluginName))
				return this['plugins'][pluginName]['pluginSettings'];
			else
				return false;
		},

		getAttrOrSetting: function (object, attrName, elementType, settingsArray, settingKey, errConsole) {
			// checking if defined on tag level
			if ($(object).attr(attrName) !== undefined && $(object).attr(attrName) != '')
				return $(object).attr(attrName);

			// checking if defined on fields configuration level
			if (settingsArray['fields'] !== undefined && settingsArray['fields'][$(object).attr('id')] !== undefined && settingsArray['fields'][$(object).attr('id')][settingKey] !== undefined) {
				var fieldSettingValue 		= settingsArray['fields'][$(object).attr('id')][settingKey];
				return fieldSettingValue;
			}

			// checking if defined on fieldtype level (e.g. top level config, textViewTag - potentially can be also set on plugin settings passed to $.veditable.addPlugin(...)
			if (settingsArray[elementType + settingKey] !== undefined && settingsArray[elementType + settingKey] != '') {
				var fieldtypeSettingValue 	= settingsArray[elementType + settingKey];
				return fieldtypeSettingValue;
			}

			if (settingsArray[settingKey] !== undefined && settingsArray[settingKey] != '') {
				var defaultSettingValue = settingsArray[settingKey];
				return defaultSettingValue;
			}
			else {
				return false;
			}
		},

	};

	$.fn.veditable = function(userSettings) {

		var defaultSettings = {

			fieldName:					'',

			fields:						{},

			ajax:						{},

			AjaxUrl:					'#',

			editButtonTag:				'button',
			editButtonClass:			'',
			editButtonAttribs:			{},

			okButtonTag:				'button',
			okButtonClass:				'',
			okButtonAttribs:			{},

			cancelButtonTag:			'button',
			cancelButtonClass:			'',
			cancelButtonAttribs:		{}
		};

		this.each(function() {

			var settings = {};

//			console.log('Creating ' + $(this).attr('id'));

			var editType = $(this).attr('type');
			if (editType == 'hidden' && $(this).attr('veditable-edit-type') !== undefined && $(this).attr('veditable-edit-type') != '')
				editType = $(this).attr('veditable-edit-type');

			if (!$.veditable.pluginExists(editType))
				return true;

			$.extend(true, settings, defaultSettings, userSettings, $.veditable.getPluginSettings(editType));
			$.extend(true, settings, settings['fields'][$(this).attr('id')]);

			this.fieldSettings = [];

			$(this).attr('id', $.veditable.getAttrOrSetting(this, 'id',editType,settings,'fieldName','VEditable ERROR: Neither "id" value nor "fieldName" config option set for control'));

			this.fieldSettings['ViewTag'] 		= $.veditable.getAttrOrSetting(this, 'veditable-view-tag',			editType, 	settings, 	'ViewTag');
			this.fieldSettings['ViewClass'] 	= $.veditable.getAttrOrSetting(this, 'veditable-view-class',		editType, 	settings, 	'ViewClass');
			this.fieldSettings['ViewPanelID']	= $.veditable.getAttrOrSetting(this, 'veditable-view-panel-id', 	editType, 	settings, 	'ViewPanelID'); // TODO Implement viewPanelID
			this.fieldSettings['EditPanelID']	= $.veditable.getAttrOrSetting(this, 'veditable-edit-panel-id',		editType,	settings,	'EditPanelID');

			this.fieldSettings['okCallback']	= $.veditable.getAttrOrSetting(this, 'veditable-ok-callback',		editType,	settings,	'okCallback');
			this.fieldSettings['viewCallback']	= $.veditable.getAttrOrSetting(this, 'veditable-view-callback', 	editType, 	settings,	'viewCallback');
			this.fieldSettings['editCallback']	= $.veditable.getAttrOrSetting(this, 'veditable-edit-callback',		editType,	settings,	'editCallback'); // TODO Implement editCallback

			this.fieldSettings['AjaxUrl']		= $.veditable.getAttrOrSetting(this, 'veditable-ajax-url',			editType,	settings,	'AjaxUrl');
			this.fieldSettings['AjaxMethod']	= $.veditable.getAttrOrSetting(this, 'veditable-ajax-method', 		editType,	settings,	'AjaxMethod');


			var viewControlCallback = $.veditable.getViewControl(editType);
			var editElement = this;

			$(editElement).bind('performAjaxCall', function(event) {
				// no callback function - standard ajax call handling
				if (event.ajax !== undefined)
					$.extend(true, settings['ajax'], event.ajax);
				if (settings['ajax'] !== undefined && settings['ajax'] !== '') {
					// ajax settings is somehow defined
					if (settings['ajax']['url'] === undefined || settings['ajax']['url'] === '')
						settings['ajax']['url'] = this.fieldSettings.AjaxUrl;
				}
				else {
					settings['ajax']['url'] = this.fieldSettings.AjaxUrl;
				}
				if ((settings['ajax']['method'] === undefined || settings['ajax']['method'] === '') && this.fieldSettings.AjaxMethod)
					settings['ajax']['method'] = this.fieldSettings.AjaxMethod;
				settings['ajax']['data']['fieldName'] = $(this).attr('id');
				settings['ajax']['data']['fieldValue'] = viewControl.getValue(this);

				$.ajax(settings['ajax'])
					.done(function(data) {
						$(viewControl)
							.trigger({type: 'updateViewControl', editElement: $(editElement)});
					});
			});

			if (!viewControlCallback) {
				console.log('VEditable ERROR: No correct type specified or not type specified for control: ');
				console.log(this);
				return true; // goes to next element
			}
			else {
				var viewControl = viewControlCallback(this, settings);

				var viewCallbackFunction = this.fieldSettings['viewCallback'];
				if ($.isFunction(viewCallbackFunction) || $.isFunction(window[viewCallbackFunction])) {
					$(viewControl).unbind('updateViewControl');
					if($.isFunction(viewCallbackFunction))
						$(viewControl).bind('updateViewControl', function(event) { $(this).html(viewCallbackFunction(event)); });
					if($.isFunction(window[viewCallbackFunction]))
						$(viewControl).bind('updateViewControl', function(event) { $(this).html(window[viewCallbackFunction](event)); });
				}

				$(viewControl)
					.attr('id', "veditable-viewControl-" + $(this).attr('id'))
					.trigger({type: 'updateEditControl', viewElement: this})
					.trigger({type: 'updateViewControl', editElement: $(editElement)})
			}

			if (! $.isFunction(viewControl.getValue))
				viewControl.getValue = function() { return $(editElement).val(); }

			var okButton =
				$('<' + settings.okButtonTag + '>', $.extend({
					"class": 	"veditable-okButton " + settings.okButtonClass,
					"for":		$(this).attr('id'),
				}, settings.okButtonAttribs));

			var cancelButton =
				$('<' + settings.cancelButtonTag + '>', $.extend({
					"class":	"veditable-cancelButton " + settings.cancelButtonClass,
					"for":		$(this).attr('id'),
				}, settings.cancelButtonAttribs));

			var editButton =
				$('<' + settings.editButtonTag + '>', $.extend({
					"class":	"veditable-editButton " + settings.editButtonClass,
					"for":		$(this).attr('id'),
				}, settings.editButtonAttribs));

			if($('label[for="' + $(this).attr('id') + '"]').length)
				var viewLabel = $('<label>')
					.attr('for', "veditable-viewControl-" + $(this).attr('id'))
					.addClass('veditable-viewControl-label ' + $('label[for="' + $(this).attr('id') + '"]').attr('class'))
					.html($('label[for="' + $(this).attr('id') + '"]').html());
			else
				var viewLabel = $( '' );

			$(viewControl)
				.attr('for', $(this).attr('id'))
				.attr('class', 'veditable-viewControl ' + $(this).attr('veditable-view-class'));

			var viewPanel = $('<span>')
				.attr('id', 'veditable-viewPanel-' + $(this).attr('id'))
				.addClass('veditable-viewPanel')
				.append(viewControl)
				.append(viewLabel)
				.append(editButton);
			$(this).before(viewPanel);


			var editPanelLabel = $('label[for="' + $(this).attr('id') + '"]').detach();
			if ($(this).attr('veditable-edit-panel-id') !== undefined) {
				var editPanelSearchString = '#' + $(this).attr('veditable-edit-panel-id');
				var editPanel = $(editPanelSearchString)
					.append(this)
					.append(cancelButton)
					.append(okButton);
			}
			else {
				var editPanel = $('<span>')
					.attr('id', 'veditable-editPanel-' + $(this).attr('id'));
				var editPanelSearchString = 'span#veditable-editPanel-' + $(this).attr('id');
				$(this).wrap(editPanel)
					.after(cancelButton)
					.after(okButton)
					.after(editPanelLabel);
			}
			editPanel = $(editPanelSearchString)
				.addClass('veditable-editPanel')
				.hide();

			editButton.click(function() {
				$(viewPanel).hide();

				oldValue = $(editElement).val();

				$(editPanel).show();
			});

			okButton.click(function() {
				$(editPanel).hide();

				callbackFunction = editElement.fieldSettings.okCallback;
				if ($.isFunction(callbackFunction) || $.isFunction(window[callbackFunction])) {
					// callback function is doing everything
					if($.isFunction(callbackFunction))
						callbackFunction($(editElement).attr('id'), $(editElement).val());
					if($.isFunction(window[callbackFunction]))
						window[callbackFunction]($(editElement).attr('id'), $(editElement).val());
					// after running it should also updateview control by running updateViewControl event
					// e.g.
					// $('.veditable-viewControl[for="' + fieldName + '"]').trigger({type: 'updateViewControl', editElement: $('#' + fieldName)});
				}
				else {
					$(editElement).trigger('performAjaxCall');
				}

				$(viewPanel).show();
			});

			cancelButton.click(function() {
				$(editPanel).hide();

				$(editElement).val(oldValue);
				// TODO: Works incorrectly for checkbox - should also be done via triggered event
				$(viewControl).trigger({type: 'updateEditControl', viewElement: $(viewControl)});

				$(viewPanel).show()
			});

			return this;
		});
	};
}(jQuery));