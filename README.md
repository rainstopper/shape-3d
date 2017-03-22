# shape-3d

###### a javascript plugin to provide **3D Shapes**, now support Cube and Carousel

<script type="text/javascript" src="shape-3d.js"></script>

#### Cube

<div id="cube"></div>

#### Carousel

<div id="carousel"></div>

<script type="text/javascript">
  var cube = new Shape3D.Cube();
  cube.setPosition(document.getElementById('cube));
  cube.show();
  cube.startRandomRotation();
</script>
