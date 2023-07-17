function generateColor() {
  let hexSet = "0123456789ABCDEF";
  let finalHexString = "#";
  for (let i = 0; i < 6; i++) {
    finalHexString += hexSet[Math.ceil(Math.random() * 15)];
  }
  return finalHexString;
}

// WHY JAVASCRIPT?!?!?
function mod(x,div) {
  var rem = x % div; 
  if (rem < 0) {
    return div+rem; 
  }
  return rem;
}

function set_size(canvas_id) {
  document.getElementById(canvas_id).setAttribute('width', W);
  document.getElementById(canvas_id).setAttribute('height', H);
}

function buildShader(gl, shader_src, shader_type) {
  const shader = gl.createShader(shader_type);
  gl.shaderSource(shader, shader_src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw `Could not compile WebGL shaders. \n\n${info}`;
  }
  return shader;
}

function createProgam(gl, vshader, fshader) {
  var program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader); 
  gl.linkProgram(program); 

  var success = gl.getProgramParameter(program, gl.LINK_STATUS); 
  if (success) {
    return program;
  }

  // If it failed to compile 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function create2dMesh(resolution) {
  var step = 2 / resolution; 

  var triangles = []
  var n_vecs = 0
  for (row=0; row<resolution; row++) {
    for (col=0; col<resolution; col++) {
      // Build this triangle: 
      /* 
      start ---> mid
        ^      |
          \    |
           \   v
             end
      */
      start = [(step*col)-1, (step*row)-1];
      mid = [(step*(col+1))-1, (step*row)-1];
      end = [(step*(col+1))-1, (step*(row+1))-1];
      
      triangles = triangles.concat(start, mid, end);
      n_vecs += 3

      // Build this triangle: 
      /* 
      start
      | ^
      |  \
      |   \
      v ---> end 
   other_mid 
      */
      other_mid = [(step*col)-1, (step*(row+1))-1];
      
      triangles = triangles.concat(start, other_mid, end);
      n_vecs += 3 
    }
  }
  return {'triangles': triangles, 'cnt': n_vecs}
}

function createBuffer(gl, program, name) {
  var positionBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  var buf_ptr = gl.getAttribLocation(program, name); 
  gl.enableVertexAttribArray(buf_ptr);

  return buf_ptr
}

function update(gl, p_buf, c_buf, position_ptr, color_ptr, colors, positions, cnt) {
  // Bind to position buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, p_buf)

  // Make the position_ptr the active variable 
  gl.enableVertexAttribArray(position_ptr);
  gl.vertexAttribPointer(position_ptr, 2, gl.FLOAT, false, 0, 0)

  // Put triangles into (active) position buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,             
    new Float32Array(positions),  // Strongly typed array
    gl.STATIC_DRAW  // Compiler hint that we won't change data
  )

  // Bind to color buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, c_buf); 

  // Tell GL to use the color_ptr for this buffer 
  gl.enableVertexAttribArray(color_ptr);
  gl.vertexAttribPointer(color_ptr, 1, gl.FLOAT, false, 0, 0)

  // Change colors a bit 
  ts = Date.now() / 1000
  var n_colors = colors.map((e) => ((1+Math.sin(ts+e))/2/0.8) ); 

  // Load into color buffer (still the active one)
  gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array(n_colors), 
    gl.STATIC_DRAW
  )

  // Redraw
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, cnt)

  // Call again 

  requestAnimationFrame( () => update(
    gl, p_buf, c_buf, position_ptr, color_ptr, colors, positions, cnt
  )); 
}

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  if (gl == null) {
    alert ("Unable to init WebGL");
    return;
  }

  // Shader src defined in shaders.js 
  const vert_shader = buildShader(gl, VERT_SHADER, gl.VERTEX_SHADER)
  const frag_shader = buildShader(gl, FRAG_SHADER, gl.FRAGMENT_SHADER)
  var program = createProgam(gl, vert_shader, frag_shader); 

  // Make webGL canvas size match what we defined <canvas> as
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Black screen
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell gl to use the shader program
  gl.useProgram(program);

  // Get pointers to variables in the shader
  var position_ptr = gl.getAttribLocation(program, 'a_position'); 
  var color_ptr = gl.getAttribLocation(program, 'a_color')

  // Create buffers 
  var p_buf = gl.createBuffer(); 
  var c_buf = gl.createBuffer();

  // Bind to position buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, p_buf)

  // Make the position_ptr the active variable 
  gl.enableVertexAttribArray(position_ptr);
  gl.vertexAttribPointer(position_ptr, 2, gl.FLOAT, false, 0, 0)

  // Make triangles
  var data = create2dMesh(32);
  var positions = data.triangles; 
  var cnt = data.cnt; 

  // Put triangles into (active) position buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,             
    new Float32Array(positions),  // Strongly typed array
    gl.STATIC_DRAW  // Compiler hint that we won't change data
  )

  // Bind to color buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, c_buf); 

  // Tell GL to use the color_ptr for this buffer 
  gl.enableVertexAttribArray(color_ptr);
  gl.vertexAttribPointer(color_ptr, 1, gl.FLOAT, false, 0, 0)

  // Create colors 
  colors = Array(cnt).fill().map(() => Math.random()); 

  /*
  // Put data into color buffer 
  gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array(colors), 
    gl.STATIC_DRAW
  )

  // Tell gl to actually draw the points we made
  var primitiveType = gl.TRIANGLES; 
  var offset = 0; // Start at the beginning of the array
  var count = cnt; // Execute 3 times for 3 vertexes
  gl.drawArrays(primitiveType, offset, count)
  */ 
  update(gl, p_buf, c_buf, position_ptr, color_ptr, colors, positions, cnt); 
}