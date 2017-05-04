/**
 * Created by benoit on 19/04/17.
 */

/* Angular */
var app = angular.module('canvasApp', []);


var drawing = new Drawing();
drawing.init({fn: "sin(7x)/7x"});
drawing.draw();

app.controller('canvasController', [
    '$scope',
    function($scope){
        $scope.showSettings = false;
        $scope.fn = drawing.fn;
        $scope.lineWidth = 1;
        $scope.update =  function() {
            // first check if function is valid. if yes updateUI
            $scope.fnInvalid = fnIsInvalid($scope.fn);
            if (!$scope.fnInvalid) {
                $scope.updateUI();
            }
        };
        $scope.updateUI = function() {
            drawing.init({
                fn: $scope.fn,
                minx: $scope.minx,
                maxx: $scope.maxx,
                miny: $scope.miny,
                maxy: $scope.maxy,
                lineWidth: $scope.lineWidth
            });
            drawing.draw();
        };
        window.addEventListener('resize', function(event){
            $scope.updateUI()
        });
        $scope.toggleSettings = function() {
            $scope.showSettings = $scope.showSettings? false : true;

        }
        $scope.setFn = function(expr) {
            console.log('setFn');
            $scope.fn = expr;
        }
    }
]);




/* Canvas part */
function Drawing()  {
    this.init = function(spec) {
        this.fn = spec.fn || "x*x";

        this.zone_dessin = document.getElementById("schema");
        this.zone_dessin.height=this.zone_dessin.parentNode.offsetHeight;
        this.zone_dessin.width=this.zone_dessin.parentNode.offsetWidth;
        this.minx = spec.minx || -8;
        this.maxx = spec.maxx || 8;
        this.pas = 1.01*(this.maxx-this.minx)/this.zone_dessin.width; // 1 peu moins d'un point per pixel
        this.miny = spec.miny || -2;
        this.maxy = spec.maxy || 2;
        this.echelleX = this.zone_dessin.width / (this.maxx - this.minx);
        this.echelleY = this.zone_dessin.height / (this.maxy - this.miny);

        this.graphe= this.zone_dessin.getContext("2d");
        this.x =this.minx;
        this.y = 0;

        this.strokeStyle = "#d82140";
        this.lineWidth= spec.lineWidth;

        this.cmp =  math.compile(this.fn);

        this.f = function(x) {
            var y = 0;
            try {
                y = this.cmp.eval({x:x})
            }
            catch(e) {
                console.log('math eval error: '+ e.message);
                y = NaN;
            }
            return y;
        }

    }

    this.draw = function() {
        this.drawAxis();

        this.graphe.strokeStyle = this.strokeStyle;
        this.graphe.lineWidth= this.lineWidth;

        //console.log(x);
        this.graphe.beginPath();
        var move = true; // if move make a move else draw a line
        while(this.x<this.maxx) {
            //console.log((x + " " + f(x)))
            this.y = this.f(this.x);
            if (this.y > this.maxy+1 || this.y < this.miny-1) { // on lève le crayon
                move = true;
                this.graphe.stroke();
            }
            else if (move) {
                this.graphe.moveTo((this.x-this.minx)*this.echelleX,this.maxy*this.echelleY-this.f(this.x)*this.echelleY);
                move = false;
            } else {
                this.graphe.lineTo((this.x-this.minx)*this.echelleX,this.maxy*this.echelleY-this.f(this.x)*this.echelleY);
            }
            this.x=(this.x+this.pas);
        }

        this.graphe.stroke();
    };
    this.drawAxis = function() {
        this.graphe.beginPath();
        this.graphe.lineWidth="1";
        this.graphe.strokeStyle="grey";
// Axe des X
        this.graphe.moveTo(0,this.zone_dessin.height/2);
        this.graphe.lineTo(this.zone_dessin.width,this.zone_dessin.height/2);
        this.graphe.lineTo(this.zone_dessin.width-5,(this.zone_dessin.height/2)-5);
        this.graphe.moveTo(this.zone_dessin.width,this.zone_dessin.height/2);
        this.graphe.lineTo(this.zone_dessin.width-5,(this.zone_dessin.height/2)+5);

// Axe Y
        this.graphe.moveTo(-this.minx*this.echelleX,this.zone_dessin.height); // origine
        this.graphe.lineTo(-this.minx*this.echelleX,0);
        this.graphe.lineTo((-this.minx*this.echelleX)+5,5);
        this.graphe.moveTo(-this.minx*this.echelleX,0);
        this.graphe.lineTo(-this.minx*this.echelleX-5,5);
        this.graphe.stroke();
        this.graphe.fillText(this.minx,0,-5+this.zone_dessin.height/2);
        this.graphe.fillText(this.maxx,this.zone_dessin.width-20,-5+this.zone_dessin.height/2);
        this.graphe.fillText(this.miny,5-this.minx*this.echelleX,-8+this.zone_dessin.height);
        this.graphe.fillText(this.maxy,5-this.minx*this.echelleX,8);
        if (this.minx < 0 && this.maxx > 0) {
            this.graphe.fillText("0", -this.minx*this.echelleX+5, this.maxy*this.echelleY-5 );
        }
    };
}
/**
 * Check the expression of the function, not secure =>
 * must be replaced by Math.js or Javascript evaluation
 * Uses Math.js
 * @param expr
 * @returns {*}
 */
var fnIsInvalid = function(expr) {
    var scope = {x:0};
    var fnInvalid = false;
    try {
        var y = math.eval(expr,scope);
    }
    catch(e){
        console.log(e.message);
        fnInvalid = e.message; // is invalid
    }
    return fnInvalid;
}


