"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import "../styles/icons.css";
import "../styles/navigation.css";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Главная",
      href: "/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Мои транскрибации",
      href: "/dashboard/transcriptions",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
    {
      name: "Создать новую",
      href: "/dashboard/create",
      icon: "M12 4v16m8-8H4",
    },
    {
      name: "Тарифы и оплата",
      href: "/dashboard/billing",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  if (!session?.user) return null;

  return (
    <div className="navigation">
      <div className="navigation-header">
        <Link href="/dashboard" className="logo">
          <Icon
            path="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            size="lg"
          />
          Transcribator
        </Link>

        <nav className="navigation-menu">
          <ul>
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`menu-item ${
                    pathname === item.href ? "active" : ""
                  }`}
                >
                  <Icon path={item.icon} size="md" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="navigation-footer">
        <div className="user-profile">
          {session.user.image && (
            <img src={session.user.image} alt="" className="avatar" />
          )}
          <div className="user-info">
            <div className="user-email">{session.user.email}</div>
          </div>
          <button onClick={() => signOut()} className="sign-out-button">
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
