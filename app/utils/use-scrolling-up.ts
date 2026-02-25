import { useEffect, useState } from "react";

/**
 * useScrollingUp
 * Adapted from https://devmuscle.com/blog/react-sticky-header. Thanks, Defne Eroğlu
 * @returns {boolean}
 */
export const useScrollingUp = () => {
    const [scrollingUp, setScrollingUp] = useState(false);
    useEffect(() => {
        let prevScroll = window.pageYOffset;
        const handleScroll = () => {
            const currScroll = window.pageYOffset;
            const isScrolled = prevScroll > currScroll;
            setScrollingUp(isScrolled);
            prevScroll = currScroll;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    return scrollingUp;
};
