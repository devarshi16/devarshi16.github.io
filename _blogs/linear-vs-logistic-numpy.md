---
layout: blog_post
title: "Linear vs Logistic Regression, all in Numpy"
date: 2021-07-20
description: "The two entry level machine learning algorithms , linear and logistic regression are quite easy to understand and provide a good way to practice coding the general machine learning pipeline, in their vectorized form. Namely, Prepping the dataset, eg: removing outliers, adding features(polynomial multiples of existing features), normalization, feature scaling. Implementing the learning algorithm function. [...]"
thumbnail: "/assets/images/blogs/wordpress/2021/07/logistic.png"
tags: ["Algorithms","algorithms comparision","linear regression","linear-regression","logistic regression"]
---


<p class="wp-block-paragraph">The two entry level machine learning algorithms , linear and logistic regression are quite easy to understand and provide a good way to practice coding the general machine learning pipeline, in their vectorized form. Namely, </p>



<ul class="wp-block-list"><li>Prepping the dataset, eg: removing outliers, adding features(polynomial multiples of existing features), normalization, feature scaling.</li><li>Implementing the learning algorithm function.</li><li>Calculating the loss through the chosen loss function and hypothesis.</li><li>Optimization algorithm &#8211; Update you model&#8217;s parameters depending on the loss and ground truth.</li><li>Maintaining a config file for the total training process.</li></ul>



<p class="wp-block-paragraph">An entry level toy dataset: <a href="https://www.kaggle.com/uciml/pima-indians-diabetes-database">pima indians diabetes dataset</a>, has a target of one variable for each datapoint(a binary classification task of predicting whether a person has diabetes or not), will be used for the sake of this tutorial blog.</p>



<h2 class="wp-block-heading">About the dataset</h2>



<p class="wp-block-paragraph">You can know all about the dataset on <a href="https://www.kaggle.com/uciml/pima-indians-diabetes-database">Kaggle</a>. The dataset has around <code>768</code> datapoints and <code>8</code> features, which is quite a sweet spot for having a decent model without worrying about underfitting. The data is about female patients, specifically, their BMI, insulin level, age, skin thickness, glucose level etc. The target tells if the person has diabetes or not. <code>500</code> of all the datapoints are non-diabetic. <code>268</code> are diabetic. The data is not highly skewed so normal test accuracy should suffice(no need to find precision, recall and <code>F1</code> score).</p>



<h2 class="wp-block-heading">Helper Functions</h2>



<h4 class="wp-block-heading">For normalizing the dataset</h4>



<p class="wp-block-paragraph">This helps in normalizing the data and bringing them in a range of <code>0-1</code>.</p>



<pre class="wp-block-code"><code>def scalify_min_max(np_dataframe):
    minimum_array=np.amin(np_dataframe,axis=0)
    maximum_array=np.amax(np_dataframe,axis=0)
    range_array = maximum_array-minimum_array

    scaled = (np_dataframe-minimum_array)/range_array
    return scaled</code></pre>



<h4 class="wp-block-heading">For calculating the accuracy</h4>



<pre class="wp-block-code"><code>def accuracy_calculator(Y_out,Y):
    accuracy=np.sum(np.logical_not(np.logical_xor(Y_out,Y)))/Y.shape&#091;0]
    true_positives=np.sum(np.logical_and(Y_out,Y))
    false_positives=np.sum(np.logical_and(Y_out,np.logical_not(Y)))
    false_negatives=np.sum(np.logical_and(np.logical_not(Y_out),Y))
    precision=true_positives/(true_positives+false_positives)
    recall=true_positives/(true_positives+false_negatives)
    print("Precision:",precision,".Recall:",recall)
    F1_score=precision*recall/(precision+recall)
    return &#091;accuracy,precision,recall,F1_score]</code></pre>



<h4 class="wp-block-heading">For preparing the dataset &#8211; creating train/val/test splits</h4>



<pre class="wp-block-code"><code>def pre_data_prep(filename,dest_fileloc):
    with open(filename,'rb') as f:
        gzip_fd=gzip.GzipFile(fileobj=f)
        next(gzip_fd)#Skip first row
        diabetes_df = loadtxt(gzip_fd,delimiter=',',dtype=np.float32)
    Y=diabetes_df&#091;:,-1]
    scaled_diabetes_df = scalify_min_max(diabetes_df&#091;:,:-1])
    concat_diabetes = np.concatenate((scaled_diabetes_df,np.array(&#091;Y]).T),axis=1)
    savetxt(dest_fileloc,concat_diabetes,delimiter=',')

def dataprep(fileloc,split):
    assert len(split) == 3
    assert sum(split) == 1
    diabetes_data = loadtxt(fileloc,delimiter=',',dtype=np.float32)
    Y=np.array(&#091;diabetes_data&#091;:,-1]]).T
    classes = np.unique(Y)
    assert len(classes) == 2
    X=diabetes_data&#091;:,:-1]
    data_size=X.shape&#091;0]
    print(data_size,X.shape,Y.shape)

    split_size=int(split&#091;0]*data_size)
    val_split=int(split&#091;0]*data_size)
    X_train=X&#091;:split_size]
    X_val=X&#091;split_size:split_size+val_split]
    X_test=X&#091;split_size+val_split:]
    Y_train=Y&#091;:split_size]
    Y_val=Y&#091;split_size:split_size+val_split]
    Y_test=Y&#091;split_size+val_split:]
    return X_train,X_val,X_test,Y_train,Y_val,Y_test</code></pre>



<h4 class="wp-block-heading">Evaluation function</h4>



<p class="wp-block-paragraph">For for finding accuracy of learned model on the test dataset.</p>



<pre class="wp-block-code"><code>def evaluate(theta_params,X,Y=None,thresh=0.5):
    data_size=X.shape&#091;0]
    X_extend=np.concatenate((np.ones((data_size,1)),X),axis=1)
    pred = np.greater(np.matmul(X_extend,theta_params),thresh)*1
    cost=np.sum(np.square(np.matmul(X_extend,theta_params)-Y))/(data_size*2)
    return pred,cost</code></pre>



<h2 class="wp-block-heading">Logistic Regression Function</h2>



<pre class="wp-block-code"><code>def sigmoid_func(theta,X):
    retval = 1/(1+np.exp(-1*np.matmul(theta.T,X)))
    return retval
    
def logistic_regression(X,Y,learning_rate=0.001,num_iters=100,thresh=0.5,rand_seed=None):
    if rand_seed!=None:#For reproducible results
        np.random.seed(rand_seed)
    data_size = X.shape&#091;0]
    theta_params=np.array(&#091;np.random.randn(X.shape&#091;1]+1)]).T
    #Add bias column to X
    X_extend = np.concatenate((np.ones((data_size,1)),X),axis=1).T
    cost=&#091;]#Keep track of cost after each iteration of learning
    for i in tqdm(range(num_iters),desc="Training.."):
        h_theta=sigmoid_func(theta_params,X_extend).T#mX1
        grad=np.matmul(X_extend,(h_theta-Y))/data_size#nXm*mX1=nX1
        theta_params=theta_params-learning_rate*grad
        cost.append(-1*np.sum(Y*np.log(h_theta)+(1-Y)*np.log(1-h_theta))/(data_size))
    final_pred = np.greater(np.matmul(X_extend.T,theta_params),thresh)*1
    accuracy=np.sum(np.logical_not(np.logical_xor(final_pred,Y)))/data_size
    cost=np.array(cost)
    return theta_params,accuracy,cost</code></pre>



<h2 class="wp-block-heading">Linear Regression Function</h2>



<pre class="wp-block-code"><code>def linear_regression(X,Y,learning_rate=0.001,num_iters=100,thresh=0.5,rand_seed=None):
    if rand_seed!=None:
        np.random.seed(rand_seed)
    data_size = X.shape&#091;0]
    #print(X.shape,Y.shape)
    theta_params=np.array(&#091;np.random.randn(X.shape&#091;1]+1)]).T
    X_extend = np.concatenate((np.ones((data_size,1)),X),axis=1)
    cost=&#091;]
    for i in tqdm(range(num_iters),desc="Training.."):
        theta_params=theta_params-learning_rate*np.matmul((np.matmul(theta_params.T,X_extend.T)-Y.T),X_extend).T/data_size
        cost.append(np.sum(np.square(np.matmul(X_extend,theta_params)-Y)&#091;0])/(data_size*2))
    final_pred = np.greater(np.matmul(X_extend,theta_params),thresh)*1
    accuracy=np.sum(np.logical_not(np.logical_xor(final_pred,Y)))/data_size
    cost=np.array(cost)
    return theta_params,accuracy,cost</code></pre>



<h2 class="wp-block-heading">Runner functions for Linear and Logistic Regressions</h2>



<pre class="wp-block-code"><code>#######################--------Linear RUNNER---------###############################
def regression_runner(fileloc,data_split_ratios,seed_values):
    X_train,X_val,X_test,Y_train,Y_val,Y_test = dataprep(fileloc,data_split_ratios)
    all_models=&#091;]
    all_val_accuracies=&#091;]
    random_seeds=seed_values
    num_iters=500
    x_axis=np.arange(num_iters)
    for i in range(len(random_seeds)):
        model,train_accuracy,cost=linear_regression(X_train,Y_train,rand_seed=random_seeds&#091;i],num_iters=num_iters)
        print("Trial:",i,".Train Accuracy:",train_accuracy)
        all_models.append(model)
        plt.plot(x_axis,cost,label=str(random_seeds&#091;i]))
        
        val_prediction,val_cost=evaluate(model,X_val,Y_val)
        accuracy_precision=accuracy_calculator(val_prediction,Y_val)
        all_val_accuracies.append(accuracy_precision&#091;0])
        print("Validation Accuracy:",accuracy_precision)
        print("Validation Cost:",val_cost)

    #plt.legend()
    plt.title("Linear Regression")
    plt.xlabel('Number of iterations')
    plt.ylabel('Cost')
    plt.show()
    max_accuracy_idx=np.where(all_val_accuracies==np.amax(all_val_accuracies))&#091;0]&#091;0]
    best_model=all_models&#091;max_accuracy_idx]
    print(best_model.shape)
    #print(X_test.shape,Y_test.shape)
    test_pred,test_cost=evaluate(best_model,X_test,Y_test)
    print(test_pred.shape,print(test_cost))
    test_accuracy,test_precision,test_recall,test_f1=accuracy_calculator(test_pred,Y_test)
    print("Test accuracy:",test_accuracy,".Test cost:",test_cost)

#####################-------------LOGISTIC RUNNER--------------##########################
def logistic_runner(fileloc,data_split_ratios,seed_values):
    X_train,X_val,X_test,Y_train,Y_val,Y_test = dataprep(fileloc,data_split_ratios)
    all_models=&#091;]
    all_val_accuracies=&#091;]
    random_seeds=seed_values
    num_iters=1500
    x_axis=np.arange(num_iters)
    for i in range(10):
        model,train_accuracy,cost=logistic_regression(X_train,Y_train,rand_seed=random_seeds&#091;i],num_iters=num_iters)
        print("Trial:",i,".Train Accuracy:",train_accuracy)
        all_models.append(model)
        plt.plot(x_axis,cost,label=str(random_seeds&#091;i]))

        val_prediction,val_cost=evaluate(model,X_val,Y_val)
        accuracy_precision=accuracy_calculator(val_prediction,Y_val)
        all_val_accuracies.append(accuracy_precision&#091;0])
        print("Validation Accuracy:",accuracy_precision)
        print("Validation Cost:",val_cost)
    #plt.legend()
    plt.title("Logistic Regression")
    plt.xlabel('Number of iterations')
    plt.ylabel('Cost')
    plt.show()
    max_accuracy_idx=np.where(all_val_accuracies==np.amax(all_val_accuracies))&#091;0]&#091;0]
    best_model=all_models&#091;max_accuracy_idx]

    test_pred,test_cost=evaluate(best_model,X_test,Y_test)
    #print(test_pred.shape,print(test_cost))
    test_accuracy,test_precision,test_recall,test_f1=accuracy_calculator(test_pred,Y_test)
    print("Test accuracy:",test_accuracy,".Test cost:",test_cost)</code></pre>



<h2 class="wp-block-heading">Training Curves</h2>



<p class="wp-block-paragraph">Note that each of the below two trainings was performed with <code>10</code> different values of initial theta. The initial value of theta effects the overall training performance. The best of the <code>10</code> was taken in consideration for the final evaluation on the test dataset.</p>



<div class="wp-block-image is-style-default"><figure class="aligncenter size-large"><img data-attachment-id="585" data-permalink="https://attackonalgorithms.wordpress.com/linear/" data-orig-file="/assets/images/blogs/wordpress/2021/07/linear.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="linear" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/linear.png" data-large-file="/assets/images/blogs/wordpress/2021/07/linear.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/linear.png" alt="linear regression training" class="wp-image-585" srcset="/assets/images/blogs/wordpress/2021/07/linear.png 640w, /assets/images/blogs/wordpress/2021/07/linear.png 150w, /assets/images/blogs/wordpress/2021/07/linear.png 300w" sizes="(max-width: 640px) 100vw, 640px" /></figure></div>



<div class="wp-block-image"><figure class="aligncenter size-large"><img data-attachment-id="587" data-permalink="https://attackonalgorithms.wordpress.com/logistic/" data-orig-file="/assets/images/blogs/wordpress/2021/07/logistic.png" data-orig-size="640,480" data-comments-opened="1" data-image-meta="{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}" data-image-title="logistic" data-image-description="" data-image-caption="" data-medium-file="/assets/images/blogs/wordpress/2021/07/logistic.png" data-large-file="/assets/images/blogs/wordpress/2021/07/logistic.png" loading="lazy" width="640" height="480" src="/assets/images/blogs/wordpress/2021/07/logistic.png" alt="logistic regression training" class="wp-image-587" srcset="/assets/images/blogs/wordpress/2021/07/logistic.png 640w, /assets/images/blogs/wordpress/2021/07/logistic.png 150w, /assets/images/blogs/wordpress/2021/07/logistic.png 300w" sizes="(max-width: 640px) 100vw, 640px" /></figure></div>



<h2 class="wp-block-heading">Test Accuracies</h2>



<pre class="wp-block-code"><code>Linear Regression:
Test accuracy: 0.7068965517241379 .Test cost: 0.14745936729023856

Logistic Regression:
Test accuracy: 0.646551724137931 .Test cost: 0.2865915372479961</code></pre>



<h2 class="wp-block-heading">Assimilated code</h2>



<p class="wp-block-paragraph"><a href="https://gist.github.com/cd09e245ffaf64eaf780ab346b2d0599.git">Gist Link</a></p>



<h2 class="wp-block-heading">Additional Notes</h2>



<ul class="wp-block-list"><li>The above code does not use regularization.</li><li>It may appear that for a few curves training was stopped prematurely, but infact the test results were more near optimal for the above training parameters.</li><li>Although linear regression appears to be performing better for the above case it might give poorer results for other datasets.</li><li>Note that logistic regression took 3X as many iterations as linear regression to converge.</li><li>Initial model parameters are chosen randomly by varying the seed values. Initial model parameters(theta) effects the overall training performance, hence 10 such values were taken.</li></ul>



<p class="wp-block-paragraph"></p>

