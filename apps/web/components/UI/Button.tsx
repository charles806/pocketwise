import React from "react";

export const Button = ({ title, onClick }: { title: string, onClick: () => void }) => {
    return (
        <button onClick={onClick} className="flex items-center bg-[#5e6ad2] shadow-[0px_0px_0px_1px_rgba(94,106,210,0.5),0px_4px_12px_rgba(94,106,210,0.3),inset_0px_1px_0px_rgba(255,255,255,0.2)] rounded-lg px-5 py-2.5 gap-2 cursor-pointer hover:scale-105 transition-all duration-200">
            <span className="text-white text-base font-semibold">{title}</span>
        </button>
    )
}
