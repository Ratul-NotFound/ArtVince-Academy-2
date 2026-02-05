"use client";

import { useEffect } from "react";

export default function HydrationFix({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Suppress hydration warnings caused by browser extensions
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === 'string' &&
                (args[0].includes('Hydration') ||
                    args[0].includes('did not match') ||
                    args[0].includes('bis_skin_checked'))
            ) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    return <>{children}</>;
}
