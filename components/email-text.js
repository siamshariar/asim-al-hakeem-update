// Renders an email address that wraps after the "@" on narrow screens
// ("sheikhassim.bookings@" / "gmail.com") instead of breaking mid-word.
export default function EmailText({ email }) {
  const at = email.indexOf("@");
  if (at === -1) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}
