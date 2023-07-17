const C_SQUARED = 1; 
const NU = 5 // Friction
const SLOWNESS = 1e6
const EPSILON = 0.05;

class Water {
    constructor(resolution) {
        resolution = resolution+1;
        this.cur = (new Matrix(resolution)).m; 
        this.prev = (new Matrix(resolution)).m; 
        this.rez = resolution; 
        this.delta_s = 2 / resolution; 
        this.delta_squared = this.delta_s * this.delta_s

        this.last_update = Date.now()/SLOWNESS; 
    }

    update() {
        var ts = Date.now()/SLOWNESS; 
        var delta_t = ts - this.last_update
        
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
        return ret; 
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
}