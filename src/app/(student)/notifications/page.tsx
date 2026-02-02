import { getMyNotifications } from "@/lib/actions/notifications";
import { NotificationList } from "./notification-list";

export const metadata = {
  title: "Notifications | Mystros Student Portal",
};

export default async function NotificationsPage() {
  const result = await getMyNotifications(50);
  const notifications = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Stay up to date with announcements and updates</p>
      </div>
      <NotificationList notifications={notifications as any[]} />
    </div>
  );
}
