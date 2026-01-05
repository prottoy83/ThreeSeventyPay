import { useEffect, useState } from 'react';
import './ExpensePrediction.css';

interface Prediction {
    category: string;
    predictedAmount: number;
    historicalAverage: number;
    confidence: number;
}

interface PredictionData {
    success: boolean;
    message?: string;
    predictions: Prediction[];
    totalPredicted: number;
    trainingDataPoints?: number;
}

interface CategoryInsight {
    category: string;
    amount: number;
    percentage: number;
}

interface InsightsData {
    totalSpent: number;
    categoryBreakdown: CategoryInsight[];
    monthlyTrend: { month: string; amount: number }[];
    transactionCount: number;
}

const ExpensePrediction = () => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'predictions' | 'insights'>('predictions');

    useEffect(() => {
        fetchPredictions();
        fetchInsights();
    }, []);

    const fetchPredictions = async () => {
        // Get UID from user object
        const userStr = localStorage.getItem('user');
        console.log('🔍 User string from localStorage:', userStr);

        if (!userStr) {
            console.log('❌ No user found in localStorage');
            setLoading(false);
            return;
        }

        let uid;
        try {
            const user = JSON.parse(userStr);
            uid = user.uid;
            console.log('✅ Parsed user object:', user);
            console.log('✅ Extracted UID:', uid);
        } catch (e) {
            console.error('❌ Failed to parse user object:', e);
            setLoading(false);
            return;
        }

        if (!uid) {
            console.log('❌ No UID in user object');
            setLoading(false);
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const url = `http://localhost:5990/predictions/predictions/${uid}`;
            console.log('📡 Fetching from:', url);

            const response = await fetch(url, { signal: controller.signal });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('❌ Response not OK:', response.status);
                throw new Error('Failed to fetch predictions');
            }

            const data = await response.json();
            console.log('📊 Received data:', data);
            console.log('   - success:', data.success);
            console.log('   - predictions count:', data.predictions?.length);
            console.log('   - predictions:', data.predictions);

            setPredictionData(data);
            console.log('✅ State updated with prediction data');
        } catch (error: any) {
            console.error('❌ Failed to fetch predictions:', error);
            // Set empty state if fetch fails
            setPredictionData({
                success: false,
                message: error.name === 'AbortError'
                    ? "Request timed out. Please try again later."
                    : "Unable to load predictions. Please check your connection.",
                predictions: [],
                totalPredicted: 0
            });
        } finally {
            setLoading(false);
            console.log('✅ Loading complete');
        }
    };

    const fetchInsights = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            const uid = user.uid;
            if (!uid) return;

            const response = await fetch(`http://localhost:5990/predictions/insights/${uid}`);
            const data = await response.json();
            setInsightsData(data);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: string } = {
            'Food & Dining': '🍽️',
            'Shopping': '🛍️',
            'Transportation': '🚗',
            'Entertainment': '🎬',
            'Bills & Utilities': '💡',
            'Healthcare': '⚕️',
            'Transfer': '💸',
            'Other': '📦'
        };
        return icons[category] || '📦';
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Food & Dining': '#FF6B6B',
            'Shopping': '#4ECDC4',
            'Transportation': '#45B7D1',
            'Entertainment': '#FFA07A',
            'Bills & Utilities': '#98D8C8',
            'Healthcare': '#F7B731',
            'Transfer': '#A29BFE',
            'Other': '#95A5A6'
        };
        return colors[category] || '#95A5A6';
    };

    if (loading) {
        console.log('🔄 Rendering: Loading state');
        return (
            <div className="expense-prediction-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Analyzing your spending patterns with AI...</p>
                </div>
            </div>
        );
    }

    console.log('🎨 Rendering: Main component');
    console.log('   - predictionData:', predictionData);
    console.log('   - predictionData.success:', predictionData?.success);
    console.log('   - activeTab:', activeTab);

    return (
        <div className="expense-prediction-container">
            <div className="prediction-header">
                <div className="header-content">
                    <h2>🤖 AI Expense Insights</h2>
                    <p className="subtitle">Smart predictions based on your spending patterns</p>
                </div>
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('predictions')}
                    >
                        Predictions
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                        onClick={() => setActiveTab('insights')}
                    >
                        Insights
                    </button>
                </div>
            </div>

            {activeTab === 'predictions' && (
                <div className="predictions-tab">
                    {!predictionData?.success ? (
                        <>
                            {console.log('📭 Rendering: Empty state')}
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <h3>{predictionData?.message || 'No predictions available'}</h3>
                                <p>Start making transactions to unlock AI-powered expense predictions!</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="prediction-summary">
                                <div className="summary-card total-predicted">
                                    <div className="summary-icon">💰</div>
                                    <div className="summary-content">
                                        <span className="summary-label">Predicted Next Month</span>
                                        <span className="summary-value">
                                            ${predictionData.totalPredicted.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="summary-card data-points">
                                    <div className="summary-icon">📈</div>
                                    <div className="summary-content">
                                        <span className="summary-label">Training Data Points</span>
                                        <span className="summary-value">
                                            {predictionData.trainingDataPoints}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="predictions-grid">
                                {predictionData.predictions.map((prediction, index) => (
                                    <div
                                        key={index}
                                        className="prediction-card"
                                        style={{
                                            borderLeft: `4px solid ${getCategoryColor(prediction.category)}`
                                        }}
                                    >
                                        <div className="prediction-card-header">
                                            <span className="category-icon">
                                                {getCategoryIcon(prediction.category)}
                                            </span>
                                            <h4>{prediction.category}</h4>
                                        </div>

                                        <div className="prediction-amounts">
                                            <div className="amount-item predicted">
                                                <span className="amount-label">AI Prediction</span>
                                                <span className="amount-value">
                                                    ${prediction.predictedAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="amount-item historical">
                                                <span className="amount-label">Historical Avg</span>
                                                <span className="amount-value">
                                                    ${prediction.historicalAverage.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="confidence-bar">
                                            <div className="confidence-label">
                                                <span>Confidence</span>
                                                <span>{Math.round(prediction.confidence)}%</span>
                                            </div>
                                            <div className="confidence-progress">
                                                <div
                                                    className="confidence-fill"
                                                    style={{
                                                        width: `${prediction.confidence}%`,
                                                        backgroundColor: getCategoryColor(prediction.category)
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {prediction.predictedAmount > prediction.historicalAverage * 1.2 && (
                                            <div className="alert-badge increase">
                                                ⚠️ 20%+ increase predicted
                                            </div>
                                        )}
                                        {prediction.predictedAmount < prediction.historicalAverage * 0.8 && (
                                            <div className="alert-badge decrease">
                                                ✅ Spending may decrease
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="insights-tab">
                    {!insightsData || insightsData.transactionCount === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No insights available yet</h3>
                            <p>Make some transactions to see your spending insights!</p>
                        </div>
                    ) : (
                        <>
                            <div className="insights-summary">
                                <div className="summary-card">
                                    <div className="summary-icon">💳</div>
                                    <div className="summary-content">
                                        <span className="summary-label">Total Spent (6 months)</span>
                                        <span className="summary-value">
                                            ${insightsData.totalSpent.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon">📝</div>
                                    <div className="summary-content">
                                        <span className="summary-label">Total Transactions</span>
                                        <span className="summary-value">
                                            {insightsData.transactionCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="category-breakdown">
                                <h3>Spending by Category</h3>
                                <div className="category-list">
                                    {insightsData.categoryBreakdown.map((cat, index) => (
                                        <div key={index} className="category-item">
                                            <div className="category-info">
                                                <span className="category-icon">
                                                    {getCategoryIcon(cat.category)}
                                                </span>
                                                <span className="category-name">{cat.category}</span>
                                            </div>
                                            <div className="category-stats">
                                                <span className="category-amount">
                                                    ${cat.amount.toFixed(2)}
                                                </span>
                                                <span className="category-percentage">
                                                    {cat.percentage}%
                                                </span>
                                            </div>
                                            <div className="category-bar">
                                                <div
                                                    className="category-bar-fill"
                                                    style={{
                                                        width: `${cat.percentage}%`,
                                                        backgroundColor: getCategoryColor(cat.category)
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="monthly-trend">
                                <h3>Monthly Spending Trend</h3>
                                <div className="trend-chart">
                                    {insightsData.monthlyTrend.map((month, index) => {
                                        const maxAmount = Math.max(...insightsData.monthlyTrend.map(m => m.amount));
                                        const heightPercent = (month.amount / maxAmount) * 100;

                                        return (
                                            <div key={index} className="trend-bar-container">
                                                <div className="trend-bar-wrapper">
                                                    <div
                                                        className="trend-bar"
                                                        style={{ height: `${heightPercent}%` }}
                                                    >
                                                        <span className="trend-amount">
                                                            ${month.amount.toFixed(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="trend-label">{month.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExpensePrediction;
