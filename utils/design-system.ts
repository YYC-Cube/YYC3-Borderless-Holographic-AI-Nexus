export const YYC3_DESIGN = {
    colors: {
        cyan: {
            primary: '#22d3ee', // cyan-400
            glow: 'rgba(34, 211, 238, 0.5)',
            bg: 'rgba(34, 211, 238, 0.1)',
            border: 'rgba(34, 211, 238, 0.3)'
        },
        purple: {
            primary: '#c084fc', // purple-400
            glow: 'rgba(192, 132, 252, 0.5)',
            bg: 'rgba(192, 132, 252, 0.1)',
            border: 'rgba(192, 132, 252, 0.3)'
        },
        emerald: {
            primary: '#34d399', // emerald-400
            glow: 'rgba(52, 211, 153, 0.5)',
            bg: 'rgba(52, 211, 153, 0.1)',
            border: 'rgba(52, 211, 153, 0.3)'
        },
        red: {
            primary: '#f87171', // red-400
            glow: 'rgba(248, 113, 113, 0.5)',
            bg: 'rgba(248, 113, 113, 0.1)',
            border: 'rgba(248, 113, 113, 0.3)'
        }
    },
    physics: {
        spring: {
            type: "spring",
            stiffness: 300,
            damping: 25
        },
        slow: {
            type: "spring",
            stiffness: 100,
            damping: 30
        }
    },
    blur: {
        glass: 'backdrop-blur-xl',
        heavy: 'backdrop-blur-3xl'
    }
};
