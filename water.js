const G = 9.81; 

class Water {
    constructor(resolution) {
        this.pos = new Matrix(resolution)
        this.vel = new Matrix(resolution)
        this.rez = resolution; 

        this.last_update = Date.now()/1000; 
    }

    update() {
        var ts = Date.now()/1000; 
        var delta = ts - this.last_update
        this.calc_vel(delta)

        this.pos.add_in_place(vel.div(delta))
        this.last_update = ts; 
    }

    calc_vel(delta) {
        // Add gravity
        var f_g = G / delta; 
        this.vel.add_if_gtz(this.pos, -f_g)

        // Calculate force of neighbor surface tension
        
    }
}