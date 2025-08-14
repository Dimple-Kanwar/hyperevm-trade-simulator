// // components/Header.tsx
// import { Button } from "@/components/ui/button";
// import { LogOut, Copy, ExternalLink } from "lucide-react";
// import { useLogout, useSignerStatus, useUser, useSmartAccountClient } from "@account-kit/react";
// import { useState } from "react";
// import { formatAddress } from "@/lib/utils";
// import Image from "next/image";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// export default function Header() {
//   const { logout } = useLogout();
//   const { isConnected } = useSignerStatus();
//   const user = useUser();
//   const { client } = useSmartAccountClient({});
//   const [isCopied, setIsCopied] = useState(false);

//   const address = client?.account?.address ?? "";
//   const chain = client?.chain;
//   const userEmail = user?.email ?? "Anonymous";

//   const handleCopy = () => {
//     if (!address) return;
//     navigator.clipboard.writeText(address);
//     setIsCopied(true);
//     setTimeout(() => setIsCopied(false), 2000);
//   };

//   const openExplorer = () => {
//     if (address && chain?.blockExplorers?.default?.url) {
//       window.open(`${chain.blockExplorers.default.url}/address/${address}`, "_blank");
//     }
//   };

//   if (!isConnected) {
//     return (
//       <header className="border-b">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Image
//               src="/smart-wallets.svg"
//               alt="Smart Wallets"
//               width={200}
//               height={26}
//               className="h-6 w-auto"
//             />
//           </div>
//         </div>
//       </header>
//     );
//   }

//   return (
//     <header className="border-b">
//       <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
//         {/* Logo */}
//         <div className="flex items-center gap-2">
//           <Image
//             src="/smart-wallets.svg"
//             alt="Smart Wallets"
//             width={200}
//             height={26}
//             className="h-6 w-auto"
//           />
//         </div>

//         {/* User Info & Actions */}
//         <div className="flex items-center gap-4">
//           {/* Email */}
//           <span className="text-sm text-muted-foreground hidden sm:inline">
//             {userEmail}
//           </span>

//           {/* Address with Copy & Explorer */}
//           <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
//             <span className="font-mono text-xs text-muted-foreground">
//               {formatAddress(address)}
//             </span>

//             <TooltipProvider>
//               {/* Copy Button */}
//               <Tooltip open={isCopied}>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-6 w-6"
//                     onClick={handleCopy}
//                   >
//                     <Copy className="h-3 w-3" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Copied!</p>
//                 </TooltipContent>
//               </Tooltip>

//               {/* Explorer Link */}
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-6 w-6"
//                     onClick={openExplorer}
//                   >
//                     <ExternalLink className="h-3 w-3" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>View on Explorer</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>

//           {/* Logout Button */}
//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-2"
//             onClick={() => logout()}
//           >
//             <LogOut className="h-4 w-4" />
//             <span>Logout</span>
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }