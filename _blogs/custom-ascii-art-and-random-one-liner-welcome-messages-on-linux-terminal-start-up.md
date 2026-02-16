---
layout: blog_post
title: "Custom ASCII art and random one-liner welcome messages on Linux Terminal start-up"
date: 2019-02-10
description: "You can have ASCII art with a random-one-liner as a welcome message on you Linux terminal. All you need to do is add some lines to your ~/. bashrc file!"
thumbnail: "/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png"
tags: ["Linux","Linux terminal","Linux tips"]
---


<p class="wp-block-paragraph">Would it not be cool if your terminal welcomes you with an ASCII art and a random one-liner each time you start it up!</p>



<p class="wp-block-paragraph">Like this:-</p>



<figure class="wp-block-image"><img data-attachment-id="161" data-permalink="https://attackonalgorithms.wordpress.com/screenshot-from-2019-02-10-22-53-45/" data-orig-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png" data-orig-size="482,276" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="screenshot-from-2019-02-10-22-53-45" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png" data-large-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png" loading="lazy" width="482" height="276" src="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png" alt="" class="wp-image-161" srcset="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png 482w, /assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png 150w, /assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-22-53-45.png 300w" sizes="(max-width: 482px) 100vw, 482px" /><figcaption>Custom welcome  to terminal</figcaption></figure>



<p class="has-text-color has-background has-light-gray-color has-dark-red-background-color wp-block-paragraph">Remember to like my post and star my GitHub repository if this post helps you!</p>



<p class="wp-block-paragraph">Linux users (Sorry Mac owners (for the time being, use the custom method after this)) can simply install my poketerm pip package! </p>



<p class="wp-block-paragraph">Remember to install with sudo permissions!</p>



<pre class="wp-block-code"><code>$ sudo pip install poketerm
$ poketerm -t 1
$ poketerm -h</code></pre>



<p class="wp-block-paragraph">You can customise the above according to your need or you can save yourself some trouble and use my code on <a href="https://github.com/devarshi16/TerminalWelcome">github</a> which does everything that I am going to describe below.</p>



<p class="wp-block-paragraph">Firstly download and put <a href="http://silgro.com/fortunes.txt">this</a> file in your /home/$USER/ folder.</p>



<p class="wp-block-paragraph">All you need to do now is manipulate the <strong>.bashrc</strong> shell script that Bash(Terminal) runs whenever it is started interactively. You can put any command in that file that you could type at the command prompt and they will run whenever you start Bash. </p>



<p class="has-text-align-left wp-block-paragraph"><strong>Note:</strong> The following makes changes to default terminal Bash. If you are using some other shell you will have to make changes to their respective analogous file.</p>



<p class="wp-block-paragraph"><strong>NOTE FOR MAC USERS:</strong> The .bashrc equivalent of Mac is <strong>.bash_profile</strong>, Mac users may use that file for the following changes.</p>



<p class="wp-block-paragraph">After opening this file with your favourite editor with a command like</p>



<pre class="wp-block-code"><code>vim ~/.bashrc</code></pre>



<p class="wp-block-paragraph">You will find the line containing the following in the start:</p>



<pre class="wp-block-code"><code>#!/bin/bash</code></pre>



<p class="wp-block-paragraph">Just after which you will have to add this small piece of code that I wrote:</p>



<pre class="wp-block-code"><code>echo "Welcome $USER "
echo "|\_                  _"
echo " \ \               _/_|"
echo "  \ \_          __/ /"
echo "   \  \________/   /"
echo "    |              |"
echo "    /              |"
echo "   |   0       0   |"
echo "   |       _       |"
echo "   |()    __    () |"
echo "    \    (__)      |"
file="/home/$USER/fortunes.txt"
if &#091; -f "$file" ]
then
    shuf -n 1 $file
fi</code></pre>



<p class="wp-block-paragraph">The file should look similar to this now:</p>



<figure class="wp-block-image"><img data-attachment-id="149" data-permalink="https://attackonalgorithms.wordpress.com/screenshot-from-2019-02-10-20-54-29-2/" data-orig-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png" data-orig-size="799,572" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="Screenshot from 2019-02-10 20-54-29" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png" data-large-file="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png" loading="lazy" width="799" height="572" src="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png" alt="" class="wp-image-149" srcset="/assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png 799w, /assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png 150w, /assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png 300w, /assets/images/blogs/wordpress/2019/02/screenshot-from-2019-02-10-20-54-29-1-e1549792600626.png 768w" sizes="(max-width: 799px) 100vw, 799px" /><figcaption>.bashrc code after addition of lines</figcaption></figure>



<p class="wp-block-paragraph">Save it and you are good to go!</p>



<p class="wp-block-paragraph"> Most of the above code is self explanatory. The only thing that you might not get is the statement inside the if conditional. If the file exists, then a random line is returned out of the 10,000 lines in the fortunes.txt file.</p>



<h2 class="wp-block-heading">What more can you do?</h2>



<p class="wp-block-paragraph">You can create your own custom ASCII art or you could find some <a href="https://www.asciiart.eu/">here</a>. Just format it and replace it with my noobish art. Do keep in mind to not use art which is very large in line length/height else it might not appear as intended. Also keep in mind the characters that are used in the art. Test the piece of code as a separate shell script before you add it to the file. You can also save the art in a file/folder and invoke one randomly just like the one-liner.</p>

