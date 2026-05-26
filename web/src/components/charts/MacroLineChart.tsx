"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  data: string;
  selic: number;
  ipca: number;
}

interface MacroLineChartProps {
  data: ChartData[];
}

export function MacroLineChart({ data }: MacroLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDEEF2" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6B6E7A" }}
          tickFormatter={(d: string) => d.slice(0, 5)}
        />
        <YAxis
          tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6B6E7A" }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            fontFamily: "Sora",
            fontSize: 12,
            border: "1px solid #EDEEF2",
          }}
          formatter={(v: unknown, name: unknown) => [
            `${Number(v).toFixed(4)}%`,
            String(name).toUpperCase(),
          ]}
        />
        <Legend
          wrapperStyle={{ fontFamily: "Sora", fontSize: 12 }}
          iconType="circle"
        />
        <Line
          type="monotone"
          dataKey="selic"
          stroke="#003087"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Selic"
        />
        <Line
          type="monotone"
          dataKey="ipca"
          stroke="#C8A951"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="IPCA"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
