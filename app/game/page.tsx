import dynamic from "next/dynamic";

const GameScene = dynamic(() => import("@/app/game/components/GameScene"), {
    ssr: false,
});

export default function Game() {
    return (
        <main>  
            <GameScene />
            <div id="game-scene"></div>
        </main>
    )
}