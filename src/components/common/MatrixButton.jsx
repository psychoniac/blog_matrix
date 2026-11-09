export const MatrixButton = ({ children, onClick, type = "button", variant = "primary", className = "" }) => {
    const baseStyles = "px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-200 border cursor-pointer";

    const variants = {
        primary: "bg-matrix-card border-matrix-border text-matrix-neon hover:bg-matrix-border/20 hover:shadow-neon",
        danger: "bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        outline: "bg-transparent border-matrix-muted text-matrix-text hover:border-matrix-neon hover:text-matrix-neon"
    };

    return (
        <button type={type} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {">"} {children}
        </button>
    );
};