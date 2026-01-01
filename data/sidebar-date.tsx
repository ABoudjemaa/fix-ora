import {
  Settings2,
  Computer,
  Bell,
} from "lucide-react";

export const sidebarData = {
  navMain: [
    {
      title: "Machines",
      url: "#",
      icon: Computer,
      isActive: true,
      items: [
        {
          title: "Liste des machines",
          url: "/dashboard/machines",
        },
        {
          title: "Ajouter une machine",
          url: "/dashboard/machines/add",
        },
        {
          title: "Machines en service",
          url: "/dashboard/machines/in-service",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      isActive: false,
      items: [
        {
          title: "Toutes les notifications",
          url: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "General",
          url: "#",
        },
      ],
    },
  ],
  projects: [],
};
