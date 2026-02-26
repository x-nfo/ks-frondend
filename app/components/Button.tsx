import clsx from "clsx";
import React from "react";

export function Button(
  props: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  return (
    <button
      {...props}
      className={clsx(
        "hover:text-white hover:bg-karima-brand focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-0 focus:ring-karima-ink",
        "bg-gray-100 border rounded-sm py-2 px-4 text-base font-medium text-karima-ink",
        "flex items-center justify-around gap-2",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
