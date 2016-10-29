var SequenceDotView = Backbone.View.extend({

  className: 'sequence-dot',

  events: {
  },

  initialize: function(option) {
    this.w = option.size;
    this.h = option.size;
    this.x = option.x;
    this.y = option.y;
  },

  render: function() {
    this.el.style.width = this.w + 'px';
    this.el.style.height = this.h + 'px';
    this.el.style.left =  this.x + 'px';
    this.el.style.top =  this.y + 'px';
    return this;
  }
});

var SequenceView = Backbone.View.extend({

  className: 'sequence',

  events: {
  },

  initialize: function(option) {
    this.sequence = new Array(option.matrix_x);
    this.grid_size = option.grid_size;
  },

  activate: function(number) {
    for (let i = 0; i < this.sequence.length; i++) {
      this.sequence[i].$el.removeClass('on');
    }
    this.sequence[number].$el.addClass('on');
  },

  render: function() {
    for (let i = 0; i < this.sequence.length; i++) {
      this.sequence[i] = new SequenceDotView({
        x: 25 * (i + 1) + this.grid_size * i + 52,
        y: 8,
        size: 10
      });
      this.$el.append(this.sequence[i].render().el);
    }
    return this;
  }
});


var GridView = Backbone.View.extend({

  className: 'grid',

  events: {
    'mouseenter': 'zoom'
  },

  initialize: function(option) {
    this.w = option.size;
    this.h = option.size;
    this.x = option.x;
    this.y = option.y;
    this.gzoom = 2;
    this.gzoom_base = 1;
    this.accel = 42;
    this.slow = 1.04;
    this.vx = 0;
    this.vxplus = 0.2;
    this.rotate = 0;
    this.is_bang = false;
  },

  update: function() {
    this.vx = (this.vx + (this.gzoom_base - this.gzoom)/this.accel)/this.slow;
    this.gzoom = this.gzoom + this.vx;
    //this.rotate += 10;
    this.el.style.transform = "rotate(" + this.rotate + "deg) scale(" + this.gzoom +")";
  },

  zoom: function() {
    this.vx += this.vxplus;
    this.$el.addClass('on');
    this.is_bang = true;
  },

  bang: function(value) {
    this.vx += value;
    this.$el.addClass('on');
    this.is_bang = true;
  },

  reset: function() {
    this.$el.removeClass('on');
    this.is_bang = false;
  },

  render: function() {
    this.el.style.width = this.w + 'px';
    this.el.style.height = this.h + 'px';
    this.el.style.left =  this.x + 'px';
    this.el.style.top =  this.y + 'px';
    if (window.fullcolor) {
      this.el.style.backgroundColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    } else {
      this.el.style.backgroundColor =  '#f00';
    }
    return this;
  }
});


var AppView = Backbone.View.extend({

  el: $("#arpone-body"),

  events: {
  },

  initialize: function() {
    this.matrix_x = 8;
    this.matrix_y = 16;
    this.grid_size = 58;
    this.matrix = new Array(this.matrix_y);
    for (let i = 0; i < this.matrix_y; i++) {
      this.matrix[i] = new Array(this.matrix_x);
    }
    this.start_time = new Date().getTime();
    this.sequence_count = 0;
    this.interval = 1000;
  },

  update: function() {
    for (let i = 0; i < this.matrix_y; i++) {
      for (let j = 0; j < this.matrix_x; j++) {
        this.matrix[i][j].update();
      }
    }
    window.requestAnimationFrame(() => {this.update()});
  },

  resets: function() {
    for (let i = 0; i < this.matrix_y; i++) {
      for (let j = 0; j < this.matrix_x; j++) {
        this.matrix[i][j].reset();
      }
    }
  },

  bangs: function(count) {
    let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    this.shuffle(array);

    let select_number = 1 + Math.floor(4 * Math.random());

    for (let i = 0; i < select_number; i++) {
      let grid = this.matrix[array[i]][count];
      grid.is_bang = true;
    }

    for (let i = 0; i < this.matrix_y; i++) {
      let grid = this.matrix[i][count];
      if (grid.is_bang) {
        let bang_value = 0.1 + 0.3 * Math.random();
        grid.bang(bang_value);
      }
    }
  },

  shuffle: function shuffle(array) {
    var n = array.length, t, i;

    while (n) {
      i = Math.floor(Math.random() * n--);
      t = array[n];
      array[n] = array[i];
      array[i] = t;
    }

    return array;
  },

  sequencer: function() {
     let last_time = new Date().getTime();
     if (last_time - this.start_time >= this.interval) {
      this.start_time = new Date().getTime();
      this.sequence_count ++;
      if (this.sequence_count >= this.matrix_x) {
        this.sequence_count = 0;
        this.resets();
      }
      this.sequenceView.activate(this.sequence_count);
      this.bangs(this.sequence_count);
      console.log(this.sequence_count);
     }

    window.requestAnimationFrame(() => {this.sequencer()});
  },


  render: function() {
    this.sequenceView = new SequenceView({
      matrix_x: this.matrix_x,
      grid_size: this.grid_size
    });
    this.$el.append(this.sequenceView .render().el);
    this.sequenceView.activate(0);

    for (let i = 0; i < this.matrix_y; i++) {
      for (let j = 0; j < this.matrix_x; j++) {
        this.matrix[i][j] = new GridView({
          x: 25 * (j + 1) + this.grid_size * j + 29,
          y: 20 * (i + 3) + this.grid_size * i + 20,
          size: this.grid_size
        });
        this.$el.append(this.matrix[i][j].render().el);
      }
    }
    window.requestAnimationFrame(() => {
      this.update();
      this.sequencer();
    });
  }

});

var app = new AppView;
app.render();

window.changeBackgroundImage = function(num) {
  $('.app-body').css({
    'background-image': 'url(../img/' +  num + '.png)'
  })

};

