export function calculateStats(history) {
    if (!history || history.length === 0) return null;
    const values = history.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min: min.toFixed(1), max: max.toFixed(1), avg: avg.toFixed(1) };
}
