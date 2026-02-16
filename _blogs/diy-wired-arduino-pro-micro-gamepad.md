---
layout: blog_post
title: "DIY Wired Arduino Pro Micro Gamepad"
date: 2020-09-10
description: "This project utilizes the Pro Micro's capability to appear as a HID compatible device to the system."
thumbnail: "/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg"
tags: ['DIY', 'Arduino', 'Gamepad']
---

<p class="wp-block-paragraph">This project utilizes the Pro Micro&#8217;s capability to appear as a HID compatible device to the system. This by no means is an expert project thanks to the awesome work already done by some incredible people. The <a href="https://github.com/MHeironimus/ArduinoJoystickLibrary">ArduinoJoystick</a> library made this project a breeze at the coding end of things. This is not a beginner&#8217;s project either as it involves some tricky soldering with the thumbslide joysticks and it uses all of the digital and analog pins that the pro micro has to offer.</p>



<h2 class="wp-block-heading">Contents</h2>



<ul class="wp-block-list"><li><a href="#hid">What is a HID compatible device?</a></li><li><a href="#requirements">What do you need?</a></li><li><a href="#soldering">Soldering components and making connections</a></li><li><a href="#setup-arduino-joystick">Setting up the Arduino Joystick Library</a></li><li><a href="#code-away">Code Away!</a><ul><li><a href="#config1">CONFIG 1: L+R, POV hat(4 buttons), A, B, X, Y, Left Analog Stick(X and Y axes), Right Analog Stick(Rx and Ry axes)</a></li><li><a href="#config2">CONFIG 2: L+R, UP/DOWN/LEFT/RIGHT -&gt; POV Hat, A,B,X,Y, Select, Start, No analog sticks</a></li><li><a href="#config3">CONFIG 3: L+R, UP/DOWN/LEFT/RIGHT-&gt;XY axes, A, B, X, Y, Select, Start, No analog sticks</a></li></ul></li><li><a href="#gallery">Gallery</a></li><li><a href="#whats-next">What&#8217;s Next?</a></li><li><a href="#appendix">Appendix</a><ul><li><a href="#bricked">Bricked my Pro Micro :(, Unable to upload sketch, Pro Micro not showing on COM port</a></li><li><a href="#joystick-basics">Arduino Joystick Library Basics</a></li><li><a href="#retropie">Setup with Retropie</a></li></ul></li></ul>



<h2 class="wp-block-heading" id="hid">What is a HID compatible device?</h2>



<p class="wp-block-paragraph">An HID device or Human Interface Device, in lay man&#8217;s terms is a peripheral device(eg. Keyboard, Mouse, Joystick, Gamepad) which can take inputs from the user. HID devices follow the USB standard, which means you don&#8217;t have to explicitly write a driver for the device on your system. HID devices will always work as plug-and play devices on most computers and mobile phones.</p>



<p class="wp-block-paragraph">Thanks to the ArduinoJoystick Library we don&#8217;t have to worry about following the USB convention for marking the device as Gamepad, defining the number of buttons, axes, hat switches, defining collections and what not! We can directly get to the good stuff.</p>



<h2 class="wp-block-heading" id="requirements">What do you need?</h2>



<p class="wp-block-paragraph">Everything that you need for this project is readily available in the market, so I will not link any stores. If this is your first intermediate difficulty project I would recommend you buy twice as many parts as you might mess up some of your parts or you might want to recreate a better version of your device later. Also, clones of original products are cheaper but are not very good quality either. However, bricking one such clone won&#8217;t be as bad as bricking an original for sure.</p>



<ul class="wp-block-list"><li>6mm Tactile switches (with good caps if available) &#8211; 10pcs.</li><li>6mm Right Angled Tactile Switches &#8211; 2 pcs.</li><li>PSP1000 compatible analog sticks &#8211; 2 pcs.</li><li>A Pro Micro (ATMEGA32U4) board (Note: ATMEGA328P boards do not have HID capability)</li><li>A Prototype board (Or you can get a PCB printed like I did, <a href="https://github.com/devarshi16/ProMicroGamepad/raw/master/gamepad_pcb_gerber.zip">download my gerber files here</a>).</li><li>Additionally, you might require solder, desoldering copper, pointed soldering tip, tape, wires, hot glue gun.</li></ul>



<h2 class="wp-block-heading" id="soldering">Soldering components and making connections</h2>



<p class="wp-block-paragraph">For the ease of mapping buttons to their respective pins I am attaching the picture of the PCB board.</p>



<figure class="wp-block-image size-large"><img data-attachment-id="307" data-permalink="https://attackonalgorithms.wordpress.com/old_pcb-1/" data-orig-file="/assets/images/blogs/wordpress/2020/09/old_pcb-1.png" data-orig-size="870,605" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="old_pcb-1" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/old_pcb-1.png" data-large-file="/assets/images/blogs/wordpress/2020/09/old_pcb-1.png" loading="lazy" width="870" height="605" src="/assets/images/blogs/wordpress/2020/09/old_pcb-1.png" alt="" class="wp-image-307" srcset="/assets/images/blogs/wordpress/2020/09/old_pcb-1.png 870w, /assets/images/blogs/wordpress/2020/09/old_pcb-1.png 150w, /assets/images/blogs/wordpress/2020/09/old_pcb-1.png 300w, /assets/images/blogs/wordpress/2020/09/old_pcb-1.png 768w" sizes="(max-width: 870px) 100vw, 870px" /></figure>



<figure class="wp-block-image size-large"><img data-attachment-id="308" data-permalink="https://attackonalgorithms.wordpress.com/old_gamepad/" data-orig-file="/assets/images/blogs/wordpress/2020/09/old_gamepad.png" data-orig-size="877,601" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="old_gamepad" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/old_gamepad.png" data-large-file="/assets/images/blogs/wordpress/2020/09/old_gamepad.png" loading="lazy" width="877" height="601" src="/assets/images/blogs/wordpress/2020/09/old_gamepad.png" alt="" class="wp-image-308" srcset="/assets/images/blogs/wordpress/2020/09/old_gamepad.png 877w, /assets/images/blogs/wordpress/2020/09/old_gamepad.png 150w, /assets/images/blogs/wordpress/2020/09/old_gamepad.png 300w, /assets/images/blogs/wordpress/2020/09/old_gamepad.png 768w" sizes="(max-width: 877px) 100vw, 877px" /><figcaption><em>PCB layout/Component Connections</em></figcaption></figure>



<p class="wp-block-paragraph">Note that one end of each tactile pin is connected to a digital pin on the board and the other end is connected to Ground. For the analog thumbslide joysticks there are 4 pins, one for ground one for VCC, and the other two for each of the potentiometers inside the joystick, reporting two axes per joystick. </p>



<p class="wp-block-paragraph">For the right angled tactile switches make sure you use the smaller pins for the connections and not the bigger ones.</p>



<p class="wp-block-paragraph">It would be wise to not directly solder the Pro Micro to your prototype board. Try attaching female headers on the PCB and male headers on the pro-micro first. For soldering the thumb-slide joysticks apply some solder on each of it&#8217;s plates and the plates on the PCB first (make sure you use a pointed soldering tip for this). Then carefully place down the analog joystick such that none of the plates touch the adjacent plate. Apply tape or glue from glue gun to keep the analog stick in place. If you have screws of appropriate size then you may even screw the component to the board or alternatively pull wires from the holes to keep it in place. Flip over the board and for each of the plates find the corresponding holes and gently put some solder through it. Make sure you don&#8217;t put a lot of solder as it might spill on the other side of the board making a connection with the adjacent plate. Remove the wires and the glue once the soldering is done.</p>



<figure class="wp-block-image size-large"><img data-attachment-id="334" data-permalink="https://attackonalgorithms.wordpress.com/analog-joystick-solder/" data-orig-file="/assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg" data-orig-size="4148,1235" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;5.6&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599744234&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;55&quot;,&quot;iso&quot;:&quot;640&quot;,&quot;shutter_speed&quot;:&quot;0.066666666666667&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="analog-joystick-solder" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg" loading="lazy" width="1024" height="304" src="/assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg" alt="" class="wp-image-334" srcset="/assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 1024w, /assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 2048w, /assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 150w, /assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 300w, /assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 768w, /assets/images/blogs/wordpress/2020/09/analog-joystick-solder.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure>



<p class="wp-block-paragraph">If you are having a hard time with soldering the analog sticks to the board, and you are using a prototype board instead of the PCB that I made, then you may consider using the more common type of analog stick, the PS2 analog stick. It has a larger footprint but is much easier to work with and give much lesser noise. You might have to desolder them from the board that they came on first. You will not be able to use the internal switch that these contain though as all the digital pins on the board are already in use (The TX and RX (pins 0 and 1) are for serial communication). Here&#8217;s the required wiring mapping for the PS2 analog stick.</p>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="309" data-permalink="https://attackonalgorithms.wordpress.com/analog-joystick/" data-orig-file="/assets/images/blogs/wordpress/2020/09/analog-joystick.png" data-orig-size="178,277" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="analog-joystick" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/analog-joystick.png" data-large-file="/assets/images/blogs/wordpress/2020/09/analog-joystick.png" loading="lazy" width="178" height="277" src="/assets/images/blogs/wordpress/2020/09/analog-joystick.png" alt="" class="wp-image-309" srcset="/assets/images/blogs/wordpress/2020/09/analog-joystick.png 178w, /assets/images/blogs/wordpress/2020/09/analog-joystick.png 96w" sizes="(max-width: 178px) 100vw, 178px" /><figcaption>PS2 analog stick footprint and connections</figcaption></figure></div>



<p class="wp-block-paragraph">If you think analog sticks are giving you a hard time you may save them for your next project and just make the gamepad with 12 buttons. I will give codes for a few possible variants of the gamepad you may use the one which suits you best.</p>



<p class="wp-block-paragraph">If you are using the PCB that I made you can test the connections using a multimeter. </p>



<p class="wp-block-paragraph">When you are happy with your connections place the pro micro in the header slot and plug it to your system via USB. We are ready to program your gamepad.</p>



<h2 class="wp-block-heading" id="setup-arduino-joystick">Setting up the Arduino Joystick Library</h2>



<p class="wp-block-paragraph">Download the <a href="https://github.com/MHeironimus/ArduinoJoystickLibrary/archive/master.zip">ArduinoJoystick Library Here</a>.</p>



<p class="wp-block-paragraph">Open your Arduino IDE.</p>



<p class="wp-block-paragraph">Goto Sketch &gt; Include Library &gt; Add .ZIP Library…</p>



<p class="wp-block-paragraph">Browse and select the zip folder you downloaded earlier.</p>



<p class="wp-block-paragraph">Your Joystick library is all set!</p>





<h2 class="wp-block-heading" id="code-away">Code Away!</h2>



<h4 class="wp-block-heading" id="config1">CONFIG 1: L+R, POV hat(4 buttons), A, B, X, Y, Left Analog Stick(X and Y axes), Right Analog Stick(Rx and Ry axes)</h4>



<pre class="wp-block-code"><code>#include &lt;Joystick.h&gt;
#define UP_PIN 5
#define DOWN_PIN 6
#define LEFT_PIN 4
#define RIGHT_PIN 7
#define X_KEY_PIN 10
#define Y_KEY_PIN 16
#define A_KEY_PIN 14
#define B_KEY_PIN 15
#define START_PIN 8
#define SELECT_PIN 9
#define L_KEY_PIN 3
#define R_KEY_PIN 2

Joystick_ Joystick(JOYSTICK_DEFAULT_REPORT_ID,JOYSTICK_TYPE_GAMEPAD,
  8, 1,                  // Button Count, Hat Switch Count
  true, true, false,     // X and Y, Z Axis
  true, true, false,   //  Rx, Ry, Rz
  false, false,          //  rudder, throttle
  false, false, false);  // accelerator, brake, steering

void setup() {
  // Initialize Button Pins
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  pinMode(5, INPUT_PULLUP);
  pinMode(6, INPUT_PULLUP);
  pinMode(7, INPUT_PULLUP);
  pinMode(8, INPUT_PULLUP);
  pinMode(9, INPUT_PULLUP);
  pinMode(10, INPUT_PULLUP);
  pinMode(16, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
  pinMode(15, INPUT_PULLUP);
  //Analog pins don't need setup
  
  // Initialize Joystick Library
  Joystick.setXAxisRange(-127,127);
  Joystick.setYAxisRange(-127,127);
  Joystick.setRxAxisRange(-127,127);
  Joystick.setRyAxisRange(-127,127);
  Joystick.begin();
}

//Joy1
int xPosition = 0;
int yPosition = 0;
int mapX = 0;
int mapY = 0;
//Joy2
int xPosition1 = 0;
int yPosition1 = 0;
int mapX1 = 0;
int mapY1 = 0;

void loop() {

  // JOY1
  xPosition = analogRead(A0);
  delay(2);
 //Delay between reading analog inputs
  yPosition = analogRead(A1);
  delay(2);
  xPosition1 = analogRead(A2);
  delay(2);
  yPosition1 = analogRead(A3);
  delay(2);
  
  mapX = map(xPosition, 0, 1023, -127, 127);
  mapY = map(yPosition, 0, 1023, -127, 127);
  mapX1 = map(xPosition1, 0, 1023, -127, 127);
  mapY1 = map(yPosition1, 0, 1023, -127, 127);
  if (mapX&gt;10)
  {Joystick.setXAxis(mapX);}
  else if (mapX&lt;-10)
  {Joystick.setXAxis(mapX);}
  else
  {Joystick.setXAxis(0);}

  if (mapY &gt;10)
  {Joystick.setYAxis(mapY);}
  else if (mapY &lt; -10)
  {Joystick.setYAxis(mapY);}
  else
  {Joystick.setYAxis(0);}
  

  if (mapX1&gt;10)
  {Joystick.setRxAxis(mapX1);}
  else if (mapX&lt;-10)
  {Joystick.setRxAxis(mapX1);}
  else
  {Joystick.setRxAxis(0);}

  if (mapY1 &gt;10)
  {Joystick.setRyAxis(mapY1);}
  else if (mapY &lt; -10)
  {Joystick.setRyAxis(mapY1);}
  else
  {Joystick.setRyAxis(0);}


  //UP
  if (digitalRead(UP_PIN) == LOW)
  {Joystick.setHatSwitch(0,0);}
  //DOWN
  else if (digitalRead(DOWN_PIN) == LOW)
  {Joystick.setHatSwitch(0,180);}
  //LEFT
  else if (digitalRead(LEFT_PIN) == LOW)
  {Joystick.setHatSwitch(0,270);}
  //RIGHT
  else if (digitalRead(RIGHT_PIN) == LOW)
  {Joystick.setHatSwitch(0,90);}
  else
  {Joystick.setHatSwitch(0,-1);}

  // A_KEY
  if (digitalRead(A_KEY_PIN) == HIGH)
  {Joystick.setButton(0, LOW);}
  else
  {Joystick.setButton(0, HIGH);}

  // B_KEY
  if (digitalRead(B_KEY_PIN) == HIGH)
  {Joystick.setButton(1, LOW);}
  else
  {Joystick.setButton(1, HIGH);}

  // X_KEY
  if (digitalRead(X_KEY_PIN) == HIGH)
  {Joystick.setButton(2, LOW);}
  else
  {Joystick.setButton(2, HIGH);}

  // Y_KEY
  if (digitalRead(Y_KEY_PIN) == HIGH)
  {Joystick.setButton(3, LOW);}
  else
  {Joystick.setButton(3, HIGH);}
  
  // L_KEY_PIN
  if (digitalRead(L_KEY_PIN) == HIGH)
  {Joystick.setButton(4, LOW);}
  else
  {Joystick.setButton(4, HIGH);}

  // R_KEY_PIN
  if (digitalRead(R_KEY_PIN) == HIGH)
  {Joystick.setButton(5, LOW);}
  else
  {Joystick.setButton(5, HIGH);}

  // START
  if (digitalRead(START_PIN) == HIGH)
  {Joystick.setButton(7, LOW);}
  else
  {Joystick.setButton(7, HIGH);}

  // SELECT
  if (digitalRead(SELECT_PIN) == HIGH)
  {Joystick.setButton(6, LOW);}
  else
  {Joystick.setButton(6, HIGH);}

  delay(10);
   
}
</code></pre>



<p class="wp-block-paragraph">Select the correct port for your device. Make sure that you select the correct configuration for your board(5V or 3V, 5V pro micro operates at 16MHz and 3V at 8MHz, if you upload a sketch for the incorrect one you might end up bricking your Microcontroller. To recover a bricked controller refer to the appendix) Upload the sketch and automatically windows will show that it&#8217;s setting up a new device. </p>



<p class="wp-block-paragraph">Test out your gamepad in the windows gamepad tester. In your search bar type &#8220;Set up USB game controllers&#8221;.</p>



<figure class="wp-block-image size-large"><img data-attachment-id="317" data-permalink="https://attackonalgorithms.wordpress.com/windows-gamepad-tester/" data-orig-file="/assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png" data-orig-size="793,584" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="windows-gamepad-tester" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png" data-large-file="/assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png" loading="lazy" width="793" height="584" src="/assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png" alt="" class="wp-image-317" srcset="/assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png 793w, /assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png 150w, /assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png 300w, /assets/images/blogs/wordpress/2020/09/windows-gamepad-tester.png 768w" sizes="(max-width: 793px) 100vw, 793px" /></figure>



<p class="wp-block-paragraph">Select your gamepad from the list of available gamepads. Mine is named Arduino Leonardo.</p>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="349" data-permalink="https://attackonalgorithms.wordpress.com/gamepadselection/" data-orig-file="/assets/images/blogs/wordpress/2020/09/gamepadselection.png" data-orig-size="374,322" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="gamepadselection" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/gamepadselection.png" data-large-file="/assets/images/blogs/wordpress/2020/09/gamepadselection.png" loading="lazy" width="374" height="322" src="/assets/images/blogs/wordpress/2020/09/gamepadselection.png" alt="" class="wp-image-349" srcset="/assets/images/blogs/wordpress/2020/09/gamepadselection.png 374w, /assets/images/blogs/wordpress/2020/09/gamepadselection.png 150w, /assets/images/blogs/wordpress/2020/09/gamepadselection.png 300w" sizes="(max-width: 374px) 100vw, 374px" /><figcaption>Available game controllers</figcaption></figure></div>



<p class="wp-block-paragraph">Once selected click on properties and then go to the &#8220;Test&#8221; tab. You will see the following.</p>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="324" data-permalink="https://attackonalgorithms.wordpress.com/arduino-leonardo-gamepad-test-1/" data-orig-file="/assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png" data-orig-size="394,448" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="arduino-leonardo-gamepad-test-1" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png" data-large-file="/assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png" loading="lazy" width="394" height="448" src="/assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png" alt="" class="wp-image-324" srcset="/assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png 394w, /assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png 132w, /assets/images/blogs/wordpress/2020/09/arduino-leonardo-gamepad-test-1.png 264w" sizes="(max-width: 394px) 100vw, 394px" /><figcaption>Gamepad testing</figcaption></figure></div>



<p class="wp-block-paragraph">Press each of the buttons on your gamepad and see if there is a response on the tester. The UP/DOWN/LEFT/RIGHT (DPAD buttons) will give a response on the Point of View Hat(POV HAT). The rest of the buttons are mapped in the following way, A-&gt;0,B-&gt;1,X-&gt;2,Y-&gt;3,L-&gt;5,R-&gt;6,Select-&gt;7,Start-&gt;8.</p>



<p class="wp-block-paragraph">The left analog stick is mapped to the X and Y axes and the Right analog stick is mapped to X and Y rotation axes. Check for the full motion on the analog sticks.</p>



<p class="wp-block-paragraph">Following codes are for different variants of gamepads that you could perhaps make.</p>



<h4 class="wp-block-heading" id="config2">CONFIG 2: L+R, UP/DOWN/LEFT/RIGHT -&gt; POV Hat, A,B,X,Y, Select, Start, No analog sticks </h4>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="325" data-permalink="https://attackonalgorithms.wordpress.com/nosticks-gamepad/" data-orig-file="/assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png" data-orig-size="393,450" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="nosticks-gamepad" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png" data-large-file="/assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png" loading="lazy" width="393" height="450" src="/assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png" alt="" class="wp-image-325" srcset="/assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png 393w, /assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png 131w, /assets/images/blogs/wordpress/2020/09/nosticks-gamepad.png 262w" sizes="(max-width: 393px) 100vw, 393px" /><figcaption>No Analog Sticks</figcaption></figure></div>



<p class="wp-block-paragraph"></p>



<pre class="wp-block-code"><code>#include &lt;Joystick.h&gt;
#define UP_PIN 5
#define DOWN_PIN 6
#define LEFT_PIN 4
#define RIGHT_PIN 7
#define X_KEY_PIN 10
#define Y_KEY_PIN 16
#define A_KEY_PIN 14
#define B_KEY_PIN 15
#define START_PIN 8
#define SELECT_PIN 9
#define L_KEY_PIN 3
#define R_KEY_PIN 2

Joystick_ Joystick(JOYSTICK_DEFAULT_REPORT_ID,JOYSTICK_TYPE_GAMEPAD,
  8, 1,                  // Button Count, Hat Switch Count
  false, false, false,     // X and Y, Z Axis
  false, false, false,   //  Rx, Ry, Rz
  false, false,          //  rudder, throttle
  false, false, false);  // accelerator, brake, steering

void setup() {
  // Initialize Button Pins
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  pinMode(5, INPUT_PULLUP);
  pinMode(6, INPUT_PULLUP);
  pinMode(7, INPUT_PULLUP);
  pinMode(8, INPUT_PULLUP);
  pinMode(9, INPUT_PULLUP);
  pinMode(10, INPUT_PULLUP);
  pinMode(16, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
  pinMode(15, INPUT_PULLUP);
  //Analog pins don't need setup
  
  Joystick.begin();
}

void loop() {

  //UP
  if (digitalRead(UP_PIN) == LOW)
  {Joystick.setHatSwitch(0,0);}
  //DOWN
  else if (digitalRead(DOWN_PIN) == LOW)
  {Joystick.setHatSwitch(0,180);}
  //LEFT
  else if (digitalRead(LEFT_PIN) == LOW)
  {Joystick.setHatSwitch(0,270);}
  //RIGHT
  else if (digitalRead(RIGHT_PIN) == LOW)
  {Joystick.setHatSwitch(0,90);}
  else
  {Joystick.setHatSwitch(0,-1);}

  // A_KEY
  if (digitalRead(A_KEY_PIN) == HIGH)
  {Joystick.setButton(0, LOW);}
  else
  {Joystick.setButton(0, HIGH);}

  // B_KEY
  if (digitalRead(B_KEY_PIN) == HIGH)
  {Joystick.setButton(1, LOW);}
  else
  {Joystick.setButton(1, HIGH);}

  // X_KEY
  if (digitalRead(X_KEY_PIN) == HIGH)
  {Joystick.setButton(2, LOW);}
  else
  {Joystick.setButton(2, HIGH);}

  // Y_KEY
  if (digitalRead(Y_KEY_PIN) == HIGH)
  {Joystick.setButton(3, LOW);}
  else
  {Joystick.setButton(3, HIGH);}
  
  // L_KEY_PIN
  if (digitalRead(L_KEY_PIN) == HIGH)
  {Joystick.setButton(4, LOW);}
  else
  {Joystick.setButton(4, HIGH);}

  // R_KEY_PIN
  if (digitalRead(R_KEY_PIN) == HIGH)
  {Joystick.setButton(5, LOW);}
  else
  {Joystick.setButton(5, HIGH);}

  // START
  if (digitalRead(START_PIN) == HIGH)
  {Joystick.setButton(7, LOW);}
  else
  {Joystick.setButton(7, HIGH);}

  // SELECT
  if (digitalRead(SELECT_PIN) == HIGH)
  {Joystick.setButton(6, LOW);}
  else
  {Joystick.setButton(6, HIGH);}

  delay(10);
   
}
</code></pre>



<h4 class="wp-block-heading" id="config3">CONFIG 3: L+R, UP/DOWN/LEFT/RIGHT-&gt;XY axes, A, B, X, Y, Select, Start, No analog sticks</h4>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="330" data-permalink="https://attackonalgorithms.wordpress.com/dpadtoxy/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dpadtoxy.png" data-orig-size="395,452" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="dpadtoxy" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dpadtoxy.png" data-large-file="/assets/images/blogs/wordpress/2020/09/dpadtoxy.png" loading="lazy" width="395" height="452" src="/assets/images/blogs/wordpress/2020/09/dpadtoxy.png" alt="" class="wp-image-330" srcset="/assets/images/blogs/wordpress/2020/09/dpadtoxy.png 395w, /assets/images/blogs/wordpress/2020/09/dpadtoxy.png 131w, /assets/images/blogs/wordpress/2020/09/dpadtoxy.png 262w" sizes="(max-width: 395px) 100vw, 395px" /><figcaption>DPAD mapped to X,Y axes</figcaption></figure></div>



<pre class="wp-block-code"><code>#include &lt;Joystick.h&gt;
#define UP_PIN 5
#define DOWN_PIN 6
#define LEFT_PIN 4
#define RIGHT_PIN 7
#define X_KEY_PIN 10
#define Y_KEY_PIN 16
#define A_KEY_PIN 14
#define B_KEY_PIN 15
#define START_PIN 8
#define SELECT_PIN 9
#define L_KEY_PIN 3
#define R_KEY_PIN 2

Joystick_ Joystick(JOYSTICK_DEFAULT_REPORT_ID,JOYSTICK_TYPE_GAMEPAD,
  8, 0,                  // Button Count, Hat Switch Count
  true, true, false,     // X and Y, Z Axis
  false, false, false,   //  Rx, Ry, Rz
  false, false,          //  rudder, throttle
  false, false, false);  // accelerator, brake, steering

void setup() {
  // Initialize Button Pins
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
  pinMode(5, INPUT_PULLUP);
  pinMode(6, INPUT_PULLUP);
  pinMode(7, INPUT_PULLUP);
  pinMode(8, INPUT_PULLUP);
  pinMode(9, INPUT_PULLUP);
  pinMode(10, INPUT_PULLUP);
  pinMode(16, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
  pinMode(15, INPUT_PULLUP);
  //Analog pins don't need setup
  
  // Initialize Joystick Library
  Joystick.setXAxisRange(-1,1);
  Joystick.setYAxisRange(-1,1);
  Joystick.begin();
}

void loop() {
  //UP  
  if (digitalRead(UP_PIN) == LOW)
  {Joystick.setYAxis(-1);}
  if (digitalRead(DOWN_PIN) == LOW)//DOWN
  {Joystick.setYAxis(1);}
  if ((digitalRead(UP_PIN) == HIGH)&amp;&amp;(digitalRead(DOWN_PIN) == HIGH))
  {Joystick.setYAxis(0);}

  if (digitalRead(RIGHT_PIN) == LOW)//RIGHT
  {Joystick.setXAxis(1);}
  if (digitalRead(LEFT_PIN) == LOW)//LEFT
  {Joystick.setXAxis(-1);}
  if ((digitalRead(RIGHT_PIN) == HIGH)&amp;&amp;(digitalRead(LEFT_PIN) == HIGH))
  {Joystick.setXAxis(0);}

  // A_KEY
  if (digitalRead(A_KEY_PIN) == HIGH)
  {Joystick.setButton(0, LOW);}
  else
  {Joystick.setButton(0, HIGH);}

  // B_KEY
  if (digitalRead(B_KEY_PIN) == HIGH)
  {Joystick.setButton(1, LOW);}
  else
  {Joystick.setButton(1, HIGH);}

  // X_KEY
  if (digitalRead(X_KEY_PIN) == HIGH)
  {Joystick.setButton(2, LOW);}
  else
  {Joystick.setButton(2, HIGH);}

  // Y_KEY
  if (digitalRead(Y_KEY_PIN) == HIGH)
  {Joystick.setButton(3, LOW);}
  else
  {Joystick.setButton(3, HIGH);}
  
  // L_KEY_PIN
  if (digitalRead(L_KEY_PIN) == HIGH)
  {Joystick.setButton(4, LOW);}
  else
  {Joystick.setButton(4, HIGH);}

  // R_KEY_PIN
  if (digitalRead(R_KEY_PIN) == HIGH)
  {Joystick.setButton(5, LOW);}
  else
  {Joystick.setButton(5, HIGH);}

  // START
  if (digitalRead(START_PIN) == HIGH)
  {Joystick.setButton(7, LOW);}
  else
  {Joystick.setButton(7, HIGH);}

  // SELECT
  if (digitalRead(SELECT_PIN) == HIGH)
  {Joystick.setButton(6, LOW);}
  else
  {Joystick.setButton(6, HIGH);}

  delay(10);
   
}
</code></pre>



<p class="wp-block-paragraph">Congratulations you just made your very first plug-and-play gamepad! You are awesome! Don&#8217;t just sit there ideally show them FPS, platformers and RPGs what your new gamepad can do! All my codes and gerber files for PCB can be found on <a href="https://github.com/devarshi16/ProMicroGamepad">my GitHub repository</a>.</p>



<h2 class="wp-block-heading" id="gallery">Gallery</h2>



<figure class="wp-block-gallery columns-3 is-cropped wp-block-gallery-1 is-layout-flex wp-block-gallery-is-layout-flex"><ul class="blocks-gallery-grid"><li class="blocks-gallery-item"><figure><img data-attachment-id="341" data-permalink="https://attackonalgorithms.wordpress.com/dsc_0002/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dsc_0002.jpg" data-orig-size="6016,4000" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;4&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599744018&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;24&quot;,&quot;iso&quot;:&quot;560&quot;,&quot;shutter_speed&quot;:&quot;0.016666666666667&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="dsc_0002" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dsc_0002.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/dsc_0002.jpg" loading="lazy" width="1024" height="680" src="/assets/images/blogs/wordpress/2020/09/dsc_0002.jpg" alt="" data-id="341" data-link="https://attackonalgorithms.com/dsc_0002/" class="wp-image-341" srcset="/assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 1024w, /assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 2048w, /assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 150w, /assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 300w, /assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 768w, /assets/images/blogs/wordpress/2020/09/dsc_0002.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure></li><li class="blocks-gallery-item"><figure><img data-attachment-id="342" data-permalink="https://attackonalgorithms.wordpress.com/dsc_0006/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dsc_0006.jpg" data-orig-size="4167,3063" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;4.2&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599744187&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;26&quot;,&quot;iso&quot;:&quot;560&quot;,&quot;shutter_speed&quot;:&quot;0.016666666666667&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="dsc_0006" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dsc_0006.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/dsc_0006.jpg" loading="lazy" width="1024" height="752" src="/assets/images/blogs/wordpress/2020/09/dsc_0006.jpg" alt="" data-id="342" data-link="https://attackonalgorithms.com/dsc_0006/" class="wp-image-342" srcset="/assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 1024w, /assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 2048w, /assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 150w, /assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 300w, /assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 768w, /assets/images/blogs/wordpress/2020/09/dsc_0006.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure></li><li class="blocks-gallery-item"><figure><img data-attachment-id="343" data-permalink="https://attackonalgorithms.wordpress.com/dsc_0009/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dsc_0009.jpg" data-orig-size="6016,4000" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;5.3&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599744337&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;40&quot;,&quot;iso&quot;:&quot;560&quot;,&quot;shutter_speed&quot;:&quot;0.066666666666667&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="dsc_0009" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dsc_0009.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/dsc_0009.jpg" loading="lazy" width="1024" height="680" src="/assets/images/blogs/wordpress/2020/09/dsc_0009.jpg" alt="" data-id="343" data-link="https://attackonalgorithms.com/dsc_0009/" class="wp-image-343" srcset="/assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 1024w, /assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 2048w, /assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 150w, /assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 300w, /assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 768w, /assets/images/blogs/wordpress/2020/09/dsc_0009.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure></li><li class="blocks-gallery-item"><figure><img data-attachment-id="344" data-permalink="https://attackonalgorithms.wordpress.com/dsc_0011/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dsc_0011.jpg" data-orig-size="6016,4000" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;5.6&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599744402&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;55&quot;,&quot;iso&quot;:&quot;800&quot;,&quot;shutter_speed&quot;:&quot;0.066666666666667&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="dsc_0011" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dsc_0011.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/dsc_0011.jpg" loading="lazy" width="1024" height="680" src="/assets/images/blogs/wordpress/2020/09/dsc_0011.jpg" alt="" data-id="344" data-link="https://attackonalgorithms.com/dsc_0011/" class="wp-image-344" srcset="/assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 1024w, /assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 2048w, /assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 150w, /assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 300w, /assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 768w, /assets/images/blogs/wordpress/2020/09/dsc_0011.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure></li><li class="blocks-gallery-item"><figure><img data-attachment-id="345" data-permalink="https://attackonalgorithms.wordpress.com/dsc_0016/" data-orig-file="/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg" data-orig-size="6016,4000" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;5.6&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;NIKON D3200&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;1599745889&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;55&quot;,&quot;iso&quot;:&quot;400&quot;,&quot;shutter_speed&quot;:&quot;0.04&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;1&quot;}" data-image-title="dsc_0016" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg" data-large-file="/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg" loading="lazy" width="1024" height="680" src="/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg" alt="" data-id="345" data-link="https://attackonalgorithms.com/dsc_0016/" class="wp-image-345" srcset="/assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 1024w, /assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 2048w, /assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 150w, /assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 300w, /assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 768w, /assets/images/blogs/wordpress/2020/09/dsc_0016.jpg 1440w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure></li></ul></figure>



<h2 class="wp-block-heading" id="whats-next">What&#8217;s Next?</h2>



<p class="wp-block-paragraph">A wired gamepad is good, but not very portable. How about we make a HID compatible bluetooth gamepad next? You might have noticed that I have given room for HC-05 bluetooth module on my PCB. Maybe I will flash the RN42 firmware on the HC05 module and see where it goes. Or maybe I will simply modify the &#8220;class of device&#8221; my HC-05 using AT commands so that it&#8217;s recognized as a Gamepad 😉 . Or maybe I will end up bricking it irreversibly. I guess we&#8217;ll find out&#8230;</p>



<figure class="wp-block-image size-large"><img data-attachment-id="333" data-permalink="https://attackonalgorithms.wordpress.com/newpcb/" data-orig-file="/assets/images/blogs/wordpress/2020/09/newpcb.png" data-orig-size="871,615" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="newpcb" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/newpcb.png" data-large-file="/assets/images/blogs/wordpress/2020/09/newpcb.png" loading="lazy" width="871" height="615" src="/assets/images/blogs/wordpress/2020/09/newpcb.png" alt="" class="wp-image-333" srcset="/assets/images/blogs/wordpress/2020/09/newpcb.png 871w, /assets/images/blogs/wordpress/2020/09/newpcb.png 150w, /assets/images/blogs/wordpress/2020/09/newpcb.png 300w, /assets/images/blogs/wordpress/2020/09/newpcb.png 768w" sizes="(max-width: 871px) 100vw, 871px" /><figcaption>A new PCB with PS2 Analog sticks in the making</figcaption></figure>


<div class="align crowdsignal-poll-wrapper" data-crowdsignal-poll="{&quot;pollId&quot;:&quot;636fd9cd-260e-4cd9-9eff-581a419c5eaf&quot;,&quot;isMultipleChoice&quot;:true,&quot;question&quot;:&quot;Will buy this from me if I sold it?&quot;,&quot;answers&quot;:[{&quot;text&quot;:&quot;Yes, just the PCB&quot;,&quot;answerId&quot;:&quot;5ff5fcfe-db6a-4a74-9dff-b39626b168ee&quot;},{&quot;text&quot;:&quot;Yes, the PCB, and the switches, analog sticks and headers, DIY kit&quot;,&quot;answerId&quot;:&quot;9d46c86e-946b-434e-87ec-4bd63e52c76c&quot;},{&quot;text&quot;:&quot;Yes, the PCB, and the switches, analog sticks and headers all pre-soldered&quot;,&quot;answerId&quot;:&quot;43bc73d6-8fbb-43eb-b45f-acd4c34ac323&quot;},{&quot;text&quot;:&quot;Yes, everything (including Pro Micro), DIY kit&quot;,&quot;answerId&quot;:&quot;0833cbfe-b0b3-4e5d-8f05-a79a71cdd8bd&quot;},{&quot;text&quot;:&quot;Yes, everything (including Pro Micro), all setup!&quot;,&quot;answerId&quot;:&quot;a3b35052-4cbb-4955-80e2-a4c61bce45c2&quot;},{&quot;text&quot;:&quot;Nope, got something else on my mind &quot;,&quot;answerId&quot;:&quot;e43c3ea1-ad75-4128-afc9-7e8145e8c720&quot;}],&quot;note&quot;:&quot;&quot;,&quot;submitButtonLabel&quot;:&quot;Submit&quot;,&quot;confirmMessageType&quot;:&quot;results&quot;,&quot;borderWidth&quot;:2,&quot;borderRadius&quot;:0,&quot;hasBoxShadow&quot;:false,&quot;hasOneResponsePerComputer&quot;:false,&quot;randomizeAnswers&quot;:false,&quot;width&quot;:100,&quot;pollStatus&quot;:&quot;open&quot;,&quot;closedPollState&quot;:&quot;show-results&quot;,&quot;hideBranding&quot;:false,&quot;buttonAlignment&quot;:&quot;list&quot;,&quot;apiPollData&quot;:{&quot;id&quot;:10608013,&quot;question&quot;:&quot;Will buy this from me if I sold it?&quot;,&quot;note&quot;:&quot;&quot;,&quot;settings&quot;:{&quot;title&quot;:&quot;Will buy this from me if I sold it?&quot;,&quot;after_vote&quot;:&quot;results&quot;,&quot;after_message&quot;:&quot;&quot;,&quot;randomize_answers&quot;:false,&quot;restrict_vote_repeat&quot;:false,&quot;captcha&quot;:false,&quot;multiple_choice&quot;:true,&quot;redirect_url&quot;:&quot;&quot;,&quot;close_status&quot;:&quot;open&quot;,&quot;close_after&quot;:false},&quot;answers&quot;:[{&quot;answer_text&quot;:&quot;Yes, just the PCB&quot;,&quot;id&quot;:49137636,&quot;client_id&quot;:&quot;5ff5fcfe-db6a-4a74-9dff-b39626b168ee&quot;},{&quot;answer_text&quot;:&quot;Yes, the PCB, and the switches, analog sticks and headers, DIY kit&quot;,&quot;id&quot;:49137637,&quot;client_id&quot;:&quot;9d46c86e-946b-434e-87ec-4bd63e52c76c&quot;},{&quot;answer_text&quot;:&quot;Yes, the PCB, and the switches, analog sticks and headers all pre-soldered&quot;,&quot;id&quot;:49137638,&quot;client_id&quot;:&quot;43bc73d6-8fbb-43eb-b45f-acd4c34ac323&quot;},{&quot;answer_text&quot;:&quot;Yes, everything (including Pro Micro), DIY kit&quot;,&quot;id&quot;:49137639,&quot;client_id&quot;:&quot;0833cbfe-b0b3-4e5d-8f05-a79a71cdd8bd&quot;},{&quot;answer_text&quot;:&quot;Yes, everything (including Pro Micro), all setup!&quot;,&quot;id&quot;:49137640,&quot;client_id&quot;:&quot;a3b35052-4cbb-4955-80e2-a4c61bce45c2&quot;},{&quot;answer_text&quot;:&quot;Nope, got something else on my mind&quot;,&quot;id&quot;:49137641,&quot;client_id&quot;:&quot;e43c3ea1-ad75-4128-afc9-7e8145e8c720&quot;}],&quot;client_id&quot;:&quot;636fd9cd-260e-4cd9-9eff-581a419c5eaf&quot;}}"></div>


<h2 class="wp-block-heading" id="appendix">Appendix</h2>



<h3 class="wp-block-heading" id="bricked">1.Unable to upload sketch, Pro Micro not showing on COM port, Bricked my Arduino Pro Micro 😦</h3>



<h4 class="wp-block-heading">A. Try resetting your module</h4>



<p class="wp-block-paragraph">While your Pro Micro is plugged to your system via the USB, attach a wire from the ground pin to the RST pin twice in succession quickly. You will now have a 7-8 sec interval to upload a blank sketch to your board. If your system is slow you might want to press the upload button first then reset as the code is first compiled. </p>



<h4 class="wp-block-heading">B. Reflash a new firmware to your Pro Micro, using another arduino as an ISP programmer</h4>



<ol class="wp-block-list"><li>Go to File &gt; Examples &gt; ArduinoISP &gt; ArduinoISP, a sketch will open</li><li>Upload this sketch to the working arduino</li><li>Make note of the pins PIN_MOSI, PIN_MISO, PIN_SCK, RESET in the sketch. Connect wires to these pins of the working arduino. If some pins are not there change the pin number to available ones.</li><li>Make connections from the working arduino to bricked Pro Micro such that the above noted pins connect</li></ol>



<figure class="wp-block-image size-large"><img data-attachment-id="337" data-permalink="https://attackonalgorithms.wordpress.com/pro_micro_flash/" data-orig-file="/assets/images/blogs/wordpress/2020/09/pro_micro_flash.png" data-orig-size="774,546" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="pro_micro_flash" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/pro_micro_flash.png" data-large-file="/assets/images/blogs/wordpress/2020/09/pro_micro_flash.png" loading="lazy" width="774" height="546" src="/assets/images/blogs/wordpress/2020/09/pro_micro_flash.png" alt="" class="wp-image-337" srcset="/assets/images/blogs/wordpress/2020/09/pro_micro_flash.png 774w, /assets/images/blogs/wordpress/2020/09/pro_micro_flash.png 150w, /assets/images/blogs/wordpress/2020/09/pro_micro_flash.png 300w, /assets/images/blogs/wordpress/2020/09/pro_micro_flash.png 768w" sizes="(max-width: 774px) 100vw, 774px" /></figure>



<p class="wp-block-paragraph">5. Go to Tools &gt; Programmer &gt; select &#8220;Arduino as ISP&#8221; if the working arduino has ATmega328p or select &#8220;Arduino as ISP(ATmega32U4)&#8221; if it has ATmega32u4</p>



<figure class="wp-block-image size-large"><img data-attachment-id="339" data-permalink="https://attackonalgorithms.wordpress.com/arduinoasisp/" data-orig-file="/assets/images/blogs/wordpress/2020/09/arduinoasisp.png" data-orig-size="565,620" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="arduinoasisp" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2020/09/arduinoasisp.png" data-large-file="/assets/images/blogs/wordpress/2020/09/arduinoasisp.png" loading="lazy" width="565" height="620" src="/assets/images/blogs/wordpress/2020/09/arduinoasisp.png" alt="" class="wp-image-339" srcset="/assets/images/blogs/wordpress/2020/09/arduinoasisp.png 565w, /assets/images/blogs/wordpress/2020/09/arduinoasisp.png 137w, /assets/images/blogs/wordpress/2020/09/arduinoasisp.png 273w" sizes="(max-width: 565px) 100vw, 565px" /></figure>



<p class="wp-block-paragraph">6. In Board: Select &#8220;Arduino Leonardo&#8221; or whichever board is compatible with you microcontroller. Select the correct port. Then Tools &gt; Burn Bootloader. This will reflash the selected microcontroller&#8217;s firmware.</p>



<h3 class="wp-block-heading" id="joystick-basics">Arduino Joystick Library Basics</h3>



<p class="wp-block-paragraph">In truth most of the heavy lifting of the code is done in this part,</p>



<pre class="wp-block-code"><code>Joystick_ Joystick(JOYSTICK_DEFAULT_REPORT_ID,JOYSTICK_TYPE_GAMEPAD,
  8, 1,                  // Button Count, Hat Switch Count
  false, false, false,     // X and Y, Z Axis
  false, false, false,   //  Rx, Ry, Rz
  false, false,          //  rudder, throttle
  false, false, false);  // accelerator, brake, steering</code></pre>



<p class="wp-block-paragraph">Here you simply declare the number of buttons, Hat Switches, X,Y,Z, Rx, Ry, Rz, Rudder, Throttle, accelerator, brake, steering. Which are all more than enough to handle most of the use cases. Some of them overlap though so keep that in mind when making something bizzare. When taking input of axes on digital buttons we declare the range of the axes between -1 to 1. Where 1 represents infinity on and -1 -infinity of the axis. When a button is pressed you don&#8217;t check for analog inputs you simply map the button press to one of the extremes of the axis. Otherwise you set the axis to zero.</p>



<pre class="wp-block-code"><code>  //UP  
  if (digitalRead(UP_PIN) == LOW)
  {Joystick.setYAxis(-1);}
  if (digitalRead(DOWN_PIN) == LOW)//DOWN
  {Joystick.setYAxis(1);}
  if ((digitalRead(UP_PIN) == HIGH)&amp;&amp;(digitalRead(DOWN_PIN) == HIGH))
  {Joystick.setYAxis(0);}</code></pre>



<h3 class="wp-block-heading" id="retropie">Setup with Retropie</h3>



<figure class="wp-block-video wp-block-video wp-block-embed is-type-video is-provider-videopress wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
<iframe title='VideoPress Video Player' aria-label='VideoPress Video Player' width='500' height='281' src='https://video.wordpress.com/embed/MeEs2KNB?preloadContent=metadata&amp;hd=0&amp;cover=1' frameborder='0' allowfullscreen  allow='clipboard-write' ></iframe><script src='https://v0.wordpress.com/js/next/videopress-iframe.js?m=1770107250'></script>
</div></figure>



<p class="wp-block-paragraph">Plug in the gamepad to Pi. Press &lt;ENTER&gt;.  Go to &#8220;Configure Input&#8221;, press a few buttons. If it says 1 gamepad detected, just long press any button and follow this instructions for setup. If it says 0 gamepad detected, then follow these instructions</p>



<ol class="wp-block-list"><li>Press &lt;SHIFT&gt; + &lt;F4&gt; for opening up the terminal. </li><li>type <strong><code>lsusb</code>  </strong>, this will show the list of plugged in devices. My device showed up as arduino leonardo. Note down the two numbers &lt;VID&gt;:&lt;PID&gt;</li><li>then type,<strong> <code>cd /etc/udev/rules.d</code></strong></li><li>then type, <code><strong>sudo nano new.rules</strong></code> , to open up the nano editor for editing the new file new.rules</li><li>In the file add the following line, <code><strong>SUBSYSTEM=="input", ATTRS{idVendor}=="&lt;VID&gt;", ATTRS{idProduct}=="&lt;PID&gt;" ENV{ID_INPUT_JOYSTICK}="1"</strong></code>  , replacing &lt;VID&gt; and &lt;PID&gt; with the numbers you noted earlier.</li><li>Press <strong>&lt;CTRL&gt;+X</strong> then <strong>Y</strong> when prompted, to exit the nano editor. Do <code><strong>sudo reboot</strong></code> to restart your device. Goto &#8220;Configure Input&#8221; your device will now be detected. </li></ol>



<p class="wp-block-paragraph"></p>

