;(function($) {


	/**
	 * b-finder
	 *
	 * @desc Column viewer of tree structured data
	 *
	 * @version 3.0
	 * @author  Shushik <silkleopard@yandex.ru>
	 * @page    http://github.com/Shushik/b-finder
	 *
	 * @requires jQuery 1.4+
<<<<<<< HEAD
=======
	 *
	 * @example
	 * <code>
	 *     $('.b-finder').finder(
	 *         'iddqd',
	 *         {
	 *             load     : function(ext) {},
	 *             click    : function(ext) {},
	 *             dblclick : function(ext) {}
	 *         },
	 *         {
	 *             param1 : 'value1',
	 *             param2 : 'value2',
	 *         }
	 *     );
	 * </code>
>>>>>>> JS Refactoring
	 *
	 * @public
	 * @method
	 *
	 * @param {Number|String} id
	 *
	 * @param {Object}        handlers
<<<<<<< HEAD
	 *     @option
	 * @param {Object}        params
	 *     @option
=======
	 *     @option {Function} load     handler that loads content for columns structure generation
	 *         @param {Object} a hash with properties given in .finder() method
	 *
	 *     @option {Function} click    handler for single click (optional)
	 *         @param {Event}  event variable
	 *         @param {Object} a hash with information about clicked row
	 *         @param {Object} a hash with properties given in .finder() method
	 *
	 *     @option {Function} dblclick handler for double click
	 *         @param {Event}  event variable
	 *         @param {Object} a hash with several finder methods
	 *             @option {Function} done   successful ending of selection
	 *             @option {Function} undone unsuccessful ending of selection
	 *             @option {Function} close  close finder
	 *         @param {Object} a hash with information about clicked row
	 *         @param {Object} a hash with properties given in .finder() method
	 *
	 * @param {Object}        params
	 *     @option {Boolean} finder_holder   true if you don`t need extra end empty column
	 *     @option {Boolean} finder_multiple true if you want a multiselect mode
	 *     @option {Number}  finder_cols     number of columns shown in one window (1 — 4)
	 *     @option {Object}  an array with the row ids, that should be selected by default
	 *     @option {Object}  a hash with text values for different ui elements
	 *         @option {String} hat      title in the top of the window
	 *         @option {String} hint     short hint in the bottom of the window
	 *         @option {String} search   search field placeholder
	 *         @option {String} selected title hint for filter of selected rows
>>>>>>> JS Refactoring
	 *
	 * @return {Object}
	 */
	$.fn.finder = function(id, handlers, params) {
		params   = params   || {};
		handlers = handlers || {
			items_load : function() {return []}
		};

		var
			$finder = this;

		// If there`s no Finder on the page,
		// create one
		if ($finder.length == 0) {
			$finder = finder_create();
		}

		// Display or hide Finder
		if ($finder.hasClass('b-finder_hidden_yes')) {
			finder_show.call($finder, id, handlers, params);
		} else {
			finder_hide.call($finder);
		}

		return this;
	}

	/**
	 * Show Finder
	 *
	 * @private
	 *
	 * @param {Number|String} id
	 * @param {Object}        handlers
	 * @param {Object}        params
	 */
	function
		finder_show(id, handlers, params) {
			var
				$finder = this,
				$window = $(window),
				$cols   = $('.b-finder__cols_id_' + id, $finder),
				first   = null;

			// Close Finder by clicking at empty space
			$window.bind(
				'keydown.b_finder_hide',
				function(event) {
					var
						$finder = $('.b-finder'),
						$cols   = $('.b-finder__cols_active_yes'),
						mode    = $cols.hasClass('b-finder__cols_mode_search') ?
						          'search' :
						          'watch',
						code    = event.keyCode;

					if (code == 27 && mode == 'search') {
						event.stopPropagation();

						filters_off.call($cols.get(0), event);
					} else if (code == 27) {
						finder_hide.call($finder);
					}
				}
			);

			// Insert text for hat
			$(
				'.b-finder__hat',
				$finder
			).html(
				params.finder_lang && params.finder_lang.hat ?
				params.finder_lang.hat :
				'&nbsp;'
			);

			// Insert text for hint
			$(
				'.b-finder__hint',
				$finder
			).html(
				params.finder_lang && params.finder_lang.hint ?
				params.finder_lang.hint :
				'&nbsp;'
			);

			// Insert placeholder for search field
			$(
				'.b-finder__field',
				$finder
			).attr(
				'placeholder',
				params.finder_lang && params.finder_lang.search ?
				params.finder_lang.search :
				''
			);

			// Insert title for filter button
			$(
				'.b-finder__filter',
				$finder
			).attr(
				'title',
				params.finder_lang && params.finder_lang.selected ?
				params.finder_lang.selected :
				''
			);

			// Load content and generate columns html
			if ($cols.length == 0) {
				$cols = cols_create.call($finder, id, handlers, params);
			}

			// Scroll columns up to selected items
			$cols.data('b_finder_prescroll', true);

			// Initiate first expanding
			first = row_first.call($cols);

			//
			row_expand.call(first, null, true);

			// Show finder block
			$finder.removeClass('b-finder_hidden_yes');
		}

	/**
	 * Hide Finder
	 *
	 * @private
	 */
	function
		finder_hide() {
			var
				$finder = this;

			// Kill window event handler for closing Finder
			$(window).unbind('keydown.b_finder_hide');

			// Hide main wrapper
			$finder.addClass('b-finder_hidden_yes');

			// Hide current columns block
			$(
				'.b-finder__cols_active_yes',
				$finder
			).removeClass(
				'b-finder__cols_active_yes'
			);
		}


	/**
	 * Create Finder`s DOM
	 *
	 * @private
	 *
	 * @return {Object}
	 */
	function
		finder_create() {
			var
				$finder = $(
							'<table class="b-finder b-finder_hidden_yes">' +
								'<tr><td class="b-finder__valign">' +
									'<div class="b-finder__window">' +
										'<div class="b-finder__search">' +
											'' +
											'<div class="b-finder__filter"></div>' +
											'<div class="b-finder__clear">×</div>' +
											'<input ' +
												'class="b-finder__field" ' +
												'autocomplete="off" ' +
											'>' +
										'</div>' +
										'<div class="b-finder__hide">×</div>' +
										'<div class="b-finder__hat"></div>' +
										'<div class="b-finder__hint"></div>' +
									'</div>' +
								'</td></tr>' +
							'</table>'
						),
				$window = $('.b-finder__window', $finder),
				$hide   = $('.b-finder__hide', $window);

			// Create new Finder in document
			$('body').append($finder);

			// Close Finder by clicking at empty space around
			$finder.click(function(event) {
				finder_hide.call($(this));
			});

			// Close Finder by clicking at cross
			$hide.click(function(event) {
				finder_hide.call($(this).closest('.b-finder'));
			});

			// Do not bubble events upper that window
			$window.click(function(event) {
				event.stopPropagation();
			});

			// Keyboard press in search field
			$window.delegate(
				'.b-finder__field',
				'keydown',
				function(event) {
					var
						$this = $(this),
						timer = $this.data('b_finder_search'),
						code  = event.keyCode;

					// Clear timer set before
					if (timer) {
						clearTimeout(timer);
					}

					// Filter some useful keys
					if (
						$this.hasClass('b-finder__field') &&
						code != 37 &&
						code != 38 &&
						code != 39 &&
						code != 40 &&
						code != 27
					) {
						$this.data(
							'b_finder_search',
							setTimeout(
								$.proxy(filters_on, this),
								300
							)
						);
					}
				}
			);

			// Click at filter`s button
			$window.delegate(
				'.b-finder__filter',
				'click',
				function(event) {
					var
						$this = $(this);

					if ($this.hasClass('b-finder__filter_active_yes')) {
						$this.removeClass('b-finder__filter_active_yes');

						filters_off.call(this, event);
					} else {
						$this.addClass('b-finder__filter_active_yes');

						filters_on.call(this);
					}
				}
			);

			// Click at cross at search field
			$window.delegate(
				'.b-finder__clear',
				'click',
				filters_off
			);

			// Hover at column with focus
			$window.delegate(
				'.b-finder__col',
				'mouseover',
				function(event) {
					$(this).focus();
				}
			);

<<<<<<< HEAD
			// Click at item in list
=======
			// Single click at item
>>>>>>> JS Refactoring
			$window.delegate(
				'.b-finder__row',
				'click',
				function(event) {
					var
						$row = $(this),
						row  = $row.data('b_finder_row');

					if (!$row.hasClass('b-finder__row_expanded_yes')) {
						//
						if (row) {
							row_expand.call(
								row,
								event,
								true
							);
						}

						//
						row_expand.call(
							this,
							event,
							true
						);
					}
				}
			);

			// Double click at item
			$window.delegate(
				'.b-finder__row',
				'dblclick',
				function(event) {
					var
						$row = $(this),
						row  = $row.data('b_finder_row');

					//
					if (row) {
						row_select.call(
							row,
							event
						);
					}

					//
					row_select.call(
						this,
						event
					);
				}
			);

			return $finder;
		}

	/**
	 * Create DOM for columns handler and save all
	 * user given params and handlers
	 *
	 * @private
	 *
	 * @param {Number|String} id
	 * @param {Object}        handlers
	 * @param {Object}        params
	 *
	 * @return {Object}
	 */
	function
		cols_create(id, handlers, params) {
			var
				cols    = params.finder_cols &&
				          typeof params.finder_cols == 'number' &&
				          params.finder_cols < 5 &&
				          params.finder_cols > 0 ?
				          params.finder_cols :
				          4,
				curr    = 0,
				width   = 0,
				$hat    = $('.b-finder__hat', this),
				$cols   = $('<div class="b-finder__cols"></div>'),
				$scroll = $('<div class="b-finder__scroll"></div>'),
				$search = $('<div class="b-finder__found"></div>'),
				levels  = {},
				groups  = {};

			var
				id,
				pid,
				tree,
				name,
				full,
				level,
				index,
				branch,
				$col,
				$row,
				$group;

			// Insert columns block into finder window
			$hat.after(
				$cols.addClass(
					'b-finder__cols_id_' + id
				).addClass(
					'b-finder__cols_x_' + cols
				).addClass(
					'b-finder__cols_mode_watch'
				).data(
					'b_finder_params',
					params
				)
			);

			// Save given handlers for further using
			for (index in handlers) {
				$cols.data('b_finder_' + index, handlers[index]);
			}

			// Insert scroll into columns block
			$cols.append($scroll);

			// Get the «tree»
			tree = handlers.load(params);

			// Iterate through the «tree»
			for (index = 0; index < tree.total; index++) {
				branch = tree.items[index];
				level  = branch.level;
				name   = branch.name;
				pid    = 'root';
				id     = branch.id;

				// Get the parent id
				if (branch.parentId) {
					pid = branch.parentId;
				} else if (branch.parent_id) {
					pid = branch.parent_id;
				} else if (branch.pid) {
					pid = branch.pid;
				}

				// Create new column
				if (!levels[level]) {
					levels[level] = col_create.call($scroll, level);

					if (curr < level) {
						curr = level;
					}
				}

				// Create new group
				if (!groups[pid]) {
					groups[pid] = group_create.call(levels[level], pid);
				}

				// Create new row
				$row = row_create.call(groups[pid], id, pid, name);

				// Select chosen row(s)
				if (
					params.finder_selected &&
					params.finder_selected.indexOf(id) > -1
				) {
					$row.addClass(
						'b-finder__row_selected_yes'
					);
				}
			}

			// Make rows with children expandable
			for (index in groups) {
				$(
					'.b-finder__row_id_' + groups[index].data('id'),
					$cols
				).addClass(
					'b-finder__row_expandable_yes'
				);
			}

			// Insert search results block
			$(
				'.b-finder__col_level_1',
				$cols
			).append(
				$search
			);

			// Create +1 column
			if (!params.finder_holder) {
				col_create.call($scroll, curr + 1);
			}

			return $cols;
		}

	/**
	 * Create column DOM
	 *
	 * @private
	 *
	 * @param {Number} level
	 *
	 * @return {Object}
	 */
	function
		col_create(level) {
			var
				$scroll = this,
				$col    = $(
				              '<div class="b-finder__col"></div>'
				          ).addClass(
				              'b-finder__col_level_' + level
				          ).data(
				              'level',
				              level
				          ),
				width   = $scroll.css('width').replace('px', '') - 0;

				// Insert column into scrolling block
				$scroll.append($col);

				// Get the width of the current column
				width += ($col.css('width').replace('px', '') - 0) +
				         ($col.css('margin-right').replace('px', '') - 0) +
				         ($col.css('margin-left').replace('px', '') - 0);

				// Set width for the scrolling block
				$scroll.css('width', width + 'px')

			return $col;
		}
	
	/**
	 * Create group DOM
	 *
	 * @private
	 *
	 * @param {Number|String} id
	 *
	 * @return {Object}
	 */
	function
		group_create(id) {
			var
				$col   = this,
				$group = $(
				             '<div class="b-finder__group b-finder__group_id_' + id + '"></div>'
				         ).data(
				             'id',
				             id
				         );

			// Root group should be chosen by default
			if (id == 'root') {
				$group.addClass('b-finder__group_expanded_yes');
			}

			// Insert group into column
			$col.append($group);

			return $group;
		}

	/**
	 * Create row DOM
	 *
	 * @private
	 *
	 * @param {Number|String} id
	 * @param {String}        name
	 *
	 * @return {Object}
	 */
	function
		row_create(id, pid, name) {
			var
				$row = $('<div class="b-finder__row b-finder__row_id_' + id + '"></div>').text(
				         name
				       ).attr(
				         'title',
				         name.toLowerCase()
				       ).data(
				           {
				               id  : id,
				               pid : pid
				           }
				       ),
				$group = this;

			// Insert row into group
			$group.append($row);

			return $row;
		}

	/**
	 * Expand a group associated with the chosen row
	 * and execute user`s handler for a single click
	 *
	 * @private
	 *
	 * @param {Event}   event
	 * @param {Boolean} first
	 * @param {Boolean} no_scroll
	 */
	function
		row_expand(event, first, no_scroll) {
			first = first         || false;
			no_scroll = no_scroll || false;

			var
				$row       = $(this),
				$group     = $row.closest('.b-finder__group'),
				$col       = $row.closest('.b-finder__col'),
				$scroll    = $col.closest('.b-finder__scroll'),
				$cols      = $scroll.closest('.b-finder__cols'),
				expandable = $row.hasClass('b-finder__row_expandable_yes') ? true : false,
				id         = $row.data('id'),
				pid        = $group.data('id'),
				level      = $col.data('level'),
				scroll     = $cols.data('b_finder_prescroll'),
				mode       = $cols.hasClass('b-finder__cols_mode_search') ?
				             'search' :
				             'watch',
				counter    = level - 1,
				next       = $('.b-finder__row_id_' + pid, $cols).get(0),
				handler    = $cols.data('b_finder_click');

			if (first) {
				// Focus on the first selected element
				$col.focus();

				// Call user`s handler for click event
				if (typeof handler == 'function') {
					handler.call(
						this,
						event,
						{
							id         : id,
							pid        : pid,
							next       : level + 1,
							name       : $row.text(),
							expandable : expandable
						},
						$cols.data('b_finder_params')
					);
				}

				// Remove previous selections from groups
				$(
					'.b-finder__group_expanded_yes',
					$cols
				).removeClass(
					'b-finder__group_expanded_yes'
				);

				// Remove previous selections from rows
				$(
					'.b-finder__row_expanded_yes',
					$cols
				).removeClass(
					'b-finder__row_expanded_yes'
				);

				// View child group
				if (expandable) {
					$(
						'.b-finder__group_id_' + id,
						$cols
					).addClass(
						'b-finder__group_expanded_yes'
					);
				}

				// Display columns block
				$cols.addClass('b-finder__cols_active_yes');
			}

			// Select current row
			$row.addClass('b-finder__row_expanded_yes');

			// Expand current group
			$group.addClass('b-finder__group_expanded_yes');

			if (mode == 'watch' && first && !no_scroll) {
				// Scroll columns block to expanded column
				$cols.data(
					'b_finder_scroll',
					setTimeout(
						function() {
							$cols.scrollLeft(
								(
									($col.css('width').replace('px', '') - 0) +
									($col.css('margin-left').replace('px', '') - 0) +
									($col.css('margin-right').replace('px', '') - 0)
								) *
								counter
							);
						},
						200
					)
				);
			}

			if (mode == 'watch' && !first) {
				// Scroll column to row
				$col.scrollTop(
					$row.offset().top -
					$group.offset().top
				);

				//
				if (level == 1) {
					$cols.removeData('b_finder_prescroll');
				}
			}

			// Select next row
			if (level > 1) {
				row_expand.call(next, event, false);
			}
		}

	/**
	 * Select chosen row and execute user`s handler
	 * for a double click
	 *
	 * @private
	 *
	 * @param {Event} event
	 */
	function
		row_select(event) {
			var
				$row     = $(this),
				$group   = $row.closest('.b-finder__group'),
				$col     = $row.closest('.b-finder__col'),
				$cols    = $col.closest('.b-finder__cols'),
				multiple = $cols.data('b_finder_multiple'),
				handler  = $cols.data('b_finder_dblclick'),
				scroll   = $cols.data('b_finder_scroll'),
				params   = $cols.data('b_finder_params'),
				clear    = params.finder_multiple && event.ctrlKey ||
				           params.finder_multiple && event.metaKey ?
				           false :
				           true,
				next     = ($col.data('level') - 0) + 1,
				action   = $row.hasClass('b-finder__row_selected_yes') ?
				           'cancel' :
				           'approve',
				pid      = $group.data('id'),
				id       = $row.data('id');

			// Clear scroller timer
			if (scroll) {
				clearTimeout(scroll);
			}

			// If there`s no user`s handler or it`s not a function
			// do nothing
			if (typeof handler == 'function') {
				// Clear previous selections
				if (clear && action == 'approve') {
					$cols.data('b_finder_clear', true);
				}

				if (action == 'cancel') {
					// Revert selection to cancel
					$row.addClass('b-finder__row_cancel_yes');
				}

				// Turn on loader
				$row.addClass('b-finder__row_loading_yes');

				// Call user`s handler for double click event
				handler.call(
					this,
					event,
					{
						hide   : $.proxy(finder_hide, $cols.closest('.b-finder')),
						done   : $.proxy(row_done,    $row),
						undone : $.proxy(row_undone,  $row)
					},
					{
						id         : id,
						pid        : pid,
						next       : next,
						name       : $row.text(),
						action     : action,
						expandable : $row.hasClass('b-finder__row_expandable_yes') ?
						             true :
						             false
					},
					params
				);
			}
		}

	/**
	 * Find first selected row or first row
	 * in root group
	 *
	 * @private
	 *
	 * @return {Object}
	 */
	function
		row_first() {
			var
				$cols = this,
				first = null;

			// Get the first selected row
			first = $(
				'.b-finder__row_selected_yes:first',
				$cols
			).get(0);

			// Get any row
			if (!first) {
				first = $(
					'.b-finder__group_id_root .b-finder__row:first',
					$cols
				).get(0);
			}

			return first;
		}

	/**
	 * Success handler
	 *
	 * @private
	 */
	function
		row_done() {
			var
				$row  = this,
				$cols = $row.closest('.b-finder__cols'),
				clear = $cols.data('b_finder_clear');

			// Clear previuos selected items
			if (clear) {
				$(
					'.b-finder__row_selected_yes',
					$cols
				).removeClass(
					'b-finder__row_selected_yes'
				);

				$cols.removeData('b_finder_clear');
			}

			// Remove selection from row or set it
			if ($row.hasClass('b-finder__row_cancel_yes')) {
				$row.removeClass('b-finder__row_selected_yes');
			} else {
				$row.addClass('b-finder__row_selected_yes');
			}

			// Turn off loader
			$row.removeClass(
				'b-finder__row_loading_yes'
			).removeClass(
				'b-finder__row_cancel_yes'
			);

			// Draw «path» to selected row
			row_expand.call(this, null, true, true);
		}

	/**
	 * Error handler
	 *
	 * @private
	 *
	 */
	function
		row_undone() {
			var
				$row = this;

			// Turn off loader
			$row.removeClass(
				'b-finder__row_loading_yes'
			).addClass(
				'b-finder__row_expanded_yes'
			);
		}

	/**
	 * Filter columns by given word(s) or by selection
	 *
	 * @private
	 */
	function
		filters_on() {
			var
				$this    = $(this),
				$cols    = $(
				             '.b-finder__cols_active_yes',
				             $this.closest('.b-finder__window')
				           ),
				$row     = null,
				$rows    = null,
				$anti    = null,
				$found   = $('.b-finder__found', $cols).empty(),
				length   = 0,
				row      = '',
				prow     = '',
				needle   = '';

			// Switch mode to «search»
			$cols.removeClass(
				'b-finder__cols_mode_watch'
			).addClass(
				'b-finder__cols_mode_search'
			).scrollLeft(0);

			if ($this.hasClass('b-finder__field')) {
				needle = $this.val();
				length = needle.length;

				// Search by word
				if (length > 0) {
					$rows = $(
						'.b-finder__row[title^="' + needle.toLowerCase() + '"],' +
						'.b-finder__row[title*=" ' + needle.toLowerCase() + '"]',
						$cols
					);
				} else {
					$rows = $('.b-finder__row', $cols);
				}
			} else {
				// Search by selection
				$rows = $('.b-finder__row_selected_yes', $cols);
			}

			// Iterate through the selected rows
			if ($rows && $rows.length > 0) {
				$rows.each(function() {
					$row = $(this)
					       .clone()
					       .removeClass('b-finder__row_expandable_yes')
					       .removeClass('b-finder__row_expanded_yes')
					       .removeClass('b-finder__row_loading_yes')
					       .data('b_finder_row', this);

					// Highlight found symbols
					if (length > 0) {
						$row.html(
							$row.text()
							.replace(
								new RegExp('(^| )(' + needle + ')', 'i'),
								'$1<span class="b-finder__highlight">$2</span>'
							)
						);
					}

					// Get text from parent row
					if (
						prow = $(
								'.b-finder__group .b-finder__row_id_' +
								$(this).data('pid'),
								$cols
							).text()
					) {
						$row.prepend(prow + ' > ');
					}

					$found.append($row);
				});
			}
		}

	/**
	 * Turn off all filters and clean their results
	 *
	 * @param {Event} event
	 *
	 * @private
	 */
	function
		filters_off(event) {
			var
				$finder = $(this).closest('.b-finder'),
				$window = $('.b-finder__window', $finder),
				$cols   = $('.b-finder__cols_active_yes', $window),
				first   = null;

			// Switch mode to «watch»
			$cols.removeClass(
				'b-finder__cols_mode_search'
			).addClass(
				'b-finder__cols_mode_watch'
			);

			// Empty previous results
			$('.b-finder__found', $cols).empty();

			// Clean search field
			$(
				'.b-finder__field',
				$window
			).val(
				''
			).blur();

			// Deactivate filter button
			$(
				'.b-finder__filter',
				$window
			).removeClass(
				'b-finder__filter_active_yes'
			);

			// Get first row to select
			first = row_first.call($cols);

			// Expand rows
			row_expand.call(
				first,
				event
			);
		}


})(jQuery);