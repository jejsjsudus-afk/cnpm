"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Cpu, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { approveGraduation, autoApproveGraduation } from "./actions";

function formatDate(dateString: string | Date | null) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const padding = (n: number) => n.toString().padStart(2, "0");
  return `${padding(date.getDate())}/${padding(date.getMonth() + 1)}/${date.getFullYear()}`;
}


type StudentData = {
  id: string;
  mssv: string;
  totalCredits: number;
  currentGPA: number;
  graduationDate: Date | null;
  user: {
    name: string;
  };
};

interface GraduationClientProps {
  eligibleStudents: StudentData[];
  graduatedStudents: StudentData[];
}

export function GraduationClient({ eligibleStudents, graduatedStudents }: GraduationClientProps) {
  const [isPending, startTransition] = useTransition();
  const handleApprove = (studentId: string, name: string) => {
    startTransition(async () => {
      const result = await approveGraduation(studentId);
      if (result.success) {
        alert(`Thành công: Đã công nhận tốt nghiệp cho sinh viên ${name}.`);
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    });
  };

  const handleAutoApprove = () => {
    startTransition(async () => {
      const result = await autoApproveGraduation();
      if (result.success) {
        alert(`Hoàn tất xét duyệt: ${result.count ? `Đã công nhận thành công ${result.count} sinh viên.` : result.message}`);
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    });
  };

  const getRank = (gpa: number) => {
    if (gpa >= 3.6) return "Xuất sắc";
    if (gpa >= 3.2) return "Giỏi";
    if (gpa >= 2.5) return "Khá";
    return "Trung Bình";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" />
            Xét Tốt Nghiệp
          </h1>
          <p className="text-slate-500">Quản lý và xét duyệt danh sách sinh viên đủ điều kiện ra trường</p>
        </div>
        <Button 
          onClick={handleAutoApprove} 
          disabled={isPending || eligibleStudents.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm shrink-0"
        >
           <Cpu className="h-4 w-4" />
           {isPending ? "Đang xử lý..." : "Chạy Thuật toán Xét duyệt"}
        </Button>
      </div>

      <Tabs defaultValue="eligible" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="eligible" className="font-semibold">
            Dự kiến Tốt nghiệp ({eligibleStudents.length})
          </TabsTrigger>
          <TabsTrigger value="graduated" className="font-semibold">
            Đã Tốt nghiệp ({graduatedStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eligible">
          <Card className="shadow-sm border-t-4 border-t-emerald-500 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách Đủ điều kiện</CardTitle>
                <CardDescription className="mt-1">TC &ge; 120, GPA &ge; 2.0 và hoàn thành đóng học phí.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-h-[300px]">
                 {eligibleStudents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="w-16 text-center">STT</TableHead>
                          <TableHead className="w-32">MSSV</TableHead>
                          <TableHead>Họ và Tên</TableHead>
                          <TableHead className="text-center">Số TC Tích lũy</TableHead>
                          <TableHead className="text-center">GPA Hệ 4</TableHead>
                          <TableHead className="text-center">Xếp loại</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eligibleStudents.map((student, idx) => {
                           const rank = getRank(student.currentGPA);
                           return (
                              <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="text-center text-slate-400">{idx + 1}</TableCell>
                                <TableCell className="font-mono text-sm font-medium text-slate-600">{student.mssv}</TableCell>
                                <TableCell className="font-bold text-slate-900">{student.user.name}</TableCell>
                                <TableCell className="text-center font-bold text-blue-600">{student.totalCredits}</TableCell>
                                <TableCell className="text-center font-bold text-slate-800">{student.currentGPA.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                   <Badge variant={rank === "Giỏi" || rank === "Xuất sắc" ? "default" : rank === "Khá" ? "secondary" : "outline"} className={rank === "Giỏi" || rank === "Xuất sắc" ? "bg-orange-500 hover:bg-orange-600" : ""}>
                                      {rank}
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleApprove(student.id, student.user.name)}
                                      disabled={isPending}
                                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                      Công nhận
                                    </Button>
                                </TableCell>
                              </TableRow>
                           )
                        })}
                      </TableBody>
                    </Table>
                 ) : (
                    <div className="text-center py-16 text-slate-500">
                      <Award className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                      <p>Không có sinh viên nào đủ điều kiện tốt nghiệp lúc này.</p>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graduated">
          <Card className="shadow-sm border-t-4 border-t-blue-500 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách Sinh viên Đã tốt nghiệp</CardTitle>
                <CardDescription className="mt-1">Các sinh viên đã được hệ thống công nhận.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-h-[300px]">
                 {graduatedStudents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="w-16 text-center">STT</TableHead>
                          <TableHead className="w-32">MSSV</TableHead>
                          <TableHead>Họ và Tên</TableHead>
                          <TableHead className="text-center">Xếp loại</TableHead>
                          <TableHead className="text-center">Ngày duyệt</TableHead>
                          <TableHead className="text-right">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {graduatedStudents.map((student, idx) => {
                           const rank = getRank(student.currentGPA);
                           return (
                              <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="text-center text-slate-400">{idx + 1}</TableCell>
                                <TableCell className="font-mono text-sm font-medium text-slate-600">{student.mssv}</TableCell>
                                <TableCell className="font-bold text-slate-900">{student.user.name}</TableCell>
                                <TableCell className="text-center">
                                   <Badge variant="outline" className="text-slate-600 font-medium">
                                      {rank}
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-center text-slate-500 text-sm">
                                   {formatDate(student.graduationDate)}
                                </TableCell>
                                <TableCell className="text-right">
                                   <div className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                      <CheckCircle className="h-4 w-4" /> Đã công nhận
                                   </div>
                                </TableCell>
                              </TableRow>
                           )
                        })}
                      </TableBody>
                    </Table>
                 ) : (
                    <div className="text-center py-16 text-slate-500">
                      <GraduationCap className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                      <p>Chưa có sinh viên nào được công nhận tốt nghiệp.</p>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
