/***********************************************
 * 
 *	作者：孙宇廷
 * 
 *	创建时间：2017.3.15
 *	修改时间：2017.3.21
 * 
 * 	存在问题：
 * 		* 修改大小的即时性问题
 * 		* setter方法封装问题
 * 		* 动画定时器被共用问题
 * 		* ...
 * 
 **********************************************/

'use strict';

/**
 * 形状
 * 		暴露的接口
 */
var Shape3D = {};

/**
 * 闭包 - 私有化作用域
 */
(function(){

	/**
	 * 立方体
	 */
	Shape3D.Cube = (function() {
		/**
		 * 静态私有属性
		 */
		/* 立方体面数量 - 只读 */
		var FACES_AMOUNT = 6;

		/* 旋转单元时间 */
		var UNIT_TIME = 500;

		/* 默认文本 */
		var DEFAULT_INNER_HTML = ['front', 'top', 'left', 'bottom', 'right', 'back'];

		/**
		 * 返回构造方法
		 */
		return function() {
			/* 获取立方体面数量 */
			this.__proto__.getFacesAmount = _getFacesAmount;

			/**
			 * 私有属性
			 */
			/* 边长 - 开放读写 */
			var size = 100;
			/* 获取边长 */
			this.getSize = _getSize;
			/* 设置边长 */
			this.setSize = _setSize;

			/* 位置 - 开放读写 */
			var position = document.body;
			/* 获取位置 */
			this.getPosition = _getPosition;
			/* 设置位置 */
			this.setPosition = _setPosition;

			/* 数据 - 开放读写 */
			var data = new Array(FACES_AMOUNT);
			/* 获取数据 */
			this.getData = _getData;
			/* 设置数据 */
			this.setData = _setData;

			/* 透视 - 开放读写 */
			var backfaceVisible = false;
			/* 获取透视 */
			this.getBackfaceVisible = _getBackfaceVisible;
			/* 设置透视 */
			this.setBackfaceVisible = _setBackfaceVisible;

			/* 使用默认样式 - 开放读写 */
			var useDefaultStyles = true;
			/* 获取使用默认样式 */
			this.getUseDefaultStyles = _getUseDefaultStyles;
			/* 设置使用默认样式 */
			this.setUseDefaultStyles = _setUseDefaultStyles;

			/* 容器 */
			var container = null;

			/* 视角 */
			var perspective = 250;

			/* 旋转定时器 */
			var intervalTimer = null;

			/**
			 * 暴露的方法
			 */
			/* 显示 */
			this.show = _show;

			/* 去除 */
			this.remove = _remove;

			/* 随机旋转 */
			this.startRandomRotation = _startRandomRotation;

			/* 停止旋转 */
			this.stopRotation = _stopRotation;

			/**
			 * 初始化
			 */
			for (var i = 0; i < FACES_AMOUNT; i++) {
				// 数据
				data[i] = document.createElement('div');
				data[i].appendChild(document.createTextNode(DEFAULT_INNER_HTML[i]));

				// 样式
				Styles.Common.dataDefaultStyles(data[i]);
				Styles.Cube.eachDataDefaultStyles[i](data[i]);
				Styles.Cube.dataFontDefualtStyles(data[i], size);
			}

			/**
			 * 方法的具体实现
			 */
			/* 获取立方体面数量 - 实现 */
			function _getFacesAmount() {
				return FACES_AMOUNT;
			}

			/* 获取边长 - 实现 */
			function _getSize() {
				return size;
			}

			/* 设置边长 - 实现 */
			function _setSize(newSize) {
				// 校验newSize合法性
				if (!Funcs.Utils.isNumber(newSize))
					throw new Error('size to set should be a type of number');

				size = newSize;

				// 控制视角
				perspective = Funcs.Utils.getPerspectiveByDistance(getCubeFaceDistance(newSize));
				// 控制默认字体样式
				for (var i = 0; i < FACES_AMOUNT; i++)
					Styles.Cube.dataFontDefualtStyles(data[i], newSize);
			}

			/* 获取位置 - 实现 */
			function _getPosition() {
				return position;
			}

			/* 设置位置 - 实现 */
			function _setPosition(newPosition) {
				// 检验newPosition合法性
				if (!Funcs.Utils.isDOM(newPosition))
					throw new Error('position to set should be a type of DOM');

				position = newPosition;

				// 若已经显示，则调整位置
				if (container !== null) {
					container.remove()
					position.appendChild(container);
				}
			}

			/* 获取数据 - 实现 */
			function _getData() {
				return data;
			}

			/* 设置数据 - 实现 */
			function _setData(newData) {
				// 校验newData合法性
				if (!Funcs.Utils.isArray(newData) || newData.length !== FACES_AMOUNT)	// 必须是长度为6的数组
					throw new Error("data to set should be an instance of Array with length:6");
				for (var i = 0; i < FACES_AMOUNT; i++)	// 数组元素必须是DOM元素
					if (!Funcs.Utils.isDOM(newData[i]))
						throw new Error('elements of data to set should be a type of DOM');

				data = newData;
			}

			/* 获取透视 - 实现 */
			function _getBackfaceVisible() {
				return backfaceVisible;
			}

			/* 设置透视 - 实现 */
			function _setBackfaceVisible(newBackfaceVisible) {
				// 校验newBackfaceVisible合法性
				if (!Funcs.Utils.isBoolean(newBackfaceVisible))
					throw new Error('backfaceVisible to set should be a type of boolean');

				backfaceVisible = newBackfaceVisible;

				// 若已显示，则修改当前样式
				if (container !== null) {
					var faces = container.childNodes;
					for (var i = 0; i < faces.length; i++)
						if (Funcs.Utils.isDOM(faces[i]))
							Styles.Common.setBackfaceVisibility(faces[i], newBackfaceVisible);
				}
			}

			/* 获取使用默认样式 - 实现 */
			function _getUseDefaultStyles() {
				return useDefaultStyles;
			}

			/* 设置使用默认样式 - 实现 */
			function _setUseDefaultStyles(newUseDefaultStyles) {
				if (!Funcs.Utils.isBoolean(newUseDefaultStyles))
					throw new Error('useDefaultStyles to set should be a type of boolean');

				useDefaultStyles = newUseDefaultStyles;
			}

			/* 显示 - 实现 */
			function _show() {
				// 增加
				position.appendChild(getCube());
			}

			// 构建立方体
			function getCube() {
				// 创建html元素
				if (container === null) {	// 单例
					container = document.createElement('div');					// 容器
					Styles.Cube.containerStyles(container, size, perspective);	// 容器样式

					for (var i = 0; i < FACES_AMOUNT; i++) {
						var face = document.createElement('div');	// 构建面
						Styles.Cube.facesStyles(face, backfaceVisible);					// 各个面统一样式
						Styles.Cube.eachFaceStyles[i](face, getCubeFaceDistance(size));	// 前、上、左、下、右、后面各自的样式

						face.appendChild(data[i]);
						container.appendChild(face);	// 放入容器
					}
				}
				return container;
			}

			// 获取立方体面心距
			function getCubeFaceDistance(size) {
				return parseFloat(size / 2);
			}

			/* 去除 - 实现 */
			function _remove() {
				_stopRotation();	// 清除定时器
				container.remove();	// 移除元素
				container = null;	// 垃圾回收
			}

			/* 随机旋转 - 实现 */
			function _startRandomRotation() {
				// 容器为空
				if (container === null) return;

				// 清除计时器
				clearInterval(intervalTimer);

				// 随机旋转
				singleRotate(UNIT_TIME);	// 第一次循环
				intervalTimer = setInterval(function() {
					singleRotate(UNIT_TIME);
				}, UNIT_TIME);
			}

			// 单次随机旋转
			function singleRotate(time) {
				// 生成-180至180间的随机数
				var x = -180 + Math.random() * 360,
					y = -180 + Math.random() * 360,
					z = -180 + Math.random() * 360;
				Funcs.Utils.spinAnimate(container, perspective, x, y, z, time);
			}

			/* 停止旋转 - 实现 */
			function _stopRotation() {
				clearInterval(intervalTimer);
			}
		}
	})();

	/**
	 * 旋转木马
	 */
	Shape3D.Carousel = (function() {
		/**
		 * 静态私有属性
		 */
		/* 整圆周角 - 只读 */
		var WHOLE_CIRCLE_ANGLE = Math.PI * 2;

		/* 旋转木马最小面数量 - 只读 */
		var MIN_FACES_AMOUNT = 3;

		/* 旋转单元时间 */
		var UNIT_TIME = 1000;

		/* 默认文本 */
		var DEFAULT_INNER_HTML = ['surface1', 'surface2', 'surface3'];

		/**
		 * 返回构造方法
		 */
		return function() {
			/* 获取整圆周角 */
			this.__proto__.getWholeCircleAngle = _getWholeCircleAngle;

			/* 获取旋转木马最小面数量 */
			this.__proto__.getMinFacesAmount = _getMinFacesAmount;

			/* 半径 - 开放读写 */
			var radius = 100;
			/* 获取半径 */
			this.getRadius = _getRadius;
			/* 设置半径 */
			this.setRadius = _setRadius;

			/* 高度 - 开放读写 */
			var height = 100;
			/* 获取高度 */
			this.getHeight = _getHeight;
			/* 设置高度 */
			this.setHeight = _setHeight;

			/* 位置 - 开放读写 */
			var position = document.body;
			/* 获取位置 */
			this.getPosition = _getPosition;
			/* 设置位置 */
			this.setPosition = _setPosition;

			/* 数据 - 开放读写 */
			var data = new Array(MIN_FACES_AMOUNT);
			/* 获取数据 */
			this.getData = _getData;
			/* 设置数据 */
			this.setData = _setData;

			/* 透视 - 开放读写 */
			var backfaceVisible = false;
			/* 获取透视 */
			this.getBackfaceVisible = _getBackfaceVisible;
			/* 设置透视 */
			this.setBackfaceVisible = _setBackfaceVisible;

			/* 使用默认样式 - 开放读写 */
			var useDefaultStyles = true;
			/* 获取使用默认样式 */
			this.getUseDefaultStyles = _getUseDefaultStyles;
			/* 设置使用默认样式 */
			this.setUseDefaultStyles = _setUseDefaultStyles;

			/* 延时 - 开放读写 */
			var timeOut = 1000;
			/* 获取延时 */
			this.getTimeOut = _getTimeOut;
			/* 设置延时 */
			this.setTimeOut = _setTimeOut;

			/* 面的数量 */
			var faceAmount = MIN_FACES_AMOUNT;

			/* 宽度 */
			var width = getWidthByRadiusAndFaceAmount(radius, faceAmount);

			/* 视角 */
			var perspective = 250;

			/* 容器 */
			var container = null;

			/* 旋转定时器 */
			var intervalTimer = null;

			/**
			 * 暴露的方法
			 */
			/* 显示 */
			this.show = _show;

			/* 去除 */
			this.remove = _remove;

			/* 旋转 */
			this.startRotation = _startRotation;

			/* 停止旋转 */
			this.stopRotation = _stopRotation;

			/**
			 * 初始化
			 */
			for (var i = 0; i < faceAmount; i++) {
				// 数据
				data[i] = document.createElement('div');
				data[i].appendChild(document.createTextNode(DEFAULT_INNER_HTML[i]));

				// 样式
				Styles.Common.dataDefaultStyles(data[i]);
				Styles.Carousel.eachDataDefaultStyles[i](data[i]);
				Styles.Carousel.dataFontDefualtStyles(data[i], height);
			}

			/**
			 * 方法的具体实现
			 */
			/* 获取整圆周角 - 实现 */
			function _getWholeCircleAngle() {
				return WHOLE_CIRCLE_ANGLE;
			}

			/* 获取旋转木马最小面数量 - 实现 */
			function _getMinFacesAmount() {
				return MIN_FACES_AMOUNT;
			}

			/* 获取半径 - 实现 */
			function _getRadius() {
				return radius;
			}

			/* 设置半径 - 实现 */
			function _setRadius(newRadius) {
				// 校验newRadius合法性
				if (!Funcs.Utils.isNumber(newRadius))
					throw new Error('radius to set should be a type of number');

				radius = newRadius;

				// 控制宽度
				width = getWidthByRadiusAndFaceAmount(newRadius, faceAmount);
			}

			/* 获取高度 - 实现 */
			function _getHeight() {
				return height;
			}

			/* 设置高度 - 实现 */
			function _setHeight(newHeight) {
				// 校验newHeight合法性
				if (!Funcs.Utils.isNumber(newHeight))
					throw new Error('height to set should be a type of number');

				height = newHeight;

				// 控制字体默认样式
				for (var i = 0; i < faceAmount; i++)
					Styles.Carousel.dataFontDefualtStyles(data[i], height);
			}

			/* 获取位置 - 实现 */
			function _getPosition() {
				return position;
			}

			/* 设置位置 - 实现 */
			function _setPosition(newPosition) {
				if (!Funcs.Utils.isDOM(newPosition))
					throw new Error('position to set should be a type of DOM');

				position = newPosition;

				// 若已经显示，则调整位置
				if (container !== null) {
					container.remove()
					position.appendChild(container);
				}
			}

			/* 获取数据 - 实现 */
			function _getData() {
				return data;
			}

			/* 设置数据 - 实现 */
			function _setData(newData) {
				// 校验newData合法性
				if (!Funcs.Utils.isArray(newData) || newData.length < MIN_FACES_AMOUNT)	// 必须是长度大于3的数组
					throw new Error("data to set should be an instance of Array with length at least 3");
				for (var i = 0; i < newData.length; i++)	// 数组元素必须是DOM元素
					if (!Funcs.Utils.isDOM(newData[i]))
						throw new Error('elements of data to set should be a type of DOM');

				data = newData;

				// 控制面的数量
				faceAmount = data.length;
				// 控制宽度
				width = getWidthByRadiusAndFaceAmount(radius, faceAmount);
			}

			/* 获取透视 - 实现 */
			function _getBackfaceVisible() {
				return backfaceVisible;
			}

			/* 设置透视 - 实现 */
			function _setBackfaceVisible(newBackfaceVisible) {
				// 校验newBackfaceVisible合法性
				if (!Funcs.Utils.isBoolean(newBackfaceVisible))
					throw new Error('backfaceVisible to set should be a type of boolean');

				backfaceVisible = newBackfaceVisible;

				// 若已显示，则修改当前样式
				if (container !== null) {
					var faces = container.childNodes;
					for (var i = 0; i < faces.length; i++)
						if (Funcs.Utils.isDOM(faces[i]))
							Styles.Common.setBackfaceVisibility(faces[i], newBackfaceVisible);
				}
			}

			/* 获取使用默认样式 - 实现 */
			function _getUseDefaultStyles() {
				return useDefaultStyles;
			}

			/* 设置使用默认样式 - 实现 */
			function _setUseDefaultStyles(newUseDefaultStyles) {
				if (!Funcs.Utils.isBoolean(newUseDefaultStyles))
					throw new Error('useDefaultStyles to set should be a type of boolean');

				useDefaultStyles = newUseDefaultStyles;
			}

			/* 获取延时 - 实现 */
			function _getTimeOut() {
				return timeOut;
			}

			/* 设置延时 - 实现 */
			function _setTimeOut(newTimeOut) {
				if (!Funcs.Utils.isNumber(newTimeOut))
					throw new Error('timeOut to set should be a type of number');

				timeOut = newTimeOut;
			}

			/* 显示 - 实现 */
			function _show() {
				// 增加
				position.appendChild(getCarousel());
			}

			// 构建旋转木马
			function getCarousel() {
				// 创建html元素
				if (container === null) {	// 单例
					container = document.createElement('div');									// 容器
					Styles.Carousel.containerStyles(container, radius, height, perspective);	// 容器样式

					for (var i = 0; i < faceAmount; i++) {
						var face = document.createElement('div');	// 构建面
						Styles.Carousel.facesStyles(face, radius, width, backfaceVisible);											// 各个面统一样式
						Styles.Carousel.eachFaceStyles(faceAmount)[i](face, getCarouselFaceDistance(radius, faceAmount));	// 前、上、左、下、右、后面各自的样式

						face.appendChild(data[i]);
						container.appendChild(face);	// 放入容器
					}
				}
				return container;
			}

			// 获取旋转木马面心距
			function getCarouselFaceDistance(radius, faceAmount) {
				var angle = WHOLE_CIRCLE_ANGLE / faceAmount;
				return Math.cos(angle / 2) * radius;
			}

			// 根据半径和面的数量获取面的宽度
			function getWidthByRadiusAndFaceAmount(radius, faceAmount) {
				var angle = WHOLE_CIRCLE_ANGLE / faceAmount;
				return Math.sin(angle / 2) * radius * 2;
			}

			/* 去除 - 实现 */
			function _remove() {
				_stopRotation();	// 清除定时器
				container.remove();	// 移除元素
				container = null;	// 垃圾回收
			}

			/* 旋转 - 实现 */
			function _startRotation(time) {
				// 容器为空
				if (container === null) return;

				// 清除计时器
				clearInterval(intervalTimer);

				// 初始化时间参数
				if (time === undefined) time = UNIT_TIME;

				// 顺时针旋转
				singleRotate(faceAmount, time);	// 第一次循环

				intervalTimer = setInterval(function() {
					singleRotate(faceAmount, time);
				}, time + timeOut);
			}

			// 单次顺时针旋转
			function singleRotate(faceAmount, time) {
				Funcs.Utils.spinAnimate(container, perspective, 0, 360 / faceAmount, 0, time);
			}

			/* 停止旋转 - 实现 */
			function _stopRotation() {
				clearInterval(intervalTimer);
			}
		}
	})();

	/**
	 * 公共方法
	 */
	var Funcs = {
		/**
		 * 工具方法
		 */
		Utils : {
			/* 判断是否是数字 */
			isNumber : function(obj) {
				return typeof obj === 'number' && !isNaN(obj);
			},

			/* 判断是否是布尔型 */
			isBoolean : function(obj) {
				return typeof obj === 'boolean';
			},

			/* 判断是否是数组 */
			isArray : function(obj) {
				return obj instanceof Array;
			},

			/* 判断是否是DOM元素 */
			isDOM : (
				typeof HTMLElement === 'object' ?
		        function(obj) {
		            return obj instanceof HTMLElement;
		        } :
		        function(obj) {
		            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
		        }
		    ),

			/* 获取视角 */
			getPerspectiveByDistance : function(distance) {
				return distance * 5;
			},

			/* 旋转动画 */
			spinAnimate : function(container, perspective, x, y, z, time) {
				// 容器为空
				if (container == null) return;

				// 获取动画开始时的样式
				var origianlRotation = container.style.transform;
				var ox = parseFloat(origianlRotation.substring(origianlRotation.indexOf('rotateX(') + 'rotateX('.length, origianlRotation.indexOf('deg')));
				origianlRotation = origianlRotation.substring(origianlRotation.indexOf('rotateY('), origianlRotation.length);
				var oy = parseFloat(origianlRotation.substring(origianlRotation.indexOf('rotateY(') + 'rotateY('.length, origianlRotation.indexOf('deg')));
				origianlRotation = origianlRotation.substring(origianlRotation.indexOf('rotateZ('), origianlRotation.length);
				var oz = parseFloat(origianlRotation.substring(origianlRotation.indexOf('rotateZ(') + 'rotateZ('.length, origianlRotation.indexOf('deg')));

				// 构建过程量
				var TOLERANCE = 1;	// 帧误差范围
				var META_TIME = 20;	// 时间元，一帧动画用时
				var frames = time / META_TIME - TOLERANCE;	// 总帧数
				var speedX = x / frames,	// 三轴各自变化速度
					speedY = y / frames,
					speedZ = z / frames;

				// 动画过程
				var count = 0;	// 帧计数器
				var animationTimer = setInterval(function () {
					if (count < frames) {
						count++;
						container.style.transform = 'perspective(' + perspective + 'px) rotateX(' + (ox + speedX * count) + 'deg) rotateY(' + (oy + speedY * count) + 'deg) rotateZ(' + (oz + speedZ * count) + 'deg)';
					} else if (count === frames) {
						container.style.transform = 'perspective(' + perspective + 'px) rotateX(' + (ox + x) + 'deg) rotateY(' + (oy + y) + 'deg) rotateZ(' + (oz + z) + 'deg)';
						count++;
					} else {
						clearInterval(animationTimer);
					}
				}, META_TIME);
			}
		},

		/**
		 * setter方法
		 */
		Setters : {
		}
	}

	/**
	 * 样式
	 */
	var Styles = {
		/**
		 * 公共样式
		 */
		Common : {
			/* 容器公共样式 */
			containerStyles : function(node, perspective) {
				node.style.position = 'relative';
				node.style.transform = 'perspective(' + perspective + 'px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
				node.style.transformStyle = 'preserve-3d';
			},

			/* 各个面公共统一样式 */
			facesStyles : function(node, backfaceVisible) {
				node.style.position = 'absolute';
				Styles.Common.setBackfaceVisibility(node, backfaceVisible);
			},

			/* 设置backfaceVisibility */
			setBackfaceVisibility : function(node, backfaceVisible) {
				if (backfaceVisible)
					node.style.backfaceVisibility = 'visible';
				else
					node.style.backfaceVisibility = 'hidden';
			},

			/* 数据默认样式 */
			dataDefaultStyles : function(node) {
				node.style.width = '100%';
				node.style.height = '100%';
				node.style.opacity = '0.6';
				node.style.textAlign = 'center';
				node.style.color = 'white';
			}
		},

		/**
		 * 立方体样式
		 */
		Cube : {
			/* 立方体容器样式 */
			containerStyles : function(node, size, perspective) {
				Styles.Common.containerStyles(node, perspective);
				node.style.width = size + 'px';
				node.style.height = size + 'px';
			},

			/* 立方体各个面统一样式 */
			facesStyles : function(node, backfaceVisible) {
				Styles.Common.facesStyles(node, backfaceVisible);
				node.style.width = '100%';
				node.style.height = '100%';
			},

			/* 立方体前、上、左、下、右、后面各自的样式 */
			eachFaceStyles : [function(node, distance) {
				// front
				node.style.transform = 'translateZ(' + distance + 'px)';
			}, function(node, distance) {
				// top
				node.style.transform = 'rotateX(90deg) translateZ(' + distance + 'px)';
			}, function(node, distance) {
				// left
				node.style.transform = 'rotateY(-90deg) translateZ(' + distance + 'px)';
			}, function(node, distance) {
				// bottom
				node.style.transform = 'rotateX(-90deg) translateZ(' + distance + 'px)';
			}, function(node, distance) {
				// right
				node.style.transform = 'rotateY(90deg) translateZ(' + distance + 'px)';
			}, function(node, distance) {
				// back
				node.style.transform = 'rotateY(180deg) translateZ(' + distance + 'px)';
			}],

			/* 数据各自默认样式 */
			eachDataDefaultStyles : [function(node) {
				node.style.backgroundColor = 'red';
			}, function(node) {
				node.style.backgroundColor = 'orange';
			}, function(node) {
				node.style.backgroundColor = 'yellow';
			}, function(node) {
				node.style.backgroundColor = 'green';
			}, function(node) {
				node.style.backgroundColor = 'blue';
			}, function(node) {
				node.style.backgroundColor = 'purple';
			}],

			/* 数据字体默认样式 */
			dataFontDefualtStyles : function(node, size) {
				node.style.fontSize = size * 0.2 + 'px';
				node.style.lineHeight = size + 'px';
			}
		},

		/**
		 * 旋转木马样式
		 */
		Carousel : {
			/* 旋转木马容器样式 */
			containerStyles : function(node, radius, height, perspective) {
				Styles.Common.containerStyles(node, perspective);
				node.style.width = radius * 2 + 'px';
				node.style.height = height + 'px';
			},

			/* 旋转木马各个面统一样式 */
			facesStyles : function(node, radius, width, backfaceVisible) {
				Styles.Common.facesStyles(node, backfaceVisible);
				node.style.margin = '0 ' + (radius - width / 2) + 'px';
				node.style.width = width + 'px';
				node.style.height = '100%';
			},

			/* 旋转木马各个面各自的样式 */
			eachFaceStyles : function(faceAmount) {
				// 根据面的数量动态生成方法数组
				var styleList = new Array(faceAmount);
				for (var i = 0; i < faceAmount; i++) {
					// 闭包遍历时赋值
					(function(index) {
						styleList[index] = function(node, distance) {
							// surface index+1
							var angle = 360 / faceAmount;
							node.style.transform = 'rotateY(' + index * angle * (-1) + 'deg) translateZ(' + distance + 'px)';
						}
					})(i);
				}
				return styleList;
			},

			/* 数据各自默认样式 */
			eachDataDefaultStyles : [function(node) {
				node.style.backgroundColor = 'red';
			}, function(node) {
				node.style.backgroundColor = 'yellow';
			}, function(node) {
				node.style.backgroundColor = 'blue';
			}],

			/* 数据字体默认样式 */
			dataFontDefualtStyles : function(node, height) {
				node.style.fontSize = height * 0.2 + 'px';
				node.style.lineHeight = height + 'px';
			}
		}
	}

})();