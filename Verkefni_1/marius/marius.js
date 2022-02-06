/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//
//    Hjálmtýr Hafsteinsson, janúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var locBox;
var locColor;
var vPosition;
var bufferPlayer;
var bufferFloor;
var bufferEnemie1;
var bufferEnemie2;
var bufferCoin;
var bufferScore;
var program;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );
var floor_pos = vec2(0.0,0.0);
var enemies_box1 = vec2(-0.40,0.0);
var enemies_box2 = vec2(-0.80,0.0);
var coin_box = vec2(0.2,0.005);
var score_box = vec2(0.0,0.0);

// Stefna fyrir spilara
var pX;
var pY;

// Stefna fyrir óvini
var eX1;
var eX2;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var character_left = new Float32Array([-0.03, -0.00, 0.03, -0.00, 0.03, 0.06]);
var character_right = new Float32Array([-0.03, -0.00, 0.03, -0.00, -0.03, 0.06]);
var character_stop = [ vec2(  -0.03, 0.0 ), vec2(  0.03,  0.0 ), vec2(  0.0, 0.06 ) ];
var enemie = new Float32Array([-0.03, -0.00, 0.03, -0.00, 0.03, 0.06,0.03,0.06,-0.03,0.06,-0.03,0.0]);
var floor = new	Float32Array([-10,0,-10,-10,10,0,10,-10,-10,-10,10,0,0.4,0.0,0.4,0.1,0.8,0.1,0.4,0.0,0.8,0.0,0.8,0.1]);

var score = [ vec2( -0.95,0.9), vec2( -0.95,0.99), vec2( -0.955,0.9), vec2( -0.955,0.9), vec2( -0.955,0.99), vec2( -0.95,0.99),
			  vec2( -0.94,0.9), vec2( -0.94,0.99), vec2( -0.945,0.9), vec2( -0.945,0.9), vec2( -0.945,0.99), vec2( -0.94,0.99),
			  vec2( -0.93,0.9), vec2( -0.93,0.99), vec2( -0.935,0.9), vec2( -0.935,0.9), vec2( -0.935,0.99), vec2( -0.93,0.99),
			  vec2( -0.92,0.9), vec2( -0.92,0.99), vec2( -0.925,0.9), vec2( -0.925,0.9), vec2( -0.925,0.99), vec2( -0.92,0.99),
			  vec2( -0.91,0.9), vec2( -0.91,0.99), vec2( -0.915,0.9), vec2( -0.915,0.9), vec2( -0.915,0.99), vec2( -0.91,0.99),
			  vec2( -0.90,0.9), vec2( -0.90,0.99), vec2( -0.905,0.9), vec2( -0.905,0.9), vec2( -0.905,0.99), vec2( -0.90,0.99),
			  vec2( -0.89,0.9), vec2( -0.89,0.99), vec2( -0.895,0.9), vec2( -0.895,0.9), vec2( -0.895,0.99), vec2( -0.89,0.99),
			  vec2( -0.88,0.9), vec2( -0.88,0.99), vec2( -0.885,0.9), vec2( -0.885,0.9), vec2( -0.885,0.99), vec2( -0.88,0.99),
			  vec2( -0.87,0.9), vec2( -0.87,0.99), vec2( -0.875,0.9), vec2( -0.875,0.9), vec2( -0.875,0.99), vec2( -0.87,0.99),
			  vec2( -0.86,0.9), vec2( -0.86,0.99), vec2( -0.865,0.9), vec2( -0.865,0.9), vec2( -0.865,0.99), vec2( -0.86,0.99),];

var player = character_stop

var coin = [vec2(-0.01,0.0),vec2(0.01,0.0),vec2(-0.01,0.02),vec2(0.01,0.0),vec2(0.01,0.02),vec2(-0.01,0.02)];

var random_locations = [vec2(-0.3,0.005),vec2(0.2,0.005),vec2(0.6,0.105),vec2(-0.7,0.005),vec2(0.7,0.105)];

var Blue = vec4(0.0, 0.0, 1.0, 1.0);
var Green = vec4(0.0, 1.0, 0.0, 1.0);
var Red = vec4(1.0, 0.0, 0.0, 1.0); 
var Yellow = vec4(1.0, 1.0, 0.0, 1.0);
var Purple = vec4(1,0,1,1);
var White = vec4(1,1,1,1);
var playerColor = Blue;
var dead = false;
var win = false;

var coins_collected = 0;
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    pX = 0.;
    pY = 0;
	
	eX1 = -0.005;
	eX2 = 0.005;
	
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    bufferPlayer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlayer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(player), gl.DYNAMIC_DRAW );
	
	bufferFloor = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferFloor );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(floor), gl.STATIC_DRAW );
	
	bufferEnemie1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferEnemie1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(enemie), gl.DYNAMIC_DRAW );
	
	bufferEnemie2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferEnemie2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(enemie), gl.DYNAMIC_DRAW );
	
	bufferCoin = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCoin );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coin), gl.DYNAMIC_DRAW );
	
	bufferScore = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferScore );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score), gl.DYNAMIC_DRAW );

    
	vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	locBox = gl.getUniformLocation( program, "boxPos" );
	locColor = gl.getUniformLocation( program, "rcolor" );
	
	window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
			case 37:
				pX = -0.02;
				
				if(dead == false) player = character_left;
				break;
			case 39:
				pX = 0.02;
				if(dead == false) player = character_right;
				break;
            case 38:	// upp ör
				if ((box[1] == 0 || box[1] == 0.1) && pY == 0.0) pY = 0.03;
                break;
        }
    } );
	
	window.addEventListener("keyup", function(e){
        switch( e.keyCode ) {
			case 37:
				if (pX < 0){
					pX = 0;
					player = character_stop
				}
				if (pX == 0){
					player = character_stop
				}
				break;
			case 39:
				if (pX > 0){
					pX = 0;
					player = character_stop
				}
				if (pX == 0){
					player = character_stop
				}
				break;
			case 38:
				pY = -0.02;
				break;
        }
    } );
	
	
	
    render();
}
function reset_game(){
	box = vec2(0,0);
	dead = false;
	win = false
	pY = 0;
	playerColor = Blue;
	enemies_box1 = vec2(-0.40,0.0);
	enemies_box2 = vec2(-0.80,0.0);
	eX1 = -0.005;
	eX2 = 0.005;
	coins_collected = 0;
}

function render(bufferid1, bufferid2) {
    var change = Math.random()
    // Lát ferninginn skoppa af veggjunum
    if ((box[0] + pX) < -1) box[0] = 0.95;
	else if ((box[0] + pX) > 1) box[0] = -0.95;
	else if (((box[0]+0.02 > 0.4) && (box[0]-0.02  < 0.8) && (box[1] > 0.1)) && (box[1]+pY < 0.1)){
		pY = 0
		box[1] = 0.1
	}
	else if (((box[0]+0.02 <= 0.4) || (box[0]-0.02  >= 0.8)) && box[1] == 0.1){
		pY = -0.02
	}
    else if ((box[1] + pY) <= 0){
		pY = 0;
		box[1] = 0;
	}
	else if ((box[1] + pY) >= 0.4){
		pY = -0.02;
	}
	if((((box[0]+ pX+0.03) > 0.4) && ((box[0] + pX-0.02) < 0.8)) && (box[1] >= 0 && box[1] < 0.1)){
		pX = 0
	}
	if(box[0]>0.4 && box[0] < 0.8 && box[1] < 0.1){
		pY = 0
		box[1] = 0.1
	}	
	if(box[0] < (enemies_box1[0]+0.03+0.02) && box[0] > (enemies_box1[0]-0.03-0.02) && box[1] < 0.06){
		playerColor = Red;
		pY = 0.01
		dead = true
	}
	else if(box[0] < (enemies_box2[0]+0.03+0.02) && box[0] > (enemies_box2 [0]-0.03-0.02) && box[1] < 0.06){
		playerColor = Red;
		pY = 0.01
		dead = true
	}
	if (dead == true || win == true){
		pY = 0.01;
		pX = 0.0;
		player = character_stop;
		if(box[1] >= 1){
			reset_game();
		}
	}
	if (enemies_box1[0]-0.06 <= enemies_box2[0] && enemies_box1[0] > enemies_box2[0]){
		eX1 = 0.005;
		eX2 = -0.005;
	}
	if (enemies_box1[0]+0.03+eX1 > 0.4 && enemies_box1[0]+0.03+eX1 < 0.8) eX1 = -0.005;
	if (enemies_box2[0]-0.03 < 0.8 && enemies_box2[0]+0.03 > 0.4) eX2 = 0.005;
	if (enemies_box2[0]-0.03+eX2 < -1) enemies_box2[0] = 0.97;
	else if (enemies_box2[0]+0.03+eX2 > 1) enemies_box2[0] = -0.97;
	
	if ((box[0]+0.03 >= coin_box[0]-0.01 && box[0]-0.03 <= coin_box[0]+0.01) && (box[1] == 0.0 || box[1] == 0.1)){
		coins_collected += 1
		coin_box = vec2(10,10);
	}
	
	if (change > 0.995) coin_box = random_locations[Math.floor(Math.random()*5)];
	if (coins_collected == 10){
		win = true;
		playerColor = White;
	}

    // Uppfæra staðsetningu
    box[0] += pX;
    box[1] += pY;
	enemies_box1[0] += eX1;
	enemies_box2[0] += eX2;
    
	
	
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    //
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlayer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(player), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform2fv( locBox, flatten(box) );
	gl.uniform4fv( locColor, flatten(playerColor) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferFloor );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4fv( locColor, flatten(Green) );
	gl.uniform2fv( locBox, flatten(floor_pos) );
    gl.drawArrays( gl.TRIANGLES, 0, 12 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferEnemie1 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4fv( locColor, flatten(Red) );
	gl.uniform2fv( locBox, flatten(enemies_box1) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferEnemie2 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4fv( locColor, flatten(Red) );
	gl.uniform2fv( locBox, flatten(enemies_box2) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferCoin );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4fv( locColor, flatten(Yellow) );
	gl.uniform2fv( locBox, flatten(coin_box) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferScore );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4fv( locColor, flatten(Purple) );
	gl.uniform2fv( locBox, flatten(score_box) );
    gl.drawArrays( gl.TRIANGLES, 0, coins_collected*6 );
	

    window.requestAnimFrame(render);
}
