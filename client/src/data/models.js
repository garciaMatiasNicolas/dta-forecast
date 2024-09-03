const timeSeriesModels = [
    {
        value: "holtsWintersExponentialSmoothing",
        label: "Suavización Exponencial Holt-Winters",
        param: "holtsWinters",
    },
    {
        value: "holtsExponentialSmoothing",
        label: "Suavización Exponencial Holt",
        param: "holts",
    },
    {
        value: "exponential_moving_average",
        label: "Promedio Móvil Exponencial ",
        param: "ema",
    },
    {
        value: "simpleExponentialSmoothing",
        label: "Suavización Exponencial Simple",
        param: "simpleExponentialSmoothing",
    },
    {
        value: "arima",
        label: "ARIMA",
        param: "arima",
    },
    {
        value: "sarima",
        label: "SARIMA",
        param: "sarima",
    }
];

const exogModels = [
    {
        value: "arimax",
        label: "ARIMAX",
        param: "arimax",
    },
    {
        value: "sarimax",
        label: "SARIMAX",
        param: "sarimax",
    },
    {
        value: "prophet_exog",
        label: "Prophet (Exógenas)",
        param: "prophet_exog",
    }
];

const machineLearningModels = [
    {
        value: "linearRegression",
        label: "Regresión lineal",
        param: "linearRegression",
    },
    {
        value: "bayesian",
        label: "Regresion Bayesiana",
        param: "bayesian",
    },
    {
        value: "lasso",
        label: "Regresión Lasso",
        param: "lasso",
    },
    {
        value: "decisionTree",
        label: "Árbol de decisiones",
        param: "decisionTree",
    },
    {
        value: "lstm",
        label: "LSTM",
        param: "lstm",
    }/* ,
    {
        value: "tsmixer",
        label: "TSMixer",
        param: "tsmixer",
    } */
];

export {timeSeriesModels, exogModels, machineLearningModels}