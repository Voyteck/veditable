/*
 * VEditable JQuery Plugin
 * Core library
 *
 * Author: 		Wojciech Zielinski
 * 				voyteck0@gmail.com
 * 				http://www.inperitia.com
 * 				https://github.com/Voyteck0/veditable
 * Created:		13.06.2017
 * Version:		0.2.4
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
 * 		ajaxCall(event)		performs ajax call
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
		addPlugin(pluginName, pluginSettings, viewControlCallback) {
			this["plugins"][pluginName] = {
				"pluginSettings": pluginSettings,
				"viewControlCallback": viewControlCallback,
			};
		},
		pluginExists(pluginName) {
			return (typeof this["plugins"][pluginName] !== "undefined" && this["plugins"][pluginName] !== "");
		},
		getViewControl(pluginName) {
			if (this.pluginExists(pluginName))
				return this["plugins"][pluginName]["viewControlCallback"];
			else
				return false;
		},
		getPluginSettings(pluginName) {
			if (this.pluginExists(pluginName))
				return this["plugins"][pluginName]["pluginSettings"];
			else
				return false;
		},

		getAttrOrSetting(object, attrName, elementType, settingsArray, settingKey, errConsole) {
			// checking if defined on tag level
			if ($(object).attr(attrName) !== undefined && $(object).attr(attrName) !== "")
				return $(object).attr(attrName);

			// checking if defined on fields configuration level
			if (typeof settingsArray["fields"] !== "undefined" && typeof settingsArray["fields"][$(object).attr("id")] !== "undefined" && typeof settingsArray["fields"][$(object).attr("id")][settingKey] !== "undefined") {
				var fieldSettingValue 		= settingsArray["fields"][$(object).attr("id")][settingKey];
				return fieldSettingValue;
			}

			// checking if defined on fieldtype level (e.g. top level config, textViewTag - potentially can be also set on plugin settings passed to $.veditable.addPlugin(...)
			if (settingsArray[elementType + settingKey] !== undefined && settingsArray[elementType + settingKey] !== "") {
				var fieldtypeSettingValue 	= settingsArray[elementType + settingKey];
				return fieldtypeSettingValue;
			}

			if (typeof settingsArray[settingKey] !== "undefined" && settingsArray[settingKey] !== "") {
				var defaultSettingValue = settingsArray[settingKey];
				return defaultSettingValue;
			}
			else {
				return false;
			}
		},
		
		runtimeSettingsBindings: {
			AjaxUrl: {
				attrName:	"veditable-ajax-url",
				settingKey:	"AjaxUrl"
			},
			AjaxMethod: {
				attrName:	"veditable-ajax-method",
				settingKey:	"AjaxMethod"
			}
		},
		
		getFieldSetting(object, settingName, elementType, settings) {
			if (this.runtimeSettingsBindings[settingName] === undefined) {
				console.log("Setting " + settingName + " is not valid or cannot be read during runtime (is initialization-only option)");
			}
			return this.getAttrOrSetting(object, this.runtimeSettingsBindings[settingName].attrName, elementType, settings,this.runtimeSettingsBindings[settingName].settingKey);
		},

	};

	$.fn.veditable = function(userSettings) {

		var defaultSettings = {

			fieldName:					"",

			fields:						{},

			ajax:						{},

			AjaxUrl:					"#",

			editButtonTag:				"button",
			editButtonClass:			"",
			editButtonAttribs:			{},

			okButtonTag:				"button",
			okButtonClass:				"",
			okButtonAttribs:			{},

			cancelButtonTag:			"button",
			cancelButtonClass:			"",
			cancelButtonAttribs:		{}
		};

		this.each(function() {
			
			var baseObject = this;

			var settings = {};

			var editType = $(this).attr("type");
			if (typeof $(this).attr("veditable-edit-type") !== "undefined" && $(this).attr("veditable-edit-type") != "")
				editType = $(this).attr("veditable-edit-type");

			if (!$.veditable.pluginExists(editType))
				return true;

			$.extend(true, settings, defaultSettings, userSettings, $.veditable.getPluginSettings(editType));
			$.extend(true, settings, settings["fields"][$(this).attr("id")]);

			this.fieldSettings = [];

			$(this).attr("id", $.veditable.getAttrOrSetting(this, "id",editType,settings,"fieldName","VEditable ERROR: Neither \"id\" value nor \"fieldName\" config option set for control"));

			this.fieldSettings["ViewTag"] 				= $.veditable.getAttrOrSetting(this, "veditable-view-tag",					editType, 	settings, 	"ViewTag");
			this.fieldSettings["ViewClass"] 			= $.veditable.getAttrOrSetting(this, "veditable-view-class",				editType, 	settings, 	"ViewClass");
			this.fieldSettings["ViewPanelID"]			= $.veditable.getAttrOrSetting(this, "veditable-view-panel-id", 			editType, 	settings, 	"ViewPanelID"); // TODO Implement viewPanelID
			this.fieldSettings["EditPanelID"]			= $.veditable.getAttrOrSetting(this, "veditable-edit-panel-id",				editType,	settings,	"EditPanelID");

			this.fieldSettings["okCallback"]			= $.veditable.getAttrOrSetting(this, "veditable-ok-callback",				editType,	settings,	"okCallback");
			this.fieldSettings["viewCallback"]			= $.veditable.getAttrOrSetting(this, "veditable-view-callback", 			editType, 	settings,	"viewCallback");
			this.fieldSettings["editCallback"]			= $.veditable.getAttrOrSetting(this, "veditable-edit-callback",				editType,	settings,	"editCallback"); // TODO Implement editCallback
			
			this.fieldSettings["okButtonSelector"]		= $.veditable.getAttrOrSetting(this, "veditable-ok-button-selector",		editType,	settings,	"okButtonSelector");
			this.fieldSettings["cancelButtonSelector"]	= $.veditable.getAttrOrSetting(this, "veditable-cancel-button-selector",	editType,	settings,	"cancelButtonSelector");
			this.fieldSettings["editButtonSelector"]	= $.veditable.getAttrOrSetting(this, "veditable-edit-button-selector",		editType,	settings,	"editButtonSelector");
			
			this.fieldSettings["AjaxUrl"]				= $.veditable.getFieldSetting(this, "AjaxUrl", 		editType, settings);
			this.fieldSettings["AjaxMethod"]			= $.veditable.getFieldSetting(this, "AjaxMethod", 	editType, settings);


			var viewControlCallback = $.veditable.getViewControl(editType);
			
			if (!viewControlCallback) {
				console.log("VEditable ERROR: No correct type specified or not type specified for control: ");
				console.log(this);
				return true; // goes to next element
			}
			else {
				var viewControl = viewControlCallback(this, settings);

				var viewCallbackFunction = this.fieldSettings["viewCallback"];
				if ($.isFunction(viewCallbackFunction) || $.isFunction(window[viewCallbackFunction])) {
					$(viewControl).off("updateViewControl");
					if($.isFunction(viewCallbackFunction))
						$(viewControl).on("updateViewControl", function(event) { $(this).html(viewCallbackFunction(event)); });
					if($.isFunction(window[viewCallbackFunction]))
						$(viewControl).on("updateViewControl", function(event) { $(this).html(window[viewCallbackFunction](event)); });
				}

				$(viewControl)
					.attr("id", "veditable-viewControl-" + $(this).attr("id"))
					.trigger({type: "updateEditControl", viewElement: $(baseObject)})
					.trigger({type: "updateViewControl", editElement: $(baseObject)})
			}

			$(baseObject).on("ajaxCall", function(event) {
				// no callback function - standard ajax call handling
				if (typeof event.ajax !== "undefined")
					$.extend(true, settings["ajax"], event.ajax);
				if (typeof settings["ajax"] !== "undefined" && settings["ajax"] !== "") {
					// ajax settings is somehow defined
					if (typeof settings["ajax"]["url"] === "undefined" || settings["ajax"]["url"] === "")
						settings["ajax"]["url"] = $.veditable.getFieldSetting(this, "AjaxUrl", editType, settings);
				}
				else {
					settings["ajax"]["url"] = $.veditable.getFieldSetting(this, "AjaxUrl", editType, settings);
				}
				if ((typeof settings["ajax"]["method"] === "undefined" || settings["ajax"]["method"] === "") && $.veditable.getFieldSetting(this, "AjaxMethod", editType, settings))
					settings["ajax"]["method"] = $.veditable.getFieldSetting(this, "AjaxMethod", editType, settings);
				
				settings["ajax"]["data"] = {
					fieldName:		$(this).attr("id"),
					fieldValue:		viewControl.getValue(this)
				};
				
				$.ajax(settings["ajax"])
					.done(function(data) {
						$(viewControl)
							.trigger({type: "updateViewControl", editElement: $(baseObject)});
						$(baseObject).trigger("ajaxDone");
					});
			});

			if (! $.isFunction(viewControl.getValue))
				viewControl.getValue = function() { return $(baseObject).val(); };
			
			var okButton;
			if (this.fieldSettings.okButtonSelector === false)
				okButton =
					$("<" + settings.okButtonTag + ">", $.extend({
						"class": 	"veditable-okButton " + settings.okButtonClass,
						"for":		$(this).attr("id"),
						"type":		"button",
					}, settings.okButtonAttribs));
			else {
				okButton = $(this.fieldSettings.okButtonSelector).addClass("veditable-okButton");
				$(this).on("hideEditControl", function(event) { $(okButton).hide(); });
				$(this).on("showEditControl", function(event) { $(okButton).show(); });
			}
			
			var cancelButton;
			if (this.fieldSettings.cancelButtonSelector === false)
				cancelButton =
					$("<" + settings.cancelButtonTag + ">", $.extend({
						"class":	"veditable-cancelButton " + settings.cancelButtonClass,
						"for":		$(this).attr("id"),
						"type":		"button",
					}, settings.cancelButtonAttribs));
			else {
				cancelButton = $(this.fieldSettings.cancelButtonSelector).addClass("veditable-cancelButton");
				$(this).on("hideEditControl", function(event) { $(cancelButton).hide(); });
				$(this).on("showEditControl", function(event) { $(cancelButton).show(); });
			}

			var editButton;
			if (!this.fieldSettings.editButtonSelector)
				editButton =
					$("<" + settings.editButtonTag + ">", $.extend({
						"class":	"veditable-editButton " + settings.editButtonClass,
						"for":		$(this).attr("id"),
						"type":		"button",
					}, settings.editButtonAttribs));
			else {
				editButton = $(this.fieldSettings.editButtonSelector).addClass("veditable-editButton");
				$(this).on("hideViewControl", function(event) { $(cancelButton).hide(); });
				$(this).on("showViewControl", function(event) { $(cancelButton).show(); });
			}

			if($("label[for=\"" + $(this).attr("id") + "\"]:not([veditable-editonly-element])").length)
				var viewLabel = $("<label>")
					.attr("for", "veditable-viewControl-" + $(this).attr("id"))
					.addClass("veditable-viewControl-label " + $("label[for=\"" + $(this).attr("id") + "\"]").attr("class"))
					.html($("label[for=\"" + $(this).attr("id") + "\"]").html());
			else
				var viewLabel = $( "" );

			$(viewControl)
				.attr("for", $(this).attr("id"))
				.attr("class", "veditable-viewControl " + $(this).attr("veditable-view-class"));

			var viewPanel = $("<span>")
				.attr("id", "veditable-viewPanel-" + $(this).attr("id"))
				.addClass("veditable-viewPanel")
				.append(viewControl)
				.append(viewLabel);
			if (this.fieldSettings.editButtonSelector === false)
				viewPanel.append(editButton);
			$(this).before(viewPanel);
			$(baseObject).trigger({type: "showViewControl", viewElement: $(viewPanel)});


			var editPanelLabel = $("label[for=\"" + $(this).attr("id") + "\"]").detach();
			if ($(this).attr("veditable-edit-panel-id") !== undefined) {
				var editPanelSearchString = "#" + $(this).attr("veditable-edit-panel-id");
				var editPanel = $(editPanelSearchString).append(this);
				if (this.fieldSettings.cancelButtonSelector === false)
					editPanel.append(cancelButton);
				if (this.fieldSettings.okButtonSelector === false)
					editPanel.append(okButton);
			}
			else {
				var editPanel = $("<span>")
					.attr("id", "veditable-editPanel-" + $(this).attr("id"));
				var editPanelSearchString = "span#veditable-editPanel-" + $(this).attr("id");
				$(this).wrap(editPanel);
				if (this.fieldSettings.cancelButtonSelector === false)
					$(this).after(cancelButton);
				if (this.fieldSettings.okButtonSelector === false)
					$(this).after(okButton);
				$(this).after(editPanelLabel);
			}
			
			editPanel = $(editPanelSearchString)
				.addClass("veditable-editPanel")
				.hide();
			$(baseObject).trigger({type: "hideEditControl", editElement: $(editPanel)});
			
			$(baseObject).on("turnEditMode", function() {
				$(viewPanel).hide();
				$(baseObject).trigger({type: "hideViewControl", viewElement: $(viewPanel)});
				$(editPanel).show();
				$(baseObject).trigger({type: "showEditControl", editElement: $(editPanel)});
			});
			
			$(baseObject).on("turnViewMode", function() {
				$(editPanel).hide();
				$(baseObject).trigger({type: "hideEditControl", editElement: $(editPanel)});
				$(viewPanel).show();
				$(baseObject).trigger({type: "showViewControl", viewElement: $(viewPanel)});
			});

			editButton.click(function() {
				$(baseObject).trigger("turnEditMode");

				oldValue = $(baseObject).val();
			});

			okButton.click(function() {
				$(baseObject).trigger("turnViewMode");

				callbackFunction = baseObject.fieldSettings.okCallback;
				if ($.isFunction(callbackFunction) || $.isFunction(window[callbackFunction])) {
					// callback function is doing everything
					if($.isFunction(callbackFunction))
						callbackFunction($(baseObject).attr("id"), $(baseObject).val());
					if($.isFunction(window[callbackFunction]))
						window[callbackFunction]($(baseObject).attr("id"), $(baseObject).val());
					// after running it should also updateview control by running updateViewControl event
					// e.g.
					// $(".veditable-viewControl[for=\"" + fieldName + "\"]").trigger({type: "updateViewControl", editElement: $("#" + fieldName)});
				}
				else {
					$(baseObject).trigger("ajaxCall");
				}

			});

			cancelButton.click(function() {
				$(editPanel).hide();
				$(baseObject).trigger({type: "hideEditControl", editElement: $(editPanel)});

				$(baseObject).val(oldValue);
				// TODO: Works incorrectly for checkbox - should also be done via triggered event
				$(viewControl).trigger({type: "updateEditControl", viewElement: $(viewControl)});

				$(viewPanel).show()
				$(baseObject).trigger({type: "showViewControl", viewElement: $(viewPanel)});
			});
			
			$(this).on("change", function() {
				viewControl.trigger({type: "updateViewControl", editElement: $(baseObject)});
			})

			return this;
		});
		
		$(this).trigger("initComplete");
		
		return this;
	};
	
	
}(jQuery));