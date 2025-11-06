"use client";

import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import Link from "next/link";
import { MdMenu } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { togglePanel } from "./side_panel/sidePanelSlice";
import Image from "next/image";
import UserMenu from "./UserMenu";
import React from "react";

function NavBar() {
  const pathName: string = usePathname();
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const hasHydrated = useAppSelector((s) => s.users.hasHydrated);
  const user = useAppSelector((s) => s.users.user);

  const username = user?.user_name ?? "";
  const division = user?.division ?? 3;
  const divisionPoints = user?.division_score ?? 0;

  const displayName =
    username || user?.name || (user?.email ? user.email.split("@")[0] : "Profile");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tournaments", href: "/tournaments" },
  ];

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      data-nav
      className="fixed top-0 left-0 z-50 w-full bg-[#242528] border-b border-black shadow-md shadow-black/50"
      style={{ isolation: "isolate" }}
    >

      <div
        className="
          flex items-center justify-between gap-3 px-3 py-3.5
          md:grid md:grid-cols-[auto_minmax(0,1fr)_auto]
          md:px-4
        "
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Image
              src="/gearforge.svg"
              alt="GearForge Logo"
              className="h-8 w-auto"
              height={80}
              width={80}
              draggable={false}
            />
          </div>
          <button
            className="inline-flex items-center md:hidden"
            aria-label="Open menu"
            onClick={() => dispatch(togglePanel())}
          >
            <MdMenu className="text-2xl" />
          </button>
        </div>

        {/* Center (Desktop only) */}
        {!isMobile && (
          <div className="w-full flex justify-center">
            <div
              className="
                w-full flex justify-center
                transition-[width] duration-300 ease-in-out
                md:w-[60rem] lg:w-[75rem] xl:w-[90rem] 2xl:w-[110rem]
                focus-within:md:w-[68rem] focus-within:lg:w-[88rem]
                focus-within:xl:w-[104rem] focus-within:2xl:w-[120rem]
              "
            >
              {/* <SearchBar
                key={pathName}
                className="
                  bg-[#161719] px-5 py-2 gap-2 items-center flex rounded-xl
                  w-full transition-shadow duration-200 ease-in-out
                  focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.35)]
                "
                type="text"
                name="game_search_field"
                placeholder="Search Game"
              /> */}
            </div>
          </div>
        )}

        {/* Right */}
        <nav className="flex gap-4 h-full items-center whitespace-nowrap overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathName === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center px-2 py-1 hover:text-white ${isActive ? "text-blue-400" : ""
                  } text-sm md:text-[1rem] group`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-blue-400 transition-all duration-300 ease-out origin-left ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              </Link>
            );
          })}

          {/* Auth UI */}
          {!hasHydrated ? (
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{ minWidth: "7rem", height: "2rem" }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full border border-neutral-600 border-t-neutral-100 animate-spin"
                aria-label="Loading"
              />
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/auth"
              className={`relative flex items-center px-2 py-1 hover:text-white ${pathName === "/auth" ? "text-blue-400" : ""
                } text-sm md:text-[1rem] group`}
            >
              Sign In
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-blue-400 transition-all duration-300 ease-out origin-left ${pathName === "/auth" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
              />
            </Link>
          ) : (
            <div
              className="relative flex items-center justify-center"
              style={{ minWidth: "7rem", height: "2rem" }}
            >
              <UserMenu
                username={displayName}
                division={division}
                divisionPoints={divisionPoints}
              />
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Search below nav */}
      {isMobile && (
        <div className="px-3 pb-3">
          <SearchBar
            key={pathName}
            className="
              bg-[#161719] px-3 py-2 gap-2 items-center flex rounded-xl
              w-full
            "
            type="text"
            name="game_search_field"
            placeholder="Search Game"
          />
        </div>
      )}
    </header>
  );
}

export default NavBar;
