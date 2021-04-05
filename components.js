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
 * creates and returns a specular component object
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
        getProjectionMatrix:function(){
            return perspective(this.fov, this.aspect, this.near, this.far);
        }
    };

    return output_component;
}