const ACTION = {
  STOP: 0,
  FORWARD: 1,
  BACKWARD: 2,
  WALTZ: 3
};

const SAFE_DISTANCE_MIN = 10;
const SAFE_DISTANCE_MAX = 14;

const SPEED_MIN = 0.3;
const SPEED_MAX = 0.6;

var SPEED = 0.4;

var motor = require('@amperka/motor');
var leftMotor = motor.connect(motor.MotorShield.M1);
var rightMotor = motor.connect(motor.MotorShield.M2);

var encoder = require('@amperka/digital-line-sensor');
var leftEncoder = encoder.connect(P9);
var rightEncoder = encoder.connect(P10);

var receiver = require('@amperka/ir-receiver').connect(P0);

var ultrasonic = require('@amperka/ultrasonic').connect({
  trigPin: P12,
  echoPin: P13
});

var neck = require('@amperka/servo').connect(P8);
neck.write(70);

var led = require('@amperka/led');
var redLed = led.connect(P1);
var blueLed = led.connect(P2);

var buzzer = require('@amperka/buzzer').connect(P3);

var curAction = ACTION.STOP;

function cruiseControl(curMotor, speed) {
  var WHEEL_LENGTH = 195;
  var CRUISESPEED = Math.abs(speed);
  var DELTAV = 0.01;

  var counter = 0;
  var lastTime = getTime();
  var V = speed;
  curMotor.write(V);

  return function () {
    counter++;
    if (counter % 12 !== 0) return;
    var deltaTime = getTime() - lastTime;
    var speed = WHEEL_LENGTH / deltaTime / 1000;
    lastTime = getTime();
    if (speed < CRUISESPEED && Math.abs(V) < 1) {
      V = V + DELTAV;
    } else if (speed > CRUISESPEED && Math.abs(V) > 0){
      V = V - DELTAV;
    }
    curMotor.write(V);
  };
}

function stopMotors() {
  leftEncoder.removeAllListeners('white');
  rightEncoder.removeAllListeners('white');
}

function startMotors(left, right) {
  if (left != 0) {
    leftEncoder.on('white', cruiseControl(leftMotor, left));
  }
  else {
    leftMotor.write(0);
  }

  if (right != 0) {
    rightEncoder.on('white', cruiseControl(rightMotor, right));
  }
  else {
    rightMotor.write(0);
  }
}

function performAction(action) {
  stopMotors();

  if (action == ACTION.STOP) {
    startMotors(0, 0);
  }
  else if (action == ACTION.FORWARD) {
    startMotors(SPEED, -SPEED);
  }
  else if (action == ACTION.BACKWARD) {
    startMotors(-SPEED, SPEED);
  }
  else if (action == ACTION.WALTZ) {
    startMotors(-SPEED, -SPEED);
  }
}

function turnLeft() {
  if (curAction == ACTION.WALTZ) return;

  stopMotors();

  if (curAction == ACTION.STOP) {
    startMotors(-SPEED, -SPEED);
  }
  else if (curAction == ACTION.FORWARD) {
    startMotors(0, -SPEED);
  }
  else {
    startMotors(0, SPEED);
  }

  setTimeout(function() {
    performAction(curAction);
  }, 100);
}

function turnRight() {
  if (curAction == ACTION.WALTZ) return;

  stopMotors();

  if (curAction == ACTION.STOP) {
    startMotors(SPEED, SPEED);
  } else if (curAction == ACTION.FORWARD) {
    startMotors(SPEED, 0);
  }
  else {
    startMotors(-SPEED, 0);
  }

  setTimeout(function() {
    performAction(curAction);
  }, 100);
}

receiver.on('receive', function(code, repeat) {
  switch(code) {
    case receiver.keys.TOP:
      curAction = ACTION.FORWARD;
      performAction(curAction);
      break;
    case receiver.keys.BOTTOM:
      curAction = ACTION.BACKWARD;
      performAction(curAction);
      break;
    case receiver.keys.LEFT:
      turnLeft();
      break;
    case receiver.keys.RIGHT:
      turnRight();
      break;
    case receiver.keys.PLAY:
      if (!repeat) {
        curAction = (curAction == ACTION.STOP) ? ACTION.WALTZ : ACTION.STOP;
      }
      performAction(curAction);
      break;
    case receiver.keys.PLUS:
      SPEED = Math.min(SPEED + 0.05, SPEED_MAX);
      performAction(curAction);
      break;
    case receiver.keys.MINUS:
      SPEED = Math.max(SPEED - 0.05, SPEED_MIN);
      performAction(curAction);
      break;
    case receiver.keys.RED:
      if (!repeat) redLed.toggle();
      break;
    case receiver.keys.BLUE:
      if (!repeat) blueLed.toggle();
      break;
    default:
      buzzer.frequency(5*(code % 1000));
      buzzer.beep(0.3);
      break;
  }
});

function checkObstacleAhead(distance) {
  if (curAction != ACTION.FORWARD) return;

  if (distance > SAFE_DISTANCE_MAX) {
    performAction(curAction);
  } else if (distance < SAFE_DISTANCE_MIN) {
    performAction(ACTION.BACKWARD);
  } else {
    performAction(ACTION.STOP);
  }
}

setInterval(function() {
  ultrasonic.ping(function(error, value) {
    if (!error) {
      checkObstacleAhead(value);
    }
  }, 'cm');
}, 100);
