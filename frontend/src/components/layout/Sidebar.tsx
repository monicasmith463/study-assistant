"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/context/SidebarContext"
import { useIsLoggedIn } from "@/hooks/useAuth"
import Logo from "@/components/common/Logo"
import {
  FileIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
} from "@/icons"

interface MenuItem {
  title: string
  icon: React.ReactNode
  path?: string
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "My Exams",
    icon: <FileIcon className="h-6 w-6 flex-shrink-0" />,
    path: "/exams",
  },
]

const Sidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    setActiveItem,
    openSubmenu,
    toggleSubmenu,
    isHovered,
    setIsHovered,
  } = useSidebar()

  const isLoggedIn = useIsLoggedIn()
  const pathname = usePathname()

  if (!isLoggedIn) {
    return null
  }

  const isActive = (path?: string) => {
    if (!path) return false
    return pathname === path
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.submenu) {
      toggleSubmenu(item.title)
    } else {
      setActiveItem(item.title)
      if (window.innerWidth < 768) {
        toggleMobileSidebar()
      }
    }
  }

  // Show expanded state when hovered on collapsed sidebar
  const showExpandedContent = isExpanded || isHovered

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 hidden h-screen bg-white transition-all duration-300 ease-in-out lg:block dark:bg-gray-900 ${
          isExpanded || isHovered ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-800">
          {/* Sidebar Header */}
          <div
            className={`flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800 ${
              showExpandedContent ? "justify-between" : "justify-center"
            }`}
          >
            {showExpandedContent ? (
              <>
                <Logo showText={true} />
                <button
                  onClick={toggleSidebar}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Toggle sidebar"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Toggle sidebar"
              >
                <ChevronLeftIcon className="h-5 w-5 rotate-180" />
              </button>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`group flex w-full items-center ${
                          showExpandedContent
                            ? "justify-between px-3"
                            : "justify-center px-2.5"
                        } rounded-lg py-2.5 text-sm font-medium transition-colors ${
                          openSubmenu === item.title
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                        title={!showExpandedContent ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3 overflow-visible">
                          <span
                            className={`flex-shrink-0 overflow-visible ${
                              openSubmenu === item.title
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {showExpandedContent && (
                            <span className="whitespace-nowrap">
                              {item.title}
                            </span>
                          )}
                        </div>
                        {showExpandedContent && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {openSubmenu === item.title ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </button>
                      {showExpandedContent && openSubmenu === item.title && (
                        <ul className="mt-1 space-y-1 pl-11">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.title}>
                              <Link
                                href={subItem.path || "#"}
                                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                  isActive(subItem.path)
                                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.path || "#"}
                      onClick={() => handleItemClick(item)}
                      className={`group flex items-center ${
                        showExpandedContent
                          ? "gap-3 px-3"
                          : "justify-center px-2.5"
                      } overflow-visible rounded-lg py-2.5 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                      title={!showExpandedContent ? item.title : undefined}
                    >
                      <span
                        className={`flex-shrink-0 overflow-visible ${
                          isActive(item.path)
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {showExpandedContent && (
                        <span className="whitespace-nowrap">{item.title}</span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden dark:bg-gray-900 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-800">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
            <Logo showText={true} onClick={() => toggleMobileSidebar()} />
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => handleItemClick(item)}
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                            {item.icon}
                          </span>
                          <span>{item.title}</span>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500">
                          {openSubmenu === item.title ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                      {openSubmenu === item.title && (
                        <ul className="mt-1 space-y-1 pl-11">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.title}>
                              <Link
                                href={subItem.path || "#"}
                                onClick={() => toggleMobileSidebar()}
                                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                  isActive(subItem.path)
                                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.path || "#"}
                      onClick={() => handleItemClick(item)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          isActive(item.path)
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
