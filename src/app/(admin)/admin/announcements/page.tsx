import { getAnnouncements } from "@/lib/actions/notifications";
import { AnnouncementManager } from "./announcement-manager";

export const metadata = {
  title: "Announcements | Admin Dashboard",
  description: "Manage school announcements",
};

export default async function AnnouncementsPage() {
  const result = await getAnnouncements();
  const announcements = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Create and manage school-wide announcements</p>
      </div>
      <AnnouncementManager announcements={announcements as any[]} />
    </div>
  );
}
