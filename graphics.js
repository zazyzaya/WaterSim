const REZ = 128; 

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
  // Building verts from left to right (-1 to 1)
  var h_step = 2/resolution; 
  var h_start = -1; 

  // Building verts from top down (1 to -1)
  var v_step = -h_step 
  var v_start = 1; 

  // Resolution = how many squares per row
  // meaning rez 1 requires 2 verts in a row / col
  var verts_per = resolution+1; 

  // Build linspace of vertices
  var verts = []
  for (var y=0; y<verts_per; y++) {
    for (var x=0; x<verts_per; x++) {
      vx = h_start + (x*h_step);
      vy = v_start + (y*v_step);
      verts.push(vx,vy);
    }
  }

  // Then tell it the order to use the indices in 
  var indices = []
  var cnt = 0
  for (var row=0; row<resolution; row++) {
    for (var col=0; col<resolution; col++) {
      start = row*verts_per + col; 
      mid = row*verts_per + col+1;
      other_mid = (row+1)*verts_per + col; 
      end = (row+1)*verts_per + col+1

      indices.push(start, mid, end, start, other_mid, end); 
      cnt += 6;
    }
  }

  return {
    'verts': verts, 
    'indices': indices, 
    't_cnt': cnt,
    'v_cnt': verts.length
  }
}

function createBuffer(gl, program, name) {
  var positionBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  var buf_ptr = gl.getAttribLocation(program, name); 
  gl.enableVertexAttribArray(buf_ptr);

  return buf_ptr
}

function update(
    gl, water, v_data, 
    p_buf, c_buf, idx_buf, 
    position_ptr, color_ptr) {

  // Bind to position buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, p_buf)

  // Make the position_ptr the active variable 
  gl.enableVertexAttribArray(position_ptr);
  gl.vertexAttribPointer(position_ptr, 2, gl.FLOAT, false, 0, 0)

  // Put vertices into (active) position buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,             
    new Float32Array(v_data.verts),  // Strongly typed array
    gl.STATIC_DRAW  // Compiler hint that we won't change data
  )


  // Bind to color buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, c_buf); 

  // Tell GL to use the color_ptr for this buffer 
  gl.enableVertexAttribArray(color_ptr);
  gl.vertexAttribPointer(color_ptr, 1, gl.FLOAT, false, 0, 0)

  // Create colors 
  colors = water.update();

  // Put data into color buffer 
  gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array(colors), 
    gl.STATIC_DRAW
  )

  // Bind to the index buffer (do this before drawing)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buf);

  // Put indices into element array buf
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, 
    new Uint16Array(v_data.indices), 
    gl.STATIC_DRAW
  )

  // Tell gl to actually draw the points we made
  var primitiveType = gl.TRIANGLES; 
  var offset = 0; // Start at the beginning of the array
  var count = v_data.t_cnt; // Execute 3 times for 3 vertexes
  var indexType = gl.UNSIGNED_SHORT; 

  // Redraw
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(primitiveType, count, indexType, offset);

  // Call again 

  requestAnimationFrame( () => update(
    gl, water, v_data, 
    p_buf, c_buf, idx_buf, 
    position_ptr, color_ptr
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
  const p_buf = gl.createBuffer(); 
  const c_buf = gl.createBuffer();
  const idx_buf = gl.createBuffer();

  // Make triangles
  const v_data = create2dMesh(REZ);

  /*
  // Bind to position buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, p_buf)

  // Make the position_ptr the active variable 
  gl.enableVertexAttribArray(position_ptr);
  gl.vertexAttribPointer(position_ptr, 2, gl.FLOAT, false, 0, 0)

  // Put vertices into (active) position buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,             
    new Float32Array(v_data.verts),  // Strongly typed array
    gl.STATIC_DRAW  // Compiler hint that we won't change data
  )


  // Bind to color buffer 
  gl.bindBuffer(gl.ARRAY_BUFFER, c_buf); 

  // Tell GL to use the color_ptr for this buffer 
  gl.enableVertexAttribArray(color_ptr);
  gl.vertexAttribPointer(color_ptr, 1, gl.FLOAT, false, 0, 0)

  // Create colors 
  colors = Array(v_data.v_cnt).fill().map(() => Math.random()); 

  // Put data into color buffer 
  gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array(colors), 
    gl.STATIC_DRAW
  )

  // Bind to the index buffer (do this before drawing)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buf);

  // Dont need to enable/call vertexAttribPointer? 
  // I guess since we aren't passing in an attrib it's fine

  // Put indices into element array buf
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, 
    new Uint16Array(v_data.indices), 
    gl.STATIC_DRAW
  )

  // Tell gl to actually draw the points we made
  var primitiveType = gl.TRIANGLES; 
  var offset = 0; // Start at the beginning of the array
  var count = v_data.t_cnt; // Execute 3 times for 3 vertexes
  var indexType = gl.UNSIGNED_SHORT; 

  gl.drawElements(primitiveType, count, indexType, offset);

  // Draws non-indexed shapes
  // gl.drawArrays(primitiveType, offset, count)
  
  */

  water = new Water(REZ);

  // Create a drop in the middle 
  mid = Math.floor(REZ/2)
  water.cur[mid][mid] = 100; 

  update(
    gl, water, v_data, 
    p_buf, c_buf, idx_buf, 
    position_ptr, color_ptr
  ); 
}