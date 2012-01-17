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
	 * @requires jQuery 1.6+
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
	 *             param2 : 'value2'
	 *         }
	 *     );
	 * </code>
	 *
	 * @public
	 * @method
	 *
	 * @param {Number|String} id for a Finder`s instance
	 *
	 * @param {Object} user defined handlers for finder actions
	 *     @option {Function} load — a handler, which loads a content for Finder
	 *         @param {Object} a hash with user params given in $.finder()
	 *         @param {Object} a hash with Finder`s own methods
	 *             @option {Function} done — method that builds Finder`s DOM from a loaded json
	 *                 @param {Array} loaded json array
	 *
	 *     @option {Function} show
	 *         @param {Object} a hash with Finder`s handlers
	 *
	 *     @option {Function} hide
	 *         @param {Object} a hash with Finder`s handlers
	 *
	 *     @option {Function} click
	 *         @param {Event} jquery event object
	 *
	 *         @param {Object} a hash with information about clicked row
	 *
	 *         @param {Object} a hash with params, given in .finder() method
	 *
	 *         @param {Object} a hash with Finder`s handlers
	 *             @option {Function} hide   close finder
	 *             @option {Function} done   successful ending of selection
	 *             @option {Function} undone unsuccessful ending of selection
	 *
	 *     @option {Function} dblclick
	 *         @param {Event} jquery event object
	 *
	 *         @param {Object} a hash with information about clicked row
	 *
	 *         @param {Object} a hash with params, given in .finder() method
	 *
	 *         @param {Object} a hash with Finder`s handlers
	 *             @option {Function} hide   close finder
	 *             @option {Function} done   successful ending of selection
	 *             @option {Function} undone unsuccessful ending of selection
	 *
	 * @param {Object} user defined params. Params for finder have «finder_» prefix
	 *
	 * @return {jQuery}
	 */
	$.fn.finder = function(id, handlers, params) {
		params   = params   ||{};
		handlers = handlers || {
			items_load : function() {return []}
		};

		var
			$finder = this;

		// Save id of current Finder instance
		params['finder_id'] = id;

		// If there`s no Finder on the page,
		// create one
		if ($finder.length == 0 || !$finder.hasClass('b-finder')) {
			$finder = finder_create.call($finder);
		}

		if ($finder.hasClass('b-finder_hidden_yes')) {
			// Save params and handlers
			$finder.data('params',   params);
			$finder.data('handlers', handlers);

			// Display Finder
			finder_show.call($finder);

			// Set a focus on a Finder`s block
			$finder.focus();
		} else {
			// Hide Finder
			finder_hide.call($finder);
		}

		return this;
	}

	/**
	 * Show Finder
	 *
	 * @private
	 */
	function
		finder_show() {
			var
				$finder  = this,
				$window  = $(document),
				$cols    = null,
				params   = $finder.data('params'),
				handlers = $finder.data('handlers');

			// Turn on static mode
			if (params.finder_static) {
				$finder.addClass('b-finder_static_yes');
			}

			// Try to get columns block with needed id
			$cols = $('.b-finder__cols_id_' + params.finder_id, $finder),

			// Close Finder by clicking at empty space
			$window.bind(
				'keydown.finder_keydown',
				function(event) {
					var
						$finder    = $('.b-finder'),
						$cols      = $('.b-finder__cols_active_yes'),
						mode       = $cols.hasClass('b-finder__cols_mode_search') ?
						             'search' :
						             'watch',
						code       = event.keyCode,
						directions = {
							38 : 'top',
							39 : 'right',
							40 : 'bottom',
							37 : 'left'
						};

					if (directions[code]) {
						// Arrow keys navigation
						event.preventDefault();

						row_go.call($cols, event, directions[code]);
					} else if (
						code == 190 && event.ctrlKey ||
						code == 190 && event.metaKey
					) {
						// Focus on search field
						$('.b-finder__field', $finder).focus();
					} else if (code == 13) {
						// Select by Enter key
						row_select.call(row_get.call($cols, mode == 'search' ? 'first' : 'last'), event);
					} else if (code == 27 && mode == 'search') {
						// Clear search results and field
						event.stopPropagation();

						filters_off.call($cols.get(0), event);
					} else if (code == 27) {
						// Close Finder
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

			if ($cols.length != 0) {
				// Display the columns block
				cols_show.call($cols);
			} else {
				if (params.finder_async) {
					// Async call of users loading handler
					handlers.load.call(
						$finder,
						params,
						{
							done : $.proxy(cols_create, $finder)
						}
					);
				} else {
					// Sync call of users loading handler
					$cols = cols_create.call($finder, handlers.load.call($finder, params));
				}
			}
		}

	/**
	 * Hide Finder
	 *
	 * @private
	 */
	function
		finder_hide() {
			var
				$finder  = this,
				params   = $finder.data('params'),
				handlers = $finder.data('handlers');

			// Kill window event handler for closing Finder
			$(document).unbind('keydown.finder_keydown');

			// Hide main wrapper
			$finder.addClass(
				'b-finder_hidden_yes'
			).removeClass(
				'b-finder_static_yes'
			);

			// Hide current columns block
			$(
				'.b-finder__cols_active_yes',
				$finder
			).removeClass(
				'b-finder__cols_active_yes'
			);

			// Execute user defined handler for hiding
			if (handlers.hide) {
				handlers.hide.call($finder, params);
			}
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
				$this   = $(this),
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
			if ($this.length > 0) {
				$this.replaceWith($finder);
			} else {
				$('body').append($finder);
			}

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
						timer = $this.data('search'),
						code  = event.keyCode;

					// Clear timer set before
					if (timer) {
						clearTimeout(timer);
					}

					// Filter some useful keys
					if ($this.hasClass('b-finder__field')) {
						if (code == 40) {
							$this.blur();
						} else if (code != 27) {
							$this.data(
								'b_finder_search',
								setTimeout(
									$.proxy(filters_on, this),
									300
								)
							);
						}
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

			// Single click at item
			$window.delegate(
				'.b-finder__row',
				'click',
				function(event) {
					row_expand.call(
						this,
						event,
						true
					);
				}
			);

			// Double click at item
			$window.delegate(
				'.b-finder__row',
				'dblclick',
				function(event) {
					row_select.call(
						this,
						event
					);
				}
			);

			return $finder;
		}

	/**
	 * Show columns block and Finder
	 */
	function
		cols_show() {
			var
				$cols    = this,
				$finder  = $cols.closest('.b-finder'),
				handlers = $finder.data('handlers'),
				params   = $finder.data('params'),
				first    = null;

			// Scroll columns up to selected items
			$cols.data('prescroll', true);

			// Initiate first expanding
			first = row_get.call($cols);

			//
			row_expand.call(first, null, true);

			// Show finder block
			$finder.removeClass('b-finder_hidden_yes');

			// Execute user defined handler for show
			if (handlers.show) {
				handlers.show.call($finder, params);
			}
		}

	/**
	 * Create DOM for columns handler and save all
	 * user given params and handlers
	 *
	 * @private
	 *
	 * @param tree
	 *
	 * @return {Object}
	 */
	function
		cols_create(tree) {
			var
				cols     = 4,
				curr     = 0,
				width    = 0,
				total    = 0,
				$finder  = this,
				$hat     = $('.b-finder__hat', $finder),
				$cols    = $('<div class="b-finder__cols"></div>'),
				$scroll  = $('<div class="b-finder__scroll"></div>'),
				$search  = $('<div class="b-finder__found"></div>'),
				levels   = {},
				groups   = {},
				params   = $finder.data('params'),
				handlers = $finder.data('handlers');

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

			// Get number of columns
			if (
				params.finder_cols &&
				params.finder_cols < 5 &&
				params.finder_cols > 0
			) {
				cols = params.finder_cols;
			}

			// Insert columns block into finder window
			$hat.after(
				$cols.addClass(
					'b-finder__cols_id_' + params.finder_id
				).addClass(
					'b-finder__cols_x_' + cols
				).addClass(
					'b-finder__cols_mode_watch'
				)
			);

			// Insert scroll into columns block
			$cols.append($scroll);

			// Count tree items
			total = tree.length;

			// Iterate through the «tree»
			for (index = 0; index < total; index++) {
				branch = tree[index];
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
					$.inArray(id, params.finder_selected) != -1
				) {
					$row.addClass(
						'b-finder__row_expanded_yes'
					).addClass(
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

			// Display Finder
			cols_show.call($cols);
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
	 * Scroll column to chosen row
	 *
	 * @param {String} mode
	 */
	function
		col_scroll(mode) {
			var
				$row = $(this),
				$col = $row.closest('.b-finder__col');

			if (
				mode == 'watch'
			) {
				// Scroll column to row
				$col.scrollTop(
					$row.offset().top -
					$row.closest('.b-finder__group').offset().top
				);
			}
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
				         'data-search',
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
	 * @param {Event} event
	 */
	function
		row_expand(event) {
			var
				$this = $(this),
				row   = $this.data('row');

			var
				$row       = row ? $(row) : $this,
				$col       = $row.closest('.b-finder__col'),
				$finder    = $col.closest('.b-finder'),
				expandable = $row.hasClass('b-finder__row_expandable_yes') ? true : false,
				id         = $row.data('id'),
				pid        = $row.data('pid'),
				level      = $col.data('level'),
				params     = $finder.data('params'),
				handlers   = $finder.data('handlers');

			// Call user`s handler for click event
			if (handlers.click && !row) {
				handlers.click.call(
					this,
					event,
					{
						id         : id,
						pid        : pid,
						next       : level + 1,
						name       : $row.text(),
						expandable : expandable
					},
					$row.closest('.b-finder').data('params'),
					{
						hide   : $.proxy(finder_hide,  $finder),
						done   : $.proxy(row_expanded, this),
						undone : $.proxy(row_undone,   this)
					}
				);
			}

			// In a synchronous mode call an expanding functions
			if (!params.finder_async) {
				row_expanded.call(this, event);
			}
		}

	/**
	 * Expand all parent groups and select all parent rows
	 *
	 * @private
	 *
	 * @param {Event} event
	 */
	function
		row_expanded(event) {
			event = event || null;

			var
				$this = $(this),
				row   = $this.data('row');

			var
				$row       = row ? $(row) : $this,
				$col       = $row.closest('.b-finder__col'),
				$cols      = $col.closest('.b-finder__cols'),
				expandable = $row.hasClass('b-finder__row_expandable_yes') ?
				             true :
				             false,
				id         = $row.data('id'),
				pid        = $row.data('pid'),
				mode       = $cols.hasClass('b-finder__cols_mode_search') ?
				             'search' :
				             'watch',
				params     = $cols.closest('.b-finder').data('params');

			// Save selected row id
			$cols.data('stopped', id);

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

			// Select current row
			$this.addClass('b-finder__row_expanded_yes');

			// Select real row (in search mode)
			if (row) {
				$row.addClass('b-finder__row_expanded_yes');
			}

			// Expand current group
			if (mode == 'watch') {
				$row.
				closest('.b-finder__group').
				addClass('b-finder__group_expanded_yes');


				// Scroll column to selected row
				if (!params || !params.finder_scroll_off) {
					col_scroll.call($row.get(0), mode);

					$cols.data(
						'scroll_timer',
						setTimeout(
							function() {
								$cols.scrollLeft(
									(
										($col.css('width').replace('px', '') - 0) +
										($col.css('margin-left').replace('px', '') - 0) +
										($col.css('margin-right').replace('px', '') - 0)
									) * (
										$col.data('level') -
										1
									)
								)
							},
							200
						)
					);
				}
			}

			// Select all parent rows
			if (mode == 'watch') {
				while (pid && pid != 'root') {
					$row = $('.b-finder__row_id_' + pid, $cols);
					id   = $row.data('id');
					pid  = $row.data('pid');

					$row.addClass('b-finder__row_expanded_yes');

					$row
					.closest('.b-finder__group')
					.addClass('b-finder__group_expanded_yes');

					if (!params || !params.finder_scroll_off) {
						col_scroll.call($row.get(0), mode);
					}
				}
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
				$this = $(this),
				row   = $this.data('row');

			var
				$row     = row ? $(row) : $this,
				$group   = $row.closest('.b-finder__group'),
				$col     = $row.closest('.b-finder__col'),
				$cols    = $col.closest('.b-finder__cols'),
				$finder  = $cols.closest('.b-finder'),
				params   = $finder.data('params'),
				handlers = $finder.data('handlers'),
				clear    = params.finder_multiple && event.ctrlKey ||
				           params.finder_multiple && event.metaKey ?
				           false :
				           true,
				scroll   = $cols.data('scroll'),
				next     = ($col.data('level') - 0) + 1,
				action   = $row.hasClass('b-finder__row_selected_yes') ?
				           'cancel' :
				           'approve',
				pid      = $group.data('id'),
				id       = $row.data('id'),
				row      = $row.data('row');

			// Clear scroller timer
			if (scroll) {
				clearTimeout(scroll);
			}

			// If there`s no user`s handler or it`s not a function
			// do nothing
			if (handlers.dblclick) {
				// Clear previous selections
				if (clear && action == 'approve') {
					$cols.data('clear', true);
				}

				if (action == 'cancel') {
					// Revert selection to cancel
					$this.addClass('b-finder__row_cancel_yes');
				}

				// Turn on loader
				$this.addClass('b-finder__row_loading_yes');

				//
				handlers.dblclick.call(
					this,
					event,
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
					params,
					{
						hide   : $.proxy(finder_hide,  $cols.closest('.b-finder')),
						done   : $.proxy(row_selected, this),
						undone : $.proxy(row_undone,   this)
					}
				);
			}
		}

	/**
	 * Go to row
	 *
	 * @private
	 *
	 * @param {String} direction
	 */
	function
		row_go(event, direction) {
			var
				$cols = this,
				mode  = $cols.hasClass('b-finder__cols_mode_search') ? 'search' : 'watch',
				$row  = $(row_get.call(
				           mode == 'search' ?
				           $('.b-finder__found', $cols) :
				           this,
				           'last'
				        )),
				$next = null;

			if (direction == 'top') {
				// Select previous row in group
				$next = $row.prev();
			} else if (direction == 'bottom') {
				// Select next row in group
				$next = $row.next();
			} else if (
				mode == 'watch' &&
				$row.hasClass('b-finder__row_expandable_yes') &&
				direction == 'right' ||
				mode == 'watch' &&
				direction == 'left' &&
				$row.data('pid') != 'root'
			) {
				if (direction == 'right') {
					// Choose firs row in a child group
					$next = $(
						row_get.call(
							$('.b-finder__group_expanded_yes:last', $cols),
							'first'
						)
					);
				} else {
					// Clean previous selection
					$row.removeClass('b-finder__row_expanded_yes');

					// Choose parent row
					$next = $('.b-finder__row_id_' + $row.data('pid'), $cols);
				}
			}

			// Turn on prescroll
			$cols.data('prescroll', true);

			// Call expand function for the chosen row
			if ($next && $next.length > 0) {
				row_expand.call($next.get(0), event, true);
			}
		}

	/**
	 * Find first selected row or first row
	 * in root group
	 *
	 * @private
	 *
	 * @param {String} order
	 *
	 * @return {Object}
	 */
	function
		row_get(order) {
			order = order || 'first';

			var
				$this = this,
				id    = $this.data('stopped'),
				row   = null;

			// Get the first expanded row
			if (id) {
				row = $(
					'.b-finder__row_id_' + id,
					$this
				);
			} else {
				row = $(
					'.b-finder__row_expanded_yes:' + order,
					$this
				).get(0);
			}

			// Get any row
			if (!row) {
				if (
					$this.hasClass('b-finder__group') ||
					$this.hasClass('b-finder__found')
				) {
					row = $(
						'.b-finder__row',
						$this
					).get(0);
				} else {
					row = $(
						'.b-finder__group_id_root .b-finder__row:' + order,
						$this
					).get(0);
				}
			}

			return row;
		}

	/**
	 * Success handler
	 *
	 * @private
	 */
	function
		row_selected() {
			var
				$row  = $(this),
				$cols = $row.closest('.b-finder__cols'),
				clear = $cols.data('clear'),
				row   = $row.data('row');

			// Clear previuos selected items
			if (clear) {
				$(
					'.b-finder__row_selected_yes',
					$cols
				).removeClass(
					'b-finder__row_selected_yes'
				);

				$cols.removeData('clear');
			}

			// Remove selection from row or set it
			if ($row.hasClass('b-finder__row_cancel_yes')) {
				$row.removeClass('b-finder__row_selected_yes');

				if (row) {
					$(row).removeClass('b-finder__row_selected_yes');
				}
			} else {
				//
				$row.addClass('b-finder__row_selected_yes');

				//
				if (row) {
					$(row).addClass('b-finder__row_selected_yes');
				}
			}

			// Turn off loader
			$row.removeClass(
				'b-finder__row_loading_yes'
			).removeClass(
				'b-finder__row_cancel_yes'
			);

			// Draw «path» to selected row
			row_expand.call(this, null, true);
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
			);

			// Draw «path» to selected row
			row_expand.call(this, null, true);
		}

	/**
	 * Filter columns by given word(s) or by selection
	 *
	 * @private
	 */
	function
		filters_on() {
			var
				$this  = $(this),
				$cols  = $(
				           '.b-finder__cols_active_yes',
				           $this.closest('.b-finder__window')
				         ),
				$row   = null,
				$rows  = null,
				$anti  = null,
				$found = $('.b-finder__found', $cols).empty(),
				index  = 0,
				length = 0,
				row    = '',
				prow   = '',
				needle = '';

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
						'.b-finder__row[data-search^="' + needle.toLowerCase() + '"],' +
						'.b-finder__row[data-search*=" ' + needle.toLowerCase() + '"]',
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
					       .data('row', this);

					// Remove a row`s id from a class
					$row.removeClass('b-finder__row_id_' + $row.data('id'));

					// Set selection at the first element
					if (index == 0) {
						$row.addClass('b-finder__row_expanded_yes');
					}

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

					index++;
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
			first = row_get.call($cols, 'last');

			// Expand rows
			row_expand.call(
				first,
				event
			);
		}


})(jQuery);