# veditable

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ae641dee7a8545329bdf130ce82ec0c9)](https://app.codacy.com/app/Voyteck/veditable?utm_source=github.com&utm_medium=referral&utm_content=Voyteck/veditable&utm_campaign=Badge_Grade_Dashboard)

VEditable - JQuery Inline Editing Plugin

Plugin uses various INPUT tags (or other - depending on which plugin is used) to create inline editing controls. As default plugin will create the appropriate panel that will include the value of the field together with edit button, as well as will encapsulate the field editing control within another panel and add the OK/Cancel buttons. Plugin also implements sending the values using AJAX transations directly to backend for processing.
In general plugin does not use FORM for sending, while implementing single AJAX calls per every field change.
Plugin contains various configuration options that includes way how the buttons or fields itself should look like (by adding various classes or manipulating HTML tags used for their creation) as well as allows to setup various callback functions for different actions. It also implements several events that can be programmed according to the needs.
Controls that can be used with plugin are setup as plugins - currectly **text**, **checkbox** and custom **checkgroup** controls are implemented. New will be added in time.

## Short version how to use it:

To use various plugin functions you first need to load them - e.g.:
```html
<script type="text/javascript" src="/js/veditable/veditable.js"></script>
<script type="text/javascript" src="/js/veditable/plugins/text-plugin.js"></script>
<script type="text/javascript" src="/js/veditable/plugins/checkbox-plugin.js"></script>
<script type="text/javascript" src="/js/veditable/plugins/checkgroup-plugin.js"></script>
```
You can load them both before and after the main file - both ways it should work.

Then you can simply create appropriate input and make it selectable - e.g. using specific class (I use .veditable, but you can use whichever you want):```html<input type=text id=email class='veditable' />```

Then you need to initiate VEditable once your document is ready:
```javascript
  $(document).ready(function() {
    $('.veditable').veditable({
      AjaxUrl:      '/someurl/to/your/default/ajax/handler'
    });
  }
```
**At the moment only text, checkbox and checkgroup (custom control) are implemented**. Since any control is handled using the plugin - you can create plugins by yourself or simply wait until I will need one and get it then :) Of course if you develop a plugin for any control - you are more than welcome to share it with others :)

## AJAX transaction

Once OK button is clicked the AJAX transaction will be sent. Unless the callbacks or configuration options are set diferently, the transation is sent into **AjaxUrl** address using default [$.ajax()](http://api.jquery.com/jquery.ajax/) method configuration. The data that is sent contains:
* FieldName - name of the field that has been changed - equivalent to field ID
* FieldValue - value of the field after the change Default response that is being expected should contain data that will be further used on event updateViewControl described later

# Documentation
For more detailed documentatio please refer to [Project Wiki](https://github.com/Voyteck0/veditable/wiki)