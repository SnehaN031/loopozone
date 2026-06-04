import './globals.css';

export const metadata = {
  title: 'LoopOZone',
  description: 'LoopOZone circular economy app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
