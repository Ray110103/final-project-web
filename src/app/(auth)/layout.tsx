import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			{/* -mt-24 for now */}
			 <div className="mt-26 " />
			{children}
			<Toaster />
		</div>
	);
}
