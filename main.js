/** some coding style guidelines
 * to prevent messy or uncohesive looking codebase
 * 
 * variables:
 *  - all lowercase
 *  - descriptive and verbose
 *  - words are separated by underscores
 *  - e.g var this_is_an_example_variable;
 * 
 * functions:
 *  - function name starts lowercase
 *  - descriptive and verbose
 *  - words are separated by capitalization
 *  - e.g function thisIsAnExampleFunction();
 * 
 * function parameters:
 *  - function parameters are lowercased
 *  - prefer to be shortened
 *  - e.g function someFunction(param1, param2);
 * 
 * comments:
 *  - prefer forward-slash-asterisk styled comments over double-forward-slash
 *  - not that important but for the sake of maintaining cohesion
 */

"use strict"

/** game settings */
const DEBUG_COLLISION = false;
const MAX_GROUND_BLOCKS = 15;
const MAX_PIPES = 3;
const MAX_PIPE_COLUMN = 7;
const PIPE_START_Y = -3;
const MAX_VIEW_DISTANCE = 100;
const PLAYER_MOVEMENT_SPEED = 0.05;
const PLAYER_MAX_FALL_SPEED = -0.3;
const PLAYER_MAX_JUMP_SPEED = 0.25;
const GRAVITY = -0.025;
const GROUND_BLOCK_TEXTURE = "./textures/ground.png";
const PIPE_BLOCK_TEXTURE = "./textures/pipe.png";
const PLAYER_BODY_TEXTURE = "./textures/player_body.png";
const PLAYER_WING_TEXTURE = "./textures/player_wing.png";

/** global variables */
var gl;
var canvas;
var ctx2;
var score_hud;
var state_hud;
var alt_text_hud;
var program;

var entities = [];
var entities_to_delete = [];
var entities_active_length;
var entity_lookup_map = {};

var camera;
var player;

var controls = {
    camera_forward:false,
    camera_backward:false,
    camera_left:false,
    camera_right:false,
    camera_up:false,
    camera_down:false,
    paused:false,
    gamestart:true,
    gameover:false,
    player_jump:false,
    player_finish_jump:true,
    player_up:false,
    player_down:false,
    player_left:false,
    player_right:false,
    light_manual:false,
    light_up:false,
    light_down:false,
    light_left:false,
    light_right:false,
    light_on:true,
    light_strobe:false,
};

var score;

/** handles webgl setup and other processes at initialization time */
window.onload = function initialize(){
    /* initialize webgl rendering context */
    canvas = document.getElementById("gl_canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL 2.0 is not available");
    }

    /** initialize hud */
    score_hud = document.getElementById("score_hud");
    state_hud = document.getElementById("state_hud");
    alt_text_hud = document.getElementById("alt_text_hud");

    /** initialize background canvas */
    ctx2 = document.getElementById("bg_canvas").getContext("2d");
    var background = new Image();
    background.src = "./textures/background.png";
    background.onload = function(){
        ctx2.drawImage(background, 0, 0);
    };

    /* configure webgl rendering context */
    gl.viewport(0, 0, canvas.width, canvas.height);
    //gl.clearColor(45/255, 7/255, 7/255, 1);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);

    /* load shaders and build webgl program */
    program = initShaders(gl, "vertex_shader", "fragment_shader");
    gl.useProgram(program);

    /** setup initial game state data*/
    /** create player */
    var player_wing1 = createEntity("player_wing");
    entities[player_wing1].addComponent(positionComponent(-0.25, 0, 0.5, 1));
    entities[player_wing1].addComponent(scaleComponent(0.25, 0.125, 0.5, 1));
    entities[player_wing1].addComponent(rotationComponent(0, 0, 0, 1));
    entities[player_wing1].addComponent(verticiesComponent(generateCubeVerticies()));
    entities[player_wing1].addComponent(normalsComponent(generateCubeNormals()));
    entities[player_wing1].addComponent(ambientComponent(1, 1, 1, 1));
    entities[player_wing1].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player_wing1].addComponent(specularComponent(1, 1, 1, 1, 100));
    entities[player_wing1].addComponent(textureComponent(PLAYER_WING_TEXTURE, generateCubeTextureCoordinates()));
    var player_wing2 = createEntity("player_wing");
    entities[player_wing2].addComponent(positionComponent(-0.25, 0, -0.5, 1));
    entities[player_wing2].addComponent(scaleComponent(0.25, 0.125, 0.5, 1));
    entities[player_wing2].addComponent(rotationComponent(0, 0, 0, 1));
    entities[player_wing2].addComponent(verticiesComponent(generateCubeVerticies()));
    entities[player_wing2].addComponent(normalsComponent(generateCubeNormals()));
    entities[player_wing2].addComponent(ambientComponent(1, 1, 1, 1));
    entities[player_wing2].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player_wing2].addComponent(specularComponent(1, 1, 1, 1, 100));
    entities[player_wing2].addComponent(textureComponent(PLAYER_WING_TEXTURE, generateCubeTextureCoordinates()));
    player = createEntity("player");
    entities[player].addComponent(positionComponent(0, 0, 0, 1));
    entities[player].addComponent(scaleComponent(0.5, 0.5, 0.5, 1));
    //entities[player].addComponent(scaleComponent(1, 1, 1, 1));
    entities[player].addComponent(rotationComponent(0, 0, 0, 1));
    entities[player].addComponent(verticiesComponent(generateCubeVerticies()));
    entities[player].addComponent(normalsComponent(generateCubeNormals()));
    entities[player].addComponent(ambientComponent(1, 1, 1, 1));
    entities[player].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player].addComponent(specularComponent(1, 1, 1, 1, 100));
    entities[player].addComponent(textureComponent(PLAYER_BODY_TEXTURE, generateCubeTextureCoordinates()));
    entities[player].addComponent(velocityComponent(0, PLAYER_MAX_FALL_SPEED, 0, 0));
    var player_children_component = entities[player].addComponent(childrenComponent());
    entities[player].components[player_children_component].addChild(player_wing1);
    entities[player].components[player_children_component].addChild(player_wing2);

    /** create camera */
    camera = createEntity("camera");
    entities[camera].addComponent(positionComponent(0, 0, 5, 1));
    entities[camera].addComponent(rotationComponent(Math.PI/2, 0, 0, 1));
    entities[camera].addComponent(projectionComponent(90, (canvas.width/canvas.height), 0.1, MAX_VIEW_DISTANCE));

    /** create lights */
    var global_light = createEntity("global_light");
    entities[global_light].addComponent(positionComponent(-10, 10, 10, 0));
    entities[global_light].addComponent(ambientComponent(0.2, 0.2, 0.2, 1));
    entities[global_light].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[global_light].addComponent(specularComponent(1, 1, 1, 1, 100));

    var player_light = createEntity("player_light");
    entities[player_light].addComponent(positionComponent(0, 0, 0, 0));
    entities[player_light].addComponent(ambientComponent(0.2, 0.2, 0.2, 1));
    entities[player_light].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player_light].addComponent(specularComponent(1, 1, 1, 1, 100));

    /** create level */
    if(!DEBUG_COLLISION){
        for(var i = 0; i < MAX_GROUND_BLOCKS; i++){
            var ground_block = createEntity("ground_block");
            entities[ground_block].addComponent(positionComponent(i - Math.floor((MAX_GROUND_BLOCKS/2)), -4, 0, 1));
            entities[ground_block].addComponent(scaleComponent(1, 1, 1, 1));
            entities[ground_block].addComponent(verticiesComponent(generateCubeVerticies()));
            entities[ground_block].addComponent(normalsComponent(generateCubeNormals()));
            entities[ground_block].addComponent(ambientComponent(1, 1, 1, 1));
            entities[ground_block].addComponent(diffuseComponent(1, 1, 1, 1));
            entities[ground_block].addComponent(specularComponent(1, 1, 1, 1, 100));
            entities[ground_block].addComponent(textureComponent(GROUND_BLOCK_TEXTURE, generateCubeTextureCoordinates()));
        }

        for(var i = 0; i < MAX_PIPES; i++){
            var gap_y = Math.floor((Math.random() * MAX_PIPE_COLUMN) % MAX_PIPE_COLUMN-3);

            for(var j = 0; j < MAX_PIPE_COLUMN; j++){
                var pipe_block = createEntity("pipe_block");
                //entities[pipe_block].addComponent(positionComponent((i * 5) + 5, j - 3, 0, 1));

                if(j+PIPE_START_Y >= gap_y){
                    //pipe's blocks are higher than the gap_y

                    //offset by gap amount
                    //entities[pipe_block].components[position_component].y = (pipe_column_counter + PIPE_START_Y) + gap_height;
                    entities[pipe_block].addComponent(positionComponent((i * 5) + 5, (j + PIPE_START_Y) + 2, 0, 1));
                }
                else {
                    //this pipe block's y is not in a gap

                    //set height as normal
                    //entities[item].components[position_component].y = pipe_column_counter + PIPE_START_Y;
                    entities[pipe_block].addComponent(positionComponent((i * 5) + 5, (j + PIPE_START_Y), 0, 1));
                }
                entities[pipe_block].addComponent(scaleComponent(1, 1, 1, 1));
                entities[pipe_block].addComponent(verticiesComponent(generateCubeVerticies()));
                entities[pipe_block].addComponent(normalsComponent(generateCubeNormals()));
                entities[pipe_block].addComponent(ambientComponent(1, 1, 1, 1));
                entities[pipe_block].addComponent(diffuseComponent(1, 1, 1, 1));
                entities[pipe_block].addComponent(specularComponent(1, 1, 1, 1, 100));
                entities[pipe_block].addComponent(textureComponent(PIPE_BLOCK_TEXTURE, generateCubeTextureCoordinates()));
            }
        }
    }
    else {
        //debug level
        var ground_block = createEntity("ground_block");
        entities[ground_block].addComponent(positionComponent(2, 0, 0, 1));
        entities[ground_block].addComponent(scaleComponent(1, 1, 1, 1));
        entities[ground_block].addComponent(verticiesComponent(generateCubeVerticies()));
        entities[ground_block].addComponent(normalsComponent(generateCubeNormals()));
        entities[ground_block].addComponent(ambientComponent(1, 1, 1, 1));
        entities[ground_block].addComponent(diffuseComponent(1, 1, 1, 1));
        entities[ground_block].addComponent(specularComponent(1, 1, 1, 1, 100));
        entities[ground_block].addComponent(textureComponent(GROUND_BLOCK_TEXTURE, generateCubeTextureCoordinates()));
    }

    score = 0;
    score_hud.innerText = score;

    /* enter main update loop */
    update();
}

/** handles keydown events for input */
window.onkeydown = function onKeyDown(evt){
    var key = String.fromCharCode(evt.keyCode);
    switch(key){
        case 'F':
            /** keydown handling example
             * do whatever when F is pressed and released
             * break out of the switch statement after handling the event
             */
            console.log("flapping wings!");
            break;
        case 'W':
            controls.camera_forward = true;
            break;
        case 'S':
            controls.camera_backward = true;
            break;
        case 'A':
            controls.camera_left = true;
            break;
        case 'D':
            controls.camera_right = true;
            break;
        case 'Q':
            controls.camera_up = true;
            break;
        case 'E':
            controls.camera_down = true;
            break;
        case ' ':
            controls.player_jump = true;
            break;
        case '&':
            //up arrow
            controls.player_up = true;
            if(controls.light_manual){
                controls.light_up = true;
            }
            break;
        case '(':
            //down arrow
            controls.player_down = true;
            if(controls.light_manual){
                controls.light_down = true;
            }
            break;
        case '%':
            //left arrow
            controls.player_left = true;
            if(controls.light_manual){
                controls.light_left = true;
            }
            break;
        case "'":
            //right arrow
            controls.player_right = true;
            if(controls.light_manual){
                controls.light_right = true;
            }
            break;
        default:
            console.log("key is down: " + key);
    }
}

/** handles keyup events for input */
window.onkeyup = function onKeyUp(evt){
    var key = String.fromCharCode(evt.keyCode);
    switch(key){
        case 'F':
            console.log(entities);
            break;
        case 'W':
            controls.camera_forward = false;
            break;
        case 'S':
            controls.camera_backward = false;
            break;
        case 'A':
            controls.camera_left = false;
            break;
        case 'D':
            controls.camera_right = false;
            break;
        case 'Q':
            controls.camera_up = false;
            break;
        case 'E':
            controls.camera_down = false;
            break;
        case 'P':
            controls.paused = !controls.paused;
            break;
        case ' ':
            controls.player_jump = false;
            if(controls.player_finish_jump == false){
                controls.player_finish_jump = true;
            }
            if(controls.gamestart){
                controls.gamestart = false;
                //start the game if it isn't started
            }
            break;
        case '&':
            //up arrow
            controls.player_up = false;
            if(controls.light_manual){
                controls.light_up = false;
            }
            break;
        case '(':
            //down arrow
            controls.player_down = false;
            if(controls.light_manual){
                controls.light_down = false;
            }
            break;
        case '%':
            //left arrow
            controls.player_left = false;
            if(controls.light_manual){
                controls.light_left = false;
            }
            break;
        case "'":
            //right arrow
            controls.player_right = false;
            if(controls.light_manual){
                controls.light_right = false;
            }
            break;
        case "R":
            location.reload();
            break;
        case "1":
            //toggle manual light movement
            controls.light_manual = !controls.light_manual;
        case "2":
            //toggle player light
            controls.light_on = !controls.light_on;
        case "3":
            //toggle player light strobe
            controls.light_strobe = !controls.light_strobe;
        default:
            console.log("key is up: " + key);
    }
}

/** handles synchronization of the entities array */
function updateEntities(){

    /** remove all entities marked for deletion */
    for(var i = 0; i < entities_to_delete.length; i++){
        var entity_reference = entities_to_delete[i];
        var entity_tag = entities[entity_reference].tag;

        entities.splice(entity_reference, 1);
        entity_lookup_map[entity_tag].splice(entity_reference, 1);
    }
    
    /** clear the entity deletion queue */
    entities_to_delete.splice(0, entities_to_delete.length);

    /** update the active entity length */
    entities_active_length = entities.length;

    /** synchronize component data for the active entities*/
    for(var i = 0; i < entities_active_length; i++){
        /**remove all components marked for deletion for each active entity*/
        for(var j = 0; j < entities[i].components_to_delete.length; j++){

            entities[i].components.splice(entities[i].component_lookup_map[entities[i].components_to_delete[j]], 1);
            delete entities[i].component_lookup_map[entities[i].components_to_delete[j]];
        }

        /** clear the component deletion queue for each active entity */
        entities[i].components_to_delete.splice(0, entities[i].components_to_delete.length);

        /** update the active component length for each active entity */
        entities[i].components_active_length = entities[i].components.length;
    }
}

/** handles entity movement and positions during debugging */
function updateMovementDebug(){
    var position_component = entities[player].findComponent("position");

    if(controls.player_up){
        entities[player].components[position_component].y += PLAYER_MOVEMENT_SPEED;
    }
    if(controls.player_down){
        entities[player].components[position_component].y -= PLAYER_MOVEMENT_SPEED;
    }
    if(controls.player_left){
        entities[player].components[position_component].x -= PLAYER_MOVEMENT_SPEED;
    }
    if(controls.player_right){
        entities[player].components[position_component].x += PLAYER_MOVEMENT_SPEED;
    }
}

/** handles entity movement and positions as a result of movement */
function updateMovement(){
    var max_ground_blocks_clean_half = Math.floor(MAX_GROUND_BLOCKS/2);

    var ground_blocks = getEntityCollection("ground_block");
    ground_blocks.forEach(function(item, index){
        var position_component = entities[item].findComponent("position");

        if(entities[item].components[position_component].x < ((-1) * max_ground_blocks_clean_half - 1)){
            //ground block went too far offscreen, move the block to the right side of the screen 

            entities[item].components[position_component].x = max_ground_blocks_clean_half - 1;
        }

        entities[item].components[position_component].x -= PLAYER_MOVEMENT_SPEED;
    });

    var pipe_blocks = getEntityCollection("pipe_block");
    /** pipe column counter
     * we know that the first MAX_PIPE_COLUMN blocks are of the same column
     * the pipes are also generated in order
     * so we manipulate columns by counting the number of pipe blocks for each column 
     * and resetting when one column is counted
     */
    var pipe_column_counter = 0;
    var gap_height = 2
    var gap_y = Math.floor((Math.random() * MAX_PIPE_COLUMN) % MAX_PIPE_COLUMN-3);
    pipe_blocks.forEach(function(item, index){
        var position_component = entities[item].findComponent("position");

        if(pipe_column_counter >= MAX_PIPE_COLUMN){
            //one column is counted

            //reset counter variable for next column
            pipe_column_counter = 0;
            gap_y = Math.floor((Math.random() * MAX_PIPE_COLUMN) % MAX_PIPE_COLUMN-3);
        }

        if(pipe_column_counter == 0){
            if(entities[item].components[position_component].x < 0.01 && entities[item].components[position_component].x > -0.01){
                score++;
                score_hud.innerText = score;
            }
        }

        if(entities[item].components[position_component].x < ((-1) * (MAX_GROUND_BLOCKS/2) - 1)){
            //ground block went too far offscreen, move the block to the right side of the screen 

            entities[item].components[position_component].x = (MAX_GROUND_BLOCKS/2) - 1;

            //regenerate column

            if(pipe_column_counter+PIPE_START_Y >= gap_y){
                //pipe's blocks are higher than the gap_y

                //offset by gap amount
                entities[item].components[position_component].y = (pipe_column_counter + PIPE_START_Y) + gap_height;
            }
            else {
                //this pipe block's y is not in a gap

                //set height as normal
                entities[item].components[position_component].y = pipe_column_counter + PIPE_START_Y;
            }
        }

        entities[item].components[position_component].x -= PLAYER_MOVEMENT_SPEED;

        pipe_column_counter++; //update when block is finished processing
    });

}

/** handles simulation of gravity for the player entity */
function updateGravity(){
    var velocity_component = entities[player].findComponent("velocity");

    // calculate player falling velocity
    if(entities[player].components[velocity_component].y < PLAYER_MAX_FALL_SPEED){
        entities[player].components[velocity_component].y = PLAYER_MAX_FALL_SPEED;
    }
    else {
        //player has not reached terminal velocity

        entities[player].components[velocity_component].y += GRAVITY;
    }

    // implement player jump
    if(controls.player_jump){
        //player pressed the jump button

        if(controls.player_finish_jump){
            //fresh new jump sequence, player is not currently already jumping or finished their last jump already

            entities[player].components[velocity_component].y = PLAYER_MAX_JUMP_SPEED;
            controls.player_finish_jump = false;
        }
        else {
            //player is currently in the middle of jumping

            if(entities[player].components[velocity_component].y == 0){
                //player reached the height of their jump, i.e finished their jump

                controls.player_finish_jump = true;
            }
        }
    }

    //simulate the effect of gravity on the player
    var position_component = entities[player].findComponent("position");
    var scale_component = entities[player].findComponent("scale");

    entities[player].components[position_component].y += entities[player].components[velocity_component].y;

    //that part of the program where elements are moving in hierarchial relationship with another.
    //but if you ask me, the moving ground_block carrying the pipe_blocks already do that
    //but I'm gonna script this in just in case
    var children_component = entities[player].findComponent("children");
    entities[player].components[children_component].children.forEach(function(item, index){
        var child_position_component = entities[item].findComponent("position");
        var child_scale_component = entities[item].findComponent("scale");

        entities[item].components[child_position_component].y = (entities[player].components[position_component].y * entities[player].components[scale_component].y) + entities[item].components[child_position_component].y_initial;
        entities[item].components[child_position_component].y /= entities[item].components[child_scale_component].y;
    });
}

/** handles collision detection of entities */
function updateCollision(){
    /** CONCEPT: simple 2d collision detection
     * collision occurs when there is an x_overlap and y_overlap
     * check each collidable entity for an x_overlap and y_overlap
     */
    var player_position_component = entities[player].findComponent("position");
    var player_scale_component = entities[player].findComponent("scale");
    var player_xscale = entities[player].components[player_scale_component].x;
    var player_yscale = entities[player].components[player_scale_component].y;
    var player_xposition = entities[player].components[player_position_component].x;
    var player_yposition = entities[player].components[player_position_component].y;

    /** scaling things down make them travel more distance to get to the same place
     * for example if a block is scaled to 0.5, it takes 2x the translation to get to the same position on screen
     * so we multiply the position by the scale factor to get the actual position
     * i guess this makes sense?
     */
    player_xposition = player_xposition * player_xscale;
    player_yposition = player_yposition * player_yscale;

    var gameover_blocks = getEntityCollection("ground_block").concat(getEntityCollection("pipe_block"));
    gameover_blocks.forEach(function(item, index){
        //for each collidable entity

        var x_overlap = false;
        var y_overlap = false;

        var entity_position_component = entities[item].findComponent("position");
        var entity_scale_component = entities[item].findComponent("scale");
        var entity_xscale = entities[item].components[entity_scale_component].x;
        var entity_yscale = entities[item].components[entity_scale_component].y;
        var entity_xposition = entities[item].components[entity_position_component].x;
        var entity_yposition = entities[item].components[entity_position_component].y;
        
        //rescale positions
        entity_xposition = entity_xposition * entity_xscale;
        entity_yposition = entity_yposition * entity_yscale;

        //check for x_overlap
        var distance_0;
        var distance;
        //distance_0 = (entity_xscale/2 + player_xscale/2) * (entity_xscale/2 + player_xscale/2);
        distance_0 = ((entity_xscale/2) + (player_xscale/2));
        if(player_xposition > entity_xposition){
            //player is to the right of entity, so we check for left sided collision

            //check for left-sided collision
            //distance = ((entity_xposition + entity_xscale/2) - (player_xposition - player_xscale/2)) * ((entity_xposition + entity_xscale/2) - (player_xposition - player_xscale/2));
            //distance = Math.abs((player_xposition - (player_xscale/2)) - (entity_xposition + (entity_xscale/2)));
            distance = Math.abs(Math.abs(player_xposition) - entity_xposition);
            if(distance < distance_0){
                //there is a left-sided collision on the x-axis

                x_overlap = true;
            }
        }
        else if(player_xposition < entity_xposition){
            //player is to the left of entity, so we check for right sided collision

            //check for right-sided collision
            //distance = ((entity_xposition - entity_xscale/2) - (player_xposition + player_xscale/2)) * ((entity_xposition - entity_xscale/2) - (player_xposition + player_xscale/2));
            //distance = Math.abs((entity_xposition - (entity_xscale/2)) - (player_xposition + (player_xscale/2)));
            distance = Math.abs(entity_xposition - player_xposition);
            if(distance < distance_0){
                //there is a right-sided collision on the x-axis

                x_overlap = true;
            }
        }
        else {
            //same x position as each other, likely a x overlap

            x_overlap = true;
        }
        //check for y_overlap
        //distance_0 = (entity_yscale/2 + player_yscale/2) * (entity_yscale/2 + player_yscale/2);
        distance_0 = ((entity_yscale/2) + (player_yscale/2));
        if(player_yposition > entity_yposition){
            //player is above entity, so we check for bot side collision

            //check for bot-sided collision
            //distance = ((entity_yposition + entity_yscale/2) - (player_yposition - player_yscale/2)) * ((entity_yposition + entity_yscale/2) - (player_yposition - player_yscale/2));
            //distance = Math.abs((player_yposition - (player_yscale/2)) - (entity_yposition + (entity_yscale/2)));
            distance = Math.abs(Math.abs(player_yposition) - entity_yposition);
            if(distance < distance_0){
                //there is a bot-sided collision on the y-axis

                y_overlap = true;
            }
        }
        else if(player_yposition < entity_yposition){
            //player is below entity, so we check for top side collision

            //check for top-sided collision
            //distance = ((entity_yposition - entity_yscale/2) - (player_yposition + player_yscale/2)) * ((entity_yposition - entity_yscale/2) - (player_yposition + player_yscale/2));
            //distance = Math.abs((entity_yposition - (entity_yscale/2)) - (player_yposition + (player_yscale/2)));
            distance = Math.abs(entity_yposition - player_yposition);
            if(distance < distance_0){
                //there is a top-sided collision on the y-axis

                y_overlap = true;
            }
        }
        else {
            //same y position as each other, more than likely a y_overlap

            y_overlap = true;
        }

        //check if there is a collision between these two entities
        if((x_overlap == true) && (y_overlap == true)){
            //collision detected!

            //console.log("---");
            //console.log("collision detected!: " + entity_xscale + ", " + entity_xposition + ", " + entity_yscale + ", " + entity_yposition + "; ");
            //console.log("collision detected!: " + player_xscale + ", " + player_xposition + ", " + player_yscale + ", " + player_yposition + "; ");
            //console.log("x_d0:" + ((entity_xscale/2) + (player_xscale/2)));
            //console.log("left_d: " + Math.abs(Math.abs(player_xposition) - entity_xposition));
            //console.log("right_d: " + Math.abs(Math.abs(entity_xposition) - player_xposition));
            //console.log("y_d0:" + ((entity_yscale/2) + (player_yscale/2)));
            //console.log("top_d: " + Math.abs(Math.abs(entity_yposition) - player_yposition));
            //console.log("bot_d: " + Math.abs(Math.abs(player_yposition) - entity_yposition));
            //console.log("---");

            var entity_diffuse_component = entities[item].findComponent("diffuse");
            entities[item].components[entity_diffuse_component].r = Math.random();
            entities[item].components[entity_diffuse_component].g = Math.random();
            entities[item].components[entity_diffuse_component].b = Math.random();
            controls.gameover = true;
        }
    });
}

/** handles updating camera settings */
function updateCamera(){
    /** CONCEPT:
     * - want to showcase 3D environment during gameplay
     * - one idea is to have the camera point slightly forward while following the player
     * - this keeps the original 2d side-scroller view from the game, while showcasing the 3D objects
     * - also allows possible future camera interactions to be handled here
     */

    /** setup camera and projection */
    var projection_component = entities[camera].findComponent("projection");
    var position_component = entities[camera].findComponent("position");
    var rotation_component = entities[camera].findComponent("rotation");

    /** update camera position */
    if(controls.camera_forward){
        entities[camera].components[projection_component].radius -= 0.1;
    }
    if(controls.camera_backward){
        entities[camera].components[projection_component].radius += 0.1;
    }
    if(controls.camera_up){
        entities[camera].components[rotation_component].y += 0.1;
    }
    if(controls.camera_down){
        entities[camera].components[rotation_component].y -= 0.1;
    }
    if(controls.camera_left){
        entities[camera].components[rotation_component].x += 0.1;
    }
    if(controls.camera_right){
        entities[camera].components[rotation_component].x -= 0.1;
    }
    
    entities[camera].components[position_component].x = Math.cos(entities[camera].components[rotation_component].x) * entities[camera].components[projection_component].radius;
    entities[camera].components[position_component].z = Math.sin(entities[camera].components[rotation_component].x) * entities[camera].components[projection_component].radius;
    entities[camera].components[position_component].y = Math.sin(entities[camera].components[rotation_component].y) * entities[camera].components[projection_component].radius;


    /** notes on model-view matrix
     * seems like model-view matrix is the model's matrix with all the transformations applied 
     * while the view matrix is the matrix returned by lookat()
     * so model-view multiplies the view matrix onto the model matrix
     * like how projection-view takes the projection matrix and multiplies the view matrix onto it
     * using this information, we can just make it a view matrix instead to separate the matricies
     * 
     * camera position z is also inverted for some reason
     */
    var view_matrix = lookAt(entities[camera].components[position_component].getVec3(), vec3(0, 0, 0), vec3(0, 1, 0));
    var projection_matrix = entities[camera].components[projection_component].getProjectionMatrix();

    var uViewMatrix_location = gl.getUniformLocation(program, "uViewMatrix");
    var uProjectionMatrix_location = gl.getUniformLocation(program, "uProjectionMatrix");
    gl.uniformMatrix4fv(uViewMatrix_location, false, flatten(view_matrix));
    gl.uniformMatrix4fv(uProjectionMatrix_location, false, flatten(projection_matrix));
}

/** handles updating lights and position*/
function updateLights(){
    var player_light = getEntityCollection("player_light")[0];
    var global_light = getEntityCollection("global_light")[0];

    var player_light_position_component = entities[player_light].findComponent("position");
    var player_light_ambient_component = entities[player_light].findComponent("ambient");
    var player_light_diffuse_component = entities[player_light].findComponent("diffuse");
    var player_light_specular_component = entities[player_light].findComponent("specular");

    var global_light_position_component = entities[global_light].findComponent("position");
    var global_light_ambient_component = entities[global_light].findComponent("ambient");
    var global_light_diffuse_component = entities[global_light].findComponent("diffuse");
    var global_light_specular_component = entities[global_light].findComponent("specular");

    //update player_light position before sending it to the gpu
    //check if light is attached to player or manually controlled
    if(controls.light_manual){
        //manual light mode

        if(controls.light_up){
            entities[player_light].components[player_light_position_component].y += 0.1;
        }
        if(controls.light_down){
            entities[player_light].components[player_light_position_component].y -= 0.1;
        }
        if(controls.light_left){
            entities[player_light].components[player_light_position_component].x -= 0.1;
        }
        if(controls.light_right){
            entities[player_light].components[player_light_position_component].x += 0.1;
        }
    }
    else{
        //attached to player

        var player_position_component = entities[player].findComponent("position");
        var player_scale_component = entities[player].findComponent("scale");

        entities[player_light].components[player_light_position_component].x = entities[player].components[player_position_component].x * entities[player].components[player_scale_component].x;
        entities[player_light].components[player_light_position_component].y = entities[player].components[player_position_component].y * entities[player].components[player_scale_component].y;
        entities[player_light].components[player_light_position_component].z = entities[player].components[player_position_component].z * entities[player].components[player_scale_component].z;
    }
    
    //update light colors
    if(controls.light_strobe){
        //strobe mode

        entities[player_light].components[player_light_diffuse_component].r = Math.random();
        entities[player_light].components[player_light_diffuse_component].g = Math.random();
        entities[player_light].components[player_light_diffuse_component].b = Math.random();
    }
    else{
        //normal lighting

        entities[player_light].components[player_light_diffuse_component].r = 1;
        entities[player_light].components[player_light_diffuse_component].g = 1;
        entities[player_light].components[player_light_diffuse_component].b = 1;
    }

    var uLightOn_location = gl.getUniformLocation(program, "uPlayerLightOn");
    gl.uniform1f(uLightOn_location, (controls.light_on)? 1.0 : 0.0);
    
    var uLightPosition_location = gl.getUniformLocation(program, "uPlayerLightPosition");
    gl.uniform4fv(uLightPosition_location, entities[player_light].components[player_light_position_component].getVec4());
    uLightPosition_location = gl.getUniformLocation(program, "uGlobalLightPosition");
    gl.uniform4fv(uLightPosition_location, entities[global_light].components[global_light_position_component].getVec4());

    var uLightAmbient_location = gl.getUniformLocation(program, "uPlayerLightAmbient");
    gl.uniform4fv(uLightAmbient_location, entities[player_light].components[player_light_ambient_component].getVec4());
    uLightAmbient_location = gl.getUniformLocation(program, "uGlobalLightAmbient");
    gl.uniform4fv(uLightAmbient_location, entities[global_light].components[global_light_ambient_component].getVec4());

    var uLightDiffuse_location = gl.getUniformLocation(program, "uPlayerLightDiffuse");
    gl.uniform4fv(uLightDiffuse_location, entities[player_light].components[player_light_diffuse_component].getVec4());
    uLightDiffuse_location = gl.getUniformLocation(program, "uGlobalLightDiffuse");
    gl.uniform4fv(uLightDiffuse_location, entities[global_light].components[global_light_diffuse_component].getVec4());

    var uLightSpecular_location = gl.getUniformLocation(program, "uPlayerLightSpecular");
    gl.uniform4fv(uLightSpecular_location, entities[player_light].components[player_light_specular_component].getVec4());
    uLightSpecular_location = gl.getUniformLocation(program, "uGlobalLightSpecular");
    gl.uniform4fv(uLightSpecular_location, entities[global_light].components[global_light_specular_component].getVec4());

    // deprecated, highly inefficient
    //for(var i = 0; i < entities_active_length; i++){
    //    if(entities[i].tag.endsWith("light")){
    //        /** entity is a light source */

    //        for(var j = 0; j < entities[i].components_active_length; j++){
    //            if(entities[i].components[j].tag == "position"){
    //                /** found position component */

    //                if(entities[i].tag.startsWith("player")){
    //                    /** player light */

    //                    var uLightPosition_location = gl.getUniformLocation(program, "uPlayerLightPosition");
    //                    gl.uniform4fv(uLightPosition_location, entities[i].components[j].getVec4());
    //                }

    //                if(entities[i].tag.startsWith("global")){
    //                    /** global light */

    //                    var uLightPosition_location = gl.getUniformLocation(program, "uGlobalLightPosition");
    //                    gl.uniform4fv(uLightPosition_location, entities[i].components[j].getVec4());
    //                }
    //            }

    //            if(entities[i].components[j].tag == "ambient"){
    //                /** found ambient component */

    //                if(entities[i].tag.startsWith("player")){
    //                    /** player light */

    //                    var uLightAmbient_location = gl.getUniformLocation(program, "uPlayerLightAmbient");
    //                    gl.uniform4fv(uLightAmbient_location, entities[i].components[j].getVec4());
    //                }

    //                if(entities[i].tag.startsWith("global")){
    //                    /** global light */

    //                    var uLightAmbient_location = gl.getUniformLocation(program, "uGlobalLightAmbient");
    //                    gl.uniform4fv(uLightAmbient_location, entities[i].components[j].getVec4());
    //                }
    //            }

    //            if(entities[i].components[j].tag == "diffuse"){
    //                /** found diffuse component */

    //                if(entities[i].tag.startsWith("player")){
    //                    /** player light */

    //                    var uLightDiffuse_location = gl.getUniformLocation(program, "uPlayerLightDiffuse");
    //                    gl.uniform4fv(uLightDiffuse_location, entities[i].components[j].getVec4());
    //                }

    //                if(entities[i].tag.startsWith("global")){
    //                    /** global light */

    //                    var uLightDiffuse_location = gl.getUniformLocation(program, "uGlobalLightDiffuse");
    //                    gl.uniform4fv(uLightDiffuse_location, entities[i].components[j].getVec4());
    //                }
    //            }

    //            if(entities[i].components[j].tag == "specular"){
    //                /** found specular component */

    //                if(entities[i].tag.startsWith("player")){
    //                    /** player light */

    //                    var uLightSpecular_location = gl.getUniformLocation(program, "uPlayerLightSpecular");
    //                    gl.uniform4fv(uLightSpecular_location, entities[i].components[j].getVec4());
    //                }

    //                if(entities[i].tag.startsWith("global")){
    //                    /** global light */

    //                    var uLightSpecular_location = gl.getUniformLocation(program, "uGlobalLightSpecular");
    //                    gl.uniform4fv(uLightSpecular_location, entities[i].components[j].getVec4());
    //                }
    //            }
    //        }
    //    }
    //}
}

/** handles loading data to the gpu and drawing vertices to the canvas */
function render(){
    /** on every update frame,
     *  render all renderable entities
     *  for each renderable entity,
     *      load data into gpu
     *          set the current vertex array buffer
     *          set the current transformation matrix
     *          ...
     *          set any other possible data to be sent to the shaders
     *      draw the vertices arrays
     *          gl.drawArrays();
     */

    /** clear gl buffers */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    /** draw hud */
    if(controls.gamestart){
        state_hud.innerText = "GAME START";
        alt_text_hud.innerText = "PRESS SPACEBAR TO PLAY";
    }
    else if(controls.gameover){
        state_hud.innerText = "GAME OVER";
        alt_text_hud.innerText = "PRESS R TO PLAY AGAIN";
    }
    else if(controls.paused){
        state_hud.innerText = "PAUSED";
        alt_text_hud.innerText = "PRESS P TO UNPAUSE";
    }
    else{
        state_hud.innerText = "";
        alt_text_hud.innerText = "";
    }

    /** load gpu data for each active entity */
    for(var i = 0; i < entities_active_length; i++){

        var verticies_component = entities[i].findComponent("verticies");
        if(verticies_component != -1){
            /** the entity has a verticies component containing triangles we can draw in webgl */

            var entity_verticies_array = entities[i].components[verticies_component].verticies;

            /** load the vertices into the gpu */
            var vertex_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(entity_verticies_array), gl.STATIC_DRAW);

            var aPosition_location = gl.getAttribLocation(program, "aPosition");
            gl.vertexAttribPointer(aPosition_location, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosition_location);

            /** load object transformations into the gpu */
            var current_transformation_matrix = mat4();
            var scale_component = entities[i].findComponent("scale");
            if(scale_component != -1){
                /** there is a scale component to apply scaling */

                var entity_scale = entities[i].components[scale_component];
                current_transformation_matrix = mult(current_transformation_matrix, scale(entity_scale.x, entity_scale.y, entity_scale.z));
            }
            var rotation_component = entities[i].findComponent("rotation");
            if(rotation_component != -1){
                /** there is a rotation component to apply rotation */

                var entity_rotation = entities[i].components[rotation_component];
                if(entity_rotation.x != 0){
                    /** apply rotation on the x axis */

                    current_transformation_matrix = mult(current_transformation_matrix, rotateX(entity_rotation.x));
                }
                if(entity_rotation.y != 0){
                    /** apply rotation on the x axis */

                    current_transformation_matrix = mult(current_transformation_matrix, rotateY(entity_rotation.y));
                }
                if(entity_rotation.z != 0){
                    /** apply rotation on the x axis */

                    current_transformation_matrix = mult(current_transformation_matrix, rotateZ(entity_rotation.z));
                }
            }
            var position_component = entities[i].findComponent("position");
            if(position_component != -1){
                /** there is a position component to apply translation */

                var entity_position = entities[i].components[position_component];
                current_transformation_matrix = mult(current_transformation_matrix, translate(entity_position.x, entity_position.y, entity_position.z));
            }

            var uTransformationMatrix_location = gl.getUniformLocation(program, "uTransformationMatrix");
            gl.uniformMatrix4fv(uTransformationMatrix_location, false, flatten(current_transformation_matrix));


            /** load the vertex normals into the gpu 
             * because if entity has verticies, it might have normals
            */
            var normals_component = entities[i].findComponent("normals");
            if(normals_component != -1){
                /** normals exist for this entity */

                var entity_normals_array = entities[i].components[normals_component].normals;

                var normals_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, normals_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(entity_normals_array), gl.STATIC_DRAW);

                var aNormal_location = gl.getAttribLocation(program, "aNormal");
                gl.vertexAttribPointer(aNormal_location, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aNormal_location);

                /** load material into gpu
                 * because if entity has normals, it must have a material
                 */
                 var ambient_component = entities[i].findComponent("ambient");
                 var diffuse_component = entities[i].findComponent("diffuse");
                 var specular_component = entities[i].findComponent("specular");

                 var entity_ambient = entities[i].components[ambient_component].getVec4();
                 var entity_diffuse = entities[i].components[diffuse_component].getVec4();
                 var entity_specular = entities[i].components[specular_component].getVec4();
                 var entity_shininess = entities[i].components[specular_component].shininess;

                 var uMaterialAmbient_location = gl.getUniformLocation(program, "uMaterialAmbient");
                 var uMaterialDiffuse_location = gl.getUniformLocation(program, "uMaterialDiffuse");
                 var uMaterialSpecular_location = gl.getUniformLocation(program, "uMaterialSpecular");
                 var uMaterialShininess_location = gl.getUniformLocation(program, "uMaterialShininess");

                 gl.uniform4fv(uMaterialAmbient_location, entity_ambient);
                 gl.uniform4fv(uMaterialDiffuse_location, entity_diffuse);
                 gl.uniform4fv(uMaterialSpecular_location, entity_specular);
                 gl.uniform1f(uMaterialShininess_location, entity_shininess);

                 /** load texture data into gpu
                  * because the textures won't draw without normals
                  */
                var texture_component = entities[i].findComponent("texture");
                if(texture_component != -1){
                    var entity_texture_coordinates_array = entities[i].components[texture_component].texture_coordinates;
                    
                    var texture_coordinates_buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, texture_coordinates_buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(entity_texture_coordinates_array), gl.STATIC_DRAW);

                    var aTexCoord_location = gl.getAttribLocation(program, "aTexCoord");
                    gl.vertexAttribPointer(aTexCoord_location, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(aTexCoord_location);

                    entities[i].components[texture_component].loadTexture();
                }
            }

            /** draw the verticies array */
            gl.drawArrays(gl.TRIANGLES, 0, entity_verticies_array.length);
        }
    }
}

/** handles the main update loop */
function update(){
    /** CONCEPT:
     * every "frame" will be a call to this update function
     * every update frame will process game data in the form of updating the game "systems"
     * 
     * systems:
     *  the idea is that every "system" is responsible for one task in the game
     *  only modifies "component" data in "entities"
     */

    /** synchronize entity data first
     * then update all systems
     * finally render entities
     */
    updateEntities();

    if(!controls.paused && !controls.gameover && !controls.gamestart){
        if(!DEBUG_COLLISION){
            updateMovement();
            updateGravity();
        }
        else {
            updateMovementDebug();
        }
        updateCollision();
    }
    updateCamera();
    updateLights();

    render();

    requestAnimationFrame(update);
}

/** CONCEPT: 
 * entities are basically containers for "components"
 * "components" can be thought of as properties of an entity
 * e.g a "pipe entity" in game has "geometry", "position", "material", "texture", etc
 * 
 * entity-components-systems layout
 * entities[]: array of all entities in the game
 * entities_active_length: integer value counting all the active entities on the current frame
 *  : new entities are added to the end of the array
 *  : the value for this variable does not update until the next update frame
 *  : therefore while the new entities are added to the array, it isn't active until the next update frame
 *  : deleting entities are also not deleted until the next update frame
 *  : deleted entities are instead marked in a separate array storing the indexes of entities to be removed from the entity array
 *  : therefore entities queued to be deleted on the current frame won't interfere with the current frame
 * entities_to_delete[]: array of all entities to be deleted on the next update frame
 * 
 * adding entities
 * createEntity("entity_tag");
 *  createEntity() creates a new entity with the specified tag, appends it to the end of the array and returns the index of the entity in the entities array
 *  this new entity is not "active" until the next update frame because we won't update the entities_active_length value until the next update frame
 *  this new entity however can still be modified in the meantime
 * 
 * deleting entities
 * deleteEntity(8);
 *  the parameter takes an integer value representing the index of that entity in the entities array
 *  the entity is not deleted immediately but instead queued to be deleted on the next frame
 *  this prevents bugs and strange behaviour caused by entities being deleted mid-frame before they were processed
 *  this function stores the value of the next entity to be deleted in the entitites_to_delete array
 * 
 * the entity manager
 *  updateEntities() is called on the beginning of every update frame
 *      it removes all the entities queued to be deleted then updates the value of entities_active_length
 *          this results in queued entities to be deleted and added entities to be active
 *      it also clears the entities_to_delete array after removing the entities
 *  we call this function before doing anything during the update frame to make sure the entities data is synchronized for the current update frame
 *  this function also does the same for components of each entity to synchronize component data
 * 
*/

/** creates and returns a new entity 
 * t = string to identify/tag the entity as a certain type, e.g "pipe" entity, or "player" entity 
 * 
 * e.g createEntity("pipe"); //creates and returns a new "pipe" entity
*/
function createEntity(t){
    var output_entity = {
        tag:t,
        components:[],
        component_lookup_map:{},
        components_active_length:0,
        components_to_delete:[],
        /** findComponent(string ctag)
         * loops through the entity's component array to find a component with a tag matching the specified tag
         * returns the index of the component if found, -1 if not found 
         * 
         * why return the index?, javascript data is pass-by-value, returning the component gives a copy of the component, not a reference to it
         */
        findComponent:function(ctag){
            if(ctag in this.component_lookup_map){
                //component exists in the entity

                if(this.component_lookup_map[ctag] < this.components_active_length){
                    //component is active and usable

                    return this.component_lookup_map[ctag];
                }
            }

            return -1;

            //for(var i = 0; i < this.components.length; i++){
            //    if(this.components[i].tag == ctag){
            //        return i;
            //    }
            //}
            //return -1;
        },
        /** addComponent(object component) 
         * this function takes a component object and adds it to this entity's component list
         * this component will not be active until the next update frame
         * 
        */
        addComponent:function(c){
            this.components.push(c);
            this.component_lookup_map[c.tag] = this.components.length-1;
            return this.components.length-1; //returns a reference to the newly added component
        },
        /** deleteComponent(int component_tag) 
         * marks the component referenced to be deleted on the next update frame
        */
        deleteComponent:function(ctag){
            this.components_to_delete.push(ctag);
        }
    };

    entities.push(output_entity);
    if(output_entity.tag in entity_lookup_map){
        //entity tag is already in the map

        entity_lookup_map[output_entity.tag].push(entities.length - 1);
    }
    else {
        //brand new entity tag

        entity_lookup_map[output_entity.tag] = [entities.length - 1];
    }
    return (entities.length - 1);
}

/** deleteEntity(int entity_reference) 
 * marks the entity referenced to be deleted on the next update frame
 * 
 * e.g deleteEntity(4); marks the 4th entity in the entities array to be deleted on the next update frame
*/
function deleteEntity(e){
    entities_to_delete.push(e);
}

/** getEntityCollection(string entity_tag)
 * returns an array of references to all entities sharing the same entity_tag
 * returns empty array if the entity_tag is not found 
 * 
 */
function getEntityCollection(etag){
    if(etag in entity_lookup_map){
        //this entity collection exists

        return entity_lookup_map[etag];
    }

    return []; //else return an empty array
}

function generateCubeVerticies(){
    var vertex_list = [
        vec4(-0.5, -0.5, 0.5, 1.0), /**bottom-left-back */
        vec4(-0.5, 0.5, 0.5, 1.0), /**top-left-back */
        vec4(0.5, 0.5, 0.5, 1.0), /**top-right-back */
        vec4(0.5, -0.5, 0.5, 1.0), /**bottom-right-back */
        vec4(-0.5, -0.5, -0.5, 1.0), /**bottom-left-front */
        vec4(-0.5, 0.5, -0.5, 1.0), /**top-left-front */
        vec4(0.5, 0.5, -0.5, 1.0), /**top-right-front */
        vec4(0.5, -0.5, -0.5, 1.0) /**bottom-right-front */
    ];
    var face_list = [
        vec4(1, 0, 3, 2), /**back */
        vec4(2, 3, 7, 6), /**right */
        vec4(3, 0, 4, 7), /**bottom */
        vec4(6, 5, 1, 2), /**top */
        vec4(4, 5, 6, 7), /**front */
        vec4(5, 4, 0, 1) /**left */
    ];
    var output_vertices = [];

    /** generate triangles */
    face_list.forEach(function(item, index){
        /** abc */
        output_vertices.push(vertex_list[item[0]]);
        output_vertices.push(vertex_list[item[1]]);
        output_vertices.push(vertex_list[item[2]]);

        /** acd */
        output_vertices.push(vertex_list[item[0]]);
        output_vertices.push(vertex_list[item[2]]);
        output_vertices.push(vertex_list[item[3]]);
    });

    return output_vertices;
}

function generateCubeNormals(){
    var vertex_list = [
        vec4(-0.5, -0.5, 0.5, 1.0), /**bottom-left-back */
        vec4(-0.5, 0.5, 0.5, 1.0), /**top-left-back */
        vec4(0.5, 0.5, 0.5, 1.0), /**top-right-back */
        vec4(0.5, -0.5, 0.5, 1.0), /**bottom-right-back */
        vec4(-0.5, -0.5, -0.5, 1.0), /**bottom-left-front */
        vec4(-0.5, 0.5, -0.5, 1.0), /**top-left-front */
        vec4(0.5, 0.5, -0.5, 1.0), /**top-right-front */
        vec4(0.5, -0.5, -0.5, 1.0) /**bottom-right-front */
    ];
    var face_list = [
        vec4(1, 0, 3, 2), /**back */
        vec4(2, 3, 7, 6), /**right */
        vec4(3, 0, 4, 7), /**bottom */
        vec4(6, 5, 1, 2), /**top */
        vec4(4, 5, 6, 7), /**front */
        vec4(5, 4, 0, 1) /**left */
    ];
    var output_normals = [];

    /**generate normals
     * normals are generated for each vertex apparently?
     * follows right hand rule, top face is the set of vertices in counter clockwise direction
     * 
     * source: slide 6 in 8_2_WebGLShading(CG20)
     */
    face_list.forEach(function(item, index){
        var p0_to_p2 = subtract(vertex_list[item[2]], vertex_list[item[0]]);
        var p0_to_p1 = subtract(vertex_list[item[1]], vertex_list[item[0]]);
        var normal = cross(p0_to_p2, p0_to_p1);
        normal = vec3(normal);
        normal = normalize(normal);

        /** generate normal for each vertex */
        for(var i = 0; i < 6; i++){
            output_normals.push(normal);
        }
    });

    return output_normals;
}

function generateCubeTextureCoordinates(){
    var vertex_list = [
        vec4(-0.5, -0.5, 0.5, 1.0), /**bottom-left-back */
        vec4(-0.5, 0.5, 0.5, 1.0), /**top-left-back */
        vec4(0.5, 0.5, 0.5, 1.0), /**top-right-back */
        vec4(0.5, -0.5, 0.5, 1.0), /**bottom-right-back */
        vec4(-0.5, -0.5, -0.5, 1.0), /**bottom-left-front */
        vec4(-0.5, 0.5, -0.5, 1.0), /**top-left-front */
        vec4(0.5, 0.5, -0.5, 1.0), /**top-right-front */
        vec4(0.5, -0.5, -0.5, 1.0) /**bottom-right-front */
    ];
    var face_list = [
        vec4(1, 0, 3, 2), /**back */
        vec4(2, 3, 7, 6), /**right */
        vec4(3, 0, 4, 7), /**bottom */
        vec4(6, 5, 1, 2), /**top */
        vec4(4, 5, 6, 7), /**front */
        vec4(5, 4, 0, 1) /**left */
    ];
    var texture_coordinates = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];
    var output_coordinates = [];

    /** generate texture mapping coordinates */
    face_list.forEach(function(item, index){
        /** abc */
        output_coordinates.push(texture_coordinates[0]);
        output_coordinates.push(texture_coordinates[1]);
        output_coordinates.push(texture_coordinates[2]);

        /** acd */
        output_coordinates.push(texture_coordinates[0]);
        output_coordinates.push(texture_coordinates[2]);
        output_coordinates.push(texture_coordinates[3]);
    });

    return output_coordinates;
}