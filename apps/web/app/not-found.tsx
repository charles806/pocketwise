import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="hero-mesh noise-overlay min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#f8fafc] p-6 text-center">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="animate-floatCard absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-400 blur-[100px] opacity-20 motion-reduce:animate-none" />
                <div className="animate-floatCard absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-400 blur-[100px] opacity-20 motion-reduce:animate-none" />
            </div>

            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
                <div className="animate-fadeInScale w-full motion-reduce:animate-none">
                    <img
                        src="/assets/Page_Not_Found_404.svg"
                        alt="Page not found illustration"
                        className="w-full max-w-[480px]"
                    />
                </div>

                <span className="animate-fadeInUp delay-100 mt-8 rounded-full bg-primary-light px-4 py-1.5 text-sm font-semibold text-primary motion-reduce:animate-none">
                    Error 404
                </span>

                <h1 className="animate-fadeInUp delay-200 mt-4 text-4xl font-extrabold tracking-tight text-[#0f172a] md:text-5xl motion-reduce:animate-none">
                    Page{" "}
                    <span className="bg-linear-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                        not found
                    </span>
                </h1>

                <p className="animate-fadeInUp delay-300 mt-4 text-lg text-slate-500 motion-reduce:animate-none">
                    This page doesn&apos;t exist or was moved.
                </p>

                <Link
                    href="/"
                    className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338ca] active:scale-95"
                >
                    <Home className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    Go back home
                </Link>
            </div>
        </div>
    );
}