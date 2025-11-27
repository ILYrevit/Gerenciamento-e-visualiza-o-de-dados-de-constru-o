import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataItem } from "@/types/data";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface FinishChartProps {
  data: DataItem[];
}

interface PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

interface LegendEntry {
  value: string;
  color: string;
}

interface LegendProps {
  payload?: LegendEntry[];
}

interface TooltipPayload {
  payload: {
    count: number;
  };
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export const FinishChart = ({ data }: FinishChartProps) => {
  const finishGroups = data.reduce((acc, item) => {
    const finish = item.ACABAMENTO;
    if (!acc[finish]) {
      acc[finish] = { name: finish, value: 0, count: 0 };
    }
    acc[finish].value += item.AREA_CALCULADA;
    acc[finish].count += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>);

  const chartData = Object.values(finishGroups)
    .map(item => ({
      name: item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name,
      value: Number(item.value.toFixed(2)),
      count: item.count
    }))
    .sort((a, b) => b.value - a.value);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Não mostra label para fatias muito pequenas

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="13px"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderCustomLegend = (props: LegendProps) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4 px-2">
        {payload?.map((entry: LegendEntry, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate max-w-[150px] text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Distribuição por Acabamento</CardTitle>
        <CardDescription>Área total por tipo de acabamento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string, props: TooltipPayload) => [
                `${value.toFixed(2)} m² (${props.payload.count} itens)`,
                'Área Total'
              ]}
            />
            <Legend
              content={renderCustomLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
