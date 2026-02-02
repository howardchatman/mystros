"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Megaphone, Plus, Send, Trash2, Edit } from "lucide-react";
import {
  createAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/notifications";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  priority: string;
  target_audience: string;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface AnnouncementManagerProps {
  announcements: AnnouncementItem[];
}

export function AnnouncementManager({ announcements }: AnnouncementManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetAudience, setTargetAudience] = useState("all");

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const handleCreate = () => {
    if (!title || !body) return;
    startTransition(async () => {
      const res = await createAnnouncement({
        title,
        body,
        priority: priority as "low" | "normal" | "high" | "urgent",
        target_audience: targetAudience,
      });
      if (res.error) showFB("error", res.error);
      else {
        showFB("success", "Announcement created as draft");
        setShowCreateDialog(false);
        setTitle("");
        setBody("");
      }
    });
  };

  const handlePublish = (id: string) => {
    startTransition(async () => {
      const res = await publishAnnouncement(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Announcement published and notifications sent");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Announcement deleted");
    });
  };

  const priorityColors: Record<string, string> = {
    low: "text-muted-foreground",
    normal: "text-blue-500",
    high: "text-yellow-500",
    urgent: "text-red-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Announcement
        </Button>
      </div>

      {feedback && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Announcements</h3>
            <p className="text-muted-foreground">Create your first announcement to notify students and staff.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{a.title}</h3>
                      {a.is_published ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      <Badge variant="outline" className={`capitalize ${priorityColors[a.priority] || ""}`}>
                        {a.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {a.target_audience || "all"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {new Date(a.created_at).toLocaleDateString()}
                      {a.published_at && ` · Published ${new Date(a.published_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!a.is_published && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(a.id)}
                        disabled={isPending}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(a.id)}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Announcement title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Announcement content..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={isPending}>Create Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
