import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy & Cookies | Eko Runner Club",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Privacy & Cookies</h1>
        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p>
            Ẹ̀ko Runner Club (ERC) uses cookies and browser storage to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep you logged in (Firebase Authentication)</li>
            <li>Remember cookie preference choices</li>
            <li>Improve site performance and experience</li>
          </ul>
          <p>
            We do not sell your personal data. Payment processing is handled by
            Paystack. Contact us if you have questions about your data.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}