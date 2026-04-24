export const metadata = {
  title: "Next.js Docker Demo",
  description: "Docker 학습 예제",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
