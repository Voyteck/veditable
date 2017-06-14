Options and configuration

This paragraph is incomplete - will be updated once time allows :)

There are 4 levels where you can specify the configuration or settings for particular fields or whole veditable. These settings are overwritten by each other on specific order:

HTML-tag settings - specified directly in HTML tag, e.g. html<input type=text id=email veditable-ajax-url='/someurl/to/your/special/ajax/handler/for/emails'>
Field configuration level - coonfiguration stored on config object under Config.fields.[fieldname] level - below example will set different URL for AJAX handler only for email field:
  $('.veditable').veditable({
 // ...
 fields: {
   name: {
     AjaxUrl: '/someurl/to/your/special/ajax/handler/for/emails',
   },
 },
 // ...
  });
Fieldtype configuration level - configuration stored on config object under main level prefixed with fieldtype - below example will set different URL for AJAX handler for all text fields:
  $('.veditable').veditable({
 // ...
 textAjaxUrl: '/someurl/to/your/special/ajax/handler/for/text/fields',
 // ...
  });
General configuration level - configuration stored on config object under main level without prefix - below example will set default URL for AJAX handler for all fields:
  $('.veditable').veditable({
 // ...
 AjaxUrl: '/someurl/to/your/default/ajax/handler',
 // ...
  });
Default configuration stored in VEditable itself or plugin configuration - these are default values which will be taken if all above settings are not set.
Not all configuration options are available on any level. The configuration options their availability and way of using is described further in this section.

Ajax URL

HTML Tag: veditable-ajax-url
Field config setting: AjaxUrl
Fieldtype config setting: [fieldtype]AjaxUrl
General config level: AjaxUrl
Default value: none
Sets the URL to which field changes will be sent once field is modified and OK button is clicked. This setting is mandatory unless AJAX options are not set correctly (especially the ajax.url option - see below). If both AJAX settings and this option is set - this option overwites AJAX settings.

Example

<input type=text id='firstName' class='veditable' veditable-ajax-url='/url/to/firstname/ajax/handler'>
<input type=text id='lastName' class='veditable'>
<input type=text id='postalCode' class='veditable'>
<input type=checkbox id='checkName' class='veditable'>
$(document).ready(function() {
  $('.veditable').veditable({
    fields: {
      lastName: '/url/to/lastname/ajax/handler',
    },
    textAjaxUrl: '/url/to/texttype/ajax/handler',
    AjaxUrl: '/url/to/default/ajax/handler'
  });
}
The above example will set following URLs for different fields:

firstName field changes will be sent to /url/to/firstname/ajax/handler - as set on the tag directly
lastName field changes will be sent to /url/to/lastname/ajax/handler - as set on field level setting
postalCode field changes will be sent to /url/to/texttype/ajax/handler - as set on field type (text) level setting (all other text fields will be sent there)
checkName field changes will be sent to /url/to/default/ajax/handler - as set as default URL for AJAX (since the field is not of text type)

AJAX Method

HTML Tag: veditable-ajax-method
Field config setting: AjaxMethod
Fieldtype config setting: [fieldtype]AjaxMethod
General config level: AjaxMethod
Default value: GET
Sets method for AJAX call. If both AJAX settings and this option is set - this option overwites AJAX settings.

Example

See example for Ajax URL

AJAX options / configuration

HTML Tag: Not Available
Field config setting: ajax
Fieldtype config setting: Not Available
General config level: ajax
Default value: none Stores object that can be used for $.ajax() function call. ajax.url and ajax.method values can be overwritten by AjaxUrl and AjaxMethod settings. Additionally once $.ajax() is called - the ajax.data object is extended by FieldName and FieldValue data (see AJAX transation section above). These values are overwriting any values that might have been set on configuration level.

Fields configurations

HTML Tag: Not Available
Field config setting: Not Available
Fieldtype config setting: Not Available
General config level: fields
Default value: none Stores object with fields which should contain additional configuration. Object is built basing on field IDs, which any of the specified ones has also object with configuration.

View Panel encapsulation tag

HTML Tag: veditable-view-tag
Field config setting: ViewTag
Fieldtype config setting: [fieldtype]ViewTag
General config level: ViewTag
Default value: none TODO Documentation to be completed

View Panel class tag

HTML Tag: veditable-view-class
Field config setting: ViewClass
Fieldtype config setting: [fieldtype]ViewClass
General config level: ViewClass
Default value: none TODO Documentation to be completed

View Panel identifier

HTML Tag: veditable-view-panel-id
Field config setting: ViewPanelID
Fieldtype config setting: [fieldtype]ViewPanelID
General config level: ViewPanelID
Default value: none TODO Documentation and implementation to be completed
Edit Panel identifier

HTML Tag: veditable-edit-panel-id
Field config setting: EditPanelID
Fieldtype config setting: [fieldtype]EditPanelID
General config level: EditPanelID
Default value: none TODO Documentation to be completed
OK Button callback function

HTML Tag: veditable-ok-callback
Field config setting: okCallback
Fieldtype config setting: [fieldtype]okCallback
General config level: okCallback
Default value: none TODO Documentation to be completed
View update callback function

HTML Tag: veditable-view-callback
Field config setting: viewCallback
Fieldtype config setting: [fieldtype]viewCallback
General config level: viewCallback
Default value: none TODO Documentation to be completed
Edit Button callback function

HTML Tag: veditable-edit-callback
Field config setting: editCallback
Fieldtype config setting: [fieldtype]editCallback
General config level: editCallback
Default value: none TODO Documentation and implementation to be completed
Edit Button tag

HTML Tag: veditable-edit-button-tag
Field config setting: editButtonTag
Fieldtype config setting: [fieldtype]editButtonTag
General config level: editButtonTag
Default value: button TODO Documentation and implementation to be completed
Edit Button class

HTML Tag: veditable-edit-button-class
Field config setting: editButtonClass
Fieldtype config setting: [fieldtype]editButtonClass
General config level: editButtonClass
Default value: none TODO Documentation and implementation to be completed
OK Button tag

HTML Tag: veditable-ok-button-tag
Field config setting: okButtonTag
Fieldtype config setting: [fieldtype]okButtonTag
General config level: okButtonTag
Default value: button TODO Documentation and implementation to be completed
OK Button class

HTML Tag: veditable-ok-button-class
Field config setting: okButtonClass
Fieldtype config setting: [fieldtype]okButtonClass
General config level: okButtonClass
Default value: none TODO Documentation and implementation to be completed
Cancel Button tag

HTML Tag: veditable-cancel-button-tag
Field config setting: cancelButtonTag
Fieldtype config setting: [fieldtype]cancelButtonTag
General config level: cancelButtonTag
Default value: button TODO Documentation and implementation to be completed
Cancel Button class

HTML Tag: veditable-cancel-button-class
Field config setting: cancelButtonClass
Fieldtype config setting: [fieldtype]cancelButtonClass
General config level: cancelButtonClass
Default value: none TODO Documentation and implementation to be completed
Plugin development and functionality extending

TODO Documentation to be completed

Events and functions

TODO Documentation to be completed

Event updateViewControl

TODO Documentation to be completed

Event updateEditControl

TODO Documentation to be completed

Function getValue()

TODO Documentation to be completed
