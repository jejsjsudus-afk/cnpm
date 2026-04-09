"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ChartDatum = {
  name: string;
  value: number;
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ReportsCharts({
  gradeData,
  financeData
}: {
  gradeData: ChartDatum[];
  financeData: ChartDatum[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tỉ lệ Giỏi / Khá / Trung Bình</CardTitle>
          <CardDescription>Dựa trên GPA của toàn bộ sinh viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {gradeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tình hình Thu Học phí</CardTitle>
          <CardDescription>Số lượng hóa đơn theo trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financeData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Số lượng Hóa đơn" radius={[4, 4, 0, 0]}>
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Đã nộp" ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
