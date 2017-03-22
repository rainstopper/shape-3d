# shape-3d

###### a javascript plugin to provide **3D Shapes**, now support Cube and Carousel

#### Cube

    <div id="cube"></div>
    
    <script type="text/javascript">
      var cube = new Shape3D.Cube();
      cube.setPosition(document.getElementById('cube));
      cube.setSize(50);
      cube.setBackfaceVisible(false);
      cube.show();
      cube.startRandomRotation();
    </script>

#### Carousel

    <div id="carousel"></div>
    
    <script type="text/javascript">
      var carousel = new Shape3D.Cube();
      carousel.setPosition(document.getElementById('cube));
      var colors = ['red', 'orange', 'yellow', 'yellowgreen', 'green', 'blue', 'purple', 'black', 'grey', 'pink', 'crimson'];
      var data = new Array(colors.length);
      for (var i = 0; i < data.length; i++) {
        data[i] = document.createElement('div');
        data[i].style.width = '100%';
        data[i].style.height = '100%';
        data[i].style.opacity = '0.6';
        data[i].style.backgroundColor = colors[i];
      }
      carousel.setData(data);
      carousel.setHeight(50);
      carousel.setTimeOut(0);
      carousel.setBackfaceVisible(true);
      carousel.show();
      carousel.startRotation();
    </script>
