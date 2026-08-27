import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">
            AHS/AGHS Alumni Hike
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Ngong Hills, Main Gate to Kona Baridi — 19 September 2026
          </p>
        </header>
        <RegistrationForm />
      </main>
    </div>
  );
}
