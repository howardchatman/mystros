"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Mail, MailOpen } from "lucide-react";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

const categoryIcons: Record<string, string> = {
  announcement: "Announcement",
  sap_alert: "SAP Alert",
  milestone: "Milestone",
  financial_aid: "Financial Aid",
  system: "System",
};

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id);
      setReadIds((prev) => new Set([...prev, id]));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      setAllMarkedRead(true);
    });
  };

  const unreadCount = notifications.filter(
    (n) => !n.is_read && !readIds.has(n.id) && !allMarkedRead
  ).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isRead = n.is_read || readIds.has(n.id) || allMarkedRead;
            const content = (
              <Card
                key={n.id}
                className={`transition-colors ${!isRead ? "border-brand-accent/30 bg-brand-accent/5" : ""}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isRead ? (
                        <MailOpen className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Mail className="w-4 h-4 text-brand-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-medium ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.title}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {categoryIcons[n.category] || n.category}
                        </Badge>
                        {n.priority === "urgent" && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                        {n.priority === "high" && (
                          <Badge variant="secondary" className="text-xs">High</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        className="text-xs"
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            if (n.link_url) {
              return (
                <Link key={n.id} href={n.link_url} className="block">
                  {content}
                </Link>
              );
            }
            return <div key={n.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
