var VERT_SHADER = 
`// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec4 a_color; 

varying vec4 v_color; 

// all shaders have a main function
void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(a_position.xy, 0,1);
    v_color = a_color; 
}`

var FRAG_SHADER = 
`// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec4 v_color; 
void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting

    gl_FragColor = vec4(0.4*v_color.x, 0.9*v_color.x, 0.2+v_color.x, 1); 
    
    //gl_FragColor = vec4(0, 0, v_color.x, 1); 
}`