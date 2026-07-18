import { motion } from "motion/react";

export function YYC3Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none flex items-start justify-center z-0 pt-[10vh]">
      <motion.div 
        initial={{ opacity: 0.1, scale: 0.98 }}
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [0.98, 1, 0.98],
          textShadow: [
            "0 0 0px rgba(34,211,238,0)",
            "0 0 20px rgba(34,211,238,0.2)",
            "0 0 0px rgba(34,211,238,0)"
          ]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="transform scale-[0.5] sm:scale-75 md:scale-100 lg:scale-125 font-mono text-cyan-400 font-bold whitespace-pre text-center blur-[0.5px] opacity-20"
      >
{`
    ██╗   ██╗██╗   ██╗ ██████╗██████╗
    ╚██╗ ██╔╝╚██╗ ██╔╝██╔════╝╚════██╗
     ╚████╔╝  ╚████╔╝ ██║      █████╔╝
      ╚██╔╝    ╚██╔╝  ██║      ╚═══██╗
       ██║      ██║   ╚██████╗██████╔╝
       ╚═╝      ╚═╝    ╚═════╝╚═════╝

    YanYuCloudCube
`}
      </motion.div>
    </div>
  );
}
