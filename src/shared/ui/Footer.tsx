import wordmark from "@/assets/logo-wordmark.svg";

export function Footer() {
  return (
    <footer className="footer">
      <img src={wordmark.src} width={wordmark.width} height={wordmark.height} alt="LendLoop. Borrow what you need. Lend what you don't." />
      {/* <p>© {new Date().getFullYear()}</p> */}
    </footer>
  );
}
