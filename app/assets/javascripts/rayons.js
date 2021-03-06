Rayons = {};

Rayons.Item = {
  bind: function() {
    $(document).delegate('a.delete', 'click', Rayons.Item.destroy)
               .delegate('a.edit', 'click', Rayons.Item.edit)
               .delegate('a.save', 'click', Rayons.Item.save);
  },

  // Delete an item using ajax, then show the message and fade out the row.
  destroy: function(e) {
    if(confirm("Are you sure you want to delete this item?")) {
      var $link = $(e.target);

      $.ajax({
        url: $link.attr('href'),
        type: 'DELETE',
        data: {
          'authenticity_token': $('[name=authenticity_token]').val()
        },
        dataType: 'json',
        success: function(response) {
          Rayons.UI.show_message("Item deleted!");
          $link.parents('tr').remove();
        }
      });
    }

    return false;
  },

  edit: function(e) {
    var $this = $(e.target),
        $row = $this.parents('tr');

    $row.find('td:not(.edit):not(.save)').each(function() {
      $(this).html("<input type=text name="+$(this).attr('class')+" value='" + $(this).html().replace(/'/, '&apos;') + "' />");
    });

    $this.parent().hide().siblings('td.save').show();

    $('html, body').animate( {
      scrollTop: $row.offset().top - 50
    }, 100);

    return false;
  },

  save: function(e) {
    var data = {'authenticity_token': $('[name=authenticity_token]').val(), 'item': {}},
        $link = $(e.target);

    $link.parents('tr').find('input').each(function() { data.item[$(this).attr('name')] = $(this).val(); });

    $.ajax({
      url: $link.attr('href'),
      data: data,
      dataType: 'json',
      type: 'PUT',
      success: function(response) {
        $link.parents('tr').find('td:not(.edit):not(.save)').each(function() {
          $(this).html($(this).find('input').val());
        });
        $link.parent().hide().siblings('td.edit').show();
      }
    });
    return false;
  }

};

Rayons.Stats = {
  bind: function() {
    $.each($('.frequency'), function(i, freq) {
      $.getJSON('/items/words_for_field?field='+$(freq).data('field'), function(response) {
        $(freq).jQCloud(response);
      });
    });

    $('.switcher a').click(Rayons.Stats.switch_view);

    var cal = new CalHeatMap();
    cal.init({
      start: new Date(2012, 1, 1), // February 1, 2012
      cellSize: 10,
      range: 24,
      domain: "month",
      subDomain: "day",
      legend: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      legendColors: {
        min: "#efefef",
        max: "#2c6079"
      },
      displayLegend: false,
      data: '/items/counts_by_day.json'
    });
  },

  switch_view: function(e) {
    var $this = $(e.target);

    if($this.data('target') === undefined) { return true; }
    if($this.is('.active')) { return false; }

    $('.switcher a.active').each(function() {
      $($(this).data('target')).fadeOut(600);
      $(this).removeClass('active');
    });

    $($this.data('target')).fadeIn(600);
    $this.addClass('active');

    return false;
  }

};

Rayons.UI = {
  bind: function() {
    $(document).delegate('form.ajax', 'submit', Rayons.UI.ajax_submit);
    $('a.login, a.import').on('click', Rayons.UI.show_editing_form);
    $('a.random').on('click', Rayons.UI.scroll_to_random);
    $('.toggle-controls a').on('click', Rayons.UI.toggle_editing_bar);
    $('a[data-sort]').click(Rayons.UI.sort);
  },

  // bind to form submission (adding/updating an item)
  // show the message and add the row to the bottom of the table
  ajax_submit: function(e) {
    var $form = $(e.target);

    $.ajax({
      url: $form.attr('action'),
      type: $form.attr('method'),
      data: $form.serialize(),
      dataType: 'json',
      success: function(response) {
        console.log("RESP", response);
        Rayons.UI.show_message("Item created!");
        $(response.item_markup).insertAfter('table tr:first');
        $form.find('input[type=text]').val('');
      },
      error: function(response) {
        var json = JSON.parse(response.responseText);
        Rayons.UI.show_message(json.join('! '));
      }
    });

    return false;
  },

  // select random data row, highlight it and scroll the window
  // to it
  scroll_to_random: function() {
    $('tr.hover').removeClass('hover');
    var rows = $('tr[data-id]:not(.edit)'),
        index = Math.floor(Math.random() * rows.length),
        $row = $(rows[index]);

    $row.addClass('hover');
    $('html, body').animate( {
      scrollTop: $row.offset().top
    }, {duration: 1200, easing: "easeInQuad"});

    return false;
  },

  show_editing_form: function(e) {
    $('#editing-bar form').show();
    $(e.target).hide();
    return false;
  },

  show_message: function(message) {
    $('.message:first').html(message).fadeIn(400).delay(4000).fadeOut(400);
  },

  sort: function(e) {
    var $this = $(e.target),
        direction = $('table').data('direction'),
        current_sort = $('table').data('sort'),
        delim = window.location.href.indexOf('?') == -1 ? '?' : '&';

    // swap direction if we're using the same sorting column
    if($this.data('sort') == current_sort) {
      if(direction == 'ASC') {
        direction = 'DESC';
      } else {
        direction = 'ASC';
      }
    } else {
      direction = 'ASC';
    }

    window.location.href = window.location.href + delim + 'sort='+$this.data('sort')+'&direction='+direction;
    return false;
  },

  toggle_editing_bar: function(e) {
    var $this = $(e.target);
    if($('#editing-bar').is(':visible')) {
      $('#editing-bar').fadeOut(400);
      $this.text('show controls');
    } else {
      $('#editing-bar').fadeIn(400);
      $this.text('hide controls');
    }
    return false;
  }

};
