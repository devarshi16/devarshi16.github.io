---
layout: blog_post
title: "Fast One Hot Encoding using Numpy (No For Loops)"
date: 2021-07-11
description: "In a lot of artificial intelligence applications, specially in supervised learning classification problems, where the labels for each of the datapoints are available, we often have a one-dimensional array containing the classes of each of the datapoints. Depending upon the machine learning algorithm we are going to apply to our dataset for classification, we might [...]"
thumbnail: "/assets/images/blogs/wordpress/2021/07/one_hot_compare-1.png"
tags: ["Algorithms","algorithms comparision","diy","one hot","python"]
---


<p class="wp-block-paragraph">In a lot of artificial intelligence applications, specially in supervised learning classification problems, where the labels for each of the datapoints are available, we often have a one-dimensional array containing the classes of each of the datapoints. Depending upon the machine learning algorithm we are going to apply to our dataset for classification, we might need to one-hot encode our labels.</p>



<h2 class="wp-block-heading">What is One Hot Encoding?</h2>



<p class="wp-block-paragraph">Say, we are given a labels array like,</p>



<pre class="wp-block-code"><code>&gt;&gt;&gt; Y=numpy.randdom.randint(15,size=10).reshape(-1,1)
&gt;&gt;&gt; Y
array(&#091;&#091;12],
       &#091; 8],
       &#091; 4],
       &#091; 4],
       &#091;11],
       &#091; 0],
       &#091;10],
       &#091;10],
       &#091; 1],
       &#091; 8]])</code></pre>



<p class="wp-block-paragraph">Where each row contains the class number of the correspoding row for the datapoint <code>X</code>. Note that, in our example there are 6 unique classes, namely, <code>0,1,4,8,10,11,12</code> .One hot encoding for the above array Y will be, </p>



<pre class="wp-block-code"><code>&gt;&gt;&gt; one_hot(Y)
array(&#091;&#091;0., 0., 0., 0., 0., 0., 1.],
       &#091;0., 0., 0., 1., 0., 0., 0.],
       &#091;0., 0., 1., 0., 0., 0., 0.],
       &#091;0., 0., 1., 0., 0., 0., 0.],
       &#091;0., 0., 0., 0., 0., 1., 0.],
       &#091;1., 0., 0., 0., 0., 0., 0.],
       &#091;0., 0., 0., 0., 1., 0., 0.],
       &#091;0., 0., 0., 0., 1., 0., 0.],
       &#091;0., 1., 0., 0., 0., 0., 0.],
       &#091;0., 0., 0., 1., 0., 0., 0.]])</code></pre>



<p class="wp-block-paragraph">Where in each row  has only one column set to 1 representing the class to which the datapoint belongs. For example, the first row has the last column set to 1. Which represents the column of the class &#8217;12&#8217;. Which would mean we would also require the class to column mapping along with the one hot encoding. Something like,</p>



<pre class="wp-block-code"><code>array(&#091;&#091; 0],
       &#091; 1],
       &#091; 4],
       &#091; 8],
       &#091;10],
       &#091;11],
       &#091;12]])</code></pre>



<p class="wp-block-paragraph">Here the row number of the class represents it&#8217;s column in the one hot encoding. It is simply a sorted order of all unique classes in <code>Y</code>.</p>



<h2 class="wp-block-heading">The easy solution to the easy problem(For loop)</h2>



<pre class="wp-block-code"><code>def one_hot_for(Y):
    data_size=Y.shape&#091;0]
    classes=np.unique(Y).reshape(-1,1)
    num_classes=classes.shape&#091;0]

    one_hot=np.zeros((data_size,num_classes))
    for row in range(data_size):
        one_hot&#091;row,np.where(classes==Y&#091;row])&#091;0]]=1

    return one_hot,classes</code></pre>



<h2 class="wp-block-heading">The hard solution to the easy problem(vector(ish))</h2>



<pre class="wp-block-code"><code>def one_hot(Y):
    data_size=Y.shape&#091;0]
    classes=np.unique(Y).reshape(-1,1)
    num_classes=classes.shape&#091;0]

    class_mappings=np.arange(0,max(Y)+1)
    class_mappings&#091;np.unique(classes)]=np.arange(num_classes)
    Y=class_mappings&#091;Y]

    one_hot=np.zeros((data_size,num_classes))
    one_hot&#091;np.arange(data_size).reshape(-1,1),Y.reshape(-1,1)]=1
    class_col=np.sort(classes)
    return one_hot,class_col</code></pre>



<h2 class="wp-block-heading">Speed comparison</h2>



<h4 class="wp-block-heading">Generating random labels and storing in a file</h4>



<pre class="wp-block-code"><code>import random

file_name="randoms.txt"
with open(file_name,"w+") as random_labels:
    for i in range(10000):
        random_labels.write(str(random.randint(0,1000))+"\n")</code></pre>



<p class="wp-block-paragraph">The above code will generate 10,000 random numbers and store them on individual lines in the file <code>randoms.txt</code></p>



<h4 class="wp-block-heading">Script for comparing the two functions</h4>



<pre class="wp-block-code"><code>import matplotlib.pyplot as plt
import time
import numpy as np
from helper_functions import one_hot,one_hot_for

filename= "randoms.txt"

with open(filename,"r+") as f:
    Y=f.readlines()
    int_map=map(int,Y)
    Y=list(int_map)
    Y=np.asarray(Y).reshape(-1,1)

one_hot_timings=&#091;]
one_hot_for_timings=&#091;]
for i in range(100,10000,100):
    start=time.time()
    _,_=one_hot(Y&#091;:i])
    end=time.time()
    one_hot_timings.append(end-start)

    start=time.time()
    _,_=one_hot_for(Y&#091;:i])
    end=time.time()
    one_hot_for_timings.append(end-start)

plt.plot(one_hot_timings,label="one_hot_vector")
plt.plot(one_hot_for_timings,label="one_hot_for")
plt.xlabel('data_size for every 100 datapoints')
plt.ylabel('time of execution')
plt.legend(loc='best')
plt.show()</code></pre>



<h4 class="wp-block-heading">Result</h4>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="558" data-permalink="https://attackonalgorithms.wordpress.com/one_hot_compare/" data-orig-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="one_hot_compare" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" data-large-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" alt="one hot encoding algorithm execution time comparison" class="wp-image-558" srcset="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png 640w, /assets/images/blogs/wordpress/2021/07/one_hot_compare.png 150w, /assets/images/blogs/wordpress/2021/07/one_hot_compare.png 300w" sizes="(max-width: 640px) 100vw, 640px" /><figcaption>Comparison for time of execution for different one-hot encoding algos</figcaption></figure></div>



<h2 class="wp-block-heading">Additional notes</h2>



<ul class="wp-block-list"><li>Libraries such as scipy, torch, sklearn etc, could probably do this faster.</li><li>Depending on how often you call the above functions in your applications, it might not be relevant for you to choose between the above two methods as both need less than a few seconds at most.</li><li>The assimilated code for the above can be found <a href="https://gist.github.com/devarshi16/5fd9266cf1fa83143088b1f630b363d3">here</a>.</li></ul>



<p class="wp-block-paragraph"></p>

