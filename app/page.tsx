

export default function Home() {
  return (
    //CV final project.

    //A game that uses hand tracking to control the player.
    //2 button links href: check hands /hands, start game /game.

    <>
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Hand Tracking Game</h1>
      <div className="flex justify-center">
        <a href="/hands" className="m-4 p-4 bg-blue-500 text-white rounded-lg">Check Hands</a>
        <a href="/game" className="m-4 p-4 bg-blue-500 text-white rounded-lg">Start Game</a>
      </div>
    </div>
    </>
  );
}
