// I2C
I2C1.setup({scl:SCL,sda:SDA});

function hello() {
 lcd.setFontVector(20);
 // write some text
 lcd.drawString("YuPlayer",10,20);
 // write to the screen
 lcd.flip();
}

var lcd = require("SSD1306").connect(I2C1, hello);

function display(title, num) {
 lcd.clear();
 lcd.setFontVector(12);
 // write some text
 lcd.drawString(title, 0, 50);
 lcd.setFontVector(20);
 // write some text
 lcd.drawString(num, 50, 15);
 // write to the screen
 lcd.flip();
}

SPI2.setup({mosi:B15, miso:B14, sck:B13});
E.connectSDCard(SPI2, P8);

var fs = require('fs');
var musicFiles = fs.readdirSync().filter(function (fname) {
  return fname.endsWith(".raw");
});
print(musicFiles);
var musicFileIdx = 0;

var blueLed = require('@amperka/led') 
  .connect(A0);

pinMode(A4, "af_output" );
pinMode(A5, "af_output" );

var w = new Waveform(2048, {doubleBuffer:true});
var playing = false;

function startMusic(fileIdx) {
  var fileName = musicFiles[fileIdx];
  var f = E.openFile(fileName, "r");
  // load first bits of sound file
  w.buffer.set(f.read(w.buffer.length));
  w.buffer2.set(f.read(w.buffer.length));
  var fileBuf = f.read(w.buffer.length);
  // when one buffer finishes playing, load the next one
  w.on("buffer", function(buf) {
    buf.set(fileBuf);
    fileBuf = f.read(buf.length);
    if (fileBuf===undefined) {  // end of file
      stopMusic();
    }
  });
  // start output
  analogWrite(A5, 0.5);
  w.startOutput(A5,22050,{repeat:true});
  blueLed.blink(1, 1);
  playing = true;
  display(fileName, fileIdx);
  setTimeout(function () {
    lcd.off();
  }, 3000);
}

function stopMusic() {
  w.removeAllListeners('buffer');
  w.stop();
  playing = false;
  blueLed.turnOff();
  lcd.on();
}

function prevTrack() {
  musicFileIdx = (musicFileIdx-1+musicFiles.length) % musicFiles.length;
  if (playing) {
    stopMusic();
    startMusic(musicFileIdx);
  }
  else {
    display(musicFiles[musicFileIdx], musicFileIdx);
  }
}

function nextTrack() {
  musicFileIdx = (musicFileIdx+1) % musicFiles.length;
  if (playing) {
    stopMusic();
    startMusic(musicFileIdx);
  }
  else {
    display(musicFiles[musicFileIdx], musicFileIdx);
  }
}


var blueButton = require('@amperka/button') 
  .connect(P13, {
    debounce: 100
  });

blueButton.on('press', function() {
  if (!playing) {
    startMusic(musicFileIdx);
  }
  else {
    stopMusic();
  }
});

var prevButton = require('@amperka/button') 
  .connect(P6);

var nextButton = require('@amperka/button') 
  .connect(P4);

prevButton.on('press', function() {
  prevTrack();
});

nextButton.on('press', function() {
  nextTrack();
});

var ir = require('@amperka/ir-receiver')
  .connect(P12);

ir.on('receive', function(code, repeat) {
  if (repeat) {
    return; 
  }
  else if (code == 378091719) { // play
    if (!playing) {
      startMusic(musicFileIdx);
    }
    else {
      stopMusic();
    }
  }
  else if (code == 378081519) { // prev
    prevTrack();
  } else if (code == 378116199) { // next
    nextTrack();
  }
  else { // any other
    console.log(code);
  }
});

setTimeout(function () {
  display(musicFiles[musicFileIdx], musicFileIdx);
}, 2000);
