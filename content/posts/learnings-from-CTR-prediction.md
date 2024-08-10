---

title: "Learnings from getting back into Kaggle."
date: 2024-08-09T02:01:58+05:30
description: "Revisiting Kaggle and documenting feature engineering."
tags: [ai, agents]

---

#  Polars are better than Pandas
I recently came in touch with Polars after using Pandas for a long while. It has been some learning to migrate from Pandas to Polars. But Polars has been less reliant on RAM and utilizes cores efficiently. Polars is written in Rust, and since Rust is a low level language, it is faster. It also supports Parallelism. On the other hand, Pandas is built on top of NumPy, which in turn is built in C, which should solve inefficiencies, but since there is a level of abstraction of NumPy, the memory handling of Python comes in between. Further Polars uses Arrow Memory, Pandas 2.0 uses PyArrow but Polars implemented their own version of Arrow for efficiency. Here are two articles talkign about Polars, Arrows and Pandas: [here](https://blog.jetbrains.com/pycharm/2024/07/polars-vs-pandas/) and [here](https://datapythonista.me/blog/pandas-20-and-the-arrow-revolution-part-i). The **downside** is the lack of compatibilty with various python libraries or other tools and frameworks. 

Below is some of my code that uses Polars while working on Kaggle.

```
import polars as pl
for column in numerical_cols:
    q1 = train_df[column].quantile(0.25)
    q3 = train_df[column].quantile(0.75)
    iqr = q3 - q1
    min_value = q1 - 1.5*iqr
    max_value = q3 + 1.5*iqr
    train_df = train_df.with_columns(pl.when(pl.col(column) > max_value).then(q3).otherwise(pl.col(column)).alias(column))
    train_df = train_df.with_columns(pl.when(pl.col(column) < min_value).then(q1).otherwise(pl.col(column)).alias(column))

    print(train_df['click'].value_counts().filter(pl.col("click")==1)['count'][0]/(train_df['click'].value_counts().filter(pl.col("click")==0)['count'][0]+train_df['click'].value_counts().filter(pl.col("click")==1)['count'][0]) )
```

The above code is trying to handle outliers using capping, i.e. use IQR to cap outliers with max_value and min_value. Speaking of feature engineering.

# Feature Engineering

*Feature Engineering depends on the dataset and how each dataset performs when different steps are taken. The combination of feature engineering that can be done are endless. The below are expressed **generally**.

**Outlier Handling**

The above outlier only works for a Gaussian/Normal distribution. To understand Interquartile range, we first need to understand quartiles. Quartiles, in easier terms, are percentiles. If someone says 25% Quartile (or 1st Quartile), it means, 25% of the data falls behind it, if someone says, q2 or 50% Quartile, it means 50% of data falls behind it. Interquartile range is q3-q1. Where q3 refers to 75 percentile and q1 means, 25 percentile.

One method for Outlier Handling requires to cap to a max value and min value. For a gaussian distribution, the max value is found to be q3+1.5 * IQR. This goes very far away for a distribution as the standard deviation is more than 3. Similarly, the min values is q1-1.5 * IQR. 

Other methods for Outlier Handling includes removing the outliers altogether. In very rare cases, you can use algorithms like KNN to find the nearest neighbors and replace with a more appropriate value.

**Missing Values**

A good way to find missing values in the dataset(dataframe)is to use ```df.isnull().sum()```, if the values are 0 for all the columns in your dataset, it might mean there are no null values. But you can be tricked, so keep an eye for values like -1 or other set values that might signal missing values. If the values missing are very high it is better to remove the columns from the dataset all together. Very rarely does it mean, that it has an impact on the output.

Data can be missing at random, or some data might be missing because a certain group/entity withholds/doesn't have that information. These are classfied as **MAR**, Missing at Random or **MNAR**, Missing not at Random. **MCAR**, is when data is missing completely at random without there being any relationship between Missing Values and the column in question.

Imputation using **Mean, Mode and Median** are more ways to handle missing data. If you replace a lot of missing values with the above, you meddle with the distribution of the population/sample. Covariance, correlations might be affected, so analyzing different cases using test data would be a better approach.

There are more methods that include Random Sample Imputation or end of distribution imputation but these come with their own positives and negatives.

**Categorical Data Engineering**

For columns that are categorical, there are various ways to encode it into numerals as ML/DL models understand numerals.

One-hot encoding is converting the data into the number of distinct categories of a categorical into columns by *activating* the categoring as 1 and deactivating other categories as 0. The problem arises with one column having a lot of categories as it creates a sparse matrix which might be huge and memroy intensive. We can use **Frequency encoding** for this but, this suffers when there is a clear ordinality among the categories as they might not be indicative of the same and might disrupt the data further more. If two categories have the same frequency, this kind of encoding fails to distinguish between them.

Target Encoding is... well who will write and reinvent the wheel at times. [Here](https://towardsdatascience.com/dealing-with-categorical-variables-by-using-target-encoder-a0f1733a4c69)

