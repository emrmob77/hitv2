import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface Forecast {
  date: string;
  predicted_value: number;
  confidence_lower: number;
  confidence_upper: number;
  confidence_level: number; // 0-100
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage_change: number;
  average_growth_rate: number;
  volatility: number;
}

/**
 * Predictive Analytics Engine
 *
 * Implements time series forecasting using simple statistical methods:
 * - Moving averages
 * - Linear regression
 * - Exponential smoothing
 */
export class PredictiveAnalytics {
  /**
   * Forecast future values using exponential smoothing
   */
  static forecast(
    historicalData: TimeSeriesDataPoint[],
    periodsAhead: number = 7,
    alpha: number = 0.3
  ): Forecast[] {
    if (historicalData.length < 2) {
      return [];
    }

    // Sort data by date
    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate exponential moving average
    const forecast: Forecast[] = [];
    let lastValue = sortedData[0].value;
    let smoothedValue = lastValue;

    // Apply exponential smoothing to historical data
    for (let i = 1; i < sortedData.length; i++) {
      smoothedValue = alpha * sortedData[i].value + (1 - alpha) * smoothedValue;
    }

    // Calculate standard deviation for confidence intervals
    const values = sortedData.map((d) => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Generate forecasts
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    for (let i = 1; i <= periodsAhead; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);

      // Confidence intervals widen with forecast horizon
      const confidenceMultiplier = 1.96 * (1 + (i - 1) * 0.1); // 95% confidence
      const marginOfError = stdDev * confidenceMultiplier;

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted_value: Math.round(smoothedValue),
        confidence_lower: Math.max(0, Math.round(smoothedValue - marginOfError)),
        confidence_upper: Math.round(smoothedValue + marginOfError),
        confidence_level: Math.max(50, 95 - i * 5), // Confidence decreases over time
      });
    }

    return forecast;
  }

  /**
   * Analyze trend in time series data
   */
  static analyzeTrend(data: TimeSeriesDataPoint[]): TrendAnalysis {
    if (data.length < 2) {
      return {
        trend: 'stable',
        percentage_change: 0,
        average_growth_rate: 0,
        volatility: 0,
      };
    }

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate linear regression
    const n = sortedData.length;
    const sumX = sortedData.reduce((sum, _, i) => sum + i, 0);
    const sumY = sortedData.reduce((sum, d) => sum + d.value, 0);
    const sumXY = sortedData.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = sortedData.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculate percentage change
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[n - 1].value;
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (slope > 0.5) {
      trend = 'increasing';
    } else if (slope < -0.5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // Calculate volatility (standard deviation)
    const mean = sumY / n;
    const variance = sortedData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / n;
    const volatility = Math.sqrt(variance);

    // Calculate average growth rate
    const growthRates: number[] = [];
    for (let i = 1; i < n; i++) {
      if (sortedData[i - 1].value > 0) {
        growthRates.push(
          ((sortedData[i].value - sortedData[i - 1].value) / sortedData[i - 1].value) * 100
        );
      }
    }
    const averageGrowthRate =
      growthRates.length > 0
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
        : 0;

    return {
      trend,
      percentage_change: percentageChange,
      average_growth_rate: averageGrowthRate,
      volatility,
    };
  }

  /**
   * Predict affiliate earnings for next period
   */
  static async forecastAffiliateEarnings(
    userId: string,
    daysAhead: number = 30
  ): Promise<Forecast[]> {
    const supabase = await createSupabaseServerClient();

    // Get historical earnings data (last 90 days)
    const { data } = await supabase
      .from('analytics_events')
      .select('created_at, metadata')
      .eq('user_id', userId)
      .eq('event_type', 'affiliate_click')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate by day
    const dailyEarnings: Record<string, number> = {};
    data.forEach((event) => {
      const date = event.created_at.split('T')[0];
      const earnings = (event.metadata as any)?.estimated_earnings || 0;
      dailyEarnings[date] = (dailyEarnings[date] || 0) + earnings;
    });

    const timeSeriesData: TimeSeriesDataPoint[] = Object.entries(dailyEarnings).map(
      ([date, value]) => ({
        date,
        value,
      })
    );

    return this.forecast(timeSeriesData, daysAhead);
  }

  /**
   * Predict bookmark growth
   */
  static async forecastBookmarkGrowth(
    userId: string,
    daysAhead: number = 30
  ): Promise<Forecast[]> {
    const supabase = await createSupabaseServerClient();

    // Get historical bookmark creation data
    const { data } = await supabase
      .from('bookmarks')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate by day
    const dailyCounts: Record<string, number> = {};
    data.forEach((bookmark) => {
      const date = bookmark.created_at.split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const timeSeriesData: TimeSeriesDataPoint[] = Object.entries(dailyCounts).map(
      ([date, value]) => ({
        date,
        value,
      })
    );

    return this.forecast(timeSeriesData, daysAhead);
  }

  /**
   * Detect anomalies in time series data
   */
  static detectAnomalies(data: TimeSeriesDataPoint[], threshold: number = 2): string[] {
    if (data.length < 3) {
      return [];
    }

    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: string[] = [];
    data.forEach((point) => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push(point.date);
      }
    });

    return anomalies;
  }

  /**
   * Calculate moving average
   */
  static calculateMovingAverage(
    data: TimeSeriesDataPoint[],
    windowSize: number = 7
  ): TimeSeriesDataPoint[] {
    if (data.length < windowSize) {
      return data;
    }

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const movingAverage: TimeSeriesDataPoint[] = [];
    for (let i = windowSize - 1; i < sortedData.length; i++) {
      const window = sortedData.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, d) => sum + d.value, 0) / windowSize;
      movingAverage.push({
        date: sortedData[i].date,
        value: Math.round(average),
      });
    }

    return movingAverage;
  }
}
