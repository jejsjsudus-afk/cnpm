"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { markNotificationAsRead } from "./actions";
import { cn } from "@/lib/utils";

export function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await markNotificationAsRead(id);
    }
  }

  if (notifications.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center text-slate-500">
          Bạn chưa có thông báo nào.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((item) => (
        <Card 
          key={item.id} 
          onClick={() => handleClick(item.id, item.isRead)}
          className={cn(
            "cursor-pointer transition-colors hover:bg-slate-50 shadow-sm border-l-4",
            !item.isRead ? "border-l-orange-500 bg-orange-50/50" : "border-l-slate-200"
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <CardTitle className={cn("text-base", !item.isRead ? "text-slate-900" : "text-slate-600 font-medium")}>
                  {item.notification.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Từ: {item.notification.sender.user.name} 
                  {item.notification.classSection && ` - Lớp ${item.notification.classSection.course.name}`}
                </CardDescription>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {new Date(item.notification.date).toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.notification.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
