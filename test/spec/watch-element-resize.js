var size = {
  w: 140,
  h: 140
};

casper.test.setUp(function() {
  casper.start(config.url);
});

casper.test.tearDown(function(done) {
  casper.run(done);
});

casper.test.begin('watch element resize', 1, function(test) {
  casper.thenEvaluate(function(size) {
    var div = document.querySelector('#resize'),
        watchResize = new WatchElementResize(div);

    window.offset = {
      width: 0,
      height: 0
    };

    watchResize.on('resize', function(evt) {
      window.offset = evt.element.offset;
      window.triggered = true; 
    });
    
    div.style.width = size.w + 'px';
    div.style.height = size.h + 'px';
  }, size);
  
  casper.waitFor(function() {
    return this.evaluate(function(size) {
      return window.offset.width === size.w && window.offset.height === size.h;
    }, size);
  }, function() {
    console.info('offset ... ', casper.getGlobal('offset').width);
    test.pass('Element is now ' + size.w + 'px X ' + size.h + 'px');
  }, function() {
    test.fail('Couldn\'t listen for new element size!');
  });
  
  test.done();
});
