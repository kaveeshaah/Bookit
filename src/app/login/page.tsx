import Link from "next/link";
import { button, cardStyle, inputStyle, labelStyle } from "@/components/ui/styles";

export default function LoginPage() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center">
            <div className={`${cardStyle} p-8`}>
                <h1 className="mb-2 text-2xl font-bold text-slate-900">Sign In</h1>
                <p className="mb-6 text-sm text-slate-500">Sign in to your Bookit account</p>
                <form className="space-y-4">
                    <div>
                        <label className={labelStyle}>Email</label>
                        <input
                            type="email"
                            className={inputStyle}
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Password</label>
                        <input
                            type="password"
                            className={inputStyle}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="button"
                        className={`${button("primary")} w-full`}
                    >
                        Sign in
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
