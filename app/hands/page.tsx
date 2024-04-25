"use client";

import dynamic from "next/dynamic";

const HandCanvas = dynamic(() => import("@/app/hands/HandCanvas"), {
    ssr: false,
});

export default function Hands() {
    return (
        <main>
            <h1>Hands Detection</h1>
            <HandCanvas />
        </main>
    )
}
