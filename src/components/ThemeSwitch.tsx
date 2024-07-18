// app/components/ThemeSwitch.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitch() {
	const [mounted, setMounted] = useState(false)
	const { setTheme, resolvedTheme } = useTheme()

	useEffect(() => setMounted(true), [])

	if (!mounted)
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				className="lucide lucide-moon-star "
			></svg>
		)

	if (resolvedTheme === "dark") {
		return <Sun onClick={() => setTheme("light")} />
	}

	if (resolvedTheme === "light") {
		return <Moon onClick={() => setTheme("dark")} />
	}
}
