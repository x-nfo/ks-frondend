import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function classNames(...classes: ClassValue[]) {
    return twMerge(clsx(classes));
}
