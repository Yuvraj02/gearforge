'use client'
import React, {useState } from "react";
import { MdOutlineSearch } from "react-icons/md";

interface SearchBarFields {
  name?: string;
  type: string;
  placeholder: string;
  className?: string;
  onTermChange?: (term: string) => void;
}

function SearchBar(prop: SearchBarFields) {
  const [inputField, setInput] = useState("");

  const searchInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (prop.onTermChange) prop.onTermChange(value);
  };

  return (
    <div className="relative flex items-center w-full">
      <MdOutlineSearch className="text-xl text-neutral-300 mr-3" />
      <input
        value={inputField}
        onChange={searchInputHandler}
        type={prop.type}
        name={prop.name}
        placeholder={prop.placeholder}
        className={`${prop.className} w-full focus:outline-none bg-transparent text-neutral-300`}
      />
    </div>
  );
}

export default SearchBar;
