"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "CDB CDI+", taxa: 14.8 },
  { name: "CDB IPCA+", taxa: 11.2 },
  { name: "CDB Pré", taxa: 13.5 },
  { name: "CRA IPCA+", taxa: 11.0 },
  { name: "LCI", taxa: 10.8 },
  { name: "DEB", taxa: 10.4 },
];

const BAR_COLORS: Record<string, string> = {
  "CDB CDI+": "#003087",
  "CDB IPCA+": "#C8A951",
  "CDB Pré": "#6B6E7A",
  "CRA IPCA+": "#C8A951",
  "LCI": "#0D7A4E",
  "DEB": "#003087",
};

export function TaxaBarChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ left: 80, right: 40, top: 8, bottom: 8 }}
      >
        <XAxis
          type="number"
          domain={[9, 16]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{
            fontFamily: "DM Mono",
            fontSize: 11,
            fill: "#6B6E7A",
          }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{
            fontFamily: "DM Mono",
            fontSize: 11,
            fill: "#1A1C23",
          }}
        />
        <Tooltip
          formatter={(v: unknown) => [`${Number(v).toFixed(2)}% a.a.`, "Taxa média"]}
          contentStyle={{
            fontFamily: "Sora",
            fontSize: 12,
            border: "1px solid #EDEEF2",
          }}
        />
        <Bar dataKey="taxa" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={BAR_COLORS[entry.name] ?? "#003087"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
