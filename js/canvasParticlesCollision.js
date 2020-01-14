//Initial Setup
var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

var mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};
var actionRange = 260;
var initialSpeed = 18;
var quantity = 40;
var gravity = 0.05;
var friction = 0.99;
var particleRadius = 15;

var colourScheme = 1;

var colourArray = [
  ['#FCBB6D',
    '#D8737F',
    '#AB6C82',
    '#685D79',
    '#475C7A'
  ],
  ['#F8B195',
    '#F67280',
    '#C06C84',
    '#6C5B7B',
    '#355C7D'
  ],
  ['#E5FCC2',
    '#9DE0AD',
    '#45ADA8',
    '#547980',
    '#594F4F '
  ],
  ['#805C22',
    '#FFD591',
    '#FFB845',
    '#806A49',
    '#CC9337'
  ],
  ['#425780',
    '#D1E0FF',
    '#85ADFF',
    '#697080',
    '#6A8BCC'
  ]
];

// var colors = [
//   '#F8B195',
//   '#F67280',
//   '#C06C84',
//   '#6C5B7B',
//   '#355C7D'
// ];
window.addEventListener('click', function(event) {
  actionRange += 10;
  setTimeout(function() {
    actionRange -= 10;
  }, 3000);
});

window.addEventListener('mousemove', function(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

// Each spacebar tap will generate more circles (by a number declared in quantity variable)
window.addEventListener('keypress', function(event) {
  console.log('Spacebar pressed');
  if (event.code === 'Space') {
    init(quantity);
    // animate();

  }
});

//useful functions
function randomColor(colourArray, colourScheme) {
  return colourArray[colourScheme][Math.floor(Math.random() * colourArray.length)];
};


function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function distance(x1, y1, x2, y2) {
  let xDist = x2 - x1;
  let yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}
/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

    // Grab angle between the two colliding particles
    const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
      y: u2.y
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x * friction;
    particle.velocity.y = vFinal1.y * friction;

    otherParticle.velocity.x = vFinal2.x * friction;
    otherParticle.velocity.y = vFinal2.y * friction;
  }
}


//Objects
function Particle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() - 0.5) * initialSpeed,
    y: (Math.random() - 0.5) * initialSpeed
  };
  this.radius = radius;
  this.color = color;
  this.mass = 1;
  this.opacity = 0;

  this.update = particles => {
    this.draw();

    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      if (distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0) {
        resolveCollision(this, particles[i]);
        // console.log('Collision Detected');
      }

    }

    if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
      this.velocity.x = -this.velocity.x * friction;
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
      this.velocity.y = -this.velocity.y * friction;

    }
    //mouse proximity detection
    if (distance(mouse.x, mouse.y, this.x, this.y) < actionRange && this.opacity < 0.4) {
      this.opacity += 0.02;
    } else if (this.opacity > 0) {
      this.opacity -= 0.02;

      this.opacity = Math.max(0, this.opacity);
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    //gravity
    this.velocity.y += gravity;
  };

  this.draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.save(); //saves the current state of canvas element
    c.globalAlpha = this.opacity; // sets opacity of the entire canvas element
    c.fillStyle = this.color;
    c.fill();
    c.restore(); //restores saved state of canvas element, so
    c.strokeStyle = this.color;
    c.stroke();
    c.closePath();
  };
}

//implementation
let particles = [];

function init(quantity) {
  var particleNumber = quantity;

  if (particles.length > 350) {
    particles = [];
  }

  for (var i = 0; i < particleNumber; i++) {
    const radius = particleRadius;
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);

    const color = randomColor(colourArray, colourScheme);

    if (i !== 0) {
      for (var j = 0; j < particles.length; j++) {
        if (distance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
          x = randomIntFromRange(radius, canvas.width - radius);
          y = randomIntFromRange(radius, canvas.height - radius);

          j = -1;
        }
      }
    }

    particles.push(new Particle(x, y, radius, color));
  }

  //console.log(particles);
}

//animation
function animate() {
  requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update(particles);
  });

}

init(quantity);
animate();