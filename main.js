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
var entities = [];
var entities_to_delete = [];
var entities_active_length;

/** handles webgl setup and other processes at initialization time */
window.onload = function initialize(){
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

    /** setup initial game state data*/
    /** testing the Entity-Component-System */
    var entity1 = createEntity("entity1");
    var entity2 = createEntity("entity2");
    var entity3 = createEntity("entity3");
    var cube_entity = createEntity("cube");

    entities[entity1].addComponent(testComponent("component1-1"));
    entities[entity2].addComponent(testComponent("component1-2"));
    entities[entity3].addComponent(testComponent("component1-3"));
    entities[cube_entity].addComponent(verticiesComponent(generateCubeVerticies()));

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
        default:
            console.log("key is down: " + key);
    }
}

/** handles keyup events for input */
window.onkeyup = function onKeyUp(evt){
    var key = String.fromCharCode(evt.keyCode);
    switch(key){
        case 'F':
            console.log("not flapping wings anymore!");
            break;

        case 'T':
            deleteEntity(0);
            break;
        case 'P':
            console.log(entities);
            break;
        case 'Y':
            entities[0].deleteComponent(0);
            break;
        default:
            console.log("key is up: " + key);
    }
}

/** handles synchronization of the entities array */
function updateEntities(){

    /** remove all entities marked for deletion */
    for(var i = 0; i < entities_to_delete.length; i++){
        entities.splice(entities_to_delete[i], 1);
    }
    
    /** clear the entity deletion queue */
    entities_to_delete.splice(0, entities_to_delete.length);

    /** update the active entity length */
    entities_active_length = entities.length;

    /** synchronize component data for the active entities*/
    for(var i = 0; i < entities_active_length; i++){
        /**remove all components marked for deletion for each active entity*/
        for(var j = 0; j < entities[i].components_to_delete.length; j++){
            entities[i].components.splice(entities[i].components_to_delete[j], 1);
        }

        /** clear the component deletion queue for each active entity */
        entities[i].components_to_delete.splice(0, entities[i].components_to_delete.length);

        /** update the active component length for each active entity */
        entities[i].components_active_length = entities[i].components.length;
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

    /** clear gl buffers */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /** load gpu data for each active entity */
    for(var i = 0; i < entities_active_length; i++){

        var entity_verticies = entities[i].findComponent("verticies");
        if(entity_verticies != -1){
            /** the entity has a verticies component containing triangles we can draw in webgl */
            var entity_verticies_array = entities[i].components[entity_verticies].verticies;

            /** load the vertices into the gpu */
            var vertex_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(entity_verticies_array), gl.STATIC_DRAW);

            var aPosition_location = gl.getAttribLocation(program, "aPosition");
            gl.vertexAttribPointer(aPosition_location, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosition_location);

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

    updateMovement();
    updateGravity();
    updateCollision();
    updateCamera();

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
        components_active_length:0,
        components_to_delete:[],
        /** findComponent(string ctag)
         * loops through the entity's component array to find a component with a tag matching the specified tag
         * returns the index of the component if found, -1 if not found 
         * 
         * why return the index?, javascript data is pass-by-value, returning the component gives a copy of the component, not a reference to it
         */
        findComponent:function(ctag){
            for(var i = 0; i < this.components.length; i++){
                if(this.components[i].tag == ctag){
                    return i;
                }
            }
            return -1;
        },
        /** addComponent(object component) 
         * this function takes a component object and adds it to this entity's component list
         * this component will not be active until the next update frame
         * 
        */
        addComponent:function(c){
            this.components.push(c);
        },
        /** deleteComponent(int component_reference) 
         * marks the component referenced to be deleted on the next update frame
        */
        deleteComponent:function(cref){
            this.components_to_delete.push(cref);
        }
    };

    entities.push(output_entity);
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