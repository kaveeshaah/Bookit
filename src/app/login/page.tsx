import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center p-6">
            <div className="rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">Sign In</h1>
                <p className="mb-6 text-sm text-slate-500">Sign in to your Bookit account</p>
                <form className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="button"
                        className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        Sign in
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
