// I am aware of the existence of Math.js but again, serverless is the goal
// Chrome keeps complaining about CORS and xside scripting so I must 
// build my own library from scratch

class Matrix {
    // For simplicity, only considering square matrices
    constructor (size, fill=0) {
        this.m = Array(size).fill(Array(size).fill(fill))
        this.size = size 
    }

    // I know you can overload [] but it seems really difficult
    get(x,y) {
        return this.m[x][y]
    }
    set(x,y,v) {
        this.m[x][y] = v
    }

    add(other) {
        var out = new Matrix(this.size); 

        if (typeof(other) == 'object') {
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    var v = this.get(i,j) + other.get(i,j);
                    out.set(i,j, v);
                }
            }
        }
        else if (typeof(other) == 'number') {
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    var v = this.get(i,j) + other; 
                    out.set(i,j, v);
                }
            }
        } 
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }
        return out 
    }

    add_in_place(other) {
        if (typeof(other) == 'object') {
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    this.m[i][j] += other.get(i,j);
                }
            }
        }
        else if (typeof(other) == 'number') {
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    this.m[i][j] += other
                }
            }
        } 
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }
    }

    mult(other) {
        if (typeof(other) == 'number') {
            var out = new Matrix(this.size); 
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    var v = this.get(i,j) * other; 
                    out.set(i,j, v);
                }
            }
        }
        else if (typeof(other) == 'object') {
            var out = mat_mul(other);
        }
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }

        return out 
    }

    mult_in_place(other) {
        if (typeof(other) == 'number') {
            for (var i=0; i<this.size; i++) {
                for (var j=0; j<this.size; j++) {
                    this.m[i][j] *= other; 
                }
            }
        }
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }
    }

    div(other) {
        if (typeof(other) == 'number') {
            return this.mult(1/other)
        }
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }
    }

    div_in_place(other) {
        if (typeof(other) == 'number') {
            return this.mult_in_place(1/other)
        }
        else {
            throw new Error(`Object type ${typeof(other)} not understood`); 
        }
    }

    mat_mul(other) {
        throw new Error('Mat mul not implimented (yet)')
    }

    add_if_gtz(other, val) {
        // Adds val to self if other[i][j] < 0 
        if (typeof(other) == 'number') {
            for (var i=0; i<self.size; i++) {
                for (var j=0; j<self.size; j++) {
                    if (other[i][j] > 0) {
                        this.m[i][j] += val; 
                    }
                }
            }
        }
        else if (typeof(other)=='object') {
            for (var i=0; i<self.size; i++) {
                for (var j=0; j<self.size; j++) {
                    if (other[i][j] > 0) {
                        this.m[i][j] += val[i][j]; 
                    }
                }
            }
        }
    }

    add_if_ltz(other, val) {
        // Adds val to self if other[i][j] < 0 
        if (typeof(other) == 'number') {
            for (var i=0; i<self.size; i++) {
                for (var j=0; j<self.size; j++) {
                    if (other[i][j] < 0) {
                        this.m[i][j] += val; 
                    }
                }
            }
        }
        else if (typeof(other)=='object') {
            for (var i=0; i<self.size; i++) {
                for (var j=0; j<self.size; j++) {
                    if (other[i][j] < 0) {
                        this.m[i][j] += val[i][j]; 
                    }
                }
            }
        }
    }
}