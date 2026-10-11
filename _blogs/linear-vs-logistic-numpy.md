---
layout: blog_post
title: "Linear vs Logistic Regression, all in Numpy"
date: 2021-07-20
updated: 2026-10-11
description: "Implement linear and logistic regression in NumPy, with training-only scaling, correct losses, and careful evaluation."
thumbnail: "/assets/images/blogs/wordpress/2021/07/logistic.png"
tags: ["Algorithms","algorithms comparision","linear regression","linear-regression","logistic regression"]
---

<p class="article-warning"><strong>Updated October 2026.</strong> The code below now splits before fitting a scaler, corrects F1, applies sigmoid before logistic classification, and calculates the appropriate loss. <a href="/examples/numpy_tutorials.py">Download the tested NumPy helpers</a>. The original 2021 plots and reported scores are retained as historical output; they do not evaluate the corrected pipeline.</p>

<pre class="wp-block-code"><code>import numpy as np</code></pre>



<p class="wp-block-paragraph">The two entry level machine learning algorithms , linear and logistic regression are quite easy to understand and provide a good way to practice coding the general machine learning pipeline, in their vectorized form. Namely, </p>



<ul class="wp-block-list"><li>Prepping the dataset, eg: removing outliers, adding features(polynomial multiples of existing features), normalization, feature scaling.</li><li>Implementing the learning algorithm function.</li><li>Calculating the loss through the chosen loss function and hypothesis.</li><li>Optimization algorithm &#8211; Update you model&#8217;s parameters depending on the loss and ground truth.</li><li>Maintaining a config file for the total training process.</li></ul>



<p class="wp-block-paragraph">An entry level toy dataset: <a href="https://www.kaggle.com/uciml/pima-indians-diabetes-database">pima indians diabetes dataset</a>, has a target of one variable for each datapoint(a binary classification task of predicting whether a person has diabetes or not), will be used for the sake of this tutorial blog.</p>



<h2 class="wp-block-heading">About the dataset</h2>



<p class="wp-block-paragraph">You can know all about the dataset on <a href="https://www.kaggle.com/uciml/pima-indians-diabetes-database">Kaggle</a>. The dataset has around <code>768</code> datapoints and <code>8</code> features, small enough to inspect while practicing a complete learning pipeline. Dataset size alone does not guarantee a useful model. The data is about female patients, specifically, their BMI, insulin level, age, skin thickness, glucose level etc. The target tells if the person has diabetes or not. <code>500</code> of all the datapoints are non-diabetic. <code>268</code> are diabetic. Class frequencies alone do not determine which metric is appropriate. Report accuracy alongside precision, recall and F1, and consider the relative cost of errors for the actual task.</p>



<h2 class="wp-block-heading">Helper Functions</h2>



<h4 class="wp-block-heading">For normalizing the dataset</h4>



<p class="wp-block-paragraph">Fit the minimum and range on the training split only, then reuse them for validation and test data. Constant training features use a denominator of one; values outside the training range can fall outside 0–1.</p>



<pre class="wp-block-code"><code>def scalify_min_max(X, minimum=None, span=None):
    X = np.asarray(X, dtype=np.float64)
    if minimum is None and span is None:
        minimum = X.min(axis=0)
        span = X.max(axis=0) - minimum
    elif minimum is None or span is None:
        raise ValueError("Supply both training minimum and span")
    return (X - minimum) / np.where(np.asarray(span) == 0, 1.0, span)</code></pre>



<h4 class="wp-block-heading">For calculating the accuracy</h4>



<pre class="wp-block-code"><code>def accuracy_calculator(Y_out, Y):
    prediction = np.asarray(Y_out).reshape(-1)
    truth = np.asarray(Y).reshape(-1)
    if prediction.shape != truth.shape or not truth.size:
        raise ValueError("Expected nonempty predictions and labels of equal length")
    if not np.isin(prediction, [0, 1]).all() or not np.isin(truth, [0, 1]).all():
        raise ValueError("These metrics expect binary 0/1 labels")
    tp = np.sum((prediction == 1) &amp; (truth == 1))
    fp = np.sum((prediction == 1) &amp; (truth == 0))
    fn = np.sum((prediction == 0) &amp; (truth == 1))
    precision = float(tp / (tp + fp)) if tp + fp else 0.0
    recall = float(tp / (tp + fn)) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return [float(np.mean(prediction == truth)), precision, recall, f1]</code></pre>



<h4 class="wp-block-heading">For preparing the dataset &#8211; creating train/val/test splits</h4>



<pre class="wp-block-code"><code>def pre_data_prep(filename, dest_fileloc):
    # NumPy transparently reads .gz files. Keep raw values until AFTER splitting.
    raw = np.loadtxt(filename, delimiter=",", skiprows=1)
    np.savetxt(dest_fileloc, raw, delimiter=",")

def dataprep(fileloc, split, seed=0):
    if len(split) != 3 or not np.isclose(sum(split), 1) or min(split) &lt;= 0:
        raise ValueError("Provide three positive ratios summing to 1")
    raw = np.loadtxt(fileloc, delimiter=",", ndmin=2)
    if not np.isfinite(raw).all() or raw.shape[1] &lt; 2:
        raise ValueError("Expected finite features and a final label column")
    shuffled = raw[np.random.default_rng(seed).permutation(len(raw))]
    n_train = int(split[0] * len(raw))
    n_val = int(split[1] * len(raw))
    if min(n_train, n_val, len(raw) - n_train - n_val) &lt; 1:
        raise ValueError("Each split must contain at least one row")
    train, val, test = np.split(shuffled, [n_train, n_train + n_val])
    minimum = train[:, :-1].min(axis=0)
    span = train[:, :-1].max(axis=0) - minimum
    X_train, X_val, X_test = [scalify_min_max(part[:, :-1], minimum, span) for part in (train, val, test)]
    Y_train, Y_val, Y_test = [part[:, -1:].copy() for part in (train, val, test)]
    if not np.isin(shuffled[:, -1], [0, 1]).all():
        raise ValueError("This example expects binary 0/1 targets")
    return X_train, X_val, X_test, Y_train, Y_val, Y_test</code></pre>



<h4 class="wp-block-heading">Evaluation function</h4>



<p class="wp-block-paragraph">Logistic classification thresholds sigmoid probabilities, while linear classification thresholds the linear prediction. The loss is binary cross-entropy for logistic regression and mean squared error divided by two for linear regression. Specify the model explicitly when evaluating it.</p>



<pre class="wp-block-code"><code>def evaluate(theta_params, X, Y=None, thresh=0.5, model="logistic"):
    if model not in ("linear", "logistic"):
        raise ValueError("model must be linear or logistic")
    X = np.asarray(X, dtype=np.float64)
    X_extend = np.column_stack([np.ones(len(X)), X])
    scores = X_extend @ np.asarray(theta_params).reshape(-1, 1)
    values = sigmoid(scores) if model == "logistic" else scores
    prediction = (values &gt;= thresh).astype(np.int64)
    if Y is None:
        return prediction, None
    truth = np.asarray(Y).reshape(-1, 1)
    if truth.shape != prediction.shape:
        raise ValueError("Label count differs from prediction count")
    loss = np.mean(np.logaddexp(0, scores) - truth * scores) if model == "logistic" else np.mean((scores - truth) ** 2) / 2
    return prediction, float(loss)</code></pre>



<h2 class="wp-block-heading">Logistic Regression Function</h2>



<pre class="wp-block-code"><code>def sigmoid(scores):
    scores = np.asarray(scores, dtype=np.float64)
    result = np.empty_like(scores)
    positive = scores &gt;= 0
    result[positive] = 1 / (1 + np.exp(-scores[positive]))
    exp_scores = np.exp(scores[~positive])
    result[~positive] = exp_scores / (1 + exp_scores)
    return result

def _fit(X, Y, learning_rate, num_iters, thresh, rand_seed, model):
    X = np.asarray(X, dtype=np.float64)
    Y = np.asarray(Y, dtype=np.float64).reshape(-1, 1)
    if X.ndim != 2 or len(X) != len(Y) or not len(X):
        raise ValueError("Expected a nonempty feature matrix and matching labels")
    if not np.isfinite(X).all() or not np.isin(Y, [0, 1]).all():
        raise ValueError("Expected finite features and binary targets")
    if learning_rate &lt;= 0 or num_iters &lt; 1:
        raise ValueError("Use a positive learning rate and iteration count")
    X_extend = np.column_stack([np.ones(len(X)), X])
    theta = np.random.default_rng(rand_seed).normal(0, 0.01, (X_extend.shape[1], 1))
    costs = []
    for _ in range(num_iters):
        scores = X_extend @ theta
        hypothesis = sigmoid(scores) if model == "logistic" else scores
        theta -= learning_rate * (X_extend.T @ (hypothesis - Y)) / len(X)
        _, cost = evaluate(theta, X, Y, thresh, model)
        costs.append(cost)
    prediction, _ = evaluate(theta, X, Y, thresh, model)
    return theta, accuracy_calculator(prediction, Y)[0], np.asarray(costs)

def logistic_regression(X, Y, learning_rate=0.001, num_iters=100, thresh=0.5, rand_seed=0):
    return _fit(X, Y, learning_rate, num_iters, thresh, rand_seed, "logistic")</code></pre>



<h2 class="wp-block-heading">Linear Regression Function</h2>



<pre class="wp-block-code"><code>def linear_regression(X, Y, learning_rate=0.001, num_iters=100, thresh=0.5, rand_seed=0):
    return _fit(X, Y, learning_rate, num_iters, thresh, rand_seed, "linear")</code></pre>



<h2 class="wp-block-heading">Runner functions for Linear and Logistic Regressions</h2>



<pre class="wp-block-code"><code>def run_models(fileloc, data_split_ratios, seed_values, model="logistic", num_iters=500):
    seed_values = list(seed_values)
    if model not in ("linear", "logistic") or not seed_values:
        raise ValueError("Choose a model and at least one initialization seed")
    X_train, X_val, X_test, Y_train, Y_val, Y_test = dataprep(fileloc, data_split_ratios)
    fit = logistic_regression if model == "logistic" else linear_regression
    candidates, validation_scores = [], []
    for seed in seed_values:
        theta, _, _ = fit(X_train, Y_train, rand_seed=seed, num_iters=num_iters)
        predictions, _ = evaluate(theta, X_val, Y_val, model=model)
        candidates.append(theta)
        validation_scores.append(accuracy_calculator(predictions, Y_val)[0])
    # Choose on validation data. Evaluate the selected model on the test set once.
    selected = candidates[int(np.argmax(validation_scores))]
    predictions, loss = evaluate(selected, X_test, Y_test, model=model)
    return selected, accuracy_calculator(predictions, Y_test), loss</code></pre>



<h2 class="wp-block-heading">Original 2021 Training Curves</h2>



<p class="wp-block-paragraph">Note that each of the below two trainings was performed with <code>10</code> different values of initial theta. The initial value of theta effects the overall training performance. The best of the <code>10</code> was taken in consideration for the final evaluation on the test dataset.</p>



<div class="wp-block-image is-style-default"><figure class="aligncenter size-large"><img data-attachment-id="585" data-permalink="https://attackonalgorithms.wordpress.com/linear/" data-orig-file="/assets/images/blogs/wordpress/2021/07/linear.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="linear" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/linear.png" data-large-file="/assets/images/blogs/wordpress/2021/07/linear.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/linear.png" alt="linear regression training" class="wp-image-585" srcset="/assets/images/blogs/wordpress/2021/07/linear.png 640w, /assets/images/blogs/wordpress/2021/07/linear.png 150w, /assets/images/blogs/wordpress/2021/07/linear.png 300w" sizes="(max-width: 640px) 100vw, 640px" /></figure></div>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="587" data-permalink="https://attackonalgorithms.wordpress.com/logistic/" data-orig-file="/assets/images/blogs/wordpress/2021/07/logistic.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="logistic" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/logistic.png" data-large-file="/assets/images/blogs/wordpress/2021/07/logistic.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/logistic.png" alt="logistic regression training" class="wp-image-587" srcset="/assets/images/blogs/wordpress/2021/07/logistic.png 640w, /assets/images/blogs/wordpress/2021/07/logistic.png 150w, /assets/images/blogs/wordpress/2021/07/logistic.png 300w" sizes="(max-width: 640px) 100vw, 640px" /></figure></div>



<h2 class="wp-block-heading">Original 2021 Test Output</h2>



<pre class="wp-block-code"><code>Linear Regression:
Test accuracy: 0.7068965517241379 .Test cost: 0.14745936729023856

Logistic Regression:
Test accuracy: 0.646551724137931 .Test cost: 0.2865915372479961</code></pre>



<h2 class="wp-block-heading">Assimilated code</h2>



<p><a href="/examples/numpy_tutorials.py">Current tested source</a></p>



<h2>Additional Notes</h2><ul><li>The example does not use regularization or missing-value imputation.</li><li>Select parameters using validation data, then evaluate the selected model on held-out test data.</li><li>Squared loss and cross-entropy have different meanings; their raw values are not directly comparable.</li><li>The archived plots do not establish that one algorithm is better. A new comparison needs the corrected pipeline and a consistent evaluation protocol.</li></ul>
