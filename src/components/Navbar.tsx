"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Sun, Moon, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/about" },
    { name: "Mentors", href: "/mentors" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState("dark");
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const themeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
                setIsThemeOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        document.addEventListener("mousedown", handleClickOutside);

        // Theme Initialization
        const savedTheme = localStorage.getItem("artvince-theme") || "dark";
        setTheme(savedTheme);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("artvince-theme", theme);
        if (theme === "light") {
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    }, [theme]);

    const themes = [
        { name: "dark", icon: Moon, label: "Dark" },
        { name: "light", icon: Sun, label: "Light" },
        { name: "creative", icon: Sparkles, label: "Creative" },
    ];

    const currentThemeIcon = themes.find(t => t.name === theme)?.icon || Moon;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4 glass border-b border-border" : "py-8"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-robot font-bold text-xl skew-x-12">
                        A
                    </div>
                    <span className="font-robot text-2xl font-bold tracking-tighter uppercase text-foreground">
                        Artvince <span className="text-primary">Academy</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="font-robot text-sm uppercase tracking-widest text-foreground hover:text-primary transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </Link>
                    ))}

                    {/* Theme Dropdown */}
                    <div className="relative" ref={themeRef}>
                        <button
                            onClick={() => setIsThemeOpen(!isThemeOpen)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/5 text-foreground transition-all"
                        >
                            {theme === "dark" && <Moon size={18} />}
                            {theme === "light" && <Sun size={18} />}
                            {theme === "creative" && <Sparkles size={18} />}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isThemeOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {isThemeOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-40 glass rounded-2xl border border-border p-2 z-50 overflow-hidden"
                                >
                                    {themes.map((t) => (
                                        <button
                                            key={t.name}
                                            onClick={() => {
                                                setTheme(t.name);
                                                setIsThemeOpen(false);
                                            }}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-robot text-xs uppercase tracking-widest transition-all ${theme === t.name ? "bg-primary text-white" : "hover:bg-foreground/5 text-foreground/70"
                                                }`}
                                        >
                                            <t.icon size={16} />
                                            {t.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        href="/login"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                        <User size={16} />
                        Login
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="fixed inset-0 top-[88px] bg-background z-40 flex flex-col items-center justify-center gap-8 md:hidden p-6"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="font-robot text-3xl uppercase tracking-widest text-foreground hover:text-primary transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Mobile Theme Selection */}
                        <div className="flex gap-4 p-4 glass rounded-2xl border border-border">
                            {themes.map((t) => (
                                <button
                                    key={t.name}
                                    onClick={() => setTheme(t.name)}
                                    className={`p-4 rounded-xl transition-all ${theme === t.name ? "bg-primary text-white" : "bg-foreground/5 text-foreground/40"
                                        }`}
                                >
                                    <t.icon size={24} />
                                </button>
                            ))}
                        </div>

                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="bg-primary px-12 py-4 rounded-full font-robot text-lg uppercase tracking-widest text-white w-full text-center"
                        >
                            Login
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
