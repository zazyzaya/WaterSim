const C_SQUARED = 0.5; 
const NU = 2 // Friction
const SLOWNESS = 200
const EPSILON = 0.0001;
const MAX_HEIGHT = 100
const DROP_SIZE = 0.01;
const DROP_DEPTH = 1; 

class Water {
    constructor(resolution) {
        resolution = resolution+1;
        this.cur = (new Matrix(resolution)).m; 
        this.prev = (new Matrix(resolution)).m; 
        this.rez = resolution; 
        this.delta_s = 2 / resolution; 
        this.delta_squared = this.delta_s * this.delta_s

        // How far apart the points are in the water space (distinct from GL space)
        this.incriment = 1/(this.rez-1);
        this.last_update = Date.now()/SLOWNESS; 
    }

    update() {
        //var ts = Date.now()/SLOWNESS; 
        var delta_t = 1/SLOWNESS
        
        var update_m = new Matrix(this.rez).m;
        for (var x=0; x<this.rez; x++) {
            for (var y=0; y<this.rez; y++) {
                update_m[x][y] = this.u_of_txy(delta_t, x,y);
            }
        }

        this.prev = this.cur; 
        this.cur = update_m;

        return this.to_vector_order()
    }

    u_of_txy(delta_t, x, y) {
        // Discrete wave equation copied from 
        // https://medium.com/@matiasortizdiez/beginners-introduction-to-natural-simulation-in-python-ii-simulating-a-water-ripple-809356ffcb43
        var x_l, x_r, y_l, y_r; 

        // Get neighbors' heights
        if (x == 0) {x_l = 0;} else {x_l = this.cur[x-1][y];}
        if (x == this.rez-1) {x_r = 0;} else {x_r = this.cur[x+1][y];}
        if (y == 0) {y_l = 0;} else {y_l = this.cur[x][y-1];}
        if (y == this.rez-1) {y_r = 0;} else {y_r = this.cur[x][y+1];}

        var x_term = (x_r - 2*this.cur[x][y] + x_l) / this.delta_squared; 
        var y_term = (y_r - 2*this.cur[x][y] + y_l) / this.delta_squared; 
        var du2_term = -this.prev[x][y] + 2*this.cur[x][y]
        var friction_term = NU * (this.cur[x][y] - this.prev[x][y]) / delta_t

        var ret = delta_t*delta_t * C_SQUARED * (x_term + y_term - friction_term) + du2_term;
        
        // Hopefully fixes tiny ripples freaking out antialiasing
        if (Math.abs(ret) < EPSILON) {
            return 0;
        }
        if (ret > 0) {return Math.min(MAX_HEIGHT, ret);}
        return Math.max(-MAX_HEIGHT, ret);
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    to_vector_order() {
        // Convert to 1d array and sigmoid values 
        var out = [];
        for (var row=0; row<this.rez; row++) {
            out = out.concat(this.cur[row])
        }

        return out.map((e) => this.sigmoid(e));
    }

    magnitude(x,y) {
        return Math.sqrt(
             Math.pow(x,2) + Math.pow(y,2)
        )
    }

    disturb(cx, cy) {
        /*
        for (var y=0; y<this.rez; y++){
            for (var x=0; x<this.rez; x++) {
                this.prev[y][x] = this.cur[y][x]; 
            }
        } */
        
        console.log("in 'disturb'")

        // First find all points in water plane that are affected by
        // object pushing on water. Everything in circle centered at 
        // <cx, cy> 
        var affected = []
        for (var y=0; y<this.rez; y++){
            for (var x=0; x<this.rez; x++) {
                vx = x*this.incriment; vy=y*this.incriment; 
                
                // Inside of sphere pushing the water
                if (this.magnitude((vx-cx), (vy-cy)) <= DROP_SIZE) {
                    affected.push([x,y])
                }
            }
        }

        // For all affected points, solve for z component of vector 
        // given sphere's radius C and location <cx, cy>
        affected.forEach( (xy) => {
            var x = xy[0]; var y = xy[1]; 
            vx = x*this.incriment; vy = y*this.incriment; 

            this.cur[y][x] = -DROP_DEPTH;
            
            /*
            DROP_DEPTH * Math.abs(
                Math.pow((vx - cx), 2) + Math.pow((vy - cy), 2) - Math.pow(DROP_SIZE, 2)
            ); */
            //this.prev[y][x] = this.cur[y][x]; 
        }); 

    }
}

function get_relative_coords(e) {
    // e = Mouse click event.
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    var canvas_h = rect.bottom-rect.top;
    var canvas_w = rect.right - rect.left; 

    var percent_y = y / canvas_h;
    var percent_x = x / canvas_w; 

    return [percent_x, percent_y]
}