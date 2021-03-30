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

/** global variables */
var gl;
var canvas;
var program;

/** handles webgl setup and other processes at initialization time */
function initialize(){
    /* initialize webgl rendering context */
    canvas = document.getElementById("gl_canvas");
    gl = canvas.getContext('webgl2');
    if(!gl){
        alert("WebGL 2.0 is not available");
    }

    /* configure webgl rendering context */
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    /* load shaders and build webgl program */
    program = initShaders(gl, "vertex_shader", "fragment_shader");
    gl.useProgram(program);

    /* enter main update loop */
    update();
}

/** handles keydown events for input */
function onKeyDown(evt){
    var key = String.fromCharCode(evt.keyCode);
    switch(key){
        case 'F':
            /** keydown handling example
             * do whatever when F is pressed and released
             * break out of the switch statement after handling the event
             */
            console.log("flapping wings!");
            break;
        default:
            console.log("key is down: " + key);
    }
}

/** handles keyup events for input */
function onKeyUp(evt){
    var key = String.fromCharCode(evt.keyCode);
    switch(key){
        case 'F':
            console.log("not flapping wings anymore!");
            break;
        default:
            console.log("key is up: " + key);
    }
}

/** handles entity movement and positions as a result of movement */
function updateMovement(){
    /** TODO:
     * on every update frame,
     *  check if player pressed the key to flap it's wings
     *      translate player position up to simulate wing flap
     *  handle other possible entity movement
     */
}

/** handles simulation of gravity for the player entity */
function updateGravity(){
    /**TODO:
     * on every update frame,
     *  translate player position down to simulate gravity effect
     */
}

/** handles collision detection of entities */
function updateCollision(){
    /** TODO:
     * on every update frame,
     *  for each entity,
     *      check if there are collisions occuring
     *      update game data accordingly
     */
}

/** handles updating camera settings */
function updateCamera(){
    /** CONCEPT:
     * - want to showcase 3D environment during gameplay
     * - one idea is to have the camera point slightly forward while following the player
     * - this keeps the original 2d side-scroller view from the game, while showcasing the 3D objects
     * - also allows possible future camera interactions to be handled here
     */

    /** TODO:
     * on every update frame,
     *  set camera position
     *  set what the camera should look at,
     *      - probably player position + some units forward (forward_offset)
     */
}

/** handles loading data to the gpu and drawing vertices to the canvas */
function render(){
    /** TODO:
     * on every update frame,
     *  render all renderable entities
     *  for each renderable entity,
     *      load data into gpu
     *          set the current vertex array buffer
     *          set the current transformation matrix
     *          set the current modelview matrix
     *          set the current projection matrix
     *          ...
     *          set any other possible data to be sent to the shaders
     *      draw the vertices arrays
     *          gl.drawArrays();
     */
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

    /** update all systems
     * then render entities
     */
    updateMovement();
    updateGravity();
    updateCollision();
    updateCamera();

    render();

    requestAnimationFrame(update);
}

window.onload = initialize();
window.onkeydown = onKeyDown(e);
window.onkeyup = onKeyUp(e);

/** CONCEPT: 
 * entities are basically containers for "components"
 * "components" can be thought of as properties of an entity
 * e.g a "pipe entity" in game has "geometry", "position", "material", "texture", etc
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
        /** findComponent(string comp)
         * loops through the entity's component array to find a component with a tag matching the specified tag
         * returns the index of the component if found, -1 if not found 
         * 
         * why return the index?, javascript data is pass-by-value, returning the component gives a copy of the component, not a reference to it
         */
        findComponent:function(comp){
            for(var i = 0; i < this.components.length; i++){
                if(this.components[i].tag == comp){
                    return i;
                }
            }
            return -1;
        }
    };

    return output_entity;
}

/** TODO:
 * - create/add/remove components and entities
 * - setup entity/component manager to prevent desynchronization issues
 *  - what does this mean?
 *      - imagine a case where you add entities or components in the middle of an update
 *      all other operations modifying entities or components after that will be different from the operations before
 *      - solution: perform adding/removing on the beginning of the update frame,
 *          all other modifications are queued for the next update frame
 * - design the rest of the rendering pipeline
 * - design the rest of the ECS (Entity-Component-Systems) engine
 * - implement designs
 */