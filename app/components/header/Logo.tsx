import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="HyperEVM Transaction Simulator"
        width={200}
        height={26}
        className="h-6 w-auto"
      />
      <h1 className="text-2xl font-bold">HyperEVM Transaction Simulator</h1>
    </div>
  );
}