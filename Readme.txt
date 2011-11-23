
	b-finder, javascript/jquery selector for tree structured data


	Goods:
	— Compatible with jQuery;
	— Simple to use;
	— User defined handlers support.


	Requirements:

	— HTML;
	— CSS;
	— JavaScript;
	— jQuery 1.6+.


	Code example:

	<code>
		$('.b-finder').finder(
			'id_dqd',
			{
				load : function(ext) {
					// your code that loads a data tree array from ajax or other source
					// (see array description below)
					return yourDataList;
				},
				click : function(event, int, ext) {
					// your additional code for single click
				},
				dblclick : function(event, call, int, ext) {
					// your code for double click with ajax requests and other actions
				}
			},
			{
				// your params
			}
		);
	</code>



	.finder() method params

	 param    | description
	============================================================
	 id       | Number or string ID for current Finder instance
	------------------------------------------------------------
	 handlers | Three user handlers: load, click and dblclick.
	          | Click is optional
	------------------------------------------------------------
	 params   | Object with user params (ids, urls, etc)
	============================================================



	The list of arguments inside .load() handler

	 #  | value
	=======================================================================
	 1. | An object given in params attribute for .finder() method
	-----------------------------------------------------------------------
	 2. | An object which exists only if finder_async param is true.
	    | Contains Finder own functions with the following keys:
	    |
	    | — done — shows finder after data for it is loaded, gets loaded
	    |          data array as an attribute
	=======================================================================


	The list of arguments inside .click() handler

	 #  | value
	=======================================================================
	 1. | Event object
	-----------------------------------------------------------------------
	 2. | Data object from Finder with the following keys:
	    |
	    | — id         — clicked row id
	    | — pid        — row parend id
	    | — name       — row name
	    | — next       — next column number (to put content there)
	    | — expandable — is row expandable or not
	-----------------------------------------------------------------------
	 3. | An object given in params attribute for .finder() method
	=======================================================================


	The list of arguments inside .dblclick() handler

	 #  | value
	=======================================================================
	 1. | Event object
	-----------------------------------------------------------------------
	 2. | An object contains Finder own functions with the following keys:
	    |
	    | — hide   — closes Finder
	    | — done   — for successful transaction ending
	    | — undone — for unsuccessful transaction ending
	-----------------------------------------------------------------------
	 3. | Data object from Finder with the following keys:
	    |
	    | — id         — clicked row id
	    | — pid        — row parend id
	    | — name       — row name
	    | — next       — next column number (to put content there)
	    | — action     — has two values: approve and cancel
	    | — expandable — is row expandable or not
	-----------------------------------------------------------------------
	 4. | An object given in params attribute for .finder() method
	=======================================================================



	Own Finder settings in params object for .finder() method

	 param           | value
	=======================================================================
	 finder_async    | True if you want to work with async data loading
	                 | (from ajax)
	-----------------------------------------------------------------------
	 finder_holder   | True if you don`t need additional column at the end
	-----------------------------------------------------------------------
	 finder_static   | True if you want a static displaying of finder
	                 | (inside of another block)
	-----------------------------------------------------------------------
	 finder_multiple | True if you want multiselect to be on
	-----------------------------------------------------------------------
	 finder_cols     | Number of columns per «page» from 2 to 4
	-----------------------------------------------------------------------
	 finder_selected | An array of row ids that should be selected for the
	                 | first Finder opening
	-----------------------------------------------------------------------
	 finder_lang     | An object contains texts for Finder`s design
	                 | elements with the following keys:
	                 |
	                 | — hat      — Finder`s title at the top
	                 | — hint     — hint for users at the bottom
	                 | — search   — placeholder for search field
	                 | — selected — title for selection filter button
	=======================================================================
