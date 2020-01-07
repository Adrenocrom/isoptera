var mat4 = glMatrix.mat4;
var muGl;
var shaderProgram;
var buffers;
var colorTexture;
var time = 0.0;
var angle = 0.0;
var counter = 0;

main();

function main() {
	muSWUpdater("muReload");

	const canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	try {
		canvas.requestFullscreen();
	}
	catch(err) { 
		console.log("fullscreen error: "+ err);
	}

	muGl = new MuskatGl(canvas);
	var vs = muGl.compileShaderFromString("x-shader/x-vertex", `
	   	precision highp float;
		
		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		
		varying vec2 vTextureCoord;
		
		void main() {
			vTextureCoord = aTextureCoord;
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		}
	`);
	
	var fs = muGl.compileShaderFromString("x-shader/x-fragment", `
	   	precision highp float;
		
		uniform sampler2D uColorSampler;
		uniform vec2 vTextureOffset;

		varying vec2 vTextureCoord;

		struct complex {
			float a;
			float b;
		};

		complex mult(complex a, complex b) {
			complex result;
			result.a = ((a.a*b.a) - (a.b*b.b));
			result.b = ((a.a*b.b) + (a.b*b.a));
			return result;
		}

		float cabs(complex a) {
			return sqrt((a.a*a.a) + (a.b*a.b));
		}

		float calcColor(vec2 coord) {
			complex z;
			z.a = 0.0;
			z.b = 0.0;

			for(float i = 0.0; i <= 34.0; i += 1.0) {
				if(z.a*z.a + z.b*z.b > 4.0)
					return i/33.0;
				z = mult(z, z);
				z.a += ((coord.s * 2.0) - 1.9);
				z.b += ((coord.t * 2.0) - 1.0);
			}
			
			return 0.0;
		}

		void main() {
    	    //gl_FragColor = texture2D(uColorSampler, vec2(vTextureCoord.s * (1.0/8.0), vTextureCoord.t * 0.5) + vTextureOffset);
			float color = calcColor(vTextureCoord.st);
			gl_FragColor = vec4(0.0, color*0.7, color*0.3, 1.0);
		}	
	`);

	shaderProgram = muGl.linkShaderProgram(vs, fs);
	muGl.useShaderProgram(shaderProgram);

	shaderProgram.vertexPositionAttrib = muGl.getVertexAttribLocation(shaderProgram, "aVertexPosition");
	shaderProgram.textureCoordAttrib = muGl.getVertexAttribLocation(shaderProgram, "aTextureCoord");

	shaderProgram.projectionMatrix = muGl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	shaderProgram.modelViewMatrix = muGl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	shaderProgram.colorSamplerUniform = muGl.getUniformLocation(shaderProgram, "uColorSampler");
	shaderProgram.textureOffsetUniform = muGl.getUniformLocation(shaderProgram, "vTextureOffset");

	buffers = initBuffers();
	colorTexture = muGl.createTextureFromUrl("img/sprite2.png", drawScene);
}

function initBuffers() {
		const positions = [
		1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		1.0, -1.0, 0.0, 
		1.0, -1.0, 0.0,
		-1.0, 1.0, 0.0,
		-1.0, -1.0, 0.0
	];
	
	const positionBuffer = muGl.gl.createBuffer();
	muGl.gl.bindBuffer(muGl.gl.ARRAY_BUFFER, positionBuffer);
	muGl.gl.bufferData(muGl.gl.ARRAY_BUFFER, new Float32Array(positions), muGl.gl.STATIC_DRAW);
	
	const texCoords = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];

	const textureBuffer = muGl.gl.createBuffer();
	muGl.gl.bindBuffer(muGl.gl.ARRAY_BUFFER, textureBuffer);
	muGl.gl.bufferData(muGl.gl.ARRAY_BUFFER, new Float32Array(texCoords), muGl.gl.STATIC_DRAW);
	
	return {
		position: positionBuffer,
		texCoords: textureBuffer
	};
}

function drawScene() {
	const projectionMatrix = mat4.create();
	
	var gl = muGl.gl;
	gl.clearColor(0.0, 0.0, 0.01, 1.0);
    gl.enable(gl.DEPTH_TEST);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(projectionMatrix, muGl.degToRad(45), gl.viewportWidth/gl.viewportHeight, 0.1, 100.0);

	const modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -3.0]);
	//mat4.rotateZ(modelViewMatrix, modelViewMatrix, muGl.degToRad(angle));
	mat4.rotateZ(modelViewMatrix, modelViewMatrix, muGl.degToRad(-90));

	gl.uniform2f(shaderProgram.textureOffsetUniform, parseFloat(counter / 8), 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoords);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttrib, 2, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, colorTexture);
	gl.uniform1i(shaderProgram.colorSamplerUniform, 0);

	gl.uniformMatrix4fv(shaderProgram.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(shaderProgram.modelViewMatrix, false, modelViewMatrix);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	gl.flush();

	angle += 0.5;
	time += 0.2;
	counter = parseInt(time);

	requestAnimationFrame(drawScene);
}
