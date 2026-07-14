import '.globals.css';

export const metadata = {
  title: 'Умный реестр подписок',
  description: 'Дашборд для управления личными подписками и регулярными платежами',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}