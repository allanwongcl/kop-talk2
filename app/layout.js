import './globals.css';

export const metadata = {
  title: 'KopTalk — Liverpool match reactions',
  description: 'Discuss Liverpool matches with fellow Reds, thread by thread.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0d15] font-sans">{children}</body>
    </html>
  );
}
