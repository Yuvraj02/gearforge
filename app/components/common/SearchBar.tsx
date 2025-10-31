'use client'
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import LoadingSpinner from "./LoadingSpinner";
import Link from "next/link";

interface SearchBarFields {
  name?: string;
  type: string; // text | number | password
  placeholder: string;
  className?: string;
}

interface SearchResults {
  id: number;
  name: string;
}

const apiKey: string = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN!;

const requestHeaders = {
  "Client-ID": "8t38bg3wjw6cfu643bmvww73yp3d0h",
  Authorization: "Bearer " + apiKey,
};

function SearchBar(prop: SearchBarFields) {
  const [inputField, setInput] = useState<string>("");
  const [open, setOpen] = useState(false); // controls dropdown visibility

  const rootRef = useRef<HTMLDivElement | null>(null);

  const searchInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInput(v);
    setOpen(v.trim().length > 0);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const searchQuery = useQuery({
    queryFn: async () => {
      const response = await axios.post(
        "/api/igdb/games",
        `fields id,name; search "${inputField}";`,
        { headers: requestHeaders }
      );
      return response.data;
    },
    queryKey: ["search_result", inputField],
    enabled: inputField.trim().length > 0,
  });

  const searchedItems: SearchResults[] = searchQuery.data;

  return (
    <div ref={rootRef} className="relative flex-col">
      {/* Input */}
      <div className={`${prop.className} ${open ? "rounded-t-xl" : "rounded-xl"}`}>
        <MdOutlineSearch className="text-xl" />
        <input
          onChange={searchInputHandler}
          onFocus={() => setOpen(inputField.trim().length > 0)}
          type={prop.type}
          name={prop.name}
          placeholder={prop.placeholder}
          className="w-full focus:outline-none bg-transparent"
        />
      </div>

      {/* Results dropdown */}
      <div
        className={
          open
            ? `absolute z-50 bg-[#242528] rounded-b-xl w-full p-2 max-h-60 overflow-auto gf-scroll`
            : `hidden`
        }
      >
        {searchQuery.isLoading ? (
          <div className="flex justify-center items-center h-full w-full">
            <LoadingSpinner />
          </div>
        ) : searchQuery.isError ? (
          <div>Error Retrieving</div>
        ) : searchedItems != null ? (
          <div>
            {searchedItems.map((value) => (
              <Link href={`/game/${value.id}`} key={value.id}>
                <div
                  onClick={() => {
                    // Close dropdown after selecting an item
                    setOpen(false);
                    setInput("");
                  }}
                >
                  <p className="leading-relaxed w-full mt-4 p-2 cursor-pointer hover:bg-neutral-700 hover:text-white hover:rounded-xl">
                    {value.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div />
        )}
        <br />
      </div>
    </div>
  );
}

export default SearchBar;
