---
layout: blog_post
title: "Fast One Hot Encoding using Numpy (No For Loops)"
date: 2021-07-11
updated: 2026-10-11
description: "Vectorized label encoding with a reusable class vocabulary, repeated timing measurements, and explicit memory costs."
thumbnail: "/assets/images/blogs/wordpress/2021/07/one_hot_compare-1.png"
tags: ["Algorithms","algorithms comparision","diy","one hot","python"]
---

<p class="article-warning"><strong>Updated October 2026.</strong> The vectorized implementation now uses a reusable class vocabulary rather than an array indexed up to the largest numeric label. It supports negative and noncontiguous labels. The timing example uses repeated measurements. <a href="/examples/numpy_tutorials.py">Download the tested helpers</a>. The figure below is the original 2021 result, not a new benchmark of the corrected code.</p>

<pre class="wp-block-code"><code>import numpy as np</code></pre>



<p class="wp-block-paragraph">In a lot of artificial intelligence applications, specially in supervised learning classification problems, where the labels for each of the datapoints are available, we often have a one-dimensional array containing the classes of each of the datapoints. Depending upon the machine learning algorithm we are going to apply to our dataset for classification, we might need to one-hot encode our labels.</p>



<h2 class="wp-block-heading">What is One Hot Encoding?</h2>



<p class="wp-block-paragraph">Say, we are given a labels array like,</p>



<pre class="wp-block-code"><code>&gt;&gt;&gt; Y=np.array([12, 8, 4, 4, 11, 0, 10, 10, 1, 8]).reshape(-1,1)
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



<p class="wp-block-paragraph">Where each row contains the class number of the corresponding row for the datapoint <code>X</code>. Note that, in our example there are 7 unique classes, namely, <code>0,1,4,8,10,11,12</code> .One hot encoding for the above array Y will be, </p>



<pre class="wp-block-code"><code>&gt;&gt;&gt; encoded, classes = one_hot(Y)
&gt;&gt;&gt; encoded
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



<pre class="wp-block-code"><code>def one_hot_for(Y, classes=None, dtype=np.float32):
    labels = np.asarray(Y).reshape(-1)
    vocabulary = np.unique(labels if classes is None else np.asarray(classes).reshape(-1))
    mapping = {value: index for index, value in enumerate(vocabulary)}
    encoded = np.zeros((len(labels), len(vocabulary)), dtype=dtype)
    for row, label in enumerate(labels):
        if label not in mapping:
            raise ValueError("A label is absent from the supplied class vocabulary")
        encoded[row, mapping[label]] = 1
    return encoded, vocabulary.reshape(-1, 1)</code></pre>



<h2 class="wp-block-heading">Vectorized encoding with a class vocabulary</h2>



<pre class="wp-block-code"><code>def one_hot(Y, classes=None, dtype=np.float32):
    labels = np.asarray(Y).reshape(-1)
    vocabulary = np.unique(labels if classes is None else np.asarray(classes).reshape(-1))
    indices = np.searchsorted(vocabulary, labels)
    if len(labels) and (np.any(indices &gt;= len(vocabulary)) or not np.array_equal(vocabulary[indices], labels)):
        raise ValueError("A label is absent from the supplied class vocabulary")
    encoded = np.zeros((len(labels), len(vocabulary)), dtype=dtype)
    encoded[np.arange(len(labels)), indices] = 1
    return encoded, vocabulary.reshape(-1, 1)</code></pre>



<h2 class="wp-block-heading">Speed comparison</h2>



<h4 class="wp-block-heading">Generating random labels and storing in a file</h4>



<pre class="wp-block-code"><code>import random

file_name="randoms.txt"
with open(file_name,"w+") as random_labels:
    for i in range(10000):
        random_labels.write(str(random.randint(0,1000))+"\n")</code></pre>



<p class="wp-block-paragraph">The above code will generate 10,000 random numbers and store them on individual lines in the file <code>randoms.txt</code></p>



<h4 class="wp-block-heading">Script for comparing the two functions</h4>



<pre class="wp-block-code"><code>import numpy as np
from timeit import repeat
import matplotlib.pyplot as plt
from numpy_tutorials import one_hot, one_hot_for

rng = np.random.default_rng(0)
labels = rng.integers(0, 1000, size=10000)
sizes = range(100, 10000, 100)
for function in (one_hot, one_hot_for):
    timings = []
    for size in sizes:
        batch = labels[:size]
        function(batch)  # warm up
        samples = repeat(lambda: function(batch), repeat=7, number=3)
        timings.append(np.median(samples) / 3)
    plt.plot(list(sizes), timings, label=function.__name__)
plt.xlabel("Number of labels")
plt.ylabel("Median seconds per call")
plt.legend()
plt.show()</code></pre>



<h4 class="wp-block-heading">Result</h4>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="558" data-permalink="https://attackonalgorithms.wordpress.com/one_hot_compare/" data-orig-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="one_hot_compare" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" data-large-file="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png" alt="one hot encoding algorithm execution time comparison" class="wp-image-558" srcset="/assets/images/blogs/wordpress/2021/07/one_hot_compare.png 640w, /assets/images/blogs/wordpress/2021/07/one_hot_compare.png 150w, /assets/images/blogs/wordpress/2021/07/one_hot_compare.png 300w" sizes="(max-width: 640px) 100vw, 640px" /><figcaption>Comparison for time of execution for different one-hot encoding algos</figcaption></figure></div>



<h2>Additional notes</h2><ul><li>Fit the class vocabulary on training labels and reuse it for other splits: <code>encoded, classes = one_hot(train_labels)</code>, then <code>validation, _ = one_hot(val_labels, classes=classes)</code>. Unknown classes raise an error.</li><li>A dense output uses <code>N × C × dtype.itemsize</code> bytes. The float32 default uses four bytes per cell; many classes can make this costly. Consider sparse storage when appropriate.</li><li>Timing depends on input shape, class count, allocation, dtype, hardware, and measurement method. Repeated timings are measurements of this workload, not a universal ranking.</li><li><a href="/examples/numpy_tutorials.py">Current tested source</a></li></ul>
