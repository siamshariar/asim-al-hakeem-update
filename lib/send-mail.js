// Sends a website form (contact, question, counselling request) to the site's inbox via /api/sendMail.
// Resolves to true when the server accepted it; failures are logged for the team, never shown raw.
export async function sendSiteMail({ name, email, subject, phone = "", message = "" }) {
    try {
        const res = await fetch("/api/sendMail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject, phone, message }),
        });
        if (!res.ok) {
            console.error("Form could not be sent:", res.status, await res.text().catch(() => ""));
        }
        return res.ok;
    } catch (error) {
        console.error("Form could not be sent:", error);
        return false;
    }
}
