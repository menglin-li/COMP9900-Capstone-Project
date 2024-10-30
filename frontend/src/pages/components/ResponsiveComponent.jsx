// useBootstrapBreakpoints.js
import { useState, useEffect } from "react";

const useBreakpoints = () => {
  const [breakpoint, setBreakpoint] = useState("");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setBreakpoint("xs");
      } else if (width >= 576 && width < 768) {
        setBreakpoint("sm");
      } else if (width >= 768 && width < 992) {
        setBreakpoint("md");
      } else if (width >= 992 && width < 1200) {
        setBreakpoint("lg");
      } else if (width >= 1200 && width < 1400) {
        setBreakpoint("xl");
      } else {
        setBreakpoint("xxl");
      }
    };

    // Initialize the breakpoint
    updateBreakpoint();

    // Add event listener
    window.addEventListener("resize", updateBreakpoint);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
};

export default useBreakpoints;
