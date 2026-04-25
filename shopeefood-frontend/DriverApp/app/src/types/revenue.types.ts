export interface Revenue{
    total_revenue: number,
    chart_data:ChartData[]
}

export interface ChartData{
    label: string,
    revenue: number
}