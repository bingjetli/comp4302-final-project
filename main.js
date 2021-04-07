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

var camera;

var controls = {
    camera_forward:false,
    camera_backward:false,
    camera_left:false,
    camera_right:false,
    camera_up:false,
    camera_down:false
};

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
    /** create player (test) */
    var player = createEntity("player");
    entities[player].addComponent(positionComponent(0, 0, 0, 1));
    entities[player].addComponent(scaleComponent(1, 1, 1, 1));
    entities[player].addComponent(rotationComponent(0, 0, 0, 1));
    entities[player].addComponent(verticiesComponent(generateCubeVerticies()));
    entities[player].addComponent(normalsComponent(generateCubeNormals()));
    entities[player].addComponent(ambientComponent(1, 1, 1, 1));
    entities[player].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player].addComponent(specularComponent(1, 1, 1, 1, 100));
    var texture_component = entities[player].addComponent(textureComponent("tiger.png", generateCubeTextureCoordinates()));
    entities[player].components[texture_component].image.onload = entities[player].components[texture_component].loadTexture();

    /** create camera */
    camera = createEntity("camera");
    entities[camera].addComponent(positionComponent(1, 1, 3, 1));
    entities[camera].addComponent(projectionComponent(90, (canvas.width/canvas.height), 0.1, 100));

    /** create lights */
    var global_light = createEntity("global_light");
    entities[global_light].addComponent(positionComponent(-1, 1, 0, 0));
    entities[global_light].addComponent(ambientComponent(0.2, 0.2, 0.2, 1));
    entities[global_light].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[global_light].addComponent(specularComponent(1, 1, 1, 1, 100));

    var player_light = createEntity("player_light");
    entities[player_light].addComponent(positionComponent(0, 0, 0, 0));
    entities[player_light].addComponent(ambientComponent(0.2, 0.2, 0.2, 1));
    entities[player_light].addComponent(diffuseComponent(1, 1, 1, 1));
    entities[player_light].addComponent(specularComponent(1, 1, 1, 1, 100));

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

    /** setup camera and projection */
    var projection_component = entities[camera].findComponent("projection");
    var position_component = entities[camera].findComponent("position");

    /** update camera position */
    if(controls.camera_forward){
        entities[camera].components[position_component].z -= 0.1;
    }
    if(controls.camera_backward){
        entities[camera].components[position_component].z += 0.1;
    }
    if(controls.camera_up){
        entities[camera].components[position_component].y += 0.1;
    }
    if(controls.camera_down){
        entities[camera].components[position_component].y -= 0.1;
    }
    if(controls.camera_left){
        entities[camera].components[position_component].x -= 0.1;
    }
    if(controls.camera_right){
        entities[camera].components[position_component].x += 0.1;
    }

    /** notes on model-view matrix
     * seems like model-view matrix is the model's matrix with all the transformations applied 
     * while the view matrix is the matrix returned by lookat()
     * so model-view multiplies the view matrix onto the model matrix
     * like how projection-view takes the projection matrix and multiplies the view matrix onto it
     * using this information, we can just make it a view matrix instead to separate the matricies
     * 
     * camera position z is also inverted for some reason
     */
    //var model_view_matrix = lookAt(entities[camera].components[position_component].getVec3(), vec3(0, 0, 0), vec3(0, 1, 0));
    var view_matrix = lookAt(entities[camera].components[position_component].getVec3(), vec3(0, 0, 0), vec3(0, 1, 0));
    var projection_matrix = entities[camera].components[projection_component].getProjectionMatrix();

    //var uModelViewMatrix_location = gl.getUniformLocation(program, "uModelViewMatrix");
    var uViewMatrix_location = gl.getUniformLocation(program, "uViewMatrix");
    var uProjectionMatrix_location = gl.getUniformLocation(program, "uProjectionMatrix");
    //gl.uniformMatrix4fv(uModelViewMatrix_location, false, flatten(model_view_matrix));
    gl.uniformMatrix4fv(uViewMatrix_location, false, flatten(view_matrix));
    gl.uniformMatrix4fv(uProjectionMatrix_location, false, flatten(projection_matrix));
}

/** handles updating lights and position*/
function updateLights(){
    for(var i = 0; i < entities_active_length; i++){
        if(entities[i].tag.endsWith("light")){
            /** entity is a light source */

            for(var j = 0; j < entities[i].components_active_length; j++){
                if(entities[i].components[j].tag == "position"){
                    /** found position component */

                    if(entities[i].tag.startsWith("player")){
                        /** player light */

                        var uLightPosition_location = gl.getUniformLocation(program, "uPlayerLightPosition");
                        gl.uniform4fv(uLightPosition_location, entities[i].components[j].getVec4());
                    }

                    if(entities[i].tag.startsWith("global")){
                        /** global light */

                        var uLightPosition_location = gl.getUniformLocation(program, "uGlobalLightPosition");
                        gl.uniform4fv(uLightPosition_location, entities[i].components[j].getVec4());
                    }
                }

                if(entities[i].components[j].tag == "ambient"){
                    /** found ambient component */

                    if(entities[i].tag.startsWith("player")){
                        /** player light */

                        var uLightAmbient_location = gl.getUniformLocation(program, "uPlayerLightAmbient");
                        gl.uniform4fv(uLightAmbient_location, entities[i].components[j].getVec4());
                    }

                    if(entities[i].tag.startsWith("global")){
                        /** global light */

                        var uLightAmbient_location = gl.getUniformLocation(program, "uGlobalLightAmbient");
                        gl.uniform4fv(uLightAmbient_location, entities[i].components[j].getVec4());
                    }
                }

                if(entities[i].components[j].tag == "diffuse"){
                    /** found diffuse component */

                    if(entities[i].tag.startsWith("player")){
                        /** player light */

                        var uLightDiffuse_location = gl.getUniformLocation(program, "uPlayerLightDiffuse");
                        gl.uniform4fv(uLightDiffuse_location, entities[i].components[j].getVec4());
                    }

                    if(entities[i].tag.startsWith("global")){
                        /** global light */

                        var uLightDiffuse_location = gl.getUniformLocation(program, "uGlobalLightDiffuse");
                        gl.uniform4fv(uLightDiffuse_location, entities[i].components[j].getVec4());
                    }
                }

                if(entities[i].components[j].tag == "specular"){
                    /** found specular component */

                    if(entities[i].tag.startsWith("player")){
                        /** player light */

                        var uLightSpecular_location = gl.getUniformLocation(program, "uPlayerLightSpecular");
                        gl.uniform4fv(uLightSpecular_location, entities[i].components[j].getVec4());
                    }

                    if(entities[i].tag.startsWith("global")){
                        /** global light */

                        var uLightSpecular_location = gl.getUniformLocation(program, "uGlobalLightSpecular");
                        gl.uniform4fv(uLightSpecular_location, entities[i].components[j].getVec4());
                    }
                }
            }
        }
    }
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

    updateMovement();
    updateGravity();
    updateCollision();
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
            return this.components.length-1; //returns a reference to the newly added component
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