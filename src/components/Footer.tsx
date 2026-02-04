"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Youtube, ArrowUpRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border pt-20 pb-10 transition-colors duration-300" suppressHydrationWarning>
            <div className="container mx-auto px-6" suppressHydrationWarning>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20" suppressHydrationWarning>
                    <div className="col-span-1 md:col-span-2" suppressHydrationWarning>
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-robot font-bold text-lg skew-x-12" suppressHydrationWarning>
                                A
                            </div>
                            <span className="font-robot text-xl font-bold tracking-tighter uppercase">
                                Artvince <span className="text-primary">Academy</span>
                            </span>
                        </Link>
                        <p className="font-inter text-foreground/50 max-w-sm mb-8">
                            Empowering the next generation of creative technologists through expert-led game design and development education.
                        </p>
                        <div className="flex gap-4">
                            {[Github, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <Link key={i} href="#" className="p-3 border border-border rounded-full hover:bg-foreground hover:text-background transition-all">
                                    <Icon size={20} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-robot font-bold uppercase tracking-widest text-sm mb-8 text-foreground">Explore</h4>
                        <ul className="space-y-4 font-inter text-foreground/40">
                            {["All Courses", "Scholarships", "Mentorship", "Blog"].map((item, i) => (
                                <li key={i}>
                                    <Link href="#" className="hover:text-primary transition-colors flex items-center justify-between group">
                                        {item} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-robot font-bold uppercase tracking-widest text-sm mb-8 text-foreground">Legal</h4>
                        <ul className="space-y-4 font-inter text-foreground/40">
                            {["Privacy Policy", "Terms of Service", "Refund Policy", "Contact Support"].map((item, i) => (
                                <li key={i}>
                                    <Link href="#" className="hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center border-t border-border pt-10 gap-6">
                    <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">
                        © 2026 Artvince Academy. All rights reserved. Built for Pioneers.
                    </p>
                    <div className="flex gap-8 font-robot text-[10px] uppercase tracking-widest text-foreground/30">
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Platform Online</span>
                        <span>Version 2.0.4</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
