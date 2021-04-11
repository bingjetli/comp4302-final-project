/** testComponent(string tag)
 * tester function to test the ECS design
 * returns a blank component with a specified tag
 */
function testComponent(t){
    var output_component = {
        tag:t
    };

    return output_component;
}

/** positionComponent(x, y, z, w) 
 * creates and returns a position component object
*/
function positionComponent(xparam, yparam, zparam, wparam){
    var output_component = {
        tag:"position",
        x:xparam,
        y:yparam,
        z:zparam,
        w:wparam,
        x_initial:xparam,
        y_initial:yparam,
        z_initial:zparam,
        w_initial:wparam,
        getVec4:function(){
            return vec4(this.x, this.y, this.z, this.w);
        },
        getVec3:function(){
            return vec3(this.x, this.y, this.z);
        }
    };

    return output_component;
}

/** scaleComponent(x, y, z, w)
 * creates and returns a scale component object
 */
function scaleComponent(xparam, yparam, zparam, wparam){
    var output_component = {
        tag:"scale",
        x:xparam,
        y:yparam,
        z:zparam,
        w:wparam,
        x_initial:xparam,
        y_initial:yparam,
        z_initial:zparam,
        w_initial:wparam,
        getVec4:function(){
            return vec4(this.x, this.y, this.z, this.w);
        },
        getVec3:function(){
            return vec3(this.x, this.y, this.z);
        }
    };

    return output_component;
}

/** rotationComponent(x, y, z, w)
 * creates and returns a rotation component object
 */
function rotationComponent(xparam, yparam, zparam, wparam){
    var output_component = {
        tag:"rotation",
        x:xparam,
        y:yparam,
        z:zparam,
        w:wparam,
        x_initial:xparam,
        y_initial:yparam,
        z_initial:zparam,
        w_initial:wparam,
        getVec4:function(){
            return vec4(this.x, this.y, this.z, this.w);
        },
        getVec3:function(){
            return vec3(this.x, this.y, this.z);
        }
    };

    return output_component;
}

/** ambientComponent(r, g, b, a) 
 * creates and returns an ambient component object
*/
function ambientComponent(rparam, gparam, bparam, aparam){
    var output_component = {
        tag:"ambient",
        r:rparam,
        g:gparam,
        b:bparam,
        a:aparam,
        getVec4:function(){
            return vec4(this.r, this.g, this.b, this.a);
        },
        getVec3:function(){
            return vec3(this.r, this.g, this.b);
        }
    };

    return output_component;
}

/** diffuseComponent(r, g, b, a) 
 * creates and returns a diffuse component object
*/
function diffuseComponent(rparam, gparam, bparam, aparam){
    var output_component = {
        tag:"diffuse",
        r:rparam,
        g:gparam,
        b:bparam,
        a:aparam,
        getVec4:function(){
            return vec4(this.r, this.g, this.b, this.a);
        },
        getVec3:function(){
            return vec3(this.r, this.g, this.b);
        }
    };

    return output_component;
}

/** specularComponent(r, g, b, a, shininess) 
 * creates and returns a specular component object
*/
function specularComponent(rparam, gparam, bparam, aparam, sparam){
    var output_component = {
        tag:"specular",
        r:rparam,
        g:gparam,
        b:bparam,
        a:aparam,
        shininess:sparam,
        getVec4:function(){
            return vec4(this.r, this.g, this.b, this.a);
        },
        getVec3:function(){
            return vec3(this.r, this.g, this.b);
        }
    };

    return output_component;
}

/** verticiesComponent(verticies_array) 
 * creates and returns a verticies component object
*/
function verticiesComponent(v){
    var output_component = {
        tag:"verticies",
        verticies:v,
        getVerticies:function(){
            return this.verticies;
        }
    };

    return output_component;
}

/** projectionComponent(fov, aspect, near, far) 
 * creates and returns a perspective projection component
*/
function projectionComponent(fo, a, n, fa){
    var output_component = {
        tag:"projection",
        fov:fo,
        aspect:a,
        near:n,
        far:fa,
        radius:5,
        getProjectionMatrix:function(){
            return perspective(this.fov, this.aspect, this.near, this.far);
        }
    };

    return output_component;
}

/** normalsComponent(normals_array)
 * creates and returns a normals component object
 */
function normalsComponent(n){
    var output_component = {
        tag:"normals",
        normals:n
    };

    return output_component;
}

/** textureComponent(source_string, texture_coordinates_array) 
 * creates and returns a texture component object
 * must call the loadTexture function after the image loads to be able to use the texture
*/
function textureComponent(s, t){
    var output_component = {
        tag:"texture",
        source:s,
        image:null,
        loaded:false,
        texture:null,
        texture_coordinates:t,
        loadTexture:function(){
            this.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            var uTexMap_location = gl.getUniformLocation(program, "uTexMap");
            gl.uniform1i(uTexMap_location, 0);
        }
    };

    output_component.image = new Image();
    output_component.image.src = s;

    return output_component;
}

function childrenComponent(){
    var output_component = {
        tag:"children",
        children:[],
        addChild:function(c){
            this.children.push(c);
        }
    };

    return output_component;
}

/** velocityComponent(x, y, z, w) 
 * creates and returns a velocity component object
*/
function velocityComponent(xparam, yparam, zparam, wparam){
    var output_component = {
        tag:"velocity",
        x:xparam,
        y:yparam,
        z:zparam,
        w:wparam,
        getVec4:function(){
            return vec4(this.x, this.y, this.z, this.w);
        },
        getVec3:function(){
            return vec3(this.x, this.y, this.z);
        }
    };

    return output_component;
}
